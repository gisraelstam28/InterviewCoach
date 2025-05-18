import logging
import json
from typing import List, Dict, Any
from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
import re

# --- Step 1: Select Top N Jobs by Index ---
async def select_top_job_indices(jobs: List[Dict[str, Any]], resume_summary: str, preferences: str, llm, n: int = 5) -> List[int]:
    """
    Ask the LLM to select the top N jobs by index (0-based) given all jobs, resume summary, and preferences.
    Returns a list of indices (ints).
    """
    job_list_str = "\n".join([
        f"Job {i}: Title: {job.get('title', '')}, Company: {job.get('company', '')}, Location: {job.get('location', '')}, Desc: {job.get('description', '')[:120]}" for i, job in enumerate(jobs)
    ])
    prompt_template = '''
You are an expert career coach. Here are job listings for a candidate. Based on the resume summary and preferences, select the {n} best jobs. ONLY return a JSON list of the selected job indices (e.g., [0, 2, 5]).

Resume Summary:
{resume_summary}

Preferences:
{preferences}

Job Listings:
{job_list_str}

Return ONLY the JSON list of indices. No explanation, no commentary, no markdown.
'''
    prompt = PromptTemplate(
        input_variables=["resume_summary", "preferences", "job_list_str", "n"],
        template=prompt_template
    )
    llm_chain = LLMChain(llm=llm, prompt=prompt)
    response = await llm_chain.arun(
        resume_summary=resume_summary,
        preferences=preferences,
        job_list_str=job_list_str,
        n=n
    )
    # Clean and parse JSON
    def clean_json(resp):
        cleaned = resp.strip()
        # Find the first '[' and last ']'
        start = cleaned.find('[')
        end = cleaned.rfind(']')
        if start != -1 and end != -1 and end > start:
            return cleaned[start:end+1]
        # Fallback: try markdown removal
        cleaned = re.sub(r"^```(?:json)?[\s\r\n]*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"[\s\r\n]*```$", "", cleaned)
        return cleaned
    try:
        cleaned = clean_json(response)
        indices = json.loads(cleaned)
        if isinstance(indices, list) and all(isinstance(i, int) for i in indices):
            return indices
        logging.error(f"LLM did not return a valid list of indices: {response}")
        return []
    except Exception as e:
        logging.error(f"Failed to parse LLM job index response: {e}\nRaw response: {response}")
        return []

# --- Step 2: Score and Explain Top Jobs in Batches of 2 ---
async def explain_jobs_in_batches(jobs: List[Dict[str, Any]], resume_summary: str, preferences: str, llm, batch_size: int = 2) -> List[Dict[str, Any]]:
    """
    For each batch of jobs (up to batch_size), ask the LLM to score and explain each job.
    Returns a list of dicts with keys: title, company, location, score, explanation.
    """
    results = []
    prompt_template = '''
You are an expert career coach. For each of the following jobs, score how well it matches the candidate (1-10) and provide a 1-2 sentence explanation. Return ONLY a JSON list of objects with keys: title, company, location, score, explanation. No commentary, no markdown.

Resume Summary:
{resume_summary}

Preferences:
{preferences}

Jobs:
{job_batch_json}
'''
    prompt = PromptTemplate(
        input_variables=["resume_summary", "preferences", "job_batch_json"],
        template=prompt_template
    )
    llm_chain = LLMChain(llm=llm, prompt=prompt)
    for i in range(0, len(jobs), batch_size):
        batch = jobs[i:i+batch_size]
        job_batch_json = json.dumps(batch, indent=2)
        response = await llm_chain.arun(
            resume_summary=resume_summary,
            preferences=preferences,
            job_batch_json=job_batch_json
        )
        # Clean and parse JSON
        def clean_json(resp):
            cleaned = resp.strip()
            # Find the first '[' and last ']'
            start = cleaned.find('[')
            end = cleaned.rfind(']')
            if start != -1 and end != -1 and end > start:
                return cleaned[start:end+1]
            # Fallback: try markdown removal
            cleaned = re.sub(r"^```(?:json)?[\s\r\n]*", "", cleaned, flags=re.IGNORECASE)
            cleaned = re.sub(r"[\s\r\n]*```$", "", cleaned)
            return cleaned
        try:
            cleaned = clean_json(response)
            batch_results = json.loads(cleaned)
            if isinstance(batch_results, list):
                results.extend(batch_results)
            else:
                logging.error(f"LLM did not return a valid list for batch: {response}")
        except Exception as e:
            logging.error(f"Failed to parse LLM job explanation batch: {e}\nRaw response: {response}")
    return results

# --- Main Two-Step Function ---
async def filter_and_explain_top_jobs_two_step(jobs: List[Dict[str, Any]], resume_summary: str, preferences: str, llm, n: int = 5, batch_size: int = 2) -> List[Dict[str, Any]]:
    """
    1. Use the LLM to select the top N job indices.
    2. For each batch of 2 jobs, get scores and explanations.
    """
    indices = await select_top_job_indices(jobs, resume_summary, preferences, llm, n)
    if not indices:
        return []
    selected_jobs = [jobs[i] for i in indices if 0 <= i < len(jobs)]
    explanations = await explain_jobs_in_batches(selected_jobs, resume_summary, preferences, llm, batch_size)
    # Ensure all required fields are present and merge back original description
    for job in explanations:
        job.setdefault("url", "")
        job.setdefault("score", 0)
        job.setdefault("explanation", "")
        # Merge back description and any other fields from the original selected_jobs
        match = next((j for j in selected_jobs if j.get('title') == job.get('title') and j.get('company') == job.get('company') and j.get('location') == job.get('location')), None)
        if match:
            job['description'] = match.get('description', '')
    return explanations
