"""
interview_prep_v2_agent.py

This module contains the data models and core logic for Interview Prep v2.
Sections are numbered 0-10 to match the product spec.
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# --- SECTION 0: Welcome & Navigation ---
class WelcomeSection(BaseModel):
    intro: str = Field(..., description="Two-line introduction to the guide.")
    quick_view_enabled: bool = Field(..., description="Whether Quick View mode is enabled.")
    deep_dive_enabled: bool = Field(..., description="Whether Deep Dive mode is enabled.")
    progress: float = Field(..., ge=0, le=1, description="Progress bar value (0-1).")

# --- SECTION 1: Company & Industry Snapshot ---
class IndustryDriver(BaseModel):
    trend: str
    citation: Optional[str]

class CompanyIndustrySection(BaseModel):
    company_overview: str = Field(..., description="~100-word overview of the company.")
    recent_news: List[str] = Field(..., description="Bullets for last 90 days' news.")
    industry_drivers: List[IndustryDriver] = Field(..., description="Top 3 trends with citations.")

# --- SECTION 2: Department / Team Context ---
class DepartmentContextSection(BaseModel):
    org_chart_mermaid: str = Field(..., description="Mermaid.js or compatible string for org chart.")
    okrs: List[str] = Field(..., description="List of typical OKRs/KPIs for the department/team.")

# --- SECTION 3: Role Success Factors ---
class RoleSuccessFactorsSection(BaseModel):
    must_haves: List[str] = Field(..., description="3-5 Day-1 must-haves.")
    nice_to_haves: List[str] = Field(..., description="3 nice-to-haves with spin suggestions.")

# --- SECTION 4: Candidate Fit Matrix ---
class FitMatrixRow(BaseModel):
    job_requirement: str
    your_evidence: str
    spin_or_gap_fix: str
    color_code: Literal['green','yellow','red']

class CandidateFitMatrixSection(BaseModel):
    rows: List[FitMatrixRow]

# --- SECTION 5: STAR Story Bank ---
class StarStory(BaseModel):
    competency: str
    situation: str
    task: str
    action: str
    result: str
    tags: List[str]

class StarStoryBankSection(BaseModel):
    stories: List[StarStory]

# --- SECTION 6: Technical / Case Prep ---
class PracticePrompt(BaseModel):
    prompt: str
    gold_standard_answer: str
    resource_links: List[str]

class TechnicalCasePrepSection(BaseModel):
    prompts: List[PracticePrompt]

# --- SECTION 7: Mock Interview & Feedback ---
class MockInterviewFeedback(BaseModel):
    question: str
    answer: str
    rubric: dict
    score: float
    feedback: str

class MockInterviewSection(BaseModel):
    questions: List[str]
    feedback: List[MockInterviewFeedback]
    premium_required: bool = True

# --- SECTION 8: Insider Cheat Sheet ---
class InsiderCheatSheetSection(BaseModel):
    culture_cues: List[str]
    exec_quotes: List[str]
    financial_snapshot: str
    glassdoor_pain_points: List[str]
    tailored_questions: List[str]

# --- SECTION 9: 30-60-90 Day Plan ---
class ThirtySixtyNinetySection(BaseModel):
    onboarding_checklist: List[str]
    milestone_goals: List[str]
    premium_required: bool = True

# --- SECTION 10: Offer & Negotiation Tips ---
class OfferNegotiationSection(BaseModel):
    comp_range_benchmarks: str
    alternative_levers: List[str]
    premium_required: bool = True

# --- Export & Share (not a numbered section, but included in the schema) ---
class ExportShareSection(BaseModel):
    pdf_export_enabled: bool
    notion_export_enabled: bool
    send_to_coach_enabled: bool

# --- FULL GUIDE SCHEMA ---
class InterviewPrepV2Guide(BaseModel):
    section_0_welcome: WelcomeSection
    section_1_company_industry: CompanyIndustrySection
    section_2_department_context: DepartmentContextSection
    section_3_role_success: RoleSuccessFactorsSection
    section_4_fit_matrix: CandidateFitMatrixSection
    section_5_star_story_bank: StarStoryBankSection
    section_6_technical_case_prep: TechnicalCasePrepSection
    section_7_mock_interview: MockInterviewSection
    section_8_insider_cheat_sheet: InsiderCheatSheetSection
    section_9_thirty_sixty_ninety: ThirtySixtyNinetySection
    section_10_offer_negotiation: OfferNegotiationSection
    export_share: ExportShareSection
