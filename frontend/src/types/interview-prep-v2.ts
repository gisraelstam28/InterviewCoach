// SECTION 0: Welcome & Navigation
export interface WelcomeSectionModel {
  introduction?: string | null;
  tell_me_about_yourself?: string | null;
  quick_view_enabled?: boolean | null;
  deep_dive_enabled?: boolean | null;
  progress?: number | null;
}

// SECTION 1: Company & Industry Snapshot
export interface NewsItem {
  title?: string | null;
  url?: string | null;
  date?: string | null;
  source?: string | null;
  summary?: string | null;
  so_what?: string | null;
}

export interface CompanyIndustrySectionModel {
  company_overview?: string | null;
  recent_news?: NewsItem[] | null;
  industry_drivers?: string[] | null;
}

// SECTION 2: Calendar Invites & Logistics
export interface CalendarInvitesSectionModel {
  logistics_summary?: string | null;
  calendar_links?: Record<string, string>[] | null;
}

// SECTION 3: Role Success Factors
export interface EvaluatedRequirementItemModel {
  text: string;
  met: boolean;
  explanation?: string | null;
  resume_evidence?: string | null;
}

export interface RoleSuccessFactorsSection {
  must_haves?: EvaluatedRequirementItemModel[] | null;
  nice_to_haves?: EvaluatedRequirementItemModel[] | null;
  job_duties?: string[] | null;
  qualifications?: string[] | null;
  overall_readiness?: string | null;
  focus_recommendations?: string[] | null;
}

// SECTION 4: Role Understanding & Fit Assessment
export interface RoleUnderstandingFitAssessmentSectionModel {
  role_summary: string;
  key_responsibilities_summary: string[];
  overall_fit_rating: string;
  fit_assessment_details: string;
}

// SECTION 5: STAR Story Bank
export interface StarStory {
  competency?: string | null;
  behavioral_question?: string | null;
  situation?: string | null;
  task?: string | null;
  action?: string | null;
  result?: string | null;
  interviewer_advice?: string | null;
  tags?: string[] | null;
}

export interface StarStoryBankSectionModel {
  stories?: StarStory[] | null;
}

// SECTION 6: Technical / Case Prep
export interface KeyTerm {
  term: string;
  definition: string;
  related_terms?: string[] | null;
}

export interface CaseStudyPrompt {
  question: string;
  sample_answer: string;
  resources: Record<string, string>[]; // Pydantic: List[Dict[str, str]] = Field(default_factory=list)
  difficulty?: string | null;
  time_estimate?: string | null;
  category?: string | null;
}

export interface TechnicalCasePrepSectionModel {
  key_concepts: string[]; // Pydantic: List[str] = Field(default_factory=list)
  prompts: CaseStudyPrompt[]; // Pydantic: List[CaseStudyPrompt] = Field(default_factory=list)
  key_terms: KeyTerm[]; // Pydantic: List[KeyTerm] = Field(default_factory=list)
  preparation_tips: string[]; // Pydantic: List[str] = Field(default_factory=list)
}

// SECTION 7: Mock Interview & Feedback
export interface MockInterviewFeedback {
  question?: string | null;
  answer?: string | null;
  rubric?: Record<string, unknown> | null;
  score?: number | null;
  feedback?: string | null;
}

export interface MockInterviewSectionModel {
  questions?: string[] | null;
  feedback?: MockInterviewFeedback[] | null;
}

// SECTION 8: Insider Cheat Sheet
export interface CandidateQuestionsModel {
  role_kpi_org?: string[] | null;
  strategy_market?: string[] | null;
  culture_growth?: string[] | null;
}

export interface RecentExecQuote {
  quote?: string | null;
  speaker?: string | null;
  context_url?: string | null;
}

export interface InsiderCheatSheetSectionModel {
  talking_points_from_news?: string[] | null;
  potential_challenges?: string[] | null;
  key_stakeholders?: string[] | null;
  recent_exec_quotes?: RecentExecQuote[] | null;
  questions_to_ask?: CandidateQuestionsModel | null; // Aligned with Pydantic's 'questions_to_ask: Optional[CandidateQuestionsModel]'
}

// SECTION 9: Questions to Ask Interviewer
export interface QuestionToAskItem {
  question_text: string;
  category: string;
  timing?: string | null;
  why_ask: string;
}

export interface QuestionsToAskSectionModel {
  questions?: QuestionToAskItem[] | null;
  guidance_on_asking?: string | null; // Pydantic: guidance_on_asking: Optional[str] = None
}

// SECTION 10: Offer & Negotiation Tips
export interface SalaryRangeModel {
  low?: string | number | null;
  median?: string | number | null;
  high?: string | number | null;
}

export interface BenefitConsiderationModel {
  category?: string | null;
  items?: string[] | null;
}

export interface ResponseTemplateModel {
  scenario?: string | null;
  template?: string | null;
}

export interface OfferNegotiationSectionModel {
  salary_range?: SalaryRangeModel | null;
  negotiation_tips?: string[] | null;
  benefits_to_consider?: BenefitConsiderationModel[] | null;
  response_templates?: ResponseTemplateModel[] | null;
  premium_required?: boolean | null;
  comp_range_benchmarks?: string | null;
  alternative_levers?: string[] | null;
  thirty_sixty_ninety_plan?: string | null;
}

// Export & Share
export interface ExportShareSectionModel {
  export_options?: string[] | null;
  share_platforms?: string[] | null;
  shareable_link?: string | null;
}

// Base models for nested structures in ResumeStructured
export interface Position { // Corresponds to Pydantic's PositionModel
  title?: string | null;
  company?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
}

export interface EducationModel { // Corresponds to Pydantic's EducationModel
  degree?: string | null;
  institution?: string | null;
  year?: string | number | null;
}

export interface ResumeStructured { // Corresponds to Pydantic's ResumeStructured
  positions?: Position[] | null;
  skills?: string[] | null;
  achievements?: string[] | null;
  education?: EducationModel[] | null;
  certifications?: string[] | null;
  languages?: string[] | null;
  publications?: string[] | null;
  contact_info?: Record<string, unknown> | null;
  summary?: string | null;
}

export interface JobDescriptionStructured { // Corresponds to Pydantic's JobDescriptionStructured
  role_title?: string | null;
  requirements?: string[] | null;
  responsibilities?: string[] | null;
  company_overview?: string | null;
  team_details?: string | null;
}

// --- FULL GUIDE SCHEMA ---
export interface InterviewPrepV2Guide {
  section_0_welcome?: WelcomeSectionModel | null;
  section_1_company_industry?: CompanyIndustrySectionModel | null;
  section_2_calendar_invites?: CalendarInvitesSectionModel | null;
  section_3_role_success?: RoleSuccessFactorsSection | null;
  section_4_role_understanding_fit_assessment?: RoleUnderstandingFitAssessmentSectionModel | null;
  section_5_star_story_bank?: StarStoryBankSectionModel | null;
  section_6_technical_case_prep?: TechnicalCasePrepSectionModel | null;
  section_7_mock_interview?: MockInterviewSectionModel | null;
  section_8_insider_cheat_sheet?: InsiderCheatSheetSectionModel | null;
  section_9_questions_to_ask?: QuestionsToAskSectionModel | null;
  section_10_offer_negotiation?: OfferNegotiationSectionModel | null;
  export_share?: ExportShareSectionModel | null;
  resume_structured?: ResumeStructured | null;
  job_description_structured?: JobDescriptionStructured | null;
}

// Request/Response types for mutations (Kept from original, now use updated ResumeStructured)
export interface ParseResumePayload {
  resumeText: string;
}

export interface GenerateQuestionsPayload {
  structured_resume: ResumeStructured;
  job_description: string;
  company_name?: string;
}

export interface GenerateQuestionsResponse {
  questions: string[]; // This might need update later if questions are more complex
}

export interface GenerateGuidePayload {
  structured_resume: ResumeStructured;
  job_description: string;
  generated_questions: GenerateQuestionsResponse;
  company_name?: string;
}