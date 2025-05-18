import os
import json
import logging
# import requests  # No longer used in this module, replaced by httpx.
from serpapi import GoogleSearch
from openai import AsyncOpenAI
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Dict, Any
import urllib.parse

# Explicitly configure logger for this module
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG) # Set level to DEBUG

# Load environment variables
load_dotenv()
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# --- Pydantic Models ---

from pydantic import BaseModel
from typing import Optional, List, Any

class JobSearchPaginatedResponse(BaseModel):
    jobs: List[Any]
    remaining: List[Any]
    next_page_token: Optional[str] = None
    has_more: bool = False
    error: Optional[str] = None

class RankedJobListing(BaseModel):
    """Represents a job listing ranked by GPT-4o."""
    job_title: str
    company: str
    details_link: str # Required, non-nullable
    match_score: int = Field(..., ge=1, le=10)
    reason: str

class JobSearchPreferences(BaseModel):
    """Represents the detailed job preferences provided by the user."""
    job_title_keywords: str = Field(..., description="Desired job title or keywords (e.g., Software Engineer)")
    industry: Optional[List[str]] = Field(None, description="List of selected industries (e.g., ['Healthcare', 'IT'])")
    location: str = Field(..., description="Preferred location (e.g., Chicago, IL or Remote)")
    employment_type: Optional[List[str]] = Field(None, description="List of selected employment types (e.g., ['full_time', 'contract'])")
    experience_level: Optional[str] = Field(None, description="Selected experience level (e.g., entry_level, mid_level)")
    salary_min: Optional[int] = Field(None, description="Minimum desired salary (USD per year)")
    salary_max: Optional[int] = Field(None, description="Maximum desired salary (USD per year)")
    remote_preference: str = Field(..., description="Remote work preference (e.g., No preference, Remote only)")
    company_preferences: Optional[str] = Field(None, description="Specific companies of interest (comma-separated or similar)")
    additional_preferences: Optional[str] = Field(None, description="Other free-text preferences")
    date_posted: Optional[str] = Field(None, description="Desired date posted (e.g., past_3_days)")

# --- Pydantic Schema for OpenAI Function Calling ---
class ReturnRankedJobs(BaseModel):
    """Schema for the list of ranked job listings returned by GPT-4o."""
    job_listings: List[RankedJobListing] = Field(..., description="A list of job listings ranked according to the user's resume and preferences.")

# --- GPT-4o Ranking Function ---
async def rank_jobs_with_gpt4o(job_results: List[Dict[str, Any]], resume_text: str, detailed_preferences: dict) -> List[Dict[str, Any]]:
    """Ranks job results using GPT-4o based on resume and preferences via function calling."""
    if not OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY not configured.")
        return []
    if not job_results:
        logger.warning("No job results provided to rank_jobs_with_gpt4o.")
        return []

    client = AsyncOpenAI(api_key=OPENAI_API_KEY)

    # Prepare job data for the prompt (limit fields for clarity/token count)
    simplified_jobs = []
    def best_link(job: dict) -> str:
        ao = job.get("apply_options") or []
        for opt in ao:
            if opt.get("link"):
                return opt["link"]
        if job.get("share_link"):
            return job["share_link"]
        rl = job.get("related_links") or []
        if rl and rl[0].get("link"):
            return rl[0]["link"]
        return ""

    simplified_jobs = []
    for job in job_results:
        simplified_jobs.append({
            "job_title": job.get("title"),
            "company": job.get("company_name"),
            "location": job.get("location"),
            "details_link": best_link(job),
            "snippet": (job.get("description", "")[:400])
        })

    # Get user experience band for prompt
    user_band = detailed_preferences.get("experience_level", "(not specified)")
    system_prompt = (
        "You are an expert job matching AI assistant. Your task is to rank the provided job listings based on their relevance "
        "to the user's resume and detailed job preferences. Analyze the job title, company, location, and description snippet.\n"
        f"User experience band: {user_band}. Down-score jobs outside that band.\n"
        "Assign a match_score from 1 (poor match) to 10 (excellent match). Provide a brief justification for your score (max 20 words).\n"
        "details_link must always be a STRING. If you did not receive a link, output an empty string (\"\"). Do NOT output null.\n"
        "DO NOT discard any job. Output a JSON array exactly as follows (all fields required):\n"
        "[\n  {\n    \"job_title\": \"...\",\n    \"company\": \"...\",\n    \"location\": \"...\",\n    \"details_link\": \"...\",\n    \"match_score\": 0-10,\n    \"reason\": \"...\"\n  }, ...\n]"
    )

    user_prompt = (
        f"Resume:\n--- --- --- --- ---\n{resume_text}\n--- --- --- --- ---\n\n"
        f"Detailed Preferences:\n--- --- --- --- ---\n{json.dumps(detailed_preferences, indent=2)}\n--- --- --- --- ---\n\n"
        f"Job Listings to Rank:\n--- --- --- --- ---\n{json.dumps(simplified_jobs, indent=2)}\n--- --- --- --- ---\n\n"
        "Please rank these jobs based on the resume and preferences."
    )

    tool_definition = {
        "type": "function",
        "function": {
            "name": "return_ranked_jobs",
            "description": "Returns the job listings ranked by relevance to the user's resume and detailed preferences.",
            "parameters": ReturnRankedJobs.model_json_schema()
#            "parameters": {
#                "type": "object",
#                "properties": {
#                    "job_listings": {
#                        "type": "array",
#                        "description": "A list of job listings ranked according to the user's resume and preferences.",
#                        "items": {
#                            "type": "object",
#                            "properties": {
#                                "job_title": {"type": "string", "description": "Job title"},
#                                "company": {"type": "string", "description": "Company name"},
#                                "match_score": {"type": "integer", "description": "Match score from 1-10"},
#                                "reason": {"type": "string", "description": "Brief justification for score"},
#                                "link": {"type": "string", "description": "The original URL/link for the job posting."} # Ensure link is described here
#                            },
#                            "required": ["job_title", "company", "match_score", "reason", "link"]
#                        }
#                    }
#                },
#                "required": ["job_listings"]
#            }
        }
    }

    try:
        logger.info(f"Sending {len(simplified_jobs)} jobs to GPT-4o for ranking.")
        response = await client.chat.completions.create(
            model="gpt-4o", # Using gpt-4o as per memory
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            tools=[tool_definition],
            tool_choice={"type": "function", "function": {"name": "return_ranked_jobs"}},
            temperature=0.2, # Lower temperature for more deterministic ranking
        )

        message = response.choices[0].message
        if not message.tool_calls:
            logger.error("GPT-4o response did not include the expected function call.")
            return []

        # Extract arguments and validate
        tool_call = message.tool_calls[0]
        if tool_call.function.name != "return_ranked_jobs":
            logger.error(f"GPT-4o called unexpected function: {tool_call.function.name}")
            return []

        arguments = tool_call.function.arguments
        logger.debug(f"Raw arguments from GPT-4o: {arguments}")

        try:
            validated_data = ReturnRankedJobs.model_validate_json(arguments)
            # Remove any 'link' field if present (for backward compatibility)
            ranked_jobs_list = []
            for job in validated_data.job_listings:
                job_dict = job.model_dump()
                if 'link' in job_dict:
                    del job_dict['link']
                ranked_jobs_list.append(job_dict)
            logger.info(f"Successfully parsed and validated {len(ranked_jobs_list)} ranked jobs from GPT-4o.")
            return ranked_jobs_list
        except ValidationError as e:
            logger.error("Bad GPT output", exc_info=True)
            return []  # graceful fallback
        except json.JSONDecodeError as e:
            logger.error(f"JSON decoding error parsing GPT-4o arguments: {e}", exc_info=True)
            logger.error(f"Invalid JSON arguments received: {arguments}")
            return []

    except Exception as e:
        logger.error(f"Exception during OpenAI API call or processing: {e}", exc_info=True)
        return []

# --- SerpAPI Function ---
async def search_serpapi_google_jobs(preferences: JobSearchPreferences) -> List[dict]:
    # TEMPORARY: Return empty list to bypass SerpAPI calls during testing due to API limits.
    logger.warning("SerpAPI call is temporarily bypassed in search_serpapi_google_jobs. Returning empty list.")
    return []

    # Original code below, commented out for now:
    # 
    """Queries SerpAPI Google Jobs endpoint with detailed preferences."""
    if not SERPAPI_API_KEY:
        logger.error("SERPAPI_API_KEY not configured.")
        return []

    # --- Construct query parameters --- 
    query_params = {
        "engine": "google_jobs",
        "api_key": SERPAPI_API_KEY,
        "q": preferences.job_title_keywords, # Core query: job title/keywords
    }

    # Location Handling
    if preferences.remote_preference == "Remote only":
        query_params["location"] = "Remote"
    else:
        # Use specified location, default to US if none provided and not remote only
        query_params["location"] = preferences.location or "United States"
    
    # Chips Handling (Combine multiple filters)
    chips = []

    # Experience Level (map to SerpAPI format)
    if preferences.experience_level:
        # Basic mapping, assumes UI values match SerpAPI chips like entry_level, mid_level etc.
        serpapi_exp_level = preferences.experience_level.lower().replace('-level', '_level')
        chips.append(serpapi_exp_level) 

    # Industry (map to SerpAPI format)
    if preferences.industry:
        for ind in preferences.industry:
            # Basic lowercase mapping
            serpapi_industry = ind.lower().replace(' ', '')
            chips.append(serpapi_industry)
    
    # Company Preferences (map to SerpAPI format: company:...)
    if preferences.company_preferences:
        # Simple split by comma, assumes user enters like "Google, Amazon"
        companies = [c.strip() for c in preferences.company_preferences.split(',') if c.strip()]
        for company in companies:
            chips.append(f"company:{company}")

    # Add collected chips if any
    if chips:
        query_params["chips"] = ",".join(chips)
    
    # Remove None values (important for SerpAPI call)
    query_params = {k: v for k, v in query_params.items() if v is not None}
    # -------------------------------

    logger.info(f"Querying SerpAPI with params: {query_params}")

    try:
        logger.info(f"Querying SerpAPI with params: {query_params}")
        search = GoogleSearch(query_params)
        results = search.get_dict()

        if "error" in results:
            logger.error(f"SerpAPI Error: {results['error']}")
            return []

        # Log raw SerpAPI results for debugging links
        if results and 'jobs_results' in results:
            logger.debug(f"--- Raw SerpAPI Results (Top 3) ---")
            for i, job in enumerate(results['jobs_results'][:3]):
                related_links = job.get("related_links", [])
                link_present = bool(related_links and related_links[0].get("link"))
                link_value = related_links[0].get("link", "N/A") if link_present else job.get("link") # Handle both link formats
                logger.debug(f"Job {i+1}: Title='{job.get('title', 'N/A')}', Company='{job.get('company_name', 'N/A')}', RelatedLink Present: {link_present}, Link: {link_value}")
                # Optionally log the link itself if present
                # if link_present: logger.debug(f"  Link: {job['link']}")
            logger.debug(f"-------------------------------------")
        else:
             logger.debug("SerpAPI returned no 'jobs_results' key or results were empty.")

        job_results = results.get("jobs_results", [])
        logger.info(f"SerpAPI returned {len(job_results)} raw job results.")
        return job_results

    except Exception as e:
        logger.error(f"Exception during SerpAPI call: {e}")
        return []

# --- Main Pipeline Function ---
from serpapi_async import fetch_serpapi_jobs

async def search_jobs_serpapi_gpt(resume_text: str, preferences: JobSearchPreferences, next_page_token: Optional[str] = None, buffer: Optional[list] = None) -> dict:
    """
    Full pipeline: Async SerpAPI fetch + robust pre-filtering, then GPT-4o ranking.
    Returns dict: jobs (top 5), buffer (remaining), next_page_token, has_more.
    """
    # 1. Fetch and filter jobs via new async fetcher
    jobs, token = await fetch_serpapi_jobs(preferences, next_page_token, want=15)

    # 2. Rank jobs with GPT-4o
    ranked_jobs = await rank_jobs_with_gpt4o(jobs, resume_text, preferences.dict())
    # Use results from fetch_serpapi_jobs directly
    all_jobs = jobs if jobs else []
    # token and has_more already set from fetch_serpapi_jobs
    logger.info(f"Extracted from fetch_serpapi_jobs: jobs_count={len(all_jobs)}, token={token}")

    if not all_jobs:
        logger.warning("Pipeline ending: No results from SerpAPI.")
        return {"jobs": [], "remaining": [], "next_page_token": token, "has_more": False}

    # Step 2: Rank the results using GPT-4o
    logger.info("Proceeding to rank jobs with GPT-4o.")
    ranked_jobs = [] # Initialize default value
    try:
        # Pass the extracted jobs, resume, and detailed preferences
        ranked_jobs = await rank_jobs_with_gpt4o(all_jobs, resume_text, preferences.model_dump(exclude_none=True))
        logger.info(f"GPT-4o ranking returned {len(ranked_jobs)} jobs.")
    except Exception as gpt_error:
        logger.error(f"Error during GPT-4o ranking: {gpt_error}", exc_info=True)

    # Split into top 8 and remaining
    jobs = ranked_jobs[:8]
    remaining = ranked_jobs[8:]

    return {
        "jobs": jobs,
        "remaining_jobs": remaining,
        "next_page_token": token,
        "has_more": bool(token)
    }


# Example Usage (for testing)
# if __name__ == "__main__":
#     import asyncio
#     async def main_test():
#         test_resume = "Experienced Python developer skilled in FastAPI, Docker, and AWS..."
#         test_preferences = JobSearchPreferences(job_title_keywords="Software Engineer", location="Remote")
#         results = await search_jobs_serpapi_gpt(test_resume, test_preferences)
#         print(json.dumps([job.model_dump() for job in results], indent=2))
#     asyncio.run(main_test())

import httpx

async def query_serpapi_google_jobs(
    q: str,
    location: str,
    filters: dict,
    next_page_token: Optional[str] = None,
    target_count: int = 20
) -> dict:
    """
    Queries SerpAPI Google Jobs, applying filters and handling pagination.
    Returns a dict: {"jobs": [...], "next_page_token": ..., "has_more": bool}
    """
    serpapi_key = os.getenv("SERPAPI_API_KEY")
    if not serpapi_key:
        logger.error("SERPAPI_API_KEY not found.")
        return {"jobs": [], "next_page_token": None, "has_more": False}

    # ... (query construction logic remains the same) ...
    query_parts = [q]
    industry_list = filters.get("industry", [])
    company_prefs = filters.get("company_preferences", "")
    additional_prefs = filters.get("additional_preferences", "")
    remote_pref = filters.get("remote_preference", "")
    # employment_types_list = filters.get("employment_type", []) # Not currently used in query

    if industry_list:
        industry_query = " OR ".join(industry_list)
        query_parts.append(f"({industry_query})")
    if company_prefs:
        query_parts.append(company_prefs)
    if additional_prefs:
        query_parts.append(additional_prefs)

    final_location_param = location
    if remote_pref == "Remote only":
        logger.info("Overriding location to 'Remote' based on preference.")
        if not query_parts or "remote" not in query_parts[-1].lower(): # Check if query_parts is not empty
             query_parts.append("remote")
        final_location_param = None
        logger.info("Omitting location parameter for SerpAPI call due to 'Remote only' preference.")
    elif remote_pref == "On-site only":
        # Note: On-site filtering is now handled via filter chip links, not directly in 'q'
        pass

    enriched_query = " ".join(filter(None, query_parts))
    logger.info(f"Constructed Enriched Query for 'q' parameter: {enriched_query}")

    # --- Initialize state variables --- 
    filter_link = None
    jobs = []
    token = next_page_token
    has_more = True # Assume more initially
    current_page = 1
    results_data = None
    # Default return value, potentially updated with partial results on error
    return_value = {"jobs": [], "next_page_token": None, "has_more": False, "error": None}

    # --- Main Async Block with overarching Try/Except --- 
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            # --- Stage 1: Get Filters (Date Posted, Job Type) ---
            if not token: # Only fetch filters on the first call (no token)
                initial_params = {
                    "engine": "google_jobs",
                    "api_key": serpapi_key,
                    "q": enriched_query,
                    **({"location": final_location_param} if final_location_param else {}),
                    "num": 1, # Only need 1 result to get filters
                }
                try:
                    serpapi_url = "https://serpapi.com/search.json"
                    logger.debug(f"Fetching filters with params: {initial_params}")
                    resp = await client.get(serpapi_url, params=initial_params)
                    resp.raise_for_status()
                    initial_result = resp.json()
                    initial_search_metadata = initial_result.get("search_metadata", {})
                    google_jobs_filters = initial_search_metadata.get("google_jobs_filters", [])
                    
                    # Find 'Past month' filter
                    date_posted_filter = next((fg for fg in google_jobs_filters if isinstance(fg, dict) and fg.get("name") == "Date posted"), None)
                    if date_posted_filter:
                        options = date_posted_filter.get("options", [])
                        target_option = next((opt for opt in options if isinstance(opt, dict) and opt.get("name") == "Past month"), None)
                        if target_option and "serpapi_link" in target_option:
                            filter_link = target_option["serpapi_link"]
                            logger.info(f"Found mandatory 'Past month' filter link: {filter_link}")
                        else: logger.warning("Could not find 'Past month' option link.")
                    else: logger.warning("Could not find 'Date posted' filter group.")

                    # Find 'On-site' filter if needed
                    if remote_pref == "On-site only":
                        logger.info("Attempting to apply 'On-site only' filter chip.")
                        type_filter_group = next((fg for fg in google_jobs_filters if isinstance(fg, dict) and fg.get("name") in ["Type", "Remote", "Work Arrangement"]), None)
                        if type_filter_group:
                            options = type_filter_group.get("options", [])
                            on_site_option = next((opt for opt in options if isinstance(opt, dict) and (opt.get("text", "").lower() == "on-site" or opt.get("value", "").lower() == "jt_on_site")), None)
                            if on_site_option and "serpapi_link" in on_site_option:
                                on_site_filter_link = on_site_option["serpapi_link"]
                                logger.info(f"Found 'On-site' filter link: {on_site_filter_link}")
                                # Apply the on-site filter link (overwrites date link if both found, as it's more specific)
                                filter_link = on_site_filter_link
                            else: logger.warning("Could not find 'On-site' option link.")
                        else: logger.warning("Could not find filter group for 'Type/Remote'.")
                
                except Exception as filter_e:
                    logger.error(f"Error during initial SerpAPI filter fetch: {filter_e}", exc_info=True)
                    logger.warning("Proceeding without filters due to error.")
                    filter_link = None # Ensure filter_link is None if filter fetch fails

            # --- Stage 2: Pagination Loop --- 
            while has_more and len(jobs) < target_count:
                # Determine URL and params for this iteration
                if current_page == 1 and filter_link and not next_page_token:
                    # First page using a filter link (Date or On-site)
                    request_url = filter_link
                    request_params = {"api_key": serpapi_key} # API key might be needed even on filter links
                    logger.info(f"Requesting page 1 using filter link: {request_url}")
                else:
                    # Subsequent pages using token, or first page without filters
                    request_url = "https://serpapi.com/search.json"
                    request_params = {
                        "engine": "google_jobs",
                        "api_key": serpapi_key,
                        "q": enriched_query,
                        **({"location": final_location_param} if final_location_param else {}),
                        "num": 10, # Standard number per page
                        "hl": "en",
                        "gl": "us",
                    }
                    if token: # Use token if available (for pages > 1)
                        request_params["next_page_token"] = token
                        logger.info(f"Requesting page {current_page} using next_page_token...")
                    else:
                         logger.info(f"Requesting page {current_page} using base parameters (no token/filter)...")
                
                # Make the API call for the current page
                resp = await client.get(request_url, params=request_params)
                resp.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
                results_data = resp.json()
                logger.debug(f"Successfully retrieved page {current_page} data.")

                # Process results safely
                page_job_results = []
                if results_data:
                    page_job_results = results_data.get("jobs_results", [])
                
                if not page_job_results:
                    logger.warning(f"No job results found on page {current_page}. Stopping pagination.")
                    if results_data and "error" in results_data:
                        logger.error(f"SerpAPI Error on page {current_page}: {results_data['error']}")
                    has_more = False
                    token = None # No more pages
                else:
                    jobs.extend(page_job_results)
                    logger.info(f"Fetched {len(page_job_results)} jobs on page {current_page}. Total jobs: {len(jobs)}")

                    # Get next page token safely
                    token = None
                    if results_data:
                        search_metadata = results_data.get("search_metadata")
                        if search_metadata:
                            pagination_data = search_metadata.get("serpapi_pagination", {})
                            token = pagination_data.get("next_page_token")
                    has_more = bool(token)
                
                results_data = None # Clear for next loop
                current_page += 1

        # --- End of successful async block --- 
        logger.info(f"query_serpapi_google_jobs finished pagination loop. Total jobs: {len(jobs)}, Has More: {has_more}")
        return_value = {"jobs": jobs, "next_page_token": token, "has_more": has_more, "error": None}

    except Exception as e:
        logger.error(f"Unhandled exception in query_serpapi_google_jobs async block: {e}", exc_info=True)
        # Update return value to reflect partial results and error
        return_value = {"jobs": jobs, "next_page_token": token, "has_more": False, "error": str(e)}
        logger.warning(f"query_serpapi_google_jobs returning partial/error state: {return_value}")

    # --- Final Return --- 
    # No longer need the extra safety net return here, as the try/except guarantees return_value is set.
    logger.info(f"query_serpapi_google_jobs returning: {return_value}")
    return return_value

def run_pipeline(
    job_title_keywords: str,
    location: str,
    resume_text: str,
    detailed_preferences: Dict[str, Any],
    target_results: int
) -> (List[Dict[str, Any]], bool):
    """
    Orchestrates the job search and ranking pipeline.
    Returns a tuple: (ranked_jobs, used_fallback_flag).
    """
    # Build preferences model
    pref_model = JobSearchPreferences(
        job_title_keywords=job_title_keywords,
        industry=detailed_preferences.get("industry"),
        location=location,
        employment_type=detailed_preferences.get("employment_type"),
        experience_level=detailed_preferences.get("experience_level"),
        salary_min=detailed_preferences.get("salary_min") or detailed_preferences.get("min_salary"),
        salary_max=detailed_preferences.get("salary_max") or detailed_preferences.get("max_salary"),
        remote_preference=detailed_preferences.get("remote_preference"),
        company_preferences=detailed_preferences.get("company_preferences"),
        additional_preferences=detailed_preferences.get("additional_preferences"),
        date_posted=detailed_preferences.get("date_posted")
    )
    import asyncio
    loop = asyncio.get_event_loop()
    # Fetch job results via SerpAPI
    job_results = loop.run_until_complete(search_serpapi_google_jobs(pref_model))
    used_fallback = not bool(job_results)
    # Trim to target_results
    job_results = job_results[:target_results]
    # Rank with GPT-4o
    ranked_jobs = loop.run_until_complete(rank_jobs_with_gpt4o(job_results, resume_text, detailed_preferences))
    return ranked_jobs, used_fallback
