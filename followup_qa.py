import os
import openai
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

router = APIRouter()

class FollowUpRequest(BaseModel):
    guide: str
    job_description: str
    company_name: str
    language_complexity: str
    question: str

@router.post("/api/follow-up/")
async def follow_up_qa(data: FollowUpRequest):
    prompt = f"""
You are an expert interview coach. Use the following context to answer the user's follow-up question:

---
INTERVIEW GUIDE:
{data.guide}

JOB DESCRIPTION:
{data.job_description}

COMPANY:
{data.company_name}

LANGUAGE COMPLEXITY:
{data.language_complexity}

---
USER'S FOLLOW-UP QUESTION:
{data.question}

Answer in a way that matches the language complexity setting above. Be concise, clear, and specific to the context provided. If the answer is not in the context, say so explicitly.
"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=350,
            temperature=0.7
        )
        answer = response.choices[0].message['content'].strip()
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}
