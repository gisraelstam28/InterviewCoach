try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None
from io import BytesIO
from typing import List, Dict
import re

def extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)

# Extract bullet-level snippets from a resume for evidence grounding
def extract_resume_snippets(resume_text: str, max_snippets: int = 20, min_length: int = 50) -> List[Dict[str, str]]:
    lines = resume_text.splitlines()
    # Patterns to exclude contact lines
    email_re = re.compile(r"\S+@\S+")
    phone_re = re.compile(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")
    url_re = re.compile(r"https?://")
    snippets = []
    counter = 1
    for line in lines:
        text = line.strip()
        # Skip too short lines or contact info
        if len(text) < min_length or email_re.search(text) or phone_re.search(text) or url_re.search(text):
            continue
        snippet_text = text[:120]
        snippets.append({"id": f"R{counter}", "snippet": snippet_text})
        counter += 1
        if counter > max_snippets:
            break
    return snippets

# New function to extract resume bullets as a list of strings
def extract_resume_bullets(resume_text: str, k: int = 40) -> List[str]:
    bullets = []
    for line in resume_text.splitlines():
        line = line.strip("•*- ").strip()  # Remove common bullet point characters and then whitespace
        if 25 < len(line) < 250:          # ignore headers / very short lines
            bullets.append(line)
    return bullets[:k]
