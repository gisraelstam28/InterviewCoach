from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, HttpUrl
from datetime import date

# SECTION 0: Welcome & Navigation
class WelcomeSectionModel(BaseModel):
    introduction: Optional[str] = None
    tell_me_about_yourself: Optional[str] = None 
    quick_view_enabled: Optional[bool] = False
    deep_dive_enabled: Optional[bool] = False
    progress: Optional[float] = 0.0

# SECTION 1: Company & Industry Snapshot
class NewsItem(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    date: Optional[str] = None
    source: Optional[str] = None
    summary: Optional[str] = None 
    so_what: Optional[str] = None 

class CompanyIndustrySectionModel(BaseModel):
    company_overview: Optional[str] = None
    recent_news: Optional[List[NewsItem]] = Field(default_factory=list)
    industry_drivers: Optional[List[str]] = Field(default_factory=list)

# SECTION 2: Calendar Invites & Logistics
class CalendarInvitesSectionModel(BaseModel):
    logistics_summary: Optional[str] = None 
    calendar_links: Optional[List[Dict[str, str]]] = Field(default_factory=list) 

# SECTION 3: Role Success Factors
class EvaluatedRequirementItemModel(BaseModel):
    text: str
    met: bool
    explanation: Optional[str] = None
    resume_evidence: Optional[str] = None

class RoleSuccessFactorsSection(BaseModel):
    # Legacy fields (kept for backward compatibility)
    must_haves: Optional[List[EvaluatedRequirementItemModel]] = Field(default_factory=list)
    nice_to_haves: Optional[List[EvaluatedRequirementItemModel]] = Field(default_factory=list)

    # New fields for improved assessment
    job_duties: Optional[List[str]] = Field(default_factory=list, description="Key responsibilities / what you will do on the job")
    qualifications: Optional[List[str]] = Field(default_factory=list, description="Required or desired qualifications for the role")
    overall_readiness: Optional[str] = Field(default=None, description="Narrative evaluation of how prepared the candidate is given resume & JD")
    focus_recommendations: Optional[List[str]] = Field(default_factory=list, description="Guidance on areas to highlight or improve during interview prep")

# SECTION 4: Role Understanding & Fit Assessment
class RoleUnderstandingFitAssessmentSectionModel(BaseModel):
    role_summary: str = Field(default="", description="A concise, easily understandable summary of what the role is.")
    key_responsibilities_summary: List[str] = Field(default_factory=list, description="A list summarizing the key day-to-day activities and expectations in the role.")
    overall_fit_rating: str = Field(default="", description="A qualitative assessment of the candidate's fit (e.g., 'Strong Fit', 'Good Potential Fit', 'Potential Gaps Identified').")
    fit_assessment_details: str = Field(default="", description="A detailed explanation of why the candidate is a good fit or not, highlighting strengths aligned with the role and any potential gaps or areas where the resume doesn't show strong alignment with the role summary and responsibilities.")

# SECTION 5: STAR Story Bank
class StarStory(BaseModel):
    competency: Optional[str] = Field(default=None, description="The core skill or competency demonstrated, e.g., 'Problem Solving', 'Leadership'. This will be used as the title.")
    behavioral_question: Optional[str] = Field(default=None, description="A relevant behavioral interview question this story can answer, tailored to the job description.")
    situation: Optional[str] = None
    task: Optional[str] = None
    action: Optional[str] = None
    result: Optional[str] = None
    interviewer_advice: Optional[str] = Field(default=None, description="Advice on what the interviewer is assessing and what the candidate should emphasize.")
    tags: Optional[List[str]] = Field(default_factory=list, description="Relevant keywords or tags for the story, e.g., specific skills, project names.")

class StarStoryBankSectionModel(BaseModel):
    stories: Optional[List[StarStory]] = Field(default_factory=list) 

# SECTION 6: Technical / Case Prep
class KeyTerm(BaseModel): 
    term: str
    definition: str
    related_terms: Optional[List[str]] = Field(default_factory=list)

class CaseStudyPrompt(BaseModel):
    question: str
    sample_answer: str
    resources: List[Dict[str, str]] = Field(default_factory=list)  # {title: str, url: str}
    difficulty: Optional[str] = "Medium"  # Easy, Medium, Hard
    time_estimate: Optional[str] = "30 minutes"
    category: Optional[str] = "Problem Solving"  # e.g., System Design, Algorithms, Data Structures

class TechnicalCasePrepSectionModel(BaseModel):
    key_concepts: List[str] = Field(
        default_factory=list,
        description="Core technical concepts relevant to the role"
    )
    prompts: List[CaseStudyPrompt] = Field(
        default_factory=list,
        description="Technical case study prompts with sample answers and resources"
    )
    sample_case_walkthrough: Optional[str] = Field(
        None,
        description="Step-by-step walkthrough of solving a sample technical case"
    )
    key_terms_glossary: List[KeyTerm] = Field(
        default_factory=list,
        description="Technical terms and their definitions relevant to the role"
    )
    preparation_tips: List[str] = Field(
        default_factory=list,
        description="General tips for technical interview preparation"
    )

# SECTION 7: Mock Interview & Feedback
# class MockInterviewFeedback(BaseModel):
#     question: Optional[str] = ""
#     answer: Optional[str] = "" 
#     rubric: Optional[dict] = Field(default_factory=dict) 
#     score: Optional[int] = 0 
#     feedback: Optional[str] = "" 
#
# class MockInterviewSectionModel(BaseModel):
#     questions: Optional[List[str]] = Field(default_factory=list)
#     feedback: Optional[List[MockInterviewFeedback]] = Field(default_factory=list)

# SECTION 8: Insider Cheat Sheet
class CandidateQuestionsModel(BaseModel): 
    role_kpi_org: Optional[List[str]] = Field(default_factory=list) 
    strategy_market: Optional[List[str]] = Field(default_factory=list) 
    culture_growth: Optional[List[str]] = Field(default_factory=list) 

class RecentExecQuote(BaseModel):
    quote: Optional[str] = None
    speaker: Optional[str] = None
    context_url: Optional[str] = None

class InsiderCheatSheetSectionModel(BaseModel):
    culture_cues: Optional[List[str]] = Field(default_factory=list)
    recent_exec_quotes: Optional[List[RecentExecQuote]] = Field(default_factory=list)
    financial_snapshot: Optional[str] = None
    glassdoor_pain_points: Optional[List[str]] = Field(default_factory=list)
    tailored_questions: Optional[List[str]] = Field(default_factory=list) 

# SECTION 9: Questions to Ask Interviewer
class QuestionsToAskSectionModel(BaseModel):
    for_hiring_manager: Optional[List[str]] = Field(default_factory=list)
    for_peers_team: Optional[List[str]] = Field(default_factory=list)
    for_leadership: Optional[List[str]] = Field(default_factory=list)
    general_questions: Optional[List[str]] = Field(default_factory=list)

# SECTION 10: Offer & Negotiation Tips
# class SalaryRangeModel(BaseModel):
#     low: Optional[Union[str, float]] = None
#     median: Optional[Union[str, float]] = None
#     high: Optional[Union[str, float]] = None
#
# class BenefitConsiderationModel(BaseModel):
#     category: Optional[str] = None
#     items: Optional[List[str]] = Field(default_factory=list)
#
# class ResponseTemplateModel(BaseModel):
#     scenario: Optional[str] = None
#     template: Optional[str] = None
#
# class OfferNegotiationSectionModel(BaseModel):
#     salary_range: Optional[SalaryRangeModel] = None
#     negotiation_tips: Optional[List[str]] = Field(default_factory=list) 
#     benefits_to_consider: Optional[List[BenefitConsiderationModel]] = Field(default_factory=list)
#     response_templates: Optional[List[ResponseTemplateModel]] = Field(default_factory=list)
#     premium_required: Optional[bool] = False
#     comp_range_benchmarks: Optional[str] = None 
#     alternative_levers: Optional[List[str]] = Field(default_factory=list)
#     thirty_sixty_ninety_plan: Optional[str] = Field(default=None, description="A 30-60-90 day plan tailored to the role.")

# Export & Share (not numbered)
class ExportShareSectionModel(BaseModel):
    export_options: Optional[List[str]] = Field(default_factory=lambda: ["PDF", "Markdown"])
    share_platforms: Optional[List[str]] = Field(default_factory=lambda: ["Email", "LinkedIn"])
    shareable_link: Optional[str] = None

# Base models for nested structures in ResumeStructured
class PositionModel(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[Union[date, str]] = None 
    end_date: Optional[Union[date, str]] = None   
    description: Optional[str] = None

class EducationModel(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    year: Optional[Union[int, str]] = None 

# Model for Resume Structured Data 
class ResumeStructured(BaseModel):
    positions: Optional[List[PositionModel]] = Field(default_factory=list)
    skills: Optional[List[str]] = Field(default_factory=list)
    achievements: Optional[List[str]] = Field(default_factory=list)
    education: Optional[List[EducationModel]] = Field(default_factory=list)
    certifications: Optional[List[str]] = Field(default_factory=list)
    languages: Optional[List[str]] = Field(default_factory=list)
    publications: Optional[List[str]] = Field(default_factory=list)
    contact_info: Optional[Dict[str, Any]] = None 
    summary: Optional[str] = None 

# Model for Job Description Structured Data 
class JobDescriptionStructured(BaseModel):
    role_title: Optional[str] = None
    requirements: Optional[List[str]] = Field(default_factory=list)
    responsibilities: Optional[List[str]] = Field(default_factory=list)
    company_overview: Optional[str] = None 
    team_details: Optional[str] = None 

# --- FULL GUIDE SCHEMA ---
class InterviewPrepV2Guide(BaseModel):
    section_0_welcome: Optional[WelcomeSectionModel] = None
    section_1_company_industry: Optional[CompanyIndustrySectionModel] = None
    section_2_calendar_invites: Optional[CalendarInvitesSectionModel] = None
    section_3_role_success: Optional[RoleSuccessFactorsSection] = None
    section_4_role_understanding_fit_assessment: Optional[RoleUnderstandingFitAssessmentSectionModel] = None
    section_5_star_story_bank: Optional[StarStoryBankSectionModel] = None
    section_6_technical_case_prep: Optional[TechnicalCasePrepSectionModel] = None
    # section_7_mock_interview: Optional[MockInterviewSectionModel] = None
    section_8_insider_cheat_sheet: Optional[InsiderCheatSheetSectionModel] = None
    section_9_questions_to_ask: Optional[QuestionsToAskSectionModel] = None
    # section_10_offer_negotiation: Optional[OfferNegotiationSectionModel] = None
    export_share: Optional[ExportShareSectionModel] = None
    resume_structured: Optional[ResumeStructured] = None
    job_description_structured: Optional[JobDescriptionStructured] = None

    class Config:
        validate_assignment = True
