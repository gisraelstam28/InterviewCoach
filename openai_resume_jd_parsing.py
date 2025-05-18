import openai
import os
import json
from typing import Dict

openai.api_key = os.getenv("OPENAI_API_KEY")

RESUME_FUNCTION = {
    "name": "parse_resume",
    "description": "Extract structured information from a resume.",
    "parameters": {
        "type": "object",
        "properties": {
            "positions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "company": {"type": "string"},
                        "start_date": {"type": "string", "format": "date"},
                        "end_date": {"type": "string", "format": "date"},
                        "description": {"type": "string"}
                    },
                    "required": ["title", "company", "start_date", "end_date"]
                }
            },
            "skills": {"type": "array", "items": {"type": "string"}},
            "achievements": {"type": "array", "items": {"type": "string"}},
            "education": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "degree": {"type": "string"},
                        "institution": {"type": "string"},
                        "year": {"type": "integer"}
                    },
                    "required": ["degree", "institution"]
                }
            },
            "certifications": {"type": "array", "items": {"type": "string"}},
            "languages": {"type": "array", "items": {"type": "string"}},
            "publications": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["positions", "skills", "education"]
    }
}

JD_FUNCTION = {
    "name": "parse_job_description",
    "description": "Extract structured information from a job description.",
    "parameters": {
        "type": "object",
        "properties": {
            "role_title": {"type": "string"},
            "requirements": {"type": "array", "items": {"type": "string"}},
            "responsibilities": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["role_title", "requirements", "responsibilities"]
    }
}

from validation import validate_resume, validate_jd
from chunking import chunk_resume_text, chunk_jd_text
from cache import get_cached_resume, set_cached_resume, get_cached_jd, set_cached_jd

def merge_resume_chunks(parsed_chunks):
    merged = {
        "positions": [], "skills": [], "achievements": [], "education": [],
        "certifications": [], "languages": [], "publications": []
    }
    for chunk in parsed_chunks:
        for field in merged.keys():
            val = chunk.get(field)
            if val:
                if isinstance(val, list):
                    merged[field].extend(v for v in val if v not in merged[field])
    # Remove dups for simple fields
    merged["skills"] = list(dict.fromkeys(merged["skills"]))
    merged["certifications"] = list(dict.fromkeys(merged["certifications"]))
    merged["languages"] = list(dict.fromkeys(merged["languages"]))
    merged["publications"] = list(dict.fromkeys(merged["publications"]))
    return merged

def parse_resume_with_openai(resume_text: str) -> Dict:
    # Single-call parsing for the full resume
    cached = get_cached_resume(resume_text)
    if cached:
        return cached
    print(f"DEBUG: Parsing resume text ({len(resume_text)} chars)")
    messages = [
        {"role": "system", "content": "You are an expert data extractor. When called to parse a resume, return only JSON matching the `parse_resume` schema."},
        {"role": "user", "content": resume_text}
    ]
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        messages=messages,
        tools=[{"type": "function", "function": RESUME_FUNCTION}],
        tool_choice={"type": "function", "function": {"name": "parse_resume"}},
        temperature=0,
        top_p=1
    )
    parsed = json.loads(response.choices[0].message.tool_calls[0].function.arguments)
    valid, missing = validate_resume(parsed)
    if not valid:
        print(f"DEBUG: parse_resume missing fields: {missing}")
    set_cached_resume(resume_text, parsed)
    return parsed

def merge_jd_chunks(parsed_chunks):
    merged = {"role_title": "", "requirements": [], "responsibilities": []}
    for chunk in parsed_chunks:
        if not merged["role_title"] and chunk.get("role_title"):
            merged["role_title"] = chunk["role_title"]
        for field in ["requirements", "responsibilities"]:
            val = chunk.get(field)
            if val:
                merged[field].extend(v for v in val if v not in merged[field])
    return merged

def parse_jd_with_openai(jd_text: str) -> Dict:
    # Single-call parsing for the full job description
    cached = get_cached_jd(jd_text)
    if cached:
        return cached
    print(f"DEBUG: Parsing job description ({len(jd_text)} chars)")
    messages = [
        {"role": "system", "content": "You are an expert data extractor. When called to parse a job description, return only JSON matching the `parse_job_description` schema."},
        {"role": "user", "content": jd_text}
    ]
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo-1106",
        messages=messages,
        tools=[{"type": "function", "function": JD_FUNCTION}],
        tool_choice={"type": "function", "function": {"name": "parse_job_description"}},
        temperature=0,
        top_p=1
    )
    parsed = json.loads(response.choices[0].message.tool_calls[0].function.arguments)
    valid, missing = validate_jd(parsed)
    if not valid:
        print(f"DEBUG: parse_jd missing fields: {missing}")
    set_cached_jd(jd_text, parsed)
    return parsed
