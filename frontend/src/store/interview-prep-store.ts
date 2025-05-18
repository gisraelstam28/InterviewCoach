import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ViewMode = "quick" | "deep"

interface InterviewPrepState {
  // User data
  resume: string
  jobDescription: string

  // Progress tracking
  currentStep: number
  progress: number
  completedSteps: number[]

  // UI state
  viewMode: ViewMode

  // Actions
  setResume: (resume: string) => void
  setJobDescription: (jd: string) => void
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  setViewMode: (mode: ViewMode) => void
  resetStore: () => void
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
  currentStep: 0,
  progress: 0,
  completedSteps: [],
  viewMode: "quick" as ViewMode,
}

export const useInterviewPrepStore = create<InterviewPrepState>()(
  persist(
    (set) => ({
      ...initialState,

      setResume: (resume) => set({ resume }),

      setJobDescription: (jobDescription) => set({ jobDescription }),

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
    }),
    {
      name: "interview-prep-storage",
      // Optional: Add encryption or obfuscation here for sensitive data
      partialize: (state) => ({
        resume: state.resume,
        jobDescription: state.jobDescription,
        completedSteps: state.completedSteps,
        viewMode: state.viewMode,
      }),
    },
  ),
)
