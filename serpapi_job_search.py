import os
from serpapi import GoogleSearch
from typing import List, Dict, Any
import logging

def fetch_jobs_from_serpapi(query: str, location: str, api_key: str) -> List[Dict[str, Any]]:
    params = {
        "engine": "google_jobs",
        "q": query,
        "location": location,
        "api_key": api_key,
    }
    logging.info(f"[SerpAPI DEBUG] Params being sent to SerpAPI: {params}")
    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        logging.info(f"[SerpAPI DEBUG] Raw response from SerpAPI: {results}")
        if not isinstance(results, dict):
            logging.error(f"SerpAPI returned non-dict response: {results}")
            return []
        jobs = results.get("jobs_results", [])
        if not isinstance(jobs, list):
            logging.error(f"SerpAPI jobs_results is not a list: {jobs}")
            return []
        # If no jobs found, try a minimal hardcoded query
        if not jobs:
            minimal_params = {
                "engine": "google_jobs",
                "q": "Business Analyst",
                "location": "Chicago, IL",
                "api_key": api_key,
            }
            logging.info(f"[SerpAPI DEBUG] Retrying with minimal params: {minimal_params}")
            try:
                minimal_search = GoogleSearch(minimal_params)
                minimal_results = minimal_search.get_dict()
                logging.info(f"[SerpAPI DEBUG] Raw response from minimal query: {minimal_results}")
                jobs = minimal_results.get("jobs_results", [])
                if not isinstance(jobs, list):
                    logging.error(f"SerpAPI jobs_results is not a list (minimal query): {jobs}")
                    return []
                return jobs
            except Exception as e2:
                logging.error(f"Error fetching jobs from SerpAPI with minimal query: {e2}", exc_info=True)
                return []
        return jobs
    except Exception as e:
        logging.error(f"Error fetching jobs from SerpAPI: {e}", exc_info=True)
        return []


def extract_relevant_job_info(jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    output = []
    for job in jobs:
        url = ""
        # Try to get the application link, fallback to job posting link
        if job.get("apply_options") and isinstance(job["apply_options"], list) and job["apply_options"]:
            url = job["apply_options"][0].get("link", "")
        if not url:
            url = job.get("job_highlights", [{}])[0].get("link", "")
        if not url:
            url = job.get("detected_extensions", {}).get("apply_link", "")
        if not url:
            url = job.get("search_link", "")
        
        # Only include if we have a URL and a title
        if url and job.get("title"):
            # Truncate description to 500 chars if present
            desc = job.get("description", "")
            if desc:
                desc = desc[:500] + ("..." if len(desc) > 500 else "")
            output.append({
                "title": job["title"],
                "company": job.get("company_name", ""),
                "location": job.get("location", ""),
                "description": desc,
                "url": url
            })
    return output
