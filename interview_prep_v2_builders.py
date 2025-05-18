import asyncio
from typing import Optional, List, Dict, Any
from pydantic import BaseModel # Added for internal models
from interview_prep_v2_models import (
    WelcomeSectionModel, CompanyIndustrySectionModel, RoleSuccessFactorsSection, EvaluatedRequirementItemModel, RoleUnderstandingFitAssessmentSectionModel, # CandidateFitMatrixSectionModel, FitMatrixRow removed
    StarStoryBankSectionModel, StarStory, TechnicalCasePrepSectionModel, CaseStudyPrompt, KeyTerm,
    MockInterviewSectionModel, InsiderCheatSheetSectionModel, 
    OfferNegotiationSectionModel, ExportShareSectionModel, NewsItem,
    JobDescriptionStructured
)
from openai_resume_jd_parsing import parse_resume_with_openai, parse_jd_with_openai
from company_profile_agent import fetch_company_profile, parse_company_profile_sections
from serpapi_news_fetcher import fetch_recent_news
import openai
import os # Added
import json
import logging
import re

logger = logging.getLogger(__name__)
# Configure basic logging if not already configured elsewhere in the application context
if not logging.getLogger().hasHandlers():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Initialize AsyncOpenAI client
# Assumes OPENAI_API_KEY is available in the environment (e.g., loaded by main.py via python-dotenv)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("CRITICAL WARNING: OPENAI_API_KEY not found in environment for interview_prep_v2_builders.py. OpenAI calls will fail.")
    # Provide a fallback or raise an error if essential, for now, it will likely fail if not set.
    # OPENAI_API_KEY = "your_fallback_key_if_absolutely_necessary_and_secure"
async_openai_client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)

import difflib

async def build_profile_sections(
    company_name: str,
    jd_structured: Dict[str, Any],
    job_description: str
) -> Dict[str, Any]:
    """
    Fetches and parses the raw company profile sections via GPT.
    """
    parsed_jd_role = jd_structured.get("role_title") or job_description[:40]
    profile_text = await fetch_company_profile(company_name or "", parsed_jd_role or "")
    sections = parse_company_profile_sections(profile_text)
    if not sections.get("overview"):
        raise ValueError("Company overview missing from GPT response.")
    return sections


def build_welcome_section(
    company_name: Optional[str]
) -> WelcomeSectionModel:
    return WelcomeSectionModel(
        intro=f"Welcome! Preparing for {company_name or 'your target company'}.",
        quick_view_enabled=True,
        deep_dive_enabled=True,
        progress=0.0
    )


async def build_company_industry_section(
    company_name: str,
    jd_structured: Dict[str, Any],
    job_description: str
) -> CompanyIndustrySectionModel:
    sections = await build_profile_sections(company_name, jd_structured, job_description)
    # Fetch recent news via SerpAPI
    try:
        news_results = await fetch_recent_news(company_name, max_articles=5)
    except Exception as e:
        print(f"Recent news fetch failed: {e}")
        news_results = []
    recent_news_items: List[NewsItem] = []
    for idx, item in enumerate(news_results, start=1):
        recent_news_items.append(NewsItem(
            title=item.get("title", ""),
            url=item.get("url", ""),
            date=item.get("published_at", ""),
            source=item.get("source", ""),
            summary=item.get("snippet", "")
        ))
    # Map parsed 'facts' from company profile as industry drivers
    industry_drivers = sections.get("facts", [])
    return CompanyIndustrySectionModel(
        company_overview=sections["overview"],
        recent_news=recent_news_items,
        industry_drivers=industry_drivers
    )


async def build_role_success_section(
    jd_structured: JobDescriptionStructured,
    resume_bullets: str  # New parameter
) -> RoleSuccessFactorsSection:
    print(f"BUILDER: build_role_success_section received jd_structured.requirements: {jd_structured.requirements}")
    print(f"BUILDER: build_role_success_section received jd_structured.responsibilities: {jd_structured.responsibilities}")
    
    # These are the raw texts used as input for the LLM
    jd_requirements_texts = jd_structured.requirements if jd_structured and jd_structured.requirements else []
    jd_responsibilities_texts = jd_structured.responsibilities if jd_structured and jd_structured.responsibilities else []

    # These fields in RoleSuccessFactorsSection will still store the raw lists for display purposes if needed
    # The LLM will independently evaluate them for the 'must_haves' and 'nice_to_haves' evaluated fields.
    raw_job_duties = jd_responsibilities_texts # Responsibilities -> What you will do (raw)
    raw_qualifications = jd_requirements_texts  # Requirements -> Qualifications (raw)

    class _FullRoleAssessmentResponse(BaseModel):
        evaluated_must_haves: List[EvaluatedRequirementItemModel]
        evaluated_nice_to_haves: List[EvaluatedRequirementItemModel]
        overall_readiness: str
        focus_recommendations: List[str]

    system_prompt = f"""
You are an expert career coach and talent analyst. Your task is to evaluate a candidate's fit for a role based on their resume and the job description.

You will be provided with:
1. `jd_requirements`: A list of requirements from the job description
2. `jd_responsibilities`: A list of responsibilities from the job description
3. `resume_bullets`: The candidate's resume content

Your evaluation should be thorough, evidence-based, and focused on the candidate's potential to succeed in the role. Consider both explicit matches and transferable skills.

Please provide your assessment in the following format:

1. Must-Have Qualifications:
   - Select 5-7 critical requirements from the JD
   - For each, indicate if the candidate meets the requirement based on their resume
   - Provide specific evidence from their experience that demonstrates each met requirement
   - For unmet requirements, note what's missing

2. Nice-to-Have Qualifications:
   - Identify 3-5 additional valuable skills or experiences
   - Assess if the candidate has these qualifications
   - Provide specific examples from their background

3. Overall Assessment:
   - Summarize the candidate's strengths for this role
   - Note any potential gaps in their experience
   - Provide actionable recommendations for addressing any gaps

Format your response as a JSON object matching this schema:
{_FullRoleAssessmentResponse.schema_json(indent=2)}

Key Guidelines:
- Be specific and evidence-based in your evaluation
- Consider both direct experience and transferable skills
- Look for patterns of achievement and impact in the candidate's background
- Be constructive in identifying areas for development
- Focus on the most important qualifications for role success
"""
    
    user_content = json.dumps({
        "jd_requirements": jd_requirements_texts,
        "jd_responsibilities": jd_responsibilities_texts,
        "resume_bullets": resume_bullets
    })

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    evaluated_must_haves_result: List[EvaluatedRequirementItemModel] = []
    evaluated_nice_to_haves_result: List[EvaluatedRequirementItemModel] = []
    overall_readiness_result = "Could not generate overall readiness assessment at this time."
    focus_recommendations_result = []

    content_str_for_error = ""  # Initialize for error reporting
    try:
        response = await async_openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        
        content_str_for_error = response.choices[0].message.content
        if not content_str_for_error:
            print("OpenAI returned empty content for role success section.")
            return RoleSuccessFactorsSection(
                must_haves=[],
                nice_to_haves=[],
                job_duties=jd_responsibilities_texts,
                qualifications=jd_requirements_texts,
                overall_readiness="Error: Could not generate assessment (empty LLM response).",
                focus_recommendations=["Error: Could not generate focus recommendations."]
            )
            
        parsed_content = json.loads(content_str_for_error)
        assessment_data = _FullRoleAssessmentResponse(**parsed_content)
        evaluated_must_haves_result = assessment_data.evaluated_must_haves
        evaluated_nice_to_haves_result = assessment_data.evaluated_nice_to_haves
        overall_readiness_result = assessment_data.overall_readiness
        focus_recommendations_result = assessment_data.focus_recommendations
        
    except json.JSONDecodeError as e:
        error_message = f"JSONDecodeError in build_role_success_section: {e}. Problematic content: {content_str_for_error}"
        print(error_message)
        return RoleSuccessFactorsSection(
            must_haves=[],
            nice_to_haves=[],
            job_duties=jd_responsibilities_texts,
            qualifications=jd_requirements_texts,
            overall_readiness="Error: Could not generate assessment due to a parsing error.",
            focus_recommendations=["Error: Could not generate focus recommendations due to a parsing error."]
        )
    except Exception as e:
        error_message = f"Unexpected error in build_role_success_section: {e}. Content from LLM (if available): {content_str_for_error}"
        print(error_message)
        return RoleSuccessFactorsSection(
            must_haves=[],
            nice_to_haves=[],
            job_duties=jd_responsibilities_texts,
            qualifications=jd_requirements_texts,
            overall_readiness="Error: Could not generate assessment due to an unexpected error.",
            focus_recommendations=["Error: Could not generate focus recommendations."]
        )

    return RoleSuccessFactorsSection(
        must_haves=evaluated_must_haves_result,
        nice_to_haves=evaluated_nice_to_haves_result,
        job_duties=raw_job_duties, # Keep raw duties for general info
        qualifications=raw_qualifications, # Keep raw qualifications for general info
        overall_readiness=overall_readiness_result,
        focus_recommendations=focus_recommendations_result
    )




async def build_role_understanding_fit_assessment_section(
    jd_structured: JobDescriptionStructured,
    resume_bullets: str
) -> RoleUnderstandingFitAssessmentSectionModel:
    """
    Generates a section that explains the role and assesses candidate fit based on JD and resume.
    """
    content_str_for_error = "" # Initialize for error reporting
    try:
        schema_json = RoleUnderstandingFitAssessmentSectionModel.schema_json(indent=2)
        
        system_prompt = f"""
You are an expert career coach and talent analyst. Your task is to help a candidate understand a potential role and their fit for it.
You will be provided with a structured Job Description (JD) and a string containing the candidate's resume bullets.
You MUST return a JSON object that strictly adheres to the following Pydantic model schema:

```json
{schema_json}
```

Instructions:

Phase 1: Role Understanding
Based on the provided structured Job Description (JD), first, clearly and concisely explain:
1.  `role_summary`: In 2-3 sentences, what is the core purpose and essence of this role? Use simple, everyday language.
2.  `key_responsibilities_summary`: List 3-5 bullet points summarizing the main things someone in this role would be doing regularly. Avoid jargon from the JD; rephrase for clarity.

Phase 2: Candidate Fit Assessment
Now, considering the candidate's `resume_bullets` and your understanding of the role from Phase 1:
3.  `overall_fit_rating`: Provide a qualitative assessment (e.g., 'Strong Fit', 'Good Potential Fit', 'Potential Gaps Identified', 'Challenging Fit').
4.  `fit_assessment_details`: Write a comprehensive but easy-to-read paragraph.
    *   Explain your `overall_fit_rating`.
    *   If it's a good fit, highlight specific experiences or skills from the resume that align directly with the `role_summary` and `key_responsibilities_summary`.
    *   If there are gaps or it's a challenging fit, gently but honestly point out which aspects of the role don't seem to be strongly supported by the resume, or what experiences might be missing.
    *   The tone should be constructive and evaluative. Ensure this explanation is thorough and directly references both the JD aspects and resume points.
"""
        user_content = {
            "job_description_structured": jd_structured.dict(exclude_none=True),
            "resume_bullets": resume_bullets
        }

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_content)}
        ]

        response = await async_openai_client.chat.completions.create(
            model="gpt-4-turbo", 
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        
        content_str_for_error = response.choices[0].message.content
        if not content_str_for_error:
            print("OpenAI returned empty content for role understanding/fit assessment.")
            return RoleUnderstandingFitAssessmentSectionModel(
                role_summary="Error: Could not generate role summary (empty LLM response).",
                key_responsibilities_summary=[],
                overall_fit_rating="Error",
                fit_assessment_details="Error: Could not generate fit assessment details (empty LLM response)."
            )
        
        parsed_section = RoleUnderstandingFitAssessmentSectionModel.parse_raw(content_str_for_error)
        return parsed_section

    except json.JSONDecodeError as e:
        error_message = f"JSONDecodeError in build_role_understanding_fit_assessment_section: {e}. Problematic content from LLM: {content_str_for_error}"
        print(error_message)
        return RoleUnderstandingFitAssessmentSectionModel(
            role_summary="Error: Could not generate role summary due to a parsing error.",
            key_responsibilities_summary=[],
            overall_fit_rating="Error",
            fit_assessment_details=error_message
        )
    except Exception as e:
        error_message = f"Unexpected error in build_role_understanding_fit_assessment_section: {e}. Content from LLM (if available): {content_str_for_error}"
        print(error_message)
        return RoleUnderstandingFitAssessmentSectionModel(
            role_summary="Error: Could not generate role summary due to an unexpected error.",
            key_responsibilities_summary=[],
            overall_fit_rating="Error",
            fit_assessment_details=error_message
        )


async def build_star_story_bank_section(
    resume_structured: Dict[str, Any],
    jd_structured: Dict[str, Any]
) -> StarStoryBankSectionModel:
    """
    Use OpenAI to generate STAR stories from resume achievements.
    """
    schema_dict = StarStoryBankSectionModel.model_json_schema()
    schema_json = json.dumps(schema_dict, indent=2)

    # --- Enhanced Achievement Extraction ---
    all_achievements = []
    # 1. Get top-level achievements if any
    if isinstance(resume_structured.get("achievements"), list):
        all_achievements.extend(resume_structured.get("achievements"))

    # 2. Get achievements from position descriptions
    positions = resume_structured.get("positions", [])
    if isinstance(positions, list):
        for position in positions:
            if isinstance(position, dict) and position.get("description"):
                # Split description string into individual bullet points
                # This assumes bullets might be separated by newlines or common bullet characters
                description_bullets = []
                raw_desc = position.get("description", "")
                # Simple split by newline, can be enhanced
                possible_bullets = raw_desc.split('\n') 
                for pb in possible_bullets:
                    # Remove common bullet characters and trim whitespace
                    cleaned_bullet = pb.replace('●', '').replace('*', '').replace('-', '').strip()
                    if cleaned_bullet: # Only add non-empty bullets
                        description_bullets.append(cleaned_bullet)
                all_achievements.extend(description_bullets)
            elif hasattr(position, 'description') and position.description: # If positions are already Pydantic models
                description_bullets = []
                raw_desc = position.description
                possible_bullets = raw_desc.split('\n')
                for pb in possible_bullets:
                    cleaned_bullet = pb.replace('●', '').replace('*', '').replace('-', '').strip()
                    if cleaned_bullet:
                        description_bullets.append(cleaned_bullet)
                all_achievements.extend(description_bullets)

    # Remove duplicates and ensure we have some achievements
    unique_achievements = sorted(list(set(all_achievements)), key=all_achievements.index)
    if not unique_achievements:
        print("No achievements found in resume_structured to generate STAR stories.")
        return StarStoryBankSectionModel(stories=[])
    # --- End Enhanced Achievement Extraction ---

    # Prepare job description context for the prompt
    jd_requirements = jd_structured.get("requirements", [])
    jd_responsibilities = jd_structured.get("responsibilities", [])
    jd_role_title = jd_structured.get("role_title", "the target role")
    jd_context_str = f"Job Title: {jd_role_title}\nKey Requirements: {'; '.join(jd_requirements[:5])}\nKey Responsibilities: {'; '.join(jd_responsibilities[:3])}"

    messages = [
        {"role": "system", "content": (
            f"You are an expert interview coach and resume writer. You will be given a list of resume achievements and context about a job description. "
            f"Your task is to generate 2-3 unique STAR stories based on the provided achievements, making them relevant to the job description. "
            f"For each STAR story, you MUST:"
            f"1. Formulate a 'behavioral_question' an interviewer might ask for {jd_role_title} that the STAR story can answer. This question should reflect common interview scenarios and be tailored to the provided job context."
            f"2. Identify a 'competency' (e.g., 'Problem Solving', 'Leadership', 'Teamwork', 'Initiative', 'Adaptability', 'Communication') that the story and question highlight. This competency will serve as the title for the story."
            f"3. Construct the STAR story with 'situation', 'task', 'action', and 'result' fields based on one of the resume achievements."
            f"4. Provide 'interviewer_advice' (2-3 sentences) explaining what an interviewer is likely trying to assess with this type of question and what the candidate should emphasize in their answer."
            f"5. Optionally, include a list of 'tags' (keywords) relevant to the story."
            f"You MUST return a JSON object. This JSON object should contain a single key 'stories', which is a list of these story objects. "
            f"Each story object in the 'stories' list MUST have the fields: 'competency' (string), 'behavioral_question' (string), 'situation' (string), 'task' (string), 'action' (string), 'result' (string), 'interviewer_advice' (string), and 'tags' (list of strings)."
            f"Your entire output must be ONLY the JSON object, strictly adhering to this structure and the Pydantic model schema provided below. Do not include any extra explanations or conversational text.\n\n"
            f"Pydantic JSON Schema to follow:\n{schema_json}"
        )},
        {"role": "user", "content": json.dumps({
            "resume_achievements": unique_achievements[:10], # Send up to 10 unique achievements
            "job_description_context": jd_context_str
        })}
    ]
    content_str_for_error = "" # Initialize for error reporting
    try:
        # Using gpt-4-turbo as it's generally better with JSON and complex instructions
        # Ensure the model used supports response_format={"type": "json_object"}
        # gpt-3.5-turbo might need a newer version like gpt-3.5-turbo-0125
        response = await async_openai_client.chat.completions.create(
            model="gpt-4-turbo", # Or "gpt-3.5-turbo-0125" or newer that supports JSON mode
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.5
        )
        
        content_str_for_error = response.choices[0].message.content
        if not content_str_for_error:
            print("OpenAI returned empty content for STAR stories.")
            return StarStoryBankSectionModel(stories=[]) # Return empty stories list
        
        parsed_section = StarStoryBankSectionModel.parse_raw(content_str_for_error)
        return parsed_section

    except json.JSONDecodeError as e:
        error_message = f"JSONDecodeError in build_star_story_bank_section: {e}. Problematic content from LLM: {content_str_for_error}"
        print(error_message)
        return StarStoryBankSectionModel(stories=[])
    except Exception as e:
        # Catching openai.APIError specifically could be useful too
        error_message = f"Unexpected error in build_star_story_bank_section: {e}. Content from LLM (if available): {content_str_for_error}"
        print(error_message)
        return StarStoryBankSectionModel(stories=[])


async def build_technical_case_prep_section(
    jd_structured: JobDescriptionStructured
) -> TechnicalCasePrepSectionModel:
    """
    Generate comprehensive technical case preparation materials including:
    - Key technical concepts for the role
    - Practice case studies with sample answers and resources
    - A sample case walkthrough
    - Technical terms glossary
    - Preparation tips
    """
    if not jd_structured or not isinstance(jd_structured, JobDescriptionStructured):
        logger.warning("No valid structured job description provided. Returning empty section.")
        return TechnicalCasePrepSectionModel()

    role_title = jd_structured.role_title or "this technical role"
    company = getattr(jd_structured, 'company_name', 'the company') or 'the company'
    
    # Prepare job description details
    responsibilities = "\n- ".join(jd_structured.responsibilities) if jd_structured.responsibilities else "Not specified"
    requirements = "\n- ".join(jd_structured.requirements) if jd_structured.requirements else "Not specified"
    
    # Enhanced system prompt for comprehensive technical prep
    system_prompt = """You are an expert technical interviewer and career coach with deep experience in technical hiring 
    across various domains. Your task is to create comprehensive technical interview preparation materials 
    tailored to a specific job role."""
    
    user_content = f"""
    Please generate comprehensive technical interview preparation materials for a candidate applying to the following role:
    
    ROLE: {role_title}
    COMPANY: {company}
    
    KEY RESPONSIBILITIES:
    - {responsibilities}
    
    REQUIRED SKILLS/QUALIFICATIONS:
    - {requirements}
    
    Please provide the following in a structured JSON format:
    
    1. key_concepts: List of 5-10 core technical concepts critical for this role
    2. prompts: 3-5 technical case studies or coding challenges, each with:
       - question: The technical problem or scenario
       - sample_answer: A detailed, step-by-step solution
       - resources: 2-3 relevant learning resources (with titles and URLs)
       - difficulty: Easy/Medium/Hard
       - time_estimate: Estimated time to solve
       - category: Problem type (e.g., System Design, Algorithms, Data Structures)
    3. sample_case_walkthrough: A detailed walkthrough of solving one technical problem
    4. key_terms_glossary: 10-15 technical terms with definitions and related terms
    5. preparation_tips: 5-7 actionable tips for technical interview preparation
    
    Format the response as a valid JSON object with these top-level keys.
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    try:
        logger.info(f"Generating technical case prep for role: {role_title}")
        
        # Use a more capable model for comprehensive generation
        response = await async_openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            temperature=0.5,  # Lower temperature for more focused, accurate responses
            response_format={"type": "json_object"},
            max_tokens=4000  # Increased for comprehensive responses
        )
        
        llm_output = response.choices[0].message.content
        logger.debug(f"Raw LLM output for technical prep: {llm_output}")

        if llm_output:
            try:
                # Parse the JSON response
                parsed_data = json.loads(llm_output)
                
                # Transform the data to match our Pydantic models
                prompts = [
                    CaseStudyPrompt(
                        question=p["question"],
                        sample_answer=p["sample_answer"],
                        resources=p.get("resources", []),
                        difficulty=p.get("difficulty", "Medium"),
                        time_estimate=p.get("time_estimate", "30 minutes"),
                        category=p.get("category", "Problem Solving")
                    )
                    for p in parsed_data.get("prompts", [])
                ]
                
                key_terms_data = parsed_data.get("key_terms_glossary", {})
                key_terms = []
                if isinstance(key_terms_data, dict):
                    for term_str, definition_str in key_terms_data.items():
                        key_terms.append(KeyTerm(term=term_str, definition=definition_str))
                elif isinstance(key_terms_data, list): # Fallback for old list format, if ever encountered
                    for item in key_terms_data:
                        if isinstance(item, dict) and "term" in item and "definition" in item:
                            key_terms.append(KeyTerm(term=item["term"], definition=item["definition"], related_terms=item.get("related_terms", [])))
                    logging.warning("Processed key_terms_glossary as a list of dicts, which is an older format.")
                else:
                    logging.warning(f"key_terms_glossary was not a dict or list, but {type(key_terms_data)}. Skipping.")
                
                sample_case_walkthrough_data = parsed_data.get("sample_case_walkthrough")
                sample_case_walkthrough_str = None
                if isinstance(sample_case_walkthrough_data, str):
                    sample_case_walkthrough_str = sample_case_walkthrough_data
                elif isinstance(sample_case_walkthrough_data, dict):
                    logger.warning(f"sample_case_walkthrough was a dict, converting to JSON string: {sample_case_walkthrough_data}")
                    try:
                        sample_case_walkthrough_str = json.dumps(sample_case_walkthrough_data, indent=2)
                    except TypeError as e:
                        logger.error(f"Could not serialize sample_case_walkthrough dict to JSON: {e}. Falling back to str().")
                        sample_case_walkthrough_str = str(sample_case_walkthrough_data) # Fallback if dict not serializable
                elif sample_case_walkthrough_data is not None:
                    logger.warning(f"sample_case_walkthrough was unexpected type {type(sample_case_walkthrough_data)}, converting to str: {sample_case_walkthrough_data}")
                    sample_case_walkthrough_str = str(sample_case_walkthrough_data)

                return TechnicalCasePrepSectionModel(
                    key_concepts=parsed_data.get("key_concepts", []),
                    prompts=prompts,
                    sample_case_walkthrough=sample_case_walkthrough_str,
                    key_terms_glossary=key_terms,
                    preparation_tips=parsed_data.get("preparation_tips", [])
                )
                
            except (json.JSONDecodeError, KeyError, TypeError) as e:
                logger.error(f"Error parsing technical prep data: {e}\nRaw output: {llm_output}")
                raise ValueError("Failed to parse technical preparation data")
        
        return TechnicalCasePrepSectionModel()
        
    except openai.APIError as e:
        logger.error(f"OpenAI API error in build_technical_case_prep_section: {e}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Unexpected error in build_technical_case_prep_section: {e}", exc_info=True)
        raise


async def build_insider_cheat_sheet_section(
    company_name: str,
    jd_structured: Dict[str, Any],
    job_description: str
) -> InsiderCheatSheetSectionModel:
    # Generate insider cheat sheet with cultural, exec, financial, and candidate questions
    function_def = {
        "name": "generate_insider_cheat_sheet",
        "description": "Generate insider cheat sheet details for company and role",
        "parameters": InsiderCheatSheetSectionModel.schema()
    }
    messages = [
        {"role": "system", "content": (
            "You are a seasoned industry analyst. Given the company name, job description, and JD requirements, "
            "generate: culture_cues (5 key cultural insights), exec_quotes (3 executive quotes about strategy), "
            "financial_snapshot (one-paragraph overview of company financials), glassdoor_pain_points (5 candidate concerns), "
            "and tailored_questions (5 insightful questions to ask in interview). Return JSON matching InsiderCheatSheetSectionModel schema."
        )},
        {"role": "system", "content": f"Job description: {job_description}"},
        {"role": "system", "content": f"JD requirements: {json.dumps(jd_structured.get('requirements', []))}"},
        {"role": "user", "content": json.dumps({"company_name": company_name})}
    ]
    response = await openai.chat.completions.create(
        model="gpt-4.1-nano",
        messages=messages,
        temperature=0.7
    )
    content_str = response.choices[0].message.content
    try:
        parsed_args = json.loads(content_str)
        return InsiderCheatSheetSectionModel(**parsed_args)
    except json.JSONDecodeError as e:
        print(f"Error generating insider cheat sheet section: {e}")
        print(f"Problematic content: {content_str}")
        return InsiderCheatSheetSectionModel(culture_cues=[], exec_quotes=[], financial_snapshot="", glassdoor_pain_points=[], tailored_questions=[])
    except Exception as e:
        print(f"Error generating insider cheat sheet section: {e}")
        return InsiderCheatSheetSectionModel(culture_cues=[], exec_quotes=[], financial_snapshot="", glassdoor_pain_points=[], tailored_questions=[])


def build_offer_negotiation_section(
    company_name: Optional[str]
) -> OfferNegotiationSectionModel:
    """
    Use OpenAI to generate compensation range benchmarks and alternative negotiation levers.
    """
    function_def = {
        "name": "generate_offer_negotiation",
        "description": "Generate compensation benchmarks and negotiation strategies",
        "parameters": OfferNegotiationSectionModel.schema()
    }
    messages = [
        {"role": "system", "content": (
            "You are an expert HR consultant. For a candidate at {company_name or 'the company'}, "
            "list 3 compensation range benchmarks by role level and geography, plus 5 creative negotiation levers (e.g., equity, bonuses, benefits). "
            "Return JSON matching OfferNegotiationSectionModel schema."
        )},
        {"role": "user", "content": json.dumps({"company_name": company_name})}
    ]
    response = openai.chat.completions.create(
        model="gpt-4.1-nano",
        messages=messages,
        temperature=0.7
    )
    content_str = response.choices[0].message.content
    try:
        parsed_args = json.loads(content_str)
        return OfferNegotiationSectionModel(**parsed_args)
    except json.JSONDecodeError as e:
        print(f"Error generating offer negotiation section: {e}")
        print(f"Problematic content: {content_str}")
        return OfferNegotiationSectionModel(comp_range_benchmarks=[], alternative_levers=[], premium_required=False)
    except Exception as e:
        print(f"Error generating offer negotiation section: {e}")
        return OfferNegotiationSectionModel(comp_range_benchmarks=[], alternative_levers=[], premium_required=False)


def build_export_share_section() -> ExportShareSectionModel:
    return ExportShareSectionModel(
        pdf_export_enabled=True,
        notion_export_enabled=True,
        send_to_coach_enabled=True
    )
