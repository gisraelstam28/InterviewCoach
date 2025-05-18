// SECTION 0: Welcome & Navigation
export interface WelcomeSection {
  intro: string;
  quick_view_enabled: boolean;
  deep_dive_enabled: boolean;
  progress: number; // 0-1
}

// SECTION 1: Company & Industry Snapshot
export interface CompanyIndustrySection {
  company_overview: string;
  recent_news: {
    title: string;
    url: string;
    date: string;
    source: string | null;
    summary: string;
    so_what: string;
  }[];
  industry_drivers: string[];
}

// SECTION 2: Department Context
export interface DepartmentContextSectionType {
  overview?: string;
  team_structure?: string;
  key_stakeholders?: string[];
}

// SECTION 3: Role Success Factors
export interface EvaluatedRequirementItem {
  text: string;
  met: boolean;
  explanation?: string;
  resume_evidence?: string;
}

export interface RoleSuccessFactorsSection {
  must_haves: EvaluatedRequirementItem[];
  nice_to_haves: EvaluatedRequirementItem[];
  // Add other fields from Pydantic model if they are to be used in UI, e.g.:
  // job_duties?: string[];
  // qualifications?: string[];
  // overall_readiness?: string;
  // focus_recommendations?: string[];
}

// SECTION 4: Role Understanding & Fit Assessment (Replaces Candidate Fit Matrix)
export interface RoleUnderstandingFitAssessmentSectionData {
  role_summary?: string;
  key_responsibilities_summary?: string[];
  overall_fit_rating?: string;
  fit_assessment_details?: string;
}

// Old Candidate Fit Matrix types (can be removed if no longer used elsewhere)
// export type FitMatrixColor = 'green' | 'yellow' | 'red';
// export interface FitMatrixRow {
//   job_requirement: string;
//   your_evidence: string;
//   spin_or_gap_fix: string;
//   color_code: FitMatrixColor;
//   evidence: string[];
// }
// export interface CandidateFitMatrixSection {
//   rows: FitMatrixRow[];
// }

// SECTION 5: STAR Story Bank
export interface StarStory {
  competency?: string; // e.g., 'Problem Solving', 'Leadership'. Used as title.
  behavioral_question?: string; // Relevant behavioral interview question.
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  interviewer_advice?: string; // Advice on what interviewer is assessing.
  tags?: string[]; // Relevant keywords or tags.
}

export interface StarStoryBankSection {
  stories: StarStory[];
}

// SECTION 6: Technical / Case Prep
export interface PracticePrompt {
  question: string; // Renamed from 'prompt' to match data and usage
  sample_answer: string; // Renamed from 'gold_standard_answer'
  resources?: Array<{ title?: string; url: string }>; // Changed from string[] and renamed
  category?: string;
  difficulty?: string;
  time_estimate?: string;
}

export interface TechnicalCasePrepSection {
  key_concepts?: string[];
  prompts?: PracticePrompt[]; // Made optional since we might have practice_prompts instead
  practice_prompts?: PracticePrompt[]; // Alias for prompts
  sample_case_walkthrough?: string;
  key_terms_glossary?: Array<{ term: string; definition: string; related_terms?: string[] }>;
  preparation_tips?: string[];
}

export type TechnicalCasePrepSectionData = TechnicalCasePrepSection;

// SECTION 7: Mock Interview & Feedback
export interface MockInterviewFeedback {
  question: string;
  answer: string;
  rubric: Record<string, number>;
  score: number;
  feedback: string;
}

export interface MockInterviewSection {
  questions: string[];
  feedback: MockInterviewFeedback[];
  premium_required: boolean;
}

// SECTION 8: Insider Cheat Sheet
export interface InsiderCheatSheetSection {
  culture_cues?: string[];
  recent_exec_quotes?: Array<{
    quote: string;
    speaker?: string;
    context_url?: string;
  }>;
  financial_snapshot?: string;
  glassdoor_pain_points?: string[];
  tailored_questions?: string[];
  // For backward compatibility
  exec_quotes?: string[];
}

// SECTION 9: 30-60-90 Day Plan
export interface ThirtySixtyNinetySection {
  onboarding_checklist: string[];
  milestone_goals: string[];
  premium_required: boolean;
}

// SECTION 10: Offer & Negotiation Tips
export interface SalaryRange {
  low: string | number;
  median: string | number;
  high: string | number;
}

export interface BenefitConsideration {
  category: string;
  items: string[];
}

export interface ResponseTemplate {
  scenario: string;
  template: string;
}

export interface OfferNegotiationSection {
  salaryRange?: SalaryRange;
  negotiationTips?: string[];
  benefitsToConsider?: BenefitConsideration[];
  responseTemplates?: ResponseTemplate[];
  premium_required: boolean;
  comp_range_benchmarks?: string; 
  alternative_levers?: string[]; 
}

// Export & Share (not numbered)
export interface ExportShareSection {
  pdf_export_enabled: boolean;
  notion_export_enabled: boolean;
  send_to_coach_enabled: boolean;
}

// ------------------- Parsing Models -------------------
export interface Position {
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  details: string[];
}

export interface ResumeStructured {
  positions: Position[];
  skills: string[];
  achievements: string[];
  bullets: string[];
}

export interface JDStructured {
  role_title: string;
  requirements: string[];
  responsibilities: string[];
}

// ------------------- Full Guide Schema -------------------
export interface InterviewPrepV2Guide {
  section_0_welcome?: WelcomeSection;
  section_1_company_industry?: CompanyIndustrySection;
  section_2_department_context?: DepartmentContextSectionType;
  section_3_role_success?: RoleSuccessFactorsSection;
  section_4_role_understanding_fit_assessment?: RoleUnderstandingFitAssessmentSectionData;
  section_5_star_story_bank?: StarStoryBankSection;
  section_6_technical_case_prep?: TechnicalCasePrepSectionData;
  section_7_mock_interview?: MockInterviewSection;
  section_8_insider_cheat_sheet?: InsiderCheatSheetSection;
  section_9_thirty_sixty_ninety?: ThirtySixtyNinetySection;
  section_10_offer_negotiation?: OfferNegotiationSection;
  export_share: ExportShareSection;
}
