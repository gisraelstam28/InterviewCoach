import hashlib
import json
from typing import Dict, Optional

# In-memory cache (for demo; replace with Redis or persistent store in prod)
_resume_cache = {}
_jd_cache = {}

def hash_input(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def get_cached_resume(text: str) -> Optional[Dict]:
    h = hash_input(text)
    return _resume_cache.get(h)

def set_cached_resume(text: str, parsed: Dict):
    h = hash_input(text)
    _resume_cache[h] = parsed

def get_cached_jd(text: str) -> Optional[Dict]:
    h = hash_input(text)
    return _jd_cache.get(h)

def set_cached_jd(text: str, parsed: Dict):
    h = hash_input(text)
    _jd_cache[h] = parsed
