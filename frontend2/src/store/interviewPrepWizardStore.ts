import { create, StateCreator } from 'zustand';
import {
  InterviewPrepWizardStoreState,
  UserInputSlice,
  ProcessedDataSlice,
  GuideSlice,
  UiStateSlice,
  InterviewWizardStep,
  ResumeFile,
  StructuredResume, // Used within ParseResumeResponseData
  InterviewPrepV2Guide, // Renamed from InterviewGuide
  // InterviewQuestion is no longer directly used in store slices
  ParseResumeResponseData, // For ProcessedDataSlice
  ParseJobDescriptionResponseData, // For ProcessedDataSlice
} from '../types/interviewPrepWizard';

// --- Slice Creators ---

/**
 * Creates the User Input slice of the store.
 * Manages resume file, job description, company name, and job details finalization.
 */
const createUserInputSlice: StateCreator<
  InterviewPrepWizardStoreState,
  [],
  [],
  UserInputSlice
> = (set) => ({
  resumeText: null,
  jobDescription: '',
  companyName: '',
  jobDetailsFinalized: false,
  setResumeText: (text: string | null) => set({ resumeText: text }),
  setJobDescription: (jd: string) => set({ jobDescription: jd }),
  setCompanyName: (name: string) => set({ companyName: name }),
  setJobDetailsFinalized: (finalized: boolean) =>
    set({ jobDetailsFinalized: finalized }),
  resetUserInput: () =>
    set({
      resumeText: null,
      jobDescription: '',
      companyName: '',
      jobDetailsFinalized: false,
    }),
});

/**
 * Creates the Processed Data slice of the store.
 * Manages parsed resume and generated interview questions.
 */
const createProcessedDataSlice: StateCreator<
  InterviewPrepWizardStoreState,
  [],
  [],
  ProcessedDataSlice
> = (set) => ({
  rawResumeText: null,
  parsedResumeData: null,
  parsedJobDescriptionData: null,
  setRawResumeText: (text: string | null) => set({ rawResumeText: text }),
  setParsedResumeData: (data: ParseResumeResponseData | null) =>
    set({ parsedResumeData: data }),
  setParsedJobDescriptionData: (data: ParseJobDescriptionResponseData | null) =>
    set({ parsedJobDescriptionData: data }),
  resetProcessedData: () =>
    set({
      rawResumeText: null,
      parsedResumeData: null,
      parsedJobDescriptionData: null,
    }),
});

/**
 * Creates the Guide slice of the store.
 * Manages the final generated interview guide.
 */
const createGuideSlice: StateCreator<
  InterviewPrepWizardStoreState,
  [],
  [],
  GuideSlice
> = (set) => ({
  interviewGuide: null,
  setInterviewGuide: (guide: InterviewPrepV2Guide | null) => // Updated type
    set({ interviewGuide: guide }),
  resetGuide: () => set({ interviewGuide: null }),
});

/**
 * Creates the UI State slice of the store.
 * Manages current step, loading indicators, and error messages.
 */
const createUiStateSlice: StateCreator<
  InterviewPrepWizardStoreState,
  [],
  [],
  UiStateSlice
> = (set) => ({
  currentStep: InterviewWizardStep.ResumeUpload, // Initial step
  isParsingResume: false,
  isParsingJobDescription: false, // Renamed from isGeneratingQuestions
  isGeneratingGuide: false,     // For the final /generate call
  error: null,
  setCurrentStep: (step: InterviewWizardStep) => set({ currentStep: step }),
  setIsParsingResume: (loading: boolean) => set({ isParsingResume: loading }),
  setIsParsingJobDescription: (loading: boolean) => // Renamed from setIsGeneratingQuestions
    set({ isParsingJobDescription: loading }),
  setIsGeneratingGuide: (loading: boolean) =>
    set({ isGeneratingGuide: loading }),
  setError: (error: string | null) => set({ error: error }),
  resetUiState: () =>
    set({
      currentStep: InterviewWizardStep.ResumeUpload,
      isParsingResume: false,
      isParsingJobDescription: false, // Renamed
      isGeneratingGuide: false,
      error: null,
    }),
});

import { UseBoundStore, StoreApi } from 'zustand'; // Import necessary types

// --- Combined Store ---

/**
 * Zustand store for the Interview Prep V2 Wizard.
 * Combines all slices for a unified state management solution.
 */
export const useInterviewPrepWizardStore: UseBoundStore<StoreApi<InterviewPrepWizardStoreState>> = create<InterviewPrepWizardStoreState>()((...a) => ({
  ...createUserInputSlice(...a),
  ...createProcessedDataSlice(...a),
  ...createGuideSlice(...a),
  ...createUiStateSlice(...a),
}));


// Default export of the main store hook
export default useInterviewPrepWizardStore;

