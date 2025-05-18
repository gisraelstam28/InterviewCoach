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
  recent_news?: NewsItem[];
  industry_drivers?: string[];
}

export interface WelcomeSectionModel {
  introduction?: string | null;
  tell_me_about_yourself?: string | null;
  quick_view_enabled?: boolean;
  deep_dive_enabled?: boolean;
  progress?: number;
}

export interface RoleSuccessFactorsSection {
  must_haves?: string[];
  nice_to_haves?: string[];
}

export interface FitMatrixRow {
  jd_requirement?: string | null;
  evidence_snippet?: string | null;
  relevance_score?: number;
  spin_or_gap_fix?: string | null;
  color_code?: string | null;
}

export interface CandidateFitMatrixSectionModel {
  rows?: FitMatrixRow[];
}

export interface StarStory {
  situation?: string | null;
  task?: string | null;
  action?: string | null;
  result?: string | null;
}

export interface StarStoryBankSectionModel {
  stories?: StarStory[];
}

export interface KeyTerm {
  term?: string | null;
  definition?: string | null;
}

export interface TechnicalCasePrepSectionModel {
  key_concepts?: string[];
  practice_prompts?: string[];
  sample_case_walkthrough?: string | null;
  key_terms_glossary?: KeyTerm[];
}

export interface MockInterviewFeedback {
  question?: string;
  answer?: string;
  rubric?: Record<string, any>; // Pydantic's dict translates to Record<string, any> or a more specific type
  score?: number;
  feedback?: string;
}

export interface MockInterviewSectionModel {
  questions?: string[];
  feedback?: MockInterviewFeedback[];
}

export interface CandidateQuestionsModel {
  role_kpi_org?: string[];
  strategy_market?: string[];
  culture_growth?: string[];
}

export interface RecentExecQuote {
  quote?: string | null;
  speaker?: string | null;
  context_url?: string | null;
}

export interface InsiderCheatSheetSectionModel {
  culture_cues?: string[];
  recent_exec_quotes?: RecentExecQuote[];
  candidate_questions?: CandidateQuestionsModel | null;
}

export interface OfferNegotiationSectionModel {
  negotiation_points?: string[];
  negotiation_strategy?: string | null;
}

export interface ExportShareSectionModel {
  export_options?: string[];
  share_platforms?: string[];
  shareable_link?: string | null;
}

export interface InterviewPrepV2Guide {
  section_0_welcome?: WelcomeSectionModel | null;
  section_1_company_industry?: CompanyIndustrySectionModel | null;
  section_3_role_success?: RoleSuccessFactorsSection | null;
  section_4_fit_matrix?: CandidateFitMatrixSectionModel | null;
  section_5_star_story_bank?: StarStoryBankSectionModel | null;
  section_6_technical_case_prep?: TechnicalCasePrepSectionModel | null;
  section_7_mock_interview?: MockInterviewSectionModel | null;
  section_8_insider_cheat_sheet?: InsiderCheatSheetSectionModel | null;
  section_10_offer_negotiation?: OfferNegotiationSectionModel | null;
  export_share?: ExportShareSectionModel | null;
}

// Request payload for /api/interview-v2/generate
export interface GenerateInterviewPrepRequest {
  resume_structured: Record<string, any>; // Placeholder, adapt as needed
  jd_structured: Record<string, any>; // Placeholder, adapt as needed
  company_name?: string | null;
  industry?: string | null;
  job_description?: string | null;
  raw_resume_text: string;
}
