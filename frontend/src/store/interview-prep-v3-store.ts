"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InterviewPrepV2Guide } from "../types/interview-prep-v2"; // Assuming types are in this path
 // Define ViewMode locally, matching StepContent child components

// Helper function to calculate progress (same as in V2 store)
const calculateProgress = (completedSteps: number[]): number => {
  const totalSteps = 12; // Adjust if total steps change
  return (completedSteps.length / totalSteps) * 100;
};

export interface InterviewPrepV3State {
  // User data
  resumeFile: File | null; // This will NOT be persisted
  resumeFileIsSelected: boolean; // This WILL be persisted
  jobDescription: string;
  companyName: string;

  // Progress tracking
  currentStep: number;
  progress: number;
  completedSteps: number[];

  // UI state
  shouldGenerateGuide: boolean;
  isGeneratingInterviewPrepGuide: boolean;

  // Guide object
  interviewGuide: InterviewPrepV2Guide | null;
  jobDetailsFinalized: boolean;

  // Actions
  setResumeFile: (file: File | null) => void;
  setJobDescription: (jd: string) => void;
  setCompanyName: (name: string) => void;
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  setShouldGenerateGuide: (shouldGenerate: boolean) => void;
  setIsGeneratingInterviewPrepGuide: (isGenerating: boolean) => void;
  setInterviewGuide: (guide: InterviewPrepV2Guide | null) => void;
  setJobDetailsFinalized: (finalized: boolean) => void;
  resetStore: () => void;
}

const initialState = {
  resumeFile: null,
  resumeFileIsSelected: false,
  jobDescription: "",
  companyName: "",
  currentStep: 0,
  progress: 0,
  completedSteps: [],
  shouldGenerateGuide: false,
  isGeneratingInterviewPrepGuide: false,
  interviewGuide: null,
  jobDetailsFinalized: false,
};

export const useInterviewPrepV3Store = create<InterviewPrepV3State>()(
  persist(
    (set) => ({
      ...initialState,

      setResumeFile: (file: File | null) => set({ resumeFile: file, resumeFileIsSelected: !!file }),
      setJobDescription: (jobDescription) => set({ jobDescription }),
      setCompanyName: (companyName) => set({ companyName }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      markStepComplete: (step) =>
        set((state) => {
          const completedSteps = state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step];
          return {
            completedSteps,
            progress: calculateProgress(completedSteps),
          };
        }),

      setShouldGenerateGuide: (shouldGenerateGuide) => set({ shouldGenerateGuide }),
      setIsGeneratingInterviewPrepGuide: (isGeneratingInterviewPrepGuide) => set({ isGeneratingInterviewPrepGuide }),
      setInterviewGuide: (guide) => set({ interviewGuide: guide }),
      setJobDetailsFinalized: (finalized) => set({ jobDetailsFinalized: finalized }),
      resetStore: () => set({ ...initialState, resumeFile: null, resumeFileIsSelected: false }), // ensure resumeFile (non-persisted) is also cleared
    }),
    {
      name: "interview-prep-v3-storage", // Unique name for localStorage
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['resumeFile', 'currentStep'].includes(key))
        ) as Omit<InterviewPrepV3State, 'resumeFile' | 'currentStep'> & { resumeFile: undefined, currentStep: undefined }, // Persist everything except resumeFile and currentStep
    }
  )
);
