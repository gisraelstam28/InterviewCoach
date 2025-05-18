import httpx
import os
from filters import matches_location, matches_experience_band, is_fresh

SERPAPI_URL = "https://serpapi.com/search.json"

async def fetch_serpapi_jobs(preferences, next_page_token=None, want=15):
    jobs, token = [], next_page_token
    page = 1
    while len(jobs) < want and token is not False:
        params = {
            "engine": "google_jobs",
            "q": preferences.job_title_keywords,  # You may want to enrich this with industry, negative keywords, etc.
            "location": preferences.location if preferences.remote_preference != "Remote only" else "Remote",
            "num": 10,
            "hl": "en",
            "gl": "us",
            "api_key": os.getenv("SERPAPI_API_KEY"),
        }
        if token:
            params["next_page_token"] = token
            params["no_cache"] = True
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(SERPAPI_URL, params={k: v for k, v in params.items() if v is not None})
            resp.raise_for_status()
            data = resp.json()
            print(">>> SerpAPI keys:", data.keys())
            print(">>> jobs_results present?", "jobs_results" in data, "length:", len(data.get("jobs_results", [])))
            # More robust extraction in case SerpAPI changes key names
            raw_jobs = data.get("jobs_results") or data.get("jobs") or []
            for job in raw_jobs:
                jobs.append(job)
                if len(jobs) == want:
                    break
            token = data.get("search_metadata", {}).get("serpapi_pagination", {}).get("next_page_token") or False
        page += 1
    return jobs, token
