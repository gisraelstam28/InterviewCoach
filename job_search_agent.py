from langchain_community.chat_models import ChatOpenAI
from langchain_community.utilities.serpapi import SerpAPIWrapper
from langchain_openai import OpenAI as LangchainOpenAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain import hub
import os
import json
import logging
import re
import time
from typing import Dict, List, Any, Optional
from serpapi_job_search import fetch_jobs_from_serpapi, extract_relevant_job_info
from llm_job_filter_two_step import filter_and_explain_top_jobs_two_step  # Two-step LLM-powered filtering

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage # Added SystemMessage and HumanMessage

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class JobSearchAgent:
    """Agent responsible for searching jobs and analyzing matches against a resume."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the agent, tools, and LLMs."""
        self.openai_api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required. Set the OPENAI_API_KEY environment variable.")

        # LLM for the main agent (job search)
        self.llm = LangchainOpenAI(
            temperature=0,
            openai_api_key=self.openai_api_key,
            model_name="gpt-4.1-nano-2025-04-14"
        )

        # LLM for targeted resume summarization per job (using preferred model)
        # Keep gpt-4.1-nano for targeted summarization as requested, but now it gets a shorter input
        self.summarization_llm = ChatOpenAI(
            model_name="gpt-4.1-nano-2025-04-14",
            temperature=0,
            openai_api_key=self.openai_api_key,
            max_tokens=500 # Added max_tokens limit as discussed
        )

        # LLM for the initial base resume summarization (using a potentially cheaper/faster model)
        self.base_summarization_llm = ChatOpenAI(
            model_name="gpt-4.1-nano-2025-04-14",  # Switched to 4.1-nano for base summary as requested
            temperature=0,
            openai_api_key=self.openai_api_key,
            max_tokens=750  # Add a sensible max_tokens limit for summaries
        )

        # Tools for the agent
        # Initialize SerpAPI tool for job search
        serpapi_api_key = os.getenv("SERPAPI_API_KEY")
        if not serpapi_api_key:
            raise ValueError("SerpAPI API key is required. Set the SERPAPI_API_KEY environment variable.")
        serpapi_tool = SerpAPIWrapper(serpapi_api_key=serpapi_api_key)
        tools = [Tool(
            name="Search",
            func=serpapi_tool.run,
            description="Search for recent job listings and information using SerpAPI."
        )]

        # Agent setup
        prompt = hub.pull("hwchase17/react")
        agent = create_react_agent(self.llm, tools, prompt)
        self.agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

        # Prompt for summarizing resume based on job description (updated)
        self.summarization_job_prompt = PromptTemplate(
            input_variables=["base_resume_summary", "job_description"],
            template="""Given the following base resume summary and job description, create a concise (max 150 words) targeted summary highlighting the most relevant skills and experiences from the base summary that match the requirements in the job description. Focus on alignment.

Base Resume Summary:
{base_resume_summary}

Job Description:
{job_description}

Targeted Summary:"""
        )
        self.summarization_chain = LLMChain(llm=self.summarization_llm, prompt=self.summarization_job_prompt)

        # Prompt for analyzing job match (input summary is now the targeted summary)
        self.job_analysis_prompt = PromptTemplate(
            input_variables=["job_title", "job_description", "targeted_resume_summary", "user_preferences"],
            template="""Analyze the fit between the candidate (represented by the targeted resume summary) and the job described below, considering the user's preferences.

Job Title: {job_title}
Job Description: {job_description}

Targeted Resume Summary (Highlighting relevance to this job):
{targeted_resume_summary}

User Preferences: {user_preferences}

Analysis:
1. Overall Fit Score (1-10): [Score based on skills, experience, and preferences]
2. Key Strengths: [2-3 bullet points on why the candidate is a good fit based on the targeted summary]
3. Potential Gaps: [1-2 bullet points on areas where the candidate might not fully meet requirements or preferences]
4. Alignment with Preferences: [Brief comment on how well the job aligns with user preferences like location, salary, role type etc.]

Provide only the analysis in the format above."""
        )
        self.analysis_chain = LLMChain(llm=self.llm, prompt=self.job_analysis_prompt)

    async def _create_base_resume_summary(self, full_resume_text: str) -> str:
        """Creates a base summary of the full resume using a designated LLM."""
        logger.info("Creating base resume summary...")
        logger.info(f"Raw resume text received for summarization:\n{full_resume_text}")
        prompt = (
            "You are an expert resume summarizer. Analyze the following full resume text.\n\n"            "Create a comprehensive yet concise summary, approximately 500-750 words long. "
            "The summary must include these key sections if present: Professional Summary/Objective, "
            "Core Skills/Technical Proficiencies (list key technologies, tools, methodologies), "
            "Professional Experience (for each role, list company, title, dates, and 2-3 key responsibilities/achievements), "
            "Education.\n\n"            "Prioritize extracting keywords, specific technologies, industry terms, and quantifiable results.\n"            "Ensure the summary accurately reflects the candidate's career trajectory and primary areas of expertise.\n\n"            "Full Resume:\n{resume_text}\n\n"            "Output only the summary text."
        )

        messages = [
            SystemMessage(content="You are an expert resume summarizer tasked with creating a detailed base summary."),
            HumanMessage(content=prompt.format(resume_text=full_resume_text))
        ]

        try:
            response = await self.base_summarization_llm.ainvoke(messages)
            base_summary = response.content
            logger.info(f"Base resume summary created successfully. Length: {len(base_summary.split())} words.")
            # Basic check for empty or placeholder summary
            if not base_summary or len(base_summary) < 100:
                logger.warning("Base summary seems too short or empty. Check LLM response.")
                # Decide on fallback: maybe return original resume? Or raise error?
                # For now, let's return the potentially problematic summary and log warning.
            logger.info(f"Base resume summary generated:\n{base_summary}")
            return base_summary
        except Exception as e:
            logger.error(f"Failed to create base resume summary: {e}", exc_info=True)
            # Fallback: Return the original resume text if summarization fails?
            # This would defeat the purpose, maybe better to raise or return empty string?
            # Let's raise an error to signal the failure upstream.
            raise RuntimeError(f"Failed to create base resume summary: {e}") from e

    async def _summarize_resume_for_job(self, base_resume_summary: str, job_description: str) -> str:
        """Generates a targeted summary of the base resume tailored to a specific job description."""
        logger.info("Generating targeted resume summary for a specific job...")
        try:
            # Use the summarization chain with the updated prompt
            result = await self.summarization_chain.arun(
                base_resume_summary=base_resume_summary,
                job_description=job_description
            )
            logger.info("Targeted resume summary generated.")
            return result
        except Exception as e:
            # Log the error and return a placeholder or the base summary itself
            logger.error(f"Failed to generate targeted resume summary: {e}", exc_info=True)
            return "Error: Could not generate targeted summary." # Return error message

    async def analyze_job_match(self, job: Dict[str, Any], base_resume_summary: str, preferences: Dict[str, str]) -> Dict[str, Any]:
        """Analyzes a single job listing against the base resume summary and user preferences."""
        logger.info(f"Analyzing job match for: {job.get('title', 'N/A')}")
        job_description = job.get("description", "")
        job_title = job.get("title", "N/A")

        if not job_description:
            logger.warning(f"Job '{job_title}' has no description. Skipping detailed analysis.")
            job["analysis"] = {
                "Overall Fit Score": "N/A",
                "Key Strengths": "N/A (No job description provided)",
                "Potential Gaps": "N/A",
                "Alignment with Preferences": "N/A"
            }
            return job

        # Step 1: Generate the targeted summary using the base summary
        targeted_summary = await self._summarize_resume_for_job(base_resume_summary, job_description)

        # Handle cases where targeted summary failed
        if targeted_summary.startswith("Error:"):
             logger.warning(f"Skipping analysis for '{job_title}' due to targeted summary error.")
             job["analysis"] = {
                 "Overall Fit Score": "N/A",
                 "Key Strengths": f"Error during summarization: {targeted_summary}",
                 "Potential Gaps": "N/A",
                 "Alignment with Preferences": "N/A"
             }
             return job

        # Step 2: Perform the analysis using the targeted summary
        try:
            logger.info(f"Running analysis chain for job: {job_title}")
            analysis_result = await self.analysis_chain.arun(
                job_title=job_title,
                job_description=job_description,
                targeted_resume_summary=targeted_summary, # Pass the targeted summary
                user_preferences=str(preferences) # Convert preferences dict to string for the prompt
            )
            logger.info(f"Analysis received for job: {job_title}")

            # Attempt to parse the structured analysis (basic parsing)
            parsed_analysis = self._parse_analysis(analysis_result)
            job["analysis"] = parsed_analysis

        except Exception as e:
            logger.error(f"Failed to analyze job match for '{job_title}': {e}", exc_info=True)
            job["analysis"] = {
                "Overall Fit Score": "Error",
                "Key Strengths": f"Error during analysis: {e}",
                "Potential Gaps": "N/A",
                "Alignment with Preferences": "N/A"
            }

        return job

    def _parse_analysis(self, analysis_text: str) -> Dict[str, str]:
        """Parses the structured analysis text from the LLM output."""
        logger.debug(f"Attempting to parse analysis text:\n{analysis_text}")
        analysis_data = {
            "Overall Fit Score": "N/A",
            "Key Strengths": "N/A",
            "Potential Gaps": "N/A",
            "Alignment with Preferences": "N/A"
        }
        try:
            lines = analysis_text.strip().split('\n')
            for line in lines:
                if line.startswith("1. Overall Fit Score:"):
                    analysis_data["Overall Fit Score"] = line.split(":", 1)[1].strip()
                elif line.startswith("2. Key Strengths:"):
                    analysis_data["Key Strengths"] = line.split(":", 1)[1].strip()
                elif line.startswith("3. Potential Gaps:"):
                    analysis_data["Potential Gaps"] = line.split(":", 1)[1].strip()
                elif line.startswith("4. Alignment with Preferences:"):
                    analysis_data["Alignment with Preferences"] = line.split(":", 1)[1].strip()

            # Handle multi-line entries for Strengths and Gaps if needed (simple concatenation)
            current_key = None
            full_analysis_lines = analysis_text.strip().split('\n')
            strengths_lines = []
            gaps_lines = []
            in_strengths = False
            in_gaps = False

            for i, line in enumerate(full_analysis_lines):
                if line.startswith("2. Key Strengths:"):
                    strengths_lines.append(line.split(":", 1)[1].strip())
                    in_strengths = True
                    in_gaps = False
                    continue
                if line.startswith("3. Potential Gaps:"):
                    gaps_lines.append(line.split(":", 1)[1].strip())
                    in_gaps = True
                    in_strengths = False
                    continue
                if line.startswith("4. Alignment with Preferences:"):
                     in_strengths = False
                     in_gaps = False
                     continue # Stop capturing for strengths/gaps

                if in_strengths and line.strip().startswith("-"):
                    strengths_lines.append(line.strip())
                elif in_gaps and line.strip().startswith("-"):
                    gaps_lines.append(line.strip())

            if strengths_lines:
                analysis_data["Key Strengths"] = "\n".join(strengths_lines)
            if gaps_lines:
                analysis_data["Potential Gaps"] = "\n".join(gaps_lines)

            logger.debug(f"Parsed analysis data: {analysis_data}")

        except Exception as e:
            logger.error(f"Error parsing analysis text: {e}\nText was:\n{analysis_text}", exc_info=True)
            # Keep default N/A values

        return analysis_data

    async def search_jobs(self, preferences: Dict[str, str]) -> List[Dict[str, Any]]:
        """Searches for jobs using SerpAPI for structured data, blending resume analysis and user preferences via LLM."""
        serpapi_api_key = os.getenv("SERPAPI_API_KEY")
        location = preferences.get("location", "Remote")
        resume_summary = preferences.get("resume_summary", "")
        questionnaire_answers = preferences.get("questionnaire_answers", "")

        logger.info(f"Resume summary for query construction:\n{resume_summary}")
        logger.info(f"Questionnaire answers for query construction:\n{questionnaire_answers}")

        # LLM generates the Boolean search query using both resume and questionnaire
        base_query = await self._construct_base_query(resume_summary, questionnaire_answers)
        logger.info(f"Constructed dynamic base query: {base_query}")

        # Fetch jobs from SerpAPI
        jobs = fetch_jobs_from_serpapi(base_query, location, serpapi_api_key)
        logger.info(f"Fetched {len(jobs)} jobs from SerpAPI.")
        logger.info(f"First 3 jobs returned: {[{'title': j.get('title'), 'company': j.get('company'), 'location': j.get('location'), 'description': j.get('description', '')[:60]} for j in jobs[:3]]}")

        # Extract only relevant info (title, company, location, description, url)
        relevant_jobs = extract_relevant_job_info(jobs)
        logger.info(f"Extracted {len(relevant_jobs)} relevant jobs with URLs and titles.")
        logger.info(f"Relevant jobs sample: {[{'title': j.get('title'), 'company': j.get('company'), 'location': j.get('location')} for j in relevant_jobs[:3]]}")

        # BYPASS LLM-powered filtering and explanation step for debugging
        # Directly return the relevant jobs extracted from SerpAPI
        logger.info("Bypassing LLM filtering. Returning all relevant jobs fetched from SerpAPI.")
        return relevant_jobs


    async def _construct_base_query(self, resume_summary: str, questionnaire_answers: str) -> str:
        """Dynamically constructs a simple keyword query using LLM based on resume summary and user preferences."""
        prompt_template = (
            """
🧠 Guidance Prompt Template for GPT (Job Search Keyword Builder)

You are an expert job search assistant. Your goal is to generate a simple search query for job boards that matches the candidate's background and preferences.

Instructions:
- Include only the 2–4 most relevant job titles based on their experience.
- Include the most relevant locations (city, state, or 'remote' if applicable).
- Include the target industry or field (e.g., manufacturing, healthcare, finance, etc.).
- Include the appropriate seniority/level (e.g., entry, mid, senior, director, VP, executive, manager, etc.).
- Do NOT use Boolean operators, special syntax, parentheses, or site: filters.
- Only output a single line of keywords separated by spaces. No extra commentary or formatting.

---
Resume:
{resume_summary}

Preferences:
{questionnaire_answers}

Return only the search keywords. No commentary or explanation.
"""
        )
        prompt = PromptTemplate(
            input_variables=["resume_summary", "questionnaire_answers"],
            template=prompt_template
        )
        # Use the main LLM for query generation
        llm_chain = LLMChain(llm=self.llm, prompt=prompt)
        query = await llm_chain.arun(resume_summary=resume_summary, questionnaire_answers=questionnaire_answers)
        return query.strip()


    def _extract_last_observation(self, agent_output: str) -> str:
        """Extracts the content after the last 'Observation:' or 'Final Answer:' marker."""
        # Handle potential None or empty string input
        if not agent_output:
            return ""

        logger.debug("Extracting last observation/final answer...")
        # Find the positions of the last occurrences
        last_observation_pos = agent_output.rfind("Observation:")
        final_answer_pos = agent_output.rfind("Final Answer:")

        # Determine which marker appears later in the string
        start_pos = -1
        if last_observation_pos > final_answer_pos:
            start_pos = last_observation_pos + len("Observation:")
            logger.debug("Found 'Observation:' as the later marker.")
        elif final_answer_pos != -1:
            start_pos = final_answer_pos + len("Final Answer:")
            logger.debug("Found 'Final Answer:' as the later marker.")
        else:
            # If neither marker is found, maybe the whole output is the result?
            # This might happen if the agent directly returns the JSON.
            # Let's return the whole output in this case, but log a warning.
            logger.warning("Neither 'Observation:' nor 'Final Answer:' found in agent output. Returning entire output.")
            # Basic check if it looks like JSON before returning it all
            if agent_output.strip().startswith("[") and agent_output.strip().endswith("]"): # Very basic check
                 return agent_output.strip()
            elif agent_output.strip().startswith("```json"):
                 return agent_output.strip() # Let downstream handle cleaning
            else:
                 logger.warning("Output doesn't look like JSON, returning empty.")
                 return ""

        # If a marker was found, extract the content after it
        if start_pos != -1:
            extracted_content = agent_output[start_pos:].strip()
            logger.debug(f"Successfully extracted content after marker. Length: {len(extracted_content)}")
            return extracted_content
        else:
            # This case should ideally be covered above, but as a fallback:
            logger.warning("Could not determine start position for extraction. Returning empty.")
            return ""

    def _create_mock_job_listings(self, preferences: Dict[str, str]) -> List[Dict[str, Any]]:
        """Creates mock job listings for fallback or testing."""
        logger.info("Creating mock job listings.")
        role = preferences.get("role", "Software Engineer")
        location = preferences.get("location", "Remote")

        return [
            {
                "title": f"Senior {role}",
                "company": "Tech Innovations Inc.",
                "location": location,
                "description": f"Seeking an experienced {role} to lead our core platform development. Must have 5+ years experience with Python, Cloud Services (AWS/GCP), and microservices architecture. Familiarity with Kubernetes and CI/CD pipelines is a plus. Join our dynamic team!",
                "url": "http://example.com/job1",
                # "analysis": {} # Analysis removed, will be added later
            },
            {
                "title": f"Mid-Level {role}",
                "company": "Data Solutions Co.",
                "location": "New York, NY" if location != "Remote" else "Remote",
                "description": f"Join our growing team as a {role}! We are looking for individuals proficient in Java or C#, with a strong understanding of database design and RESTful APIs. Experience with Agile methodologies preferred. Opportunity for growth.",
                "url": "http://example.com/job2",
                # "analysis": {} # Analysis removed
            },
            {
                "title": f"Junior {role} ({preferences.get('keywords', 'Backend')})",
                "company": "Startup Hub Ventures",
                "location": location,
                "description": f"Exciting opportunity for a recent graduate or junior {role} interested in {preferences.get('keywords', 'backend development')}. Work with modern technologies like Node.js, React, and Docker. Mentorship provided. Requires a passion for learning.",
                "url": "http://example.com/job3",
                # "analysis": {} # Analysis removed
            }
        ]
