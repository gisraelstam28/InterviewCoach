import { create, StateCreator } from 'zustand';
import { ResumeStructured, Position, InterviewPrepV2Guide } from '../types/interview-prep-v2';

// Define the full store type first for StateCreator
// This type will be the combination of all slice types.
export type FullStoreState = UserInputSlice & ProcessedDataSlice & GuideSlice & UiSlice;

// --- User Input Slice --- //
export interface UserInputState {
  resumeFile: File | null;
  jobDescription: string;
  companyName: string;
  jobDetailsFinalized: boolean;
}

export interface UserInputActions {
  setResumeFile: (file: File | null) => void;
  setJobDescription: (text: string) => void;
  setCompanyName: (name: string) => void;
  setJobDetailsFinalized: (finalized: boolean) => void;
  resetUserInput: () => void;
}

export type UserInputSlice = UserInputState & UserInputActions;

const initialUserInputState: UserInputState = {
  resumeFile: null,
  jobDescription: '',
  companyName: '',
  jobDetailsFinalized: false,
};

export const createUserInputSlice: StateCreator<FullStoreState, [], [], UserInputSlice> = (set) => ({
  ...initialUserInputState,
  setResumeFile: (file) => set({ resumeFile: file }),
  setJobDescription: (text) => set({ jobDescription: text }),
  setCompanyName: (name) => set({ companyName: name }),
  setJobDetailsFinalized: (finalized) => set({ jobDetailsFinalized: finalized }),
  resetUserInput: () => set(initialUserInputState),
});

// --- Processed Data Slice --- //
export interface ProcessedDataState {
  parsedResumeText: string;
  structuredResume: ResumeStructured | null;
  generatedQuestions: any; // TODO: Define a specific type for questions
}

export interface ProcessedDataActions {
  setParsedResumeText: (text: string) => void;
  setStructuredResume: (resume: ResumeStructured | null) => void;
  setGeneratedQuestions: (questions: any) => void; // TODO: Define type
  resetProcessedData: () => void;
}

export type ProcessedDataSlice = ProcessedDataState & ProcessedDataActions;

const initialProcessedDataState: ProcessedDataState = {
  parsedResumeText: '',
  structuredResume: null,
  generatedQuestions: null,
};

export const createProcessedDataSlice: StateCreator<FullStoreState, [], [], ProcessedDataSlice> = (set) => ({
  ...initialProcessedDataState,
  setParsedResumeText: (text) => set({ parsedResumeText: text }),
  setStructuredResume: (resume) => set({ structuredResume: resume }),
  setGeneratedQuestions: (questions) => set({ generatedQuestions: questions }),
  resetProcessedData: () => set(initialProcessedDataState),
});

// --- Guide Slice --- //
export interface GuideState {
  interviewGuide: InterviewPrepV2Guide | null;
}

export interface GuideActions {
  setInterviewGuide: (guide: InterviewPrepV2Guide | null) => void;
  resetGuide: () => void;
}

export type GuideSlice = GuideState & GuideActions;

const initialGuideState: GuideState = {
  interviewGuide: null,
};

export const createGuideSlice: StateCreator<FullStoreState, [], [], GuideSlice> = (set) => ({
  ...initialGuideState,
  setInterviewGuide: (guide) => set({ interviewGuide: guide }),
  resetGuide: () => set(initialGuideState),
});

// --- UI State Slice --- //
export interface UiState {
  currentStep: number; // 1: Resume, 2: Job Details, 3: Guide Display/Loading
  isParsingResume: boolean;
  isGeneratingQuestions: boolean;
  isGeneratingGuide: boolean;
  error: string | null;
}

export interface UiActions {
  setCurrentStep: (step: number) => void;
  setIsParsingResume: (isLoading: boolean) => void;
  setIsGeneratingQuestions: (isLoading: boolean) => void;
  setIsGeneratingGuide: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetUiState: () => void; // Resets step, loading flags, and error
}

export type UiSlice = UiState & UiActions;

const initialUiState: UiState = {
  currentStep: 1, // Start at the first step
  isParsingResume: false,
  isGeneratingQuestions: false,
  isGeneratingGuide: false,
  error: null,
};

export const createUiSlice: StateCreator<FullStoreState, [], [], UiSlice> = (set) => ({
  ...initialUiState,
  setCurrentStep: (step) => set({ currentStep: step }),
  setIsParsingResume: (isLoading) => set({ isParsingResume: isLoading }),
  setIsGeneratingQuestions: (isLoading) => set({ isGeneratingQuestions: isLoading }),
  setIsGeneratingGuide: (isLoading) => set({ isGeneratingGuide: isLoading }),
  setError: (error) => set({ error: error }),
  resetUiState: () => set(initialUiState),
});

// --- Main Store --- //
export type InterviewPrepV2WizardStoreState = FullStoreState;

export const useInterviewPrepV2WizardStore = create<InterviewPrepV2WizardStoreState>()((...a) => ({
  ...createUserInputSlice(...a),
  ...createProcessedDataSlice(...a),
  ...createGuideSlice(...a),
  ...createUiSlice(...a),
}));

export default useInterviewPrepV2WizardStore;
