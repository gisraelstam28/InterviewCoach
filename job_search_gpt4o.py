import os
import openai
import json
import logging
import asyncio
import httpx
import re
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

PROMPT_TEMPLATE = """\
You are an expert AI assistant specialized in finding relevant, *active* job postings based on a user's resume and preferences. Your goal is to return 10-15 high-quality job listings from reputable online sources. Ensure the jobs appear to be currently open and accepting applications.

**CRITICAL INSTRUCTIONS - READ AND FOLLOW CAREFULLY:**
1.  **Relevance:** Prioritize jobs that closely match the skills, experience level, and preferences outlined in the user's input.
2.  **Activity Check:** Only include jobs that appear to be currently active. If a listing looks potentially old or expired, prefer newer ones.
3.  **Self-Critique:** Before finalizing your list, review each job found. Does it *truly* match the user's profile? Does the link seem likely to lead to an *active* job posting? Discard any dubious entries.
4.  **Output Format:** Structure your findings as a JSON object containing a single key, `"job_listings"`, which holds a list of job objects. Each job object **MUST** have these keys:
    *   `"title"`: The job title.
    *   `"company"`: The hiring company.
    *   `"url"`: The direct URL to the job posting.
    *   `"guessed_posted_date"`: Your best guess of the posting date (e.g., "2024-03-15", "Posted 2 weeks ago", "Unknown").

**ABSOLUTE OUTPUT REQUIREMENT:**
*   Your response **MUST** be **ONLY** the JSON object described in step 4 above.
*   Do **NOT** include **ANY** introductory text, explanations, apologies, summaries, or markdown formatting (like ```json ... ```) outside of the JSON structure itself.
*   If, after applying **ALL** filters and self-critique, you cannot find **ANY** job listings that meet **ALL** the specified criteria, you **MUST** return exactly this JSON object: {{"job_listings": []}}. Do **NOT** explain why or offer alternatives.

**User Input:**
Resume Text:
```
{resume_text}
```
Job Preferences:
```
{preferences}
```

Based *only* on the provided resume, preferences, and the web search results you perform, find 10-15 matching, *active* job postings following **all** instructions above. Ensure the output is valid JSON.
"""

# Keywords indicating a job is likely closed or expired
CLOSED_JOB_KEYWORDS = [
    r"job has been filled",
    r"position has been filled",
    r"job is closed",
    r"job has expired",
    r"no longer available",
    r"position closed",
    r"posting has been removed",
    r"listing is no longer active",
    r"job opening is closed",
    r"not accepting applications",
    r"this job has been archived"
]
CLOSED_JOB_PATTERN = re.compile(r"|".join(CLOSED_JOB_KEYWORDS), re.IGNORECASE)

class JobListing(BaseModel):
    title: str
    company: str
    url: str
    guessed_posted_date: str

async def check_url(client: httpx.AsyncClient, job: JobListing) -> Optional[JobListing]:
    """Fetches a URL and checks if the job seems open."""
    try:
        response = await client.get(job.url, follow_redirects=True, timeout=10)
        response.raise_for_status()  # Raise exception for 4xx or 5xx errors

        # Check page content for closed keywords
        # Decode safely, ignoring errors
        html_content = response.text # httpx handles decoding based on headers
        if CLOSED_JOB_PATTERN.search(html_content):
            logging.info(f"Job '{job.title}' at {job.url} seems closed/expired.")
            return None # Discard job
            
        # Optional: Could add check for 'Apply' button presence here

        logging.info(f"Job '{job.title}' at {job.url} passed validation.")
        return job # Job seems valid
        
    except httpx.HTTPStatusError as e:
        logging.warning(f"HTTP error {e.response.status_code} for {job.url}: {e}")
        return None
    except httpx.RequestError as e:
        logging.warning(f"Request error for {job.url}: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error checking {job.url}: {e}")
        return None

async def validate_job_links(jobs: List[JobListing]) -> List[JobListing]:
    """Asynchronously validates a list of job listing URLs."""
    if not jobs:
        return []
        
    async with httpx.AsyncClient() as client:
        tasks = [check_url(client, job) for job in jobs]
        results = await asyncio.gather(*tasks)
        
    validated_jobs = [job for job in results if job is not None]
    logging.info(f"Validation complete. Kept {len(validated_jobs)} out of {len(jobs)} jobs.")
    return validated_jobs

async def search_jobs_gpt4o(resume_text: str, preferences: Dict[str, Any], api_key: str = None) -> Dict[str, Any]:
    """
    Calls OpenAI GPT-4o with Search Preview to find matching job listings.
    Returns a list of job dicts or a fallback message.
    """
    api_key = api_key or OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY is missing. Please set it in your .env file.")

    # Ensure resume_text is non-empty string and preferences is a non-empty dictionary
    if not resume_text or not isinstance(resume_text, str):
        raise ValueError("Missing or invalid resume text — cannot construct prompt.")
    if not preferences or not isinstance(preferences, dict):
        raise ValueError("Missing or invalid preferences — cannot construct prompt.")

    def validate_prompt(input_string):
        if not input_string or not isinstance(input_string, str):
            raise ValueError("Prompt input is missing or not a string.")
    validate_prompt(resume_text)

    try:
        import openai
        client = openai.OpenAI(api_key=api_key)

        # Format the preferences dictionary into a string
        pref_string = ", ".join([f"{k}: {v}" for k, v in preferences.items() if v])
        if not pref_string: # Handle case where preferences might be empty after filtering
             pref_string = "No specific preferences provided."

        # Format the main prompt template with user's resume and preferences string
        formatted_prompt = PROMPT_TEMPLATE.format(
            resume_text=resume_text.strip(),
            preferences=pref_string
        )

        # Ensure the formatted prompt is valid
        validate_prompt(formatted_prompt)

        logging.debug(f"--- Sending Prompt to GPT-4o ---\n{formatted_prompt}\n-----------------------------")

        # Revert to using client.responses.create which handles the web_search tool type correctly
        response = client.responses.create(
            model="gpt-4o",
            input=formatted_prompt, # Use formatted prompt as input
            tools=[{"type": "web_search_preview"}],
            tool_choice={"type": "web_search_preview"} # Force web search
        )

        # Log the full raw response object for debugging
        logging.warning("[GPT-4o RAW FULL RESPONSE (responses.create)] %r", response)

        # Extract the assistant message content from the output list (responses.create format)
        content = None
        for output_item in getattr(response, "output", []):
            if getattr(output_item, "type", None) == "message":
                # Assuming content is plain text within the message
                if hasattr(output_item, "content") and isinstance(output_item.content, list):
                    for text_item in output_item.content:
                        if hasattr(text_item, "text"):
                             content = text_item.text
                             break # Found text content
                # Fallback or alternative structure check if needed
                # elif hasattr(output_item, "text"): # Example fallback
                #    content = output_item.text
            if content:
                break

        if not content or not content.strip():
            logging.warning("[GPT-4o EMPTY RESPONSE] %r", content)
            return {"error": "OpenAI returned an empty response.", "raw": content}

        # Re-add JSON cleaning for potential markdown markers
        import re
        import json
        content = re.sub(r"^```json\n|\n```$", "", content.strip(), flags=re.MULTILINE)

        try:
            jobs = json.loads(content)
            # Check if the result is a dictionary with a key (like sometimes happens)
            # and extract the list if necessary.
            if isinstance(jobs, dict):
                # Look for a likely key containing the list of jobs
                list_key = next((k for k, v in jobs.items() if isinstance(v, list)), None)
                if list_key:
                    jobs = jobs[list_key]
                else:
                    # If no list found in the dict, raise an error
                    raise ValueError("JSON response is a dictionary, but contains no list of jobs.")

            if not isinstance(jobs, list):
                 raise ValueError(f"Expected a list of jobs, but got {type(jobs)}")

            # Validate job structure (optional but recommended)
            validated = []
            for job in jobs:
                if all(k in job for k in ["title", "company", "url", "guessed_posted_date"]):
                    validated.append(job)
            if not validated:
                logging.warning("[GPT-4o NO VALID JOBS] %r", content)
                return {"error": "No valid jobs found in response.", "raw": content}
            logging.warning("[RETURNING TO FRONTEND] %r", validated)
            
            # Convert validated jobs to JobListing objects
            job_listings = [JobListing(**job) for job in validated]
            
            # Run link validation
            validated_jobs = await validate_job_links(job_listings)
            return {"job_listings": [job.dict() for job in validated_jobs]}
        except Exception as e:
            logging.error("[GPT-4o MALFORMED JSON] %r", content)
            return {"error": "Malformed JSON from OpenAI.", "raw": content}
    except Exception as e:
        return {"error": f"OpenAI API call failed: {str(e)}"}
