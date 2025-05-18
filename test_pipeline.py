import asyncio
import json
import logging
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Capture DEBUG level messages from the pipeline
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler() # Output logs to console
    ]
)

# Adjust logger level for noisy libraries if needed
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.INFO)

# Ensure the pipeline module can be found (assuming test script is in root)
try:
    from job_search_pipeline import run_pipeline, JobSearchPreferences
except ImportError as e:
    logging.error(f"Failed to import: {e}")
    logging.error("Ensure this script is run from the project root directory and necessary classes are defined correctly.")
    exit(1)

# --- Test Configuration ---

sample_preferences_dict = {
    "job_title_keywords": "Software Engineer", # Corrected key name
    "industry": ["Healthcare", "Information Technology (IT)"], # Correct key, List
    "location": "Remote",  # Location for initial query
    "employment_type": ["Full-time"], # Correct key, List
    "experience_level": "Mid-Level",
    "min_salary": 90000,
    "max_salary": 120000,
    "remote_preference": "Remote only", # Specific remote filter for GPT
    "company_preferences": "Google Stripe", # Converted to space-separated string
    "additional_preferences": "startup culture flexible hours" # Correct key, String
}

sample_resume = """Experienced Software Engineer with 4 years of experience in Python, Java, and cloud technologies (AWS, GCP).
Proven ability to design, develop, and deploy scalable applications.
Seeking a challenging Mid-Level remote role in a fast-paced environment, preferably within the IT or Healthcare sectors.
Interested in innovative companies like Google and Stripe, and roles offering flexible hours and a dynamic startup culture.
Comfortable working independently and collaboratively in remote settings.
Target salary range: $90,000 - $120,000.
"""

def main():
    # Load environment variables (SERPAPI_API_KEY, OPENAI_API_KEY)
    if not load_dotenv():
        logging.warning("Could not load .env file or it's empty.")
    logging.info("Environment variables loaded.")

    serpapi_key = os.getenv("SERPAPI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if not serpapi_key:
        logging.error("SERPAPI_API_KEY not found in environment variables.")
        return
    if not openai_key:
        logging.error("OPENAI_API_KEY not found in environment variables.")
        return

    logging.info("API keys found.")

    # Create JobPreferences object
    try:
        preferences = JobSearchPreferences(**sample_preferences_dict)
        logging.info(f"JobPreferences created: {preferences.model_dump_json(indent=2)}")
    except Exception as e:
        logging.error(f"Error creating JobPreferences object: {e}")
        return

    logging.info("Starting job search pipeline...")
    try:
        location = preferences.location

        # Pass detailed preferences as a dictionary
        detailed_preferences_dict = preferences.model_dump(exclude_none=True)

        # Call run_pipeline with individual arguments
        ranked_jobs, used_fallback = run_pipeline(
            job_title_keywords=preferences.job_title_keywords, # Pass only title keywords
            location=location,
            resume_text=sample_resume,
            detailed_preferences=detailed_preferences_dict,
            target_results=8
        )
        if used_fallback:
            print("\nWARNING: No jobs posted in the last 3 months. Showing older roles instead.\n")

        logging.info("Job search pipeline finished.")

        print("\n--- Final Ranked Jobs (Top 8) ---")
        if ranked_jobs:
            print(json.dumps(ranked_jobs, indent=2))
            logging.info(f"Successfully retrieved {len(ranked_jobs)} ranked jobs.")
            # Check for links in the final output
            links_found = [job.get('details_link') for job in ranked_jobs if job.get('details_link')]
            logging.info(f"Found {len(links_found)} links in the final {len(ranked_jobs)} results.")
            if len(links_found) < len(ranked_jobs):
                logging.warning("Some final ranked jobs are missing 'details_link'.")
        else:
            print("No ranked jobs returned by the pipeline.")
            logging.warning("Pipeline returned an empty list of ranked jobs.")

    except Exception as e:
        logging.error(f"An error occurred during pipeline execution: {e}")

if __name__ == "__main__":
    main()
