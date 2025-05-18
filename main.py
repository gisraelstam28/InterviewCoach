import openai
import logging
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pdf_export import router as pdf_export_router
from followup_qa import router as followup_qa_router
from fastapi import HTTPException, UploadFile, File, Form, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from typing import Optional, List, Dict, Any, Union, Literal
import json
import asyncio
from prompts import (
    INTERVIEW_PREP_V2_SYSTEM_PROMPT_A_COMPANY,
    INTERVIEW_PREP_V2_SYSTEM_PROMPT_B_CANDIDATE_ROLE,
    INTERVIEW_PREP_V2_RESUME_BULLETS_SYSTEM_PROMPT_TEMPLATE,
    INTERVIEW_PREP_V2_USER_PROMPT_TEMPLATE_A_COMPANY,
    INTERVIEW_PREP_V2_USER_PROMPT_TEMPLATE_B_CANDIDATE_ROLE,
    INTERVIEW_PREP_V2_SYSTEM_PROMPT_C_INSIDER_CHEAT_SHEET  # Added for Call C
)
from interview_prep_v2_builders import build_role_success_section, build_role_understanding_fit_assessment_section, build_star_story_bank_section, build_technical_case_prep_section # Added import
from langchain_core.messages import SystemMessage, HumanMessage # Added import
from interview_prep_v2_models import (
    JobDescriptionStructured,
    ResumeStructured,
    InterviewPrepV2Guide,
    WelcomeSectionModel, # Added this import
    CompanyIndustrySectionModel,
    RoleSuccessFactorsSection,
    RoleUnderstandingFitAssessmentSectionModel, # Replaced CandidateFitMatrixSectionModel
    StarStoryBankSectionModel,
    StarStory,  # Added import
    TechnicalCasePrepSectionModel,
    QuestionsToAskSectionModel,
    OfferNegotiationSectionModel,
    InsiderCheatSheetSectionModel, # Added for InsiderCheatSheetSectionModel (was CompanyCheatSheet)
    MockInterviewSectionModel, # Added for LLM Call B
    ExportShareSectionModel # Added this import
)
from job_search_agent import JobSearchAgent
from job_search_pipeline import search_jobs_serpapi_gpt, JobSearchPreferences, RankedJobListing
from openai_resume_jd_parsing import parse_resume_with_openai, parse_jd_with_openai # Added parse_jd_with_openai
import time
from utils import extract_text_from_pdf_bytes, extract_resume_bullets
import uvicorn
from serpapi_news_fetcher import fetch_recent_news # Added import

# Pydantic Models for Request/Response
class ParseResumeRequest(BaseModel):
    resume_text: str

class ParseJDRequest(BaseModel):
    job_description_text: str

class GenerateInterviewPrepRequest(BaseModel):
    resume_structured: Dict[str, Any]  
    jd_structured: Dict[str, Any]      
    company_name: Optional[str] = None
    industry: Optional[str] = None
    job_description: Optional[str] = None 
    raw_resume_text: Optional[str] = None 

# Setup Logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG) # Ensure logger is set to debug for more verbose output

# Load environment variables
load_dotenv()

# Initialize OpenAI API
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    print("Warning: OPENAI_API_KEY not found in environment variables")
    openai_api_key = "your_openai_api_key_here"  # Placeholder for development

# Initialize OpenAI v1 client
client = openai.OpenAI(api_key=openai_api_key)

# Define the OpenAI model globally
GPT_MODEL_V2 = "gpt-3.5-turbo-0125" # Or "gpt-4-turbo-preview" for higher quality

app = FastAPI(debug=True)
app.include_router(pdf_export_router)
app.include_router(followup_qa_router)
app.title = "Job Search Assistant API"

print("DEBUG: FastAPI app loaded with global exception handler.")

# Catch-all middleware for debugging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import PlainTextResponse

class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            import traceback
            tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
            print("MIDDLEWARE DEBUG TRACEBACK:\n", tb)
            return PlainTextResponse(f"Internal Server Error (middleware):\n{tb}", status_code=500)

# app.add_middleware(CatchAllMiddleware)  # Disabled to prevent EndOfStream interception

# CORS configuration
origins = [
    "http://localhost:5180",  # Frontend origin currently reported
    "http://localhost:5173",  # Default Vite origin
    # Add any other origins if needed, e.g., your deployed frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Restore specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize agents
def get_job_search_agent():
    return JobSearchAgent(api_key=openai_api_key)

def get_interview_prep_agent():
    return InterviewPrepAgent(api_key=openai_api_key)

@app.post("/api/upload-resume")
async def handle_resume_upload(request: Request, file: UploadFile = File(...)):
    logger.info(f"handle_resume_upload: Received request headers: {request.headers}")
    try:
        if not file:
            logger.error("handle_resume_upload: File object is None after parameter binding.")
            raise HTTPException(status_code=400, detail="No file was uploaded or file object is None.")
        
        logger.info(f"handle_resume_upload: UploadFile object received: name='{file.filename}', content_type='{file.content_type}'")

        if not file.filename:
            logger.error("handle_resume_upload: File name is missing.")
            raise HTTPException(status_code=400, detail="File name is missing.")

        if not file.filename.endswith(".pdf"):
            logger.error(f"handle_resume_upload: Invalid file type: {file.filename}. Only PDF files are allowed.")
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")

        contents = await file.read()
        if not contents:
            logger.error(f"handle_resume_upload: File {file.filename} is empty.")
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")

        extracted_text = extract_text_from_pdf_bytes(contents)
        if not extracted_text.strip():
            logger.warning(f"handle_resume_upload: No text could be extracted from {file.filename} or the file contains only whitespace.")
            # Not raising an error, allowing frontend to decide how to handle empty text
            # Consider if an error should be raised if text extraction is critical here.

        logger.info(f"handle_resume_upload: Successfully extracted text from {file.filename}.")
        return {"filename": file.filename, "extracted_text": extracted_text}
    except HTTPException as e: # Re-raise HTTPExceptions to return proper status codes
        raise e
    except Exception as e:
        logger.error(f"handle_resume_upload: Error processing file {getattr(file, 'filename', 'unknown_file')}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Could not process file: {str(e)}")

@app.post("/api/interview-v2/parse-resume", response_model=ResumeStructured)
async def handle_parse_resume(request: ParseResumeRequest):
    try:
        logging.debug(f"Parsing resume text. Length: {len(request.resume_text)}")
        # Run the synchronous parse_resume_with_openai in a separate thread
        parsed_resume = await asyncio.to_thread(parse_resume_with_openai, request.resume_text)
        logging.info("Successfully parsed resume.")
        return parsed_resume
    except Exception as e:
        logging.error(f"Error parsing resume: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

# New endpoint for parsing JD text
@app.post("/api/interview-v2/parse-jd", response_model=JobDescriptionStructured) # Changed from JDStructured
async def handle_parse_jd(request: ParseJDRequest):
    try:
        logging.debug(f"Parsing JD text. Length: {len(request.job_description_text)}")
        # Run the synchronous parse_jd_with_openai in a separate thread
        parsed_jd = await asyncio.to_thread(parse_jd_with_openai, request.job_description_text)
        logging.info("Successfully parsed JD.")
        return parsed_jd
    except Exception as e:
        logging.error(f"Error parsing JD: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to parse JD: {str(e)}")

@app.post("/api/interview-v2/generate", response_model=InterviewPrepV2Guide)
async def generate_interview_prep(request: GenerateInterviewPrepRequest):
    logger.info(f"generate_interview_prep called with request: {request.company_name}, {request.industry}")
    # Log the types and content of structured data for debugging
    logger.debug(f"Type of request.resume_structured: {type(request.resume_structured)}")
    logger.debug(f"Content of request.resume_structured: {request.resume_structured}")
    logger.debug(f"Type of request.jd_structured: {type(request.jd_structured)}")
    logger.debug(f"Content of request.jd_structured: {request.jd_structured}")

    try:
        # Ensure that structured data is treated as Pydantic model instances
        resume_model = ResumeStructured(**request.resume_structured) if request.resume_structured else None
        jd_model = JobDescriptionStructured(**request.jd_structured) if request.jd_structured else None

        # Debugging logs for the parsed models
        logger.debug(f"Parsed resume_model: {resume_model.model_dump_json(indent=2) if resume_model else 'None'}")
        logger.debug(f"Parsed jd_model: {jd_model.model_dump_json(indent=2) if jd_model else 'None'}")

    except ValidationError as ve:
        logger.error(f"Pydantic ValidationError during structuring: {ve.errors()}", exc_info=True)
        raise HTTPException(status_code=422, detail=f"Invalid structured data format: {ve.errors()}")
    except Exception as e:
        logger.error(f"Error processing structured data: {e}", exc_info=True)
        # Consider if this should be a 500 or a more specific 4xx error
        raise HTTPException(status_code=500, detail=f"Error processing structured data: {str(e)}")

    start_time = time.time()
    logging.info(f"Received request for interview prep generation: {request.model_dump_json(indent=2)}")

    top_resume_bullets = []
    if resume_model and resume_model.positions:
        for pos in resume_model.positions:
            if pos.description:
                bullets = [b.strip() for b in pos.description.replace('●', '\n').replace('*', '\n').split('\n') if b.strip()]
                top_resume_bullets.extend(bullets)
    top_resume_bullets_str = "\n- ".join(top_resume_bullets[:7]) 
    logging.debug(f"Extracted top resume bullets for prompt B: {top_resume_bullets_str}")

    company_industry_output = CompanyIndustrySectionModel()
    role_success_output = RoleSuccessFactorsSection()
    role_understanding_fit_assessment_output = RoleUnderstandingFitAssessmentSectionModel() # Changed from CandidateFitMatrixSectionModel
    star_story_bank_output = StarStoryBankSectionModel()
    technical_case_prep_output = TechnicalCasePrepSectionModel()
    mock_interview_output = MockInterviewSectionModel()
    offer_negotiation_output = OfferNegotiationSectionModel()
    insider_cheat_sheet_output = InsiderCheatSheetSectionModel() # Added based on prompt B expectations
    questions_to_ask_output = QuestionsToAskSectionModel() # Initialize questions_to_ask_output

    role_success_built_output = RoleSuccessFactorsSection() # Initialize with default
    try:
        meaningful_resume_content_parts = []
        if resume_model and resume_model.positions:
            for pos in resume_model.positions:
                if pos.description:
                    meaningful_resume_content_parts.append(pos.description)
        # Also consider adding skills, summary, etc. if deemed relevant for role_success evaluation
        # For now, focusing on position descriptions as primary content.
        meaningful_resume_content_str = "\n\n".join(meaningful_resume_content_parts)

        # --- Pre-build Section 3: Role Success Factors ---
        if jd_model and meaningful_resume_content_str:
            logger.info(f"MAIN.PY: Before calling build_role_success_section - jd_model.requirements: {jd_model.requirements}")
            logger.info(f"MAIN.PY: Before calling build_role_success_section - jd_model.responsibilities: {jd_model.responsibilities}")
            logger.info(f"MAIN.PY: Before calling build_role_success_section - meaningful_resume_content_str: {meaningful_resume_content_str[:750]}...")
            
            # section_3_data = await build_role_success_section(jd_structured=jd_model, resume_bullets=meaningful_resume_content_str)
            # 
            # logger.info(f"MAIN.PY: After calling build_role_success_section - section_3_data: {section_3_data.model_dump_json(indent=2) if section_3_data else 'None'}")
            # if section_3_data:
            #     role_success_output = RoleSuccessFactorsSection(**section_3_data.model_dump())
            # else:
            #     logger.warning("MAIN.PY: build_role_success_section returned None or empty-like, using default for section_3.")
        else:
            logger.warning("MAIN.PY: Skipping pre-build of role_success_section due to missing jd_model or resume_content.")

        # --- Pre-build Section 4: Role Understanding & Fit Assessment ---
        if jd_model and meaningful_resume_content_str:
            logger.info(f"MAIN.PY: Before calling build_role_understanding_fit_assessment_section - jd_model info logged above.")

        #     # section_4_data = await build_role_understanding_fit_assessment_section(jd_structured=jd_model, resume_bullets=meaningful_resume_content_str)
        #     # 
        #     # logger.info(f"MAIN.PY: After calling build_role_understanding_fit_assessment_section - section_4_data: {section_4_data.model_dump_json(indent=2) if section_4_data else 'None'}")
        #     # if section_4_data:
        #     #     # Assign to the variable that was originally intended for section 4's Pydantic model
        #     #     role_understanding_fit_assessment_output = RoleUnderstandingFitAssessmentSectionModel(**section_4_data.model_dump()) # Ensure consistency with initialized variable
        #     # else:
        #     #     logger.warning("MAIN.PY: build_role_understanding_fit_assessment_section returned None or empty-like, using default for section_4.")
        # else:
        #     logger.warning("MAIN.PY: Skipping pre-build of role_understanding_fit_assessment_section due to missing jd_model or resume_content.") 

        # --- Pre-build Section 5: STAR Story Bank ---
        # if resume_model:
        #     logger.info(f"MAIN.PY: Before calling build_star_story_bank_section - resume_model available.")
        #     # Pass the whole resume_model; the builder can extract achievements or other relevant parts.
        #     # section_5_data = await build_star_story_bank_section(resume_structured=resume_model.model_dump(), jd_structured=jd_model.model_dump())
        #     # logger.info(f"MAIN.PY: After calling build_star_story_bank_section - section_5_data: {section_5_data.model_dump_json(indent=2) if section_5_data else 'None'}")
        #     # if section_5_data:
        #     #     star_story_bank_output = StarStoryBankSectionModel(**section_5_data.model_dump())
        #     # else:
        #     #     logger.warning("MAIN.PY: build_star_story_bank_section returned None or empty-like, using default for section_5.")
        # else:
        #     logger.warning("MAIN.PY: Skipping pre-build of star_story_bank_section due to missing resume_model.")

        # --- Pre-build Section 6: Technical Case Prep ---
        # if jd_model:
        #     logger.info(f"MAIN.PY: Before calling build_technical_case_prep_section - jd_model available.")
        #     # section_6_data = await build_technical_case_prep_section(jd_structured=jd_model)
        #     # logger.info(f"MAIN.PY: After calling build_technical_case_prep_section - section_6_data: {section_6_data.model_dump_json(indent=2) if section_6_data else 'None'}")
        #     # if section_6_data and section_6_data.prompts:
        #     #     technical_case_prep_output = TechnicalCasePrepSectionModel(**section_6_data.model_dump())
        #     # else:
        #     #     logger.warning("MAIN.PY: build_technical_case_prep_section returned None, empty, or no prompts, using default for section_6.")
        # else:
        #     logger.warning("MAIN.PY: Skipping pre-build of technical_case_prep_section due to missing jd_model.")

    except Exception as e:
        logging.warning(f"Could not build role_success_section separately: {e}", exc_info=True)
    role_success_factors_str_for_prompt_b = role_success_built_output.model_dump_json(indent=2) if role_success_built_output and (role_success_built_output.must_haves or role_success_built_output.nice_to_haves) else "{}"

    try:
        # Fetch recent news for Company A prompt - COMMENTED OUT FOR TESTING
        # fetched_news = await fetch_recent_news(request.company_name, max_articles=5)
        # formatted_news_articles_str = ""
        # if fetched_news:
        #     for article in fetched_news:
        #         formatted_news_articles_str += f"Title: {article.get('title', 'N/A')}\n"
        #         formatted_news_articles_str += f"Snippet: {article.get('snippet', 'N/A')}\n"
        #         formatted_news_articles_str += f"URL: {article.get('url', 'N/A')}\n"
        #         formatted_news_articles_str += f"Published Date: {article.get('published_at', 'N/A')}\n\n"
        # else:
        #     formatted_news_articles_str = "No recent news articles found or failed to fetch."
        formatted_news_articles_str = "News fetching disabled for testing."
        logger.debug(f"Formatted news for prompt A: {formatted_news_articles_str}")

        user_prompt_params_for_a = {
            "jd_full_text": request.job_description or "",
            "company_name": request.company_name or "the company",
            "industry": request.industry or "the relevant industry",
            "role_title": jd_model.role_title if jd_model else "the role",
            "fetched_news_articles": formatted_news_articles_str  # Added fetched news
        }
        messages_a = [
            SystemMessage(content=INTERVIEW_PREP_V2_SYSTEM_PROMPT_A_COMPANY),
            HumanMessage(content=INTERVIEW_PREP_V2_USER_PROMPT_TEMPLATE_A_COMPANY.format(**user_prompt_params_for_a))
        ]
        # company_industry_json_string_task = asyncio.create_task( # COMMENTED OUT FOR TESTING
        #     _call_openai_api_with_retry(
        #         messages=messages_a,
        #         model_name="gpt-4o", 
        #         max_tokens=1500
        #     )
        # )
        company_industry_json_string_task = None # Ensure it's defined

        jd_structured_json_for_prompt_b = jd_model.model_dump_json(indent=2) if jd_model else "{}"
        resume_structured_json_for_prompt_b = resume_model.model_dump_json(indent=2) if resume_model else "{}"
        
        jd_summary_for_prompt_b = request.job_description[:1000] if request.job_description else ""
        jd_requirements_for_prompt_b = ", ".join(jd_model.requirements) if jd_model and jd_model.requirements else ""

        user_prompt_params_for_b = {
            "jd_role_title": jd_model.role_title if jd_model else "the role",
            "company_name": request.company_name or "the company",
            "industry": request.industry or "the relevant industry",
            "jd_structured_json": jd_structured_json_for_prompt_b,
            "resume_structured_json": resume_structured_json_for_prompt_b,
            "role_success_factors": role_success_factors_str_for_prompt_b,
            "top_resume_bullets": top_resume_bullets_str,
            "jd_summary": jd_summary_for_prompt_b, 
            "jd_requirements": jd_requirements_for_prompt_b,
            "resume_raw_text_snippet": request.raw_resume_text[:3000] if request.raw_resume_text else ""
        }

        logging.debug(f"LLM Call B - User Prompt Params: {json.dumps(user_prompt_params_for_b, indent=2)}")

        messages_b = [
            SystemMessage(content=INTERVIEW_PREP_V2_SYSTEM_PROMPT_B_CANDIDATE_ROLE),
            HumanMessage(content=INTERVIEW_PREP_V2_USER_PROMPT_TEMPLATE_B_CANDIDATE_ROLE.format(**user_prompt_params_for_b))
        ]
        other_sections_json_string_task = asyncio.create_task(
            _call_openai_api_with_retry(
                messages=messages_b,
                model_name="gpt-4o", 
                max_tokens=4000 
            )
        )

        llm_output_b = await other_sections_json_string_task

        if company_industry_json_string_task:
            llm_output_a_json_string = await company_industry_json_string_task
            logging.info(f"LLM Call A raw content: {llm_output_a_json_string}")
            try:
                company_industry_data = json.loads(llm_output_a_json_string)
                company_industry_output = CompanyIndustrySectionModel(**company_industry_data)
                logging.info(f"LLM Call A parsed content: {company_industry_output}")
            except json.JSONDecodeError as e:
                logging.error(f"Error decoding JSON from LLM Call A: {e}. Raw string: {llm_output_a_json_string}")
                # company_industry_output remains default if parsing fails
            except Exception as e:
                logging.error(f"Error processing LLM Call A output: {e}. Raw string: {llm_output_a_json_string}")
        else:
            logging.info("LLM Call A was skipped for testing. Using default company_industry_output.")

        logging.info(f"LLM Call B raw content: {llm_output_b}")
        llm_b_parsed_data = json.loads(llm_output_b)
        logging.info(f"LLM Call B parsed content: {llm_b_parsed_data}")

        role_success_final_output = RoleSuccessFactorsSection()
        # if 'role_success_factors' in llm_b_parsed_data:
        #     role_success_final_output = RoleSuccessFactorsSection(**llm_b_parsed_data['role_success_factors'])
        # elif role_success_output and (role_success_output.must_haves or role_success_output.nice_to_haves): # Use actual pre-built section 3
        #      role_success_final_output = role_success_output # Use actual pre-built section 3 if LLM B didn't provide
        # Ensure role_success_final_output remains its default initialized value by not reassigning here for isolated testing.
        # --- Populate Section 6: Technical Case Prep ---
        if 'section_6_technical_case_prep' in llm_b_parsed_data and llm_b_parsed_data['section_6_technical_case_prep']:
            section_6_data = llm_b_parsed_data['section_6_technical_case_prep']
            logger.info(f"Populating technical_case_prep_output from LLM B (using key 'section_6_technical_case_prep'). Data: {json.dumps(section_6_data, indent=2)}")
            # <<< START DEBUG LOGGING FOR RAW SECTION 6 DATA >>>
            logger.info(f"MAIN.PY: Raw section_6_data from LLM B before Pydantic model: {section_6_data}")
            logger.info(f"MAIN.PY: Type of section_6_data: {type(section_6_data)}")
            if isinstance(section_6_data, dict):
                logger.info(f"MAIN.PY: Keys in section_6_data: {section_6_data.keys()}")
                # Check for both 'prompts' and 'practice_prompts' as the key from LLM
                prompts_key_found = None
                if 'prompts' in section_6_data:
                    prompts_key_found = 'prompts'
                elif 'practice_prompts' in section_6_data:
                    prompts_key_found = 'practice_prompts'
                
                if prompts_key_found:
                    logger.info(f"MAIN.PY: Raw '{prompts_key_found}' field in section_6_data: {section_6_data.get(prompts_key_found)}")
                    logger.info(f"MAIN.PY: Type of '{prompts_key_found}' field: {type(section_6_data.get(prompts_key_found))}")
                else:
                    logger.warning("MAIN.PY: Neither 'prompts' nor 'practice_prompts' key FOUND in section_6_data.")
            # <<< END DEBUG LOGGING FOR RAW SECTION 6 DATA >>>
            # The LLM is now instructed to provide structured prompts under 'practice_prompts'.
            # These will be directly used for the 'prompts' field of TechnicalCasePrepSectionModel.
            if 'practice_prompts' in section_6_data:
                # LLM provides structured prompts (list of dicts) under 'practice_prompts'
                section_6_data['prompts'] = section_6_data.pop('practice_prompts')
                logger.info("MAIN.PY: Moved structured 'practice_prompts' from LLM to 'prompts' field.")
            elif 'prompts' in section_6_data:
                # If 'practice_prompts' isn't there but 'prompts' is, log that we're using it.
                # This assumes it's already in the correct format if present.
                logger.info("MAIN.PY: Using existing 'prompts' field from LLM data for TechnicalCasePrepSectionModel.")
            else:
                # If neither 'practice_prompts' nor 'prompts' is in section_6_data,
                # ensure 'prompts' key exists with an empty list for the Pydantic model.
                section_6_data['prompts'] = []
                logger.info("MAIN.PY: Neither 'practice_prompts' nor 'prompts' found in LLM data for section 6. Initializing 'prompts' as empty list.")
            try:
                technical_case_prep_output = TechnicalCasePrepSectionModel(**section_6_data)
            except Exception as e_model_val:
                logger.error(f"MAIN.PY: Pydantic validation error for TechnicalCasePrepSectionModel: {e_model_val}", exc_info=True)
                logger.error(f"MAIN.PY: Data that caused validation error for TechnicalCasePrepSectionModel: {section_6_data}")
                # Fallback to default if validation fails, to maintain previous behavior of not crashing
                technical_case_prep_output = TechnicalCasePrepSectionModel()
        else:
            logger.warning("LLM B response missing or empty 'section_6_technical_case_prep'. Using default.")

        # --- Populate Section 7: Mock Interview ---
        # if 'section_7_mock_interview' in llm_b_parsed_data and llm_b_parsed_data['section_7_mock_interview']:
        #     mock_interview_output = MockInterviewSectionModel(**llm_b_parsed_data['section_7_mock_interview'])
        # else:
        #     logger.warning("LLM B response missing 'section_7_mock_interview'. Using default.")
        # if 'insider_cheat_sheet' in llm_b_parsed_data:
        #     insider_cheat_sheet_output = InsiderCheatSheetSectionModel(**llm_b_parsed_data['insider_cheat_sheet'])
        if 'section_9_questions_to_ask' in llm_b_parsed_data and llm_b_parsed_data['section_9_questions_to_ask']:
            try:
                questions_to_ask_output = QuestionsToAskSectionModel(**llm_b_parsed_data['section_9_questions_to_ask'])
                logger.info("Successfully populated QuestionsToAskSectionModel from LLM B data.")
            except Exception as e:
                logger.error(f"Error instantiating QuestionsToAskSectionModel from LLM B data: {e}. Data: {llm_b_parsed_data.get('section_9_questions_to_ask')}", exc_info=True)
                # Keep the default initialized questions_to_ask_output
        else:
            logger.warning("LLM B response missing 'section_9_questions_to_ask' or it's empty. Using default QuestionsToAskSectionModel.")
        if 'section_8_offer_negotiation' in llm_b_parsed_data and llm_b_parsed_data['section_8_offer_negotiation']:
            try:
                offer_negotiation_output = OfferNegotiationSectionModel(**llm_b_parsed_data['section_8_offer_negotiation'])
                logger.info("Successfully populated OfferNegotiationSectionModel from LLM B data.")
            except Exception as e:
                logger.error(f"Error instantiating OfferNegotiationSectionModel from LLM B data: {e}. Data: {llm_b_parsed_data.get('section_8_offer_negotiation')}", exc_info=True)
                # Keep the default initialized offer_negotiation_output
        else:
            logger.warning("LLM B response missing 'section_8_offer_negotiation' or it's empty. Using default OfferNegotiationSectionModel.")

    except json.JSONDecodeError as e:
        llm_a_content = locals().get('llm_output_a_json_string', 'N/A')
        llm_b_content = locals().get('llm_output_b', 'N/A')
        logging.error(f"JSON parsing error: {e}. Raw LLM A output: {llm_a_content}. Raw LLM B output: {llm_b_content}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error parsing LLM response: {str(e)}")
    except Exception as e:
        logging.error(f"Error during LLM calls or processing: {e}", exc_info=True)
        user_prompt_params_for_a_val = locals().get('user_prompt_params_for_a', 'N/A') # This var was not defined above
        user_prompt_params_for_b_val = locals().get('user_prompt_params_for_b', 'N/A')
        logging.error(f"LLM A user_prompt_params: {user_prompt_params_for_a_val}")
        logging.error(f"LLM B user_prompt_params: {user_prompt_params_for_b_val}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

    guide_section_3_role_success: Optional[RoleSuccessFactorsSection] = None
    if role_success_final_output and (role_success_final_output.must_haves or role_success_final_output.nice_to_haves):
        guide_section_3_role_success = RoleSuccessFactorsSection(
            must_haves=role_success_final_output.must_haves,
            nice_to_haves=role_success_final_output.nice_to_haves
        )
    elif not role_success_final_output.must_haves and not role_success_final_output.nice_to_haves:
        # If it's an empty model, ensure it's None or an empty valid model for the guide
        guide_section_3_role_success = RoleSuccessFactorsSection() # or None, depending on desired output for empty

    # --- LLM Call C: Generate Insider Cheat Sheet ---
    logger.info("Initiating LLM Call C for Insider Cheat Sheet")
    parsed_response_c = None
    try:
        role_title_for_c = jd_model.role_title if jd_model and jd_model.role_title else request.role_title
        if not role_title_for_c:
            logger.warning("Role title for Call C is missing, Insider Cheat Sheet might be generic.")
            role_title_for_c = "the specified role" # Fallback role title

        user_message_c_content = (
            f"Company Name: {request.company_name}\n"
            f"Role Title: {role_title_for_c}\n"
            f"Industry: {request.industry if request.industry else 'Not specified'}"
        )
        user_message_c = HumanMessage(content=user_message_c_content)
        system_message_c = SystemMessage(content=INTERVIEW_PREP_V2_SYSTEM_PROMPT_C_INSIDER_CHEAT_SHEET)

        logger.debug(f"Call C - System Prompt: {system_message_c.content}")
        logger.debug(f"Call C - User Message: {user_message_c.content}")

        response_c_json_str = await _call_openai_api_with_retry(
            messages=[system_message_c, user_message_c],
            model_name="gpt-4-turbo-preview", # Ensure this model has browsing capabilities
            temperature=0.0
        )
        
        if response_c_json_str:
            logger.info(f"LLM Call C successful. Response: {response_c_json_str[:500]}...")
            parsed_response_c = json.loads(response_c_json_str)
            # Directly assign if the structure matches InsiderCheatSheetSectionModel
            # Pydantic will validate; if it fails, the except block below will catch it.
            insider_cheat_sheet_output = InsiderCheatSheetSectionModel(**parsed_response_c)
        else:
            logger.warning("LLM Call C did not return content. Insider Cheat Sheet will use defaults.")

    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON from LLM Call C: {e}. Response string: {response_c_json_str}", exc_info=True)
        # Keep default insider_cheat_sheet_output
    except ValidationError as ve:
        logger.error(f"Pydantic validation error for InsiderCheatSheetSectionModel from Call C: {ve.errors()}\nRaw Data: {parsed_response_c}", exc_info=True)
        # Keep default insider_cheat_sheet_output. This might indicate a mismatch between prompt output and Pydantic model.
    except Exception as e:
        logger.error(f"An unexpected error occurred during LLM Call C for Insider Cheat Sheet: {e}", exc_info=True)
        # Keep default insider_cheat_sheet_output
    
    # --- Assemble the final guide object ---
    logger.info("Attempting to assemble the final_guide object.")
    final_guide = InterviewPrepV2Guide(
        section_0_welcome=WelcomeSectionModel(
            title="Welcome to Your AI-Powered Interview Prep!",
            introduction="This guide is designed to help you ace your interview. Let's get started."
        ),
        section_1_company_industry=company_industry_output,
        section_3_role_success=guide_section_3_role_success, 
        section_4_role_understanding_fit_assessment=role_understanding_fit_assessment_output, 
        section_5_star_story_bank=star_story_bank_output, 
        section_6_technical_case_prep=technical_case_prep_output, # Prioritize pre-built section 6
        section_7_mock_interview=mock_interview_output,
        section_8_insider_cheat_sheet=insider_cheat_sheet_output,
        section_9_questions_to_ask=questions_to_ask_output,
        section_10_offer_negotiation=offer_negotiation_output,
        export_share=ExportShareSectionModel( 
            export_options=["PDF", "Markdown"],
            share_platforms=["Email", "LinkedIn"],
            shareable_link="(Coming Soon!)"
        ),
        resume_structured=resume_model, 
        job_description_structured=jd_model
    )

    try:
        final_guide.model_validate(final_guide.model_dump()) # Validate the dict representation
        logging.info("Successfully validated final guide object.")
    except Exception as e:
        logging.error(f"Validation error for final_guide: {e}. Full guide data: {final_guide.model_dump_json(indent=2)}", exc_info=True)
        # Note: If model_validate fails on model_dump(), it might indicate an issue with how Pydantic handles nested models or default values
        # Consider final_guide.model_validate(final_guide) if it's about validating the instance itself.
        raise HTTPException(status_code=500, detail=f"Final guide validation failed: {str(e)}")

    logger.info(f"FINAL GUIDE JSON OUTPUT:\n{final_guide.model_dump_json(indent=2)}")

    end_time = time.time()
    logging.info(f"Interview prep generation completed in {end_time - start_time:.2f} seconds.")
    return final_guide

async def _call_openai_api_with_retry(messages: list, model_name: str, max_tokens: int = 3000, max_retries: int = 3, delay_seconds: int = 2, temperature: float = 0.2):
    client = openai.AsyncOpenAI(api_key=openai_api_key)
    last_exception = None

    formatted_messages = []
    for msg in messages:
        if hasattr(msg, 'type') and hasattr(msg, 'content'): 
            role = msg.type
            if role == 'human':
                role = 'user'
            formatted_messages.append({"role": role, "content": msg.content})
        elif isinstance(msg, dict) and 'role' in msg and 'content' in msg: 
            formatted_messages.append(msg)
        else:
            logging.error(f"Skipping unrecognised message type in _call_openai_api_with_retry: {type(msg)}")

    for attempt in range(max_retries):
        try:
            logging.debug(f"Attempt {attempt + 1} to call OpenAI API with model {model_name}.")
            response = await client.chat.completions.create(
                model=model_name,
                messages=formatted_messages,  
                response_format={"type": "json_object"}, 
                temperature=temperature,
                max_tokens=max_tokens 
            )
            response_content = response.choices[0].message.content
            if response_content:
                try:
                    parsed_json = json.loads(response_content)
                    logging.debug(f"OpenAI API call successful. Response sample: {json.dumps(parsed_json, indent=2)[:500]}...")
                except json.JSONDecodeError:
                    logging.debug(f"OpenAI API call successful. Response (non-JSON) sample: {response_content[:500]}...")
                return response_content
            else:
                logging.warning("OpenAI API returned empty content.")
                last_exception = Exception("OpenAI API returned empty content.")
        except Exception as e:
            logging.error(f"Error calling OpenAI API (attempt {attempt + 1}/{max_retries}): {e}")
            last_exception = e
            if attempt < max_retries - 1:
                logging.info(f"Retrying in {delay_seconds} seconds...")
                await asyncio.sleep(delay_seconds)
            else:
                logging.error("Max retries reached for OpenAI API call.")
                break 

    if last_exception:
        logging.error(f"Failed to get response from OpenAI API after {max_retries} attempts. Last error: {last_exception}")
    return None 

# Models
class JobPreference(BaseModel):
    industry: str
    role_type: str
    seniority: str
    location: str
    salary_range: str
    remote_preference: Optional[str] = None
    additional_preferences: Optional[str] = None

class MatchingSkill(BaseModel):
    skill: str
    relevance: Optional[str] = None

class JobListing(BaseModel):
    title: str
    company: str
    location: str
    description: str
    url: str
    match_score: float
    match_reasoning: str
    matching_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None

class JobSearchResponse(BaseModel):
    job_listings: List[JobListing]
    search_query: str
    premium_required: bool = False
    total_results: int

class JobSearchPipelineResponse(BaseModel):
    job_listings: List[RankedJobListing]
    used_fallback: Optional[bool] = None
    error: Optional[str] = None

class InterviewQuestion(BaseModel):
    question: str
    suggested_answer: str
    key_points: List[str]

class InterviewPrepResponse(BaseModel):
    role_fit_overview: Optional[str] = None
    matched_strengths: Optional[List[str]] = []
    skill_gaps_and_mitigation: Optional[List[str]] = []
    tailored_talking_points: Optional[List[str]] = []
    star_examples: Optional[List[StarStory]] = [] # Changed StarExample to StarStory
    company_cheat_sheet: Optional[InsiderCheatSheetSectionModel] = None # Changed CompanyCheatSheet to InsiderCheatSheetSectionModel
    questions: List[InterviewQuestion] = []
    premium_required: bool = False

class MockInterviewRequest(BaseModel):
    previous_question: str
    candidate_answer: str
    job_description: str
    resume_text: str
    role: Optional[str] = None
    company_name: Optional[str] = None

class MockInterviewResponse(BaseModel):
    feedback: str
    follow_up_question: str
    premium_required: bool = False

class UserSession(BaseModel):
    user_id: str
    is_premium: bool
    searches_today: int
    interview_preps_today: int

# Dependency for user session
def get_user_session(user_id: str = "anonymous"):
    # In a real app, this would fetch user data from a database
    # For now, we'll simulate a free user with usage limits
    return UserSession(
        user_id=user_id,
        is_premium=True, # Temporarily set to True for development
        searches_today=0,
        interview_preps_today=0
    )
