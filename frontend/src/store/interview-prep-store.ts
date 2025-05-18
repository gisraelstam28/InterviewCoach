import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ViewMode = "quick" | "deep"

export interface InterviewPrepState {
  // User data
  resume: string
  jobDescription: string
  companyName: string;
  industry: string;

  // Progress tracking
  currentStep: number
  progress: number
  completedSteps: number[]

  // UI state
  viewMode: ViewMode
  isGeneratingInterviewPrepGuide: boolean
  shouldGenerateGuide: boolean

  // Actions
  setResume: (resume: string) => void
  setJobDescription: (jd: string) => void
  setCompanyName: (name: string) => void;
  setIndustry: (industry: string) => void;
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  setViewMode: (mode: ViewMode) => void
  resetStore: () => void
  setIsGeneratingInterviewPrepGuide: (isGenerating: boolean) => void
  setShouldGenerateGuide: (shouldGenerate: boolean) => void
}

// Helper to calculate progress percentage
const calculateProgress = (completedSteps: number[]) => {
  // 11 total steps (0-10)
  return Math.round((completedSteps.length / 11) * 100)
}

// Initial state
const initialState = {
  resume: "",
  jobDescription: "",
  companyName: "",
  industry: "",
  currentStep: 0,
  progress: 0,
  completedSteps: [],
  viewMode: "quick" as ViewMode,
  isGeneratingInterviewPrepGuide: false,
  shouldGenerateGuide: false,
}

export const useInterviewPrepStore = create<InterviewPrepState>()(
  persist(
    (set) => ({ 
      ...initialState,

      setResume: (resume: string) => {
        console.log('[InterviewPrepStore] setResume called with:', resume);
        set((state) => {
          console.log('[InterviewPrepStore] Old resume state:', state.resume);
          const newState = { ...state, resume };
          console.log('[InterviewPrepStore] New resume state:', newState.resume);
          return newState;
        });
      },

      setJobDescription: (jobDescription: string) => {
        console.log('[InterviewPrepStore] setJobDescription called with:', jobDescription);
        set((state) => {
          console.log('[InterviewPrepStore] Old jobDescription state:', state.jobDescription);
          const newState = { ...state, jobDescription };
          console.log('[InterviewPrepStore] New jobDescription state:', newState.jobDescription);
          return newState;
        });
      },

      setCompanyName: (companyName: string) => {
        console.log('[InterviewPrepStore] setCompanyName CALLED with:', companyName);
        set((state) => {
          console.log('[InterviewPrepStore] Current companyName state:', state.companyName);
          const newState = { ...state, companyName };
          console.log('[InterviewPrepStore] New companyName state after set:', newState.companyName);
          return newState;
        });
      },

      setIndustry: (industry: string) => {
        console.log('[InterviewPrepStore] setIndustry CALLED with:', industry);
        set((state) => {
          console.log('[InterviewPrepStore] Current industry state:', state.industry);
          const newState = { ...state, industry };
          console.log('[InterviewPrepStore] New industry state after set:', newState.industry);
          return newState;
        });
      },

      setCurrentStep: (currentStep) => set({ currentStep }),

      markStepComplete: (step) =>
        set((state) => {
          const completedSteps = state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step]

          return {
            completedSteps,
            progress: calculateProgress(completedSteps),
          }
        }),

      setViewMode: (viewMode) => set({ viewMode }),

      resetStore: () => set(initialState),

      setIsGeneratingInterviewPrepGuide: (isGenerating) => set({ isGeneratingInterviewPrepGuide: isGenerating }),

      setShouldGenerateGuide: (shouldGenerate) => set({ shouldGenerateGuide: shouldGenerate }),
    }),
    {
      name: "interview-prep-storage",
      partialize: (state: InterviewPrepState): Partial<InterviewPrepState> => ({
        resume: state.resume,
        jobDescription: state.jobDescription,
        companyName: state.companyName,
        industry: state.industry,
        currentStep: state.currentStep,
      }),
    }
  )
);
