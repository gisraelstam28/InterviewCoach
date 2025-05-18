from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import re
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class StarExample(BaseModel):
    question: str = Field(..., description="The specific interview question the STAR response answers.")
    situation: str = Field(..., description="Describe the specific situation or context from the candidate's experience.")
    task: str = Field(..., description="Describe the task or goal the candidate was trying to achieve.")
    action: str = Field(..., description="Describe the specific actions the candidate took.")
    result: str = Field(..., description="Describe the specific outcome or result of the candidate's actions.")

class CompanyCheatSheet(BaseModel):
    company_summary: Optional[str] = Field(None, description="A brief summary of the company and its industry.")
    relevant_current_events: Optional[List[str]] = Field(None, description="List of relevant current events or news about the company.")
    inferred_cultural_values: Optional[List[str]] = Field(None, description="Inferred cultural values based on the company's description or mission.")
    suggested_questions: Optional[List[str]] = Field(None, description="Specific questions the candidate can ask based on the company analysis.")

class AnalysisResult(BaseModel):
    role_fit_overview: str = Field(..., description="Why the candidate is uniquely poised for this role/company.")
    matched_strengths: List[str] = Field(..., description="List of specific strengths from the resume matching job requirements.")
    skill_gaps_and_mitigation: List[str] = Field(..., description="List of specific skills/experiences possibly missing.")
    tailored_talking_points: List[str] = Field(..., description="List of 3-5 specific talking points mapping resume experience to job skills.")
    star_examples: List[StarExample] = Field(..., description="List of 3 detailed STAR method examples relevant to the role and candidate's likely experience.")
    company_cheat_sheet: Optional[CompanyCheatSheet] = Field(None, description="Optional section with company-specific insights.")

class InterviewPrepAgent:
    def __init__(self, api_key: str):
        """Initialize the interview preparation agent with API key."""
        self.openai_api_key = api_key
        self.llm = ChatOpenAI(
            temperature=0.2,
            openai_api_key=self.openai_api_key,
            model_name="gpt-4o",
            max_tokens=4000
        )
        
        # Question generation chain
        self.question_gen_template = """
        You are an expert interview coach with deep knowledge of the {industry} industry.

        JOB DESCRIPTION:
        {job_description}

        COMPANY:
        {company_name}

        CANDIDATE RESUME:
        {resume}

        LANGUAGE COMPLEXITY:
        {language_complexity}

        Adjust the language, tone, and level of detail of your response according to the language complexity setting above.

        Based on the job description and resume, generate {num_questions} interview questions that are likely to be asked in this interview.
        For each question, provide:
        1. The question itself
        2. A suggested answer tailored to the candidate's background
        3. 3-5 key points the candidate should emphasize

        IMPORTANT: Do not use any placeholders (like '[...]' or similar bracketed text) in your response. All questions, suggested answers, and key points must be specific and based *only* on the provided job description, resume, and company name.

        Format your response as a JSON array of objects, each with keys:
        "question", "suggested_answer", "key_points"
        """
        
        self.question_gen_prompt = PromptTemplate(
            input_variables=["industry", "job_description", "company_name", "resume", "num_questions", "language_complexity"],
            template=self.question_gen_template
        )
        
        # RunnableSequence: prompt | llm
        self.question_gen_chain = self.question_gen_prompt | self.llm
        
        # Analysis chain
        self.analysis_template = """
        You are an expert career coach and communication strategist analyzing a job opportunity for a candidate. Your goal is to provide highly tailored, actionable feedback based *only* on the provided job description, resume, and company name. 

        **CRITICAL INSTRUCTIONS:**
        1.  **Structure:** Generate a response strictly following these six sections, using the EXACT headings provided:
            - Role Fit Overview
            - Matched Strengths
            - Skill Gaps & Mitigation
            - Targeted Talking Points
            - STAR Story Bank
            - Insider Company Cheat Sheet
        2.  **Content Specificity:** Base ALL analysis *directly* on the text within the Job Description and Resume. Avoid generic advice. Use concrete examples and specific phrases from the inputs.
        3.  **Language Complexity Adaptation:** Adjust the length, depth, vocabulary, and sentence structure significantly based on the '{language_complexity}' setting:
            *   **If 'Simple / Fast Read':** Provide concise, direct summaries. Use simple vocabulary. Aim for 1-2 sentences per key point or item. Focus on the absolute essentials.
            *   **If 'Professional':** Offer detailed, professional insights. Use standard business vocabulary. Aim for 3-5 sentences per key point or item. Provide clear, actionable examples.
            *   **If 'Robust / Deep Dive':** Generate comprehensive, in-depth analysis. Use sophisticated vocabulary and complex sentence structures. Aim for 5+ sentences per key point or item. Explore nuances, potential challenges, strategic considerations, and provide multiple concrete examples for each point. The output should be significantly longer and more detailed than 'Professional'.
        4.  **No Placeholders:** Do NOT use placeholders like '[...]', '[Your Example]', or similar bracketed text. Fill in all details.
        5.  **Actionability:** Ensure advice, especially in 'Skill Gaps & Mitigation' and 'Targeted Talking Points', is practical and actionable for the candidate.

        **INPUTS:**
        ----------------
        JOB DESCRIPTION:
        {job_description}
        ----------------
        COMPANY:
        {company_name}
        ----------------
        CANDIDATE RESUME:
        {resume}
        ----------------
        REQUESTED LANGUAGE COMPLEXITY: {language_complexity}
        ----------------

        **OUTPUT SECTIONS (Provide content under these exact headings):**

        **1. Role Fit Overview**
        *   Provide a brief (1-2 sentence) summary statement of the overall fit.
        *   List 3-5 key bullet points highlighting the core alignment between the resume and the role's requirements, referencing specific skills or experiences.
        *   Tailor length and detail according to '{language_complexity}'.

        **2. Matched Strengths**
        *   Identify 3-5 specific strengths from the RESUME that directly match key requirements in the JOB DESCRIPTION.
        *   For each strength, briefly explain the connection and cite specific evidence (e.g., 'Your experience in X directly addresses the requirement for Y').
        *   Tailor length, detail, and number of examples according to '{language_complexity}'.

        **3. Skill Gaps & Mitigation**
        *   Identify 2-4 specific skills or experiences mentioned in the JOB DESCRIPTION that appear less developed or absent in the RESUME.
        *   For each gap, provide 1-2 concrete, *actionable* suggestions for how the candidate can address or mitigate this gap during the interview (e.g., 'Highlight transferable skills from project Z', 'Prepare a STAR story focusing on aspect Q').
        *   Tailor length, detail, and actionability according to '{language_complexity}'. Avoid generic advice like 'learn more'.

        **4. Targeted Talking Points**
        *   Generate 3-5 specific talking points the candidate should weave into the interview.
        *   Each point should link a specific achievement/skill from the RESUME to a specific need/requirement from the JOB DESCRIPTION.
        *   Phrase these as impactful statements (e.g., 'Emphasize how your work optimizing process A led to result B, directly relevant to their need for efficiency gains mentioned in the JD').
        *   Tailor length, detail, and strategic phrasing according to '{language_complexity}'.

        **5. STAR Story Bank**
        *   Suggest 2-3 potential interview questions based on the job description and resume.
        *   For each suggested question, provide a fully fleshed-out STAR example (Situation, Task, Action, Result) based *plausibly* on the candidate's resume.
        *   Ensure the examples are detailed and specific, showcasing relevant skills.
        *   Tailor length, detail, and complexity of the examples according to '{language_complexity}'. 'Simple' might have shorter sentences, 'Robust' might include more context or nuance.

        **6. Insider Company Cheat Sheet**
        *   **Company & Industry Overview:** Brief summary based on the company name and job description context.
        *   **Relevant Current Events:** (Optional - if inferrable or commonly known) Mention 1-2 recent news items or trends potentially relevant to the company/role.
        *   **Inferred Cultural Values:** Based on the job description's language (e.g., 'fast-paced', 'collaborative', 'data-driven'), list 3-5 likely cultural values.
        *   **Suggested Questions to Ask:** Provide 3 insightful, specific questions the candidate could ask the interviewer, related to the role, team, or company direction, reflecting the inferred values or job requirements.
        *   Tailor length and detail according to '{language_complexity}'.
        """
        
        self.analysis_prompt = PromptTemplate(
            input_variables=["job_description", "company_name", "resume", "language_complexity"],
            template=self.analysis_template
        )
        
        self.analysis_chain = self.analysis_prompt | self.llm
        
        # Mock interview chain
        self.mock_interview_template = """
        You are conducting a mock interview for a {role} position at {company_name}.
        
        CONTEXT:
        - Previous question: {previous_question}
        - Candidate's answer: {candidate_answer}
        
        JOB DESCRIPTION:
        {job_description}
        
        CANDIDATE RESUME:
        {resume}
        
        Based on the candidate's answer, provide:
        1. Feedback on the answer (strengths and areas for improvement)
        2. A follow-up question that builds on the previous answer
        
        Format your response as a JSON object with keys:
        "feedback", "follow_up_question"
        """
        
        self.mock_interview_prompt = PromptTemplate(
            input_variables=["role", "company_name", "previous_question", "candidate_answer", "job_description", "resume"],
            template=self.mock_interview_template
        )
        
        self.mock_interview_chain = self.mock_interview_prompt | self.llm
    
    def generate_interview_questions(self, job_description: str, resume: str, company_name: str = "", industry: str = "", num_questions: int = 5, language_complexity: str = "Simple") -> List[Dict[str, Any]]:
        """
        Generate interview questions based on job description and resume.
        
        Args:
            job_description: Text of the job description
            resume: Text of the user's resume
            company_name: Name of the company (optional)
            industry: Industry of the job (optional)
            num_questions: Number of questions to generate
            language_complexity: Language complexity for the questions (optional)
        Returns:
            List of interview questions with suggested answers and key points
        """
        try:
            # If industry not provided, extract from job description
            if not industry:
                industry = "technology"  # Default
            
            # Run the question generation chain
            result = self.question_gen_chain.invoke({
                "industry": industry,
                "job_description": job_description,
                "company_name": company_name,
                "resume": resume,
                "num_questions": num_questions,
                "language_complexity": language_complexity
            })
            content = getattr(result, "content", result)  # Extract .content if present
            # Parse the JSON response
            try:
                questions = json.loads(content)
                return questions
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return self._create_mock_questions(job_description)
                
        except Exception as e:
            print(f"Error in question generation: {str(e)}")
            return self._create_mock_questions(job_description)
    
    def analyze_interview_fit(self, job_description: str, resume: str, company_name: str = "", language_complexity: str = "Simple") -> Dict[str, List[str]]:
        """
        Analyze how well a candidate fits a job and provide preparation advice.
        
        Args:
            job_description: Text of the job description
            resume: Text of the user's resume
            company_name: Name of the company (optional)
            language_complexity: Language complexity of the analysis (optional)
        Returns:
            Dictionary with strengths, potential gaps, and preparation tips
        """
        logger.info(f"Analyzing interview fit with language complexity: {language_complexity}")
        try:
            # Run the analysis chain
            result = self.analysis_chain.invoke({
                "job_description": job_description,
                "company_name": company_name,
                "resume": resume,
                "language_complexity": language_complexity
            })
            content = getattr(result, "content", str(result))  # Extract content, ensure it's a string
            logger.info(f"Raw AI Response Content:\n{content[:500]}...") # Log beginning of raw response

            # --- Parse Structured Text Response --- 
            # Define regex patterns for headings (making number optional and handling bold markdown)
            headings = [
                "Role Fit Overview",
                "Matched Strengths",
                "Skill Gaps & Mitigation",
                "Targeted Talking Points",
                "STAR Story Bank",
                "Insider Company Cheat Sheet"
            ]
            # Pattern looks for '**', optional number and dot, the heading text, '**'
            pattern = r"\*\*(?:\d\.\s*)?(" + "|".join(re.escape(h) for h in headings) + r")\*\*"
            
            # Split the content based on the headings
            parts = re.split(pattern, content)
            
            analysis_dict = {}
            current_heading = None
            
            # The first part before any heading is discarded or handled if needed
            # Iterate through the split parts, associating text with headings
            for i in range(1, len(parts), 2): # Step by 2: heading, text, heading, text...
                heading = parts[i].strip()
                text_content = parts[i+1].strip() if (i+1) < len(parts) else ""
                
                # Map parsed heading to dictionary keys
                if heading == "Role Fit Overview":
                    analysis_dict["role_fit_overview"] = text_content
                elif heading == "Matched Strengths":
                    # Simple parsing: split by newline, filter empty
                    analysis_dict["matched_strengths"] = [s.strip().lstrip('-* ') for s in text_content.split('\n') if s.strip()]
                elif heading == "Skill Gaps & Mitigation":
                    analysis_dict["skill_gaps_and_mitigation"] = [s.strip().lstrip('-* ') for s in text_content.split('\n') if s.strip()]
                elif heading == "Targeted Talking Points":
                    analysis_dict["tailored_talking_points"] = [s.strip().lstrip('-* ') for s in text_content.split('\n') if s.strip()]
                elif heading == "STAR Story Bank":
                    # More complex parsing needed for STAR examples
                    # For now, just store the raw text block
                    # TODO: Implement detailed STAR parsing if needed
                    analysis_dict["star_examples_text"] = text_content 
                    analysis_dict["star_examples"] = [] # Placeholder
                elif heading == "Insider Company Cheat Sheet":
                     analysis_dict["company_cheat_sheet"] = None # Initialize as None
                     try:
                         # Attempt basic parsing within the cheat sheet block
                         cheat_sheet_data = {}
                         # Example: Extract overview (assuming first paragraph)
                         overview_match = re.search(r"Company & Industry Overview:(.*?)(Relevant Current Events:|Inferred Cultural Values:|Suggested Questions to Ask:|$)", text_content, re.IGNORECASE | re.DOTALL)
                         if overview_match:
                            cheat_sheet_data["company_summary"] = overview_match.group(1).strip()
                         
                         # Example: Extract values (assuming bullet points under heading)
                         values_match = re.search(r"Inferred Cultural Values:(.*?)(Suggested Questions to Ask:|$)", text_content, re.IGNORECASE | re.DOTALL)
                         if values_match:
                             values_text = values_match.group(1)
                             cheat_sheet_data["inferred_cultural_values"] = [v.strip().lstrip('-* ') for v in values_text.split('\n') if v.strip()]
                         else:
                             cheat_sheet_data["inferred_cultural_values"] = [] # Default empty list if not found
                             
                         # Example: Extract suggested questions (assuming bullet points under heading)
                         questions_match = re.search(r"Suggested Questions to Ask:(.*?)$", text_content, re.IGNORECASE | re.DOTALL)
                         if questions_match:
                             questions_text = questions_match.group(1)
                             cheat_sheet_data["suggested_questions"] = [q.strip().lstrip('-* ') for q in questions_text.split('\n') if q.strip()]
                         else:
                             cheat_sheet_data["suggested_questions"] = [] # Default empty list if not found
                             
                         # Add relevant_current_events if parsed (add parsing logic if needed)
                         cheat_sheet_data.setdefault("relevant_current_events", []) # Default empty list

                         # If we successfully parsed something meaningful, assign the dict
                         if cheat_sheet_data.get("company_summary") or cheat_sheet_data.get("inferred_cultural_values") or cheat_sheet_data.get("suggested_questions"):
                             analysis_dict["company_cheat_sheet"] = cheat_sheet_data
                         
                     except Exception as parse_err:
                         logger.warning(f"Could not parse 'Insider Company Cheat Sheet': {parse_err}")
                         analysis_dict["company_cheat_sheet"] = None # Ensure it's None on error

            # Basic validation: check if essential keys were found
            if not analysis_dict.get("role_fit_overview"):
                 logger.warning("Could not parse 'Role Fit Overview' from AI response.")
                 # Optionally return error or try alternative parsing

            # --- Return Parsed Data --- 
            # Return the dictionary with parsed sections
            # Note: STAR and Cheat Sheet parsing is basic for now
            return {
                "role_fit_overview": analysis_dict.get("role_fit_overview", "Parsing error or section not found."),
                "matched_strengths": analysis_dict.get("matched_strengths", []),
                "skill_gaps_and_mitigation": analysis_dict.get("skill_gaps_and_mitigation", []),
                "tailored_talking_points": analysis_dict.get("tailored_talking_points", []),
                "star_examples": analysis_dict.get("star_examples", []), # Still placeholder list
                "company_cheat_sheet": analysis_dict.get("company_cheat_sheet", None) # Default to None if not parsed
                # Optionally include raw text for complex sections if parsing fails:
                # "star_examples_text": analysis_dict.get("star_examples_text", ""),
                # "company_cheat_sheet_text": analysis_dict.get("company_cheat_sheet_text", "")
            }

        except Exception as e:
            logger.error(f"Error in interview analysis or parsing: {str(e)}", exc_info=True) # Log full traceback
            # Return an error structure instead of fallback data
            return {
                "error": "Failed to generate or parse interview analysis.",
                "details": str(e)
            }
    
    def conduct_mock_interview(self, previous_question: str, candidate_answer: str, job_description: str, resume: str, role: str = "", company_name: str = "") -> Dict[str, str]:
        """
        Provide feedback on a candidate's answer and generate a follow-up question.
        
        Args:
            previous_question: The question the candidate answered
            candidate_answer: The candidate's answer
            job_description: Text of the job description
            resume: Text of the user's resume
            role: Job role (optional)
            company_name: Name of the company (optional)
            
        Returns:
            Dictionary with feedback and follow-up question
        """
        try:
            # If role not provided, extract from job description
            if not role:
                role = "professional"  # Default
            
            # Run the mock interview chain
            result = self.mock_interview_chain.invoke({
                "role": role,
                "company_name": company_name,
                "previous_question": previous_question,
                "candidate_answer": candidate_answer,
                "job_description": job_description,
                "resume": resume
            })
            content = getattr(result, "content", result)  # Extract .content if present
            # Parse the JSON response
            try:
                response = json.loads(content)
                return {
                    "feedback": response.get("feedback", ""),
                    "follow_up_question": response.get("follow_up_question", "")
                }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "feedback": "Your answer demonstrated good knowledge, but could be more specific with examples.",
                    "follow_up_question": "Can you elaborate on a specific instance where you applied these skills?"
                }
                
        except Exception as e:
            print(f"Error in mock interview: {str(e)}")
            return {
                "feedback": "Your answer demonstrated good knowledge, but could be more specific with examples.",
                "follow_up_question": "Can you elaborate on a specific instance where you applied these skills?"
            }
    
    def _create_mock_questions(self, job_description: str) -> List[Dict[str, Any]]:
        """
        Create mock interview questions for testing.
        In a real implementation, this would be replaced with actual generated questions.
        """
        return [] # Return empty list to remove placeholders
