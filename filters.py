import re, yaml, dateparser, datetime as dt
from pathlib import Path

CFG = yaml.safe_load(Path("config/experience_levels.yml").read_text())
COMPILED = {
    band: [re.compile(p, re.I) for p in meta["patterns"]]
    for band, meta in CFG.items()
}

REMOTE_PAT = re.compile(r"(remote|anywhere)", re.I)

def _years(txt: str):
    rng = re.search(r"(\d{1,2})\s*-\s*(\d{1,2})\s*years", txt)
    if rng:
        return (int(rng.group(1)) + int(rng.group(2))) // 2
    one = re.search(r"(\d{1,2})\s*\+?\s*years?", txt)
    return int(one.group(1)) if one else None

def matches_experience_band(job, band):
    band_key = band.lower()
    if band_key == "any":
        return True
    BAND_MAP = {
        "entry": "entry_level",
        "mid": "mid_level",
        "senior": "senior_level"
    }
    band_key = BAND_MAP.get(band_key, band_key)
    txt = (job.get("title","") + job.get("description","")).lower()
    pats = COMPILED[band_key]
    pattern_ok = any(p.search(txt) for p in pats)
    yrs = _years(txt)
    yrs_ok = yrs is not None and CFG[band_key]["min_years"] <= yrs < CFG[band_key]["max_years"]
    # reject if text matches *another* band strongly
    other_hit = any(
        any(p.search(txt) for p in pats2)
        for b, pats2 in COMPILED.items() if b != band_key
    )
    return (pattern_ok or yrs_ok) and not other_hit

def matches_location(job, city, remote_pref):
    loc = (job.get("location") or "").lower()
    city = (city or "").lower()
    if remote_pref == "Remote only":
        return REMOTE_PAT.search(loc)
    if remote_pref == "On-site only":
        return city in loc and not REMOTE_PAT.search(loc)
    # No preference → allow on-site in city OR explicit remote
    return city in loc or REMOTE_PAT.search(loc)

def is_fresh(job, max_days=30):
    raw = job.get("detected_extensions", {}).get("posted_at")
    if not raw:
        return True
    if "+" in raw:
        return False
    date_obj = dateparser.parse(raw)
    if not date_obj:
        return True
    return date_obj.date() >= dt.date.today() - dt.timedelta(days=max_days)
