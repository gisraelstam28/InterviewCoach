/**
 * Defines the different steps in the Interview Prep V2 Wizard.
 */
export enum InterviewWizardStep {
  ResumeUpload = 'ResumeUpload',
  JobDetails = 'JobDetails',
  LoadingGuide = 'LoadingGuide', // For parsing resume, jd, and generating the final guide
  GuideDisplay = 'GuideDisplay',
}

// --- User Input Types ---

/**
 * Represents the resume file uploaded by the user.
 */
export type ResumeFile = File | null;

/**
 * User-provided job details.
 */
export interface JobDetailsInput {
  jobDescription: string;
  companyName: string;
}

// --- API Request & Response Types ---

/**
 * Represents the structured data extracted from a resume.
 * This is a placeholder; align with your backend's Pydantic model for structured resume.
 */
export interface StructuredResume {
  // Example fields, replace with actual structure from backend
  fileName?: string;
  textContent?: string; // Raw text from resume
  contactInfo?: any;
  experience?: any[];
  education?: any[];
  skills?: string[];
  [key: string]: any; // Allow other fields
}

/**
 * Represents the structured data extracted from a job description.
 * This is a placeholder; align with your backend's Pydantic model for structured JD.
 */
export interface StructuredJobDescription {
  // Example fields, replace with actual structure from backend
  roleTitle?: string;
  requirements?: string[];
  responsibilities?: string[];
  [key: string]: any; // Allow other fields
}

// For POST /api/interview-v2/parse-resume
// Assuming the backend expects the raw text of the resume.
// If it expects FormData with a file, this needs adjustment, and the API call logic will differ.
export interface ParseResumeRequestData {
  resume_text: string; // Changed from raw_resume_text to match backend
}
// The backend /parse-resume endpoint directly returns the StructuredResume object.
export type ParseResumeResponseData = StructuredResume;

// For POST /api/interview-v2/parse-jd
export interface ParseJobDescriptionRequestData {
  job_description_text: string; // Raw job description
  company_name?: string; // Optional, for context
}
// The backend /parse-jd endpoint directly returns the StructuredJobDescription object.
export type ParseJobDescriptionResponseData = StructuredJobDescription;

// For POST /api/interview-v2/generate
export interface GenerateInterviewPrepRequest {
  resume_structured: StructuredResume; // Or 'any'
  jd_structured: StructuredJobDescription;     // Or 'any'
  company_name?: string;
  industry?: string;
  job_description?: string; // Raw job description text (original input to /parse-jd)
  raw_resume_text: string;   // Raw resume text (original input to /parse-resume)
}

// --- Section Models for InterviewPrepV2Guide ---
// These should mirror your backend Pydantic models for each section.

export interface WelcomeSectionModel {
  introduction?: string;
  tell_me_about_yourself?: string;
  quick_view_enabled?: boolean;
  deep_dive_enabled?: boolean;
  progress?: number;
  [key: string]: any; // Allow other fields from backend
}

export interface RecentNewsItem {
  title?: string;
  url?: string;
  date?: string;
  source?: string;
  summary?: string;
  [key: string]: any;
}

export interface CompanyIndustrySectionModel {
  company_overview?: string;
  recent_news?: RecentNewsItem[];
  industry_drivers?: string[];
  [key: string]: any;
}

export interface CalendarInvitesSectionModel {
  [key: string]: any; // Placeholder - Define based on backend Pydantic model
}

export interface RoleSuccessSectionModel {
  must_haves?: string[];
  nice_to_haves?: string[];
  job_duties?: string[];
  qualifications?: string[];
  overall_readiness?: string | null; // Or a more structured readiness score
  focus_recommendations?: string[];
  [key: string]: any;
}

export interface RoleUnderstandingFitAssessmentSectionModel {
  role_summary?: string;
  key_responsibilities_summary?: string[];
  overall_fit_rating?: string; // e.g., "High", "Medium", "Low" or a numeric score
  fit_assessment_details?: string; // Could be markdown
  [key: string]: any;
}

export interface StarStoryItem {
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  title?: string; // Optional title for the story
  keywords?: string[];
  [key: string]: any;
}

export interface StarStoryBankSectionModel {
  stories?: StarStoryItem[];
  [key: string]: any;
}

export interface TechnicalCasePrepPromptItem {
  question?: string;
  sample_answer?: string;
  resources?: string[]; // Assuming array of strings or resource links
  difficulty?: string;
  time_estimate?: string;
  category?: string;
  [key: string]: any;
}

export interface KeyTermItem {
  term?: string;
  definition?: string;
  related_terms?: string[];
  [key: string]: any;
}

export interface TechnicalCasePrepSectionModel {
  key_concepts?: string[];
  prompts?: TechnicalCasePrepPromptItem[];
  sample_case_walkthrough?: string; // Could be markdown
  key_terms_glossary?: KeyTermItem[];
  preparation_tips?: string[];
  [key: string]: any;
}

export interface MockInterviewQuestionItem {
  question?: string;
  suggested_answer_points?: string[];
  type?: string; // e.g., 'Behavioral', 'Technical'
  [key: string]: any;
}

export interface MockInterviewSectionModel {
  questions?: MockInterviewQuestionItem[];
  feedback?: string[]; // General feedback points or array of feedback objects
  [key: string]: any;
}

export interface RecentExecQuoteItem {
  quote?: string;
  speaker?: string;
  context_url?: string;
  [key: string]: any;
}

export interface InsiderCheatSheetSectionModel {
  culture_cues?: string[];
  recent_exec_quotes?: RecentExecQuoteItem[];
  financial_snapshot?: string;
  glassdoor_pain_points?: string[];
  tailored_questions?: string[];
  [key: string]: any;
}

export interface QuestionsToAskSectionModel {
  for_hiring_manager?: string[];
  for_peers_team?: string[];
  for_leadership?: string[];
  general_questions?: string[];
  [key: string]: any;
}

export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
  text_representation?: string; // e.g., "$100k - $120k"
}

export interface OfferNegotiationSectionModel {
  salary_range?: SalaryRange | string | null;
  negotiation_tips?: string[];
  benefits_to_consider?: string[];
  response_templates?: string[]; // Or array of objects with title/template
  premium_required?: boolean;
  comp_range_benchmarks?: string | null; // Could be markdown or link
  alternative_levers?: string[];
  thirty_sixty_ninety_plan?: string | null; // Could be markdown
  [key: string]: any;
}

export interface ExportShareSectionModel {
  export_options?: string[];
  share_platforms?: string[];
  shareable_link?: string;
  [key: string]: any;
}

/**
 * The main Interview Prep V2 Guide structure.
 * This mirrors the backend's InterviewPrepV2Guide Pydantic model.
 */
export interface InterviewPrepV2Guide {
  section_0_welcome?: WelcomeSectionModel;
  section_1_company_industry?: CompanyIndustrySectionModel;
  section_2_calendar_invites?: CalendarInvitesSectionModel;
  section_3_role_success?: RoleSuccessSectionModel;
  section_4_role_understanding_fit_assessment?: RoleUnderstandingFitAssessmentSectionModel;
  section_5_star_story_bank?: StarStoryBankSectionModel;
  section_6_technical_case_prep?: TechnicalCasePrepSectionModel;
  section_7_mock_interview?: MockInterviewSectionModel;
  section_8_insider_cheat_sheet?: InsiderCheatSheetSectionModel;
  section_9_questions_to_ask?: QuestionsToAskSectionModel;
  section_10_offer_negotiation?: OfferNegotiationSectionModel;
  export_share?: ExportShareSectionModel;
}

// --- Zustand Store State Types ---

export interface UserInputSlice {
  resumeText: string | null;
  jobDescription: string; // Raw JD text from user input
  companyName: string;
  jobDetailsFinalized: boolean;
  setResumeText: (text: string | null) => void;
  setJobDescription: (jd: string) => void;
  setCompanyName: (name: string) => void;
  setJobDetailsFinalized: (finalized: boolean) => void;
  resetUserInput: () => void;
}

export interface ProcessedDataSlice {
  rawResumeText: string | null;           // From parsing resume file
  parsedResumeData: ParseResumeResponseData | null; // From /api/interview-v2/parse-resume
  // rawJobDescriptionText is available from UserInputSlice.jobDescription
  parsedJobDescriptionData: ParseJobDescriptionResponseData | null; // From /api/interview-v2/parse-jd

  setRawResumeText: (text: string | null) => void;
  setParsedResumeData: (data: ParseResumeResponseData | null) => void;
  setParsedJobDescriptionData: (data: ParseJobDescriptionResponseData | null) => void;
  resetProcessedData: () => void;
}

export interface GuideSlice {
  interviewGuide: InterviewPrepV2Guide | null; // Updated type
  setInterviewGuide: (guide: InterviewPrepV2Guide | null) => void;
  resetGuide: () => void;
}

export interface UiStateSlice {
  currentStep: InterviewWizardStep;
  isParsingResume: boolean;
  isParsingJobDescription: boolean; // Added
  isGeneratingGuide: boolean;     // For the final /generate call
  error: string | null;
  setCurrentStep: (step: InterviewWizardStep) => void;
  setIsParsingResume: (loading: boolean) => void;
  setIsParsingJobDescription: (loading: boolean) => void; // Added
  setIsGeneratingGuide: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetUiState: () => void;
}

export type InterviewPrepWizardStoreState = UserInputSlice &
  ProcessedDataSlice &
  GuideSlice &
  UiStateSlice;

