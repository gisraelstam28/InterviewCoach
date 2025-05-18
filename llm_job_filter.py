import logging
import json
from typing import List, Dict, Any
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain

# This function assumes you have a LangChain LLM instance (e.g. self.llm) available
def preprocess_jobs_for_llm(jobs, max_jobs=8, desc_max_len=250):
    processed = []
    for job in jobs[:max_jobs]:
        processed.append({
            'title': job.get('title', ''),
            'company': job.get('company', ''),
            'location': job.get('location', ''),
            # Cap description at ~2 sentences (~250 chars)
            'description': (job.get('description', '')[:desc_max_len] + '...') if len(job.get('description', '')) > desc_max_len else job.get('description', ''),
            # 'url' is intentionally omitted for this test
        })
    return processed

async def filter_and_explain_top_jobs(jobs: List[Dict[str, Any]], resume_summary: str, preferences: str, llm, n: int = 5) -> List[Dict[str, Any]]:
    # Preprocess jobs to avoid token overflow
    jobs_for_llm = preprocess_jobs_for_llm(jobs, max_jobs=8, desc_max_len=350)
    prompt_template = '''
You are an expert career coach. Your task is to review the following job listings and select the {n} best matches for the candidate, based on the provided resume summary and preferences.

For each selected job, provide:
- The job title
- The company name
- The location
- A score (1-10) for how well it matches the candidate
- A 1-2 sentence explanation of why this job is a good fit

Resume Summary:
{resume_summary}

Preferences:
{preferences}

Job Listings (JSON):
{job_json}

Return your answer as a JSON list of objects with keys: title, company, location, score, explanation.
Return ONLY valid JSON, with NO extra text or commentary.
'''

    prompt = PromptTemplate(
        input_variables=["resume_summary", "preferences", "job_json", "n"],
        template=prompt_template
    )
    llm_chain = LLMChain(llm=llm, prompt=prompt)
    job_json = json.dumps(jobs_for_llm, indent=2)
    response = await llm_chain.arun(
        resume_summary=resume_summary,
        preferences=preferences,
        job_json=job_json,
        n=n
    )
    # Clean markdown code block formatting if present
    import re
    def clean_llm_json_response(resp):
        # Remove opening code block with optional 'json' and any whitespace/newlines after
        cleaned = re.sub(r"^```(?:json)?[\s\r\n]*", "", resp.strip(), flags=re.IGNORECASE)
        # Remove closing code block with any whitespace/newlines before
        cleaned = re.sub(r"[\s\r\n]*```$", "", cleaned)
        return cleaned

    try:
        cleaned_response = clean_llm_json_response(response)
        filtered_jobs = json.loads(cleaned_response)
        # Ensure all required fields are present
        for job in filtered_jobs:
            job.setdefault("url", "")
            job.setdefault("score", 0)
            job.setdefault("explanation", "")
        return filtered_jobs
    except Exception as e:
        logging.error(f"Failed to parse LLM job filter response: {e}\nRaw response: {response}")
        return []
