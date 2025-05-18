from typing import List, Dict, Tuple
import re

SECTION_HEADERS = [
    r"(?i)experience", r"(?i)work history", r"(?i)employment", r"(?i)education", r"(?i)skills", r"(?i)certifications", r"(?i)languages", r"(?i)publications", r"(?i)achievements", r"(?i)awards"
]

def chunk_resume_text(resume_text: str, max_words: int = 2000) -> List[str]:
    """
    Splits resume text into logical sections using common headers. If still too long, further splits into max_words chunks.
    """
    # Split by section headers
    sections = re.split(r'|'.join(SECTION_HEADERS), resume_text)
    chunks = []
    for sec in sections:
        words = sec.split()
        if len(words) > max_words:
            # Further split long sections
            for i in range(0, len(words), max_words):
                chunk = ' '.join(words[i:i+max_words])
                chunks.append(chunk)
        else:
            if sec.strip():
                chunks.append(sec.strip())
    return [c for c in chunks if c]

def chunk_jd_text(jd_text: str, max_words: int = 2000) -> List[str]:
    words = jd_text.split()
    if len(words) <= max_words:
        return [jd_text.strip()]
    # Split into max_words chunks
    return [' '.join(words[i:i+max_words]) for i in range(0, len(words), max_words)]
