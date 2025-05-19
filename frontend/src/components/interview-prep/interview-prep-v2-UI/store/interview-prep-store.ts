"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ViewMode = "quick" | "deep"

import type { InterviewPrepV2Guide } from "../../../../types/interview-prep-v2";

export interface InterviewPrepState {
  // User data
  resumeFile: File | null
  jobDescription: string
  companyName: string
  industry: string

  // Progress tracking
  currentStep: number
  progress: number
  completedSteps: number[]

  // UI state
  viewMode: ViewMode

  // Guide object
  interviewGuide: InterviewPrepV2Guide | null

  // Actions
  setResumeFile: (file: File | null) => void
  setJobDescription: (jd: string) => void
  setCompanyName: (name: string) => void
  setIndustry: (industry: string) => void
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  setViewMode: (mode: ViewMode) => void
  setInterviewGuide: (guide: InterviewPrepV2Guide | null) => void
  resetStore: () => void
}

// Helper to calculate progress percentage
const calculateProgress = (completedSteps: number[]) => {
  // 11 total steps (0-10)
  return Math.round((completedSteps.length / 11) * 100)
}

// Initial state
const initialState = {
  resumeFile: null,
  jobDescription: "",
  companyName: "",
  industry: "",
  currentStep: 0,
  progress: 0,
  completedSteps: [],
  viewMode: "quick" as ViewMode,
  interviewGuide: null,
}

export const useInterviewPrepStore = create<InterviewPrepState>()(
  persist(
    (set) => ({
      ...initialState,

      setResumeFile: (file: File | null) => set({ resumeFile: file }),

      setJobDescription: (jobDescription) => set({ jobDescription }),

      setCompanyName: (companyName) => set({ companyName }),

      setIndustry: (industry) => set({ industry }),

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

      setInterviewGuide: (guide) => set({ interviewGuide: guide }),

      resetStore: () => set(initialState),
    }),
    {
      name: "interview-prep-storage",
      // Optional: Add encryption or obfuscation here for sensitive data
      partialize: (state) => ({
        // File objects cannot be persisted; store only a flag
        hasResume: !!state.resumeFile,
        jobDescription: state.jobDescription,
        companyName: state.companyName,
        industry: state.industry,
        completedSteps: state.completedSteps,
        viewMode: state.viewMode,
      }),
    },
  ),
)
