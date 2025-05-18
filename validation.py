from typing import Dict, Tuple, List

def validate_resume(resume: Dict) -> Tuple[bool, List[str]]:
    """
    Checks for missing or empty required fields in the parsed resume dict.
    Returns (is_valid, list_of_missing_fields)
    """
    missing = []
    if not resume.get("positions"):
        missing.append("positions")
    if not resume.get("skills"):
        missing.append("skills")
    # Removed education as it's not part of ResumeStructured
    # Optionally, check for at least 1 achievement
    if "achievements" in resume and not resume["achievements"]:
        missing.append("achievements (empty)")
    return (len(missing) == 0, missing)

def validate_jd(jd: Dict) -> Tuple[bool, List[str]]:
    missing = []
    if not jd.get("role_title"):
        missing.append("role_title")
    if not jd.get("requirements"):
        missing.append("requirements")
    if not jd.get("responsibilities"):
        missing.append("responsibilities")
    return (len(missing) == 0, missing)
