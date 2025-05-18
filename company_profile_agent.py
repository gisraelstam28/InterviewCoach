import os
from openai import AsyncOpenAI

openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = AsyncOpenAI(api_key=openai_api_key)

async def fetch_company_profile(company_name: str, role_title: str) -> str:
    prompt = [
        {"role": "system", "content": (
            "You are a razor-sharp corporate researcher. "
            "Given a company and role, you fetch best-guess high-level info based on public sources.")},
        {"role": "user", "content": (
            f"Company: {company_name}\n"
            f"Role: {role_title}\n\n"
            "Please provide:\n"
            "1. A 2-sentence company overview.\n"
            "2. Top 3 cultural values or traits.\n"
            "3. Three noteworthy recent developments or facts (no URLs needed)."
        )}
    ]
    resp = await openai_client.chat.completions.create(
        model="gpt-4-1106-preview",  # Use gpt-4.1-nano if available in your OpenAI account
        messages=prompt,
        temperature=0.2,
        max_tokens=300,
    )
    return resp.choices[0].message.content.strip()

def parse_company_profile_sections(profile_text: str):
    """
    Parses the GPT output into sections: overview, culture_cues, exec_quotes.
    Returns a dict.
    """
    import re
    lines = profile_text.split("\n")
    overview = ""
    culture_cues = []
    exec_quotes = []
    facts = []
    section = 0
    for line in lines:
        line = line.strip()
        if line.startswith("1."):
            section = 1
            overview = line[2:].strip()
        elif line.startswith("2."):
            section = 2
        elif line.startswith("3."):
            section = 3
        elif section == 1 and line:
            overview += " " + line
        elif section == 2 and line:
            culture_cues.append(re.sub(r"^[\-\d. ]+", "", line))
        elif section == 3 and line:
            facts.append(re.sub(r"^[\-\d. ]+", "", line))
    return {
        "overview": overview.strip(),
        "culture_cues": [c for c in culture_cues if c],
        "facts": [f for f in facts if f],
    }
