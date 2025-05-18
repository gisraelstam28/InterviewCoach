import pytest
from utils import extract_resume_snippets


def test_extract_resume_snippets_returns_empty_for_short_text():
    text = "Short line\nAnother short"
    snippets = extract_resume_snippets(text, max_snippets=5, min_length=50)
    assert snippets == []


def test_extract_resume_snippets_basic_truncation():
    line1 = "A" * 200
    line2 = "B" * 100
    resume_text = f"{line1}\n{line2}"
    snippets = extract_resume_snippets(resume_text, max_snippets=5, min_length=50)
    assert len(snippets) == 2
    assert snippets[0]["id"] == "R1"
    assert snippets[1]["id"] == "R2"
    assert snippets[0]["snippet"] == line1[:120]
    assert snippets[1]["snippet"] == line2[:120]


def test_extract_resume_snippets_respects_max_snippets():
    # Generate 10 lines, each long enough
    resume_text = "\n".join([f"Line that is long enough number {i}" for i in range(10)])
    snippets = extract_resume_snippets(resume_text, max_snippets=3, min_length=10)
    assert len(snippets) == 3
    assert snippets[0]["id"] == "R1"
    assert snippets[-1]["id"] == "R3"


def test_extract_resume_snippets_respects_min_length():
    # Only lines >= min_length are included
    long_line = "X" * 60
    short_line = "Y" * 20
    resume_text = f"{short_line}\n{long_line}\n{short_line}"
    snippets = extract_resume_snippets(resume_text, max_snippets=5, min_length=50)
    assert len(snippets) == 1
    assert snippets[0]["id"] == "R1"
    assert snippets[0]["snippet"] == long_line[:120]


def test_extract_resume_snippets_from_sample_resume():
    import os
    # Load a real resume from sample_resume.txt
    sample_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "sample_resume.txt")
    )
    with open(sample_path, "r", encoding="utf-8") as f:
        text = f.read()
    snippets = extract_resume_snippets(text, max_snippets=5, min_length=50)
    assert snippets, "Expected non-empty snippets from sample_resume.txt"
    for sn in snippets:
        assert sn["id"].startswith("R"), "Snippet ID should start with 'R'"
        assert isinstance(sn["snippet"], str)
        assert 50 <= len(sn["snippet"]) <= 120


def test_extract_resume_snippets_filters_out_contact_info():
    # Lines with email, phone, or URL should be skipped
    text = (
        "john.doe@example.com\n"
        "(123) 456-7890\n"
        "https://website.com/profile\n"
        "This is a meaningful resume bullet that should be picked up because it's long enough and has no contact info."
    )
    snippets = extract_resume_snippets(text, max_snippets=5, min_length=30)
    assert len(snippets) == 1
    assert snippets[0]["id"] == "R1"
    assert "meaningful resume bullet" in snippets[0]["snippet"]
