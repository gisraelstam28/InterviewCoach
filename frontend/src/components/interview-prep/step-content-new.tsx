/*
// THIS FILE IS NOT CURRENTLY IN USE (as of 2025-05-18).
// The active StepContent is located at: frontend/src/components/interview-prep/interview-prep-v2-UI/components/interview-prep/StepContent.tsx
// Please refer to that file for current logic and debugging.

"use client"

import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { useInterviewPrepStore } from "./store/interview-prep-store"
import ViewToggle from "@/components/interview-prep/ui/view-toggle"
import NavigationButtons from "@/components/interview-prep/ui/navigation-buttons"
import WelcomeSection from "@/components/interview-prep/sections/welcome-section"
import CompanyIndustrySection from "@/components/interview-prep/sections/company-industry-section"
import DepartmentContextSection from "@/components/interview-prep/sections/department-context-section"
import RoleSuccessFactorsSection from "@/components/interview-prep/sections/role-success-factors-section"
import CandidateFitMatrixSection from "@/components/interview-prep/sections/candidate-fit-matrix-section"
import StarStoryBankSection from "@/components/interview-prep/sections/star-story-bank-section"
import SimpleTechCaseDisplay from "@/components/interview-prep/sections/SimpleTechCaseDisplay";
import MockInterviewSection from "@/components/interview-prep/sections/mock-interview-section"
import InsiderCheatSheetSection from "@/components/interview-prep/sections/insider-cheatsheet-section"
import ThirtySixtyNinetySection from "@/components/interview-prep/sections/thirty-sixty-ninety-section";
import type { RoleSuccessFactorsSection as RoleSuccessFactorsSectionType } from "@/types/interview-prep-v2";
import type { RoleUnderstandingFitAssessmentSectionData } from "@/types/interview-prep-v2"; 
import type { OfferNegotiationSection as OfferNegotiationSectionType } from "@/types/interview-prep-v2";
import type { ThirtySixtyNinetySection as ThirtySixtyNinetySectionType } from "@/types/interview-prep-v2";
import OfferNegotiationSection from "@/components/interview-prep/sections/offer-negotiation-section"
import StepSkeleton from "./step-skeleton";
import ResumeUploadSection from "./v2/sections/resume-upload-section";
import JobDetailsSection from "./v2/sections/job-details-section"; // Changed from JobDescriptionSection
import { useInterviewPrepV2Guide } from "@/hooks/useInterviewPrepV2Guide";


export default function StepContent({ stepId }: { stepId: number }) {
  const navigate = useNavigate();
  const { viewMode, setViewMode, setCurrentStep, resetStore, currentStep: storeCurrentStep } = useInterviewPrepStore()
  const { resumeFile, jobDescription, companyName, industry } = useInterviewPrepStore();

  useEffect(() => {
    console.log('[StepContent Store/QueryKey Check]', {
      currentStepVal: storeCurrentStep,
      propStepId: stepId,
      resumeFileNameFromStore: resumeFile?.name || null, // Updated to reflect source
      hasJobDescriptionFromStore: !!jobDescription, // Updated to reflect source
      hasCompanyNameFromStore: !!companyName, // Updated to reflect source
      hasIndustryFromStore: !!industry, // Updated to reflect source
      guideGenTriggered: sessionStorage.getItem("guide-generation-triggered"),
      guideGenSucceeded: sessionStorage.getItem("guide-generation-succeeded-once")
    });
  }, [storeCurrentStep, stepId, resumeFile, jobDescription, companyName, industry]);

  const { data: guide, isLoading, error } = useInterviewPrepV2Guide()

  useEffect(() => {
    if (storeCurrentStep !== stepId) {
      setCurrentStep(stepId)
    }
  }, [stepId, setCurrentStep, storeCurrentStep])

  // Effect for resetting store and flag on initial step (Step 0)
  useEffect(() => {
    if (stepId === 0) {
      console.log('[StepContent New] Initializing Step 0: Resetting store and guide generation flag.');
      resetStore(); // Reset the Zustand store to its initial state
      sessionStorage.removeItem("guide-generation-triggered");
    }
  }, [stepId, resetStore]); // Dependencies: stepId to re-run if user navigates back to 0, resetStore action

  // Debug useEffect to monitor guide loading and step changes
  useEffect(() => {
    console.log('[StepContent New Debug] State update:', {
      stepId,
      guideIsPresent: !!guide,
      isLoading,
      error: error ? error.message : null,
    });
    if (guide && !isLoading && !error) {
      console.log('[StepContent New Debug] Guide successfully loaded/available.');
    }
  }, [guide, isLoading, error, stepId]);

  const renderStepContent = () => {
    console.log('[renderStepContent] Called. Current stepId prop:', stepId, 'Is guide available?', !!guide, 'isLoading:', isLoading, 'error:', error);

    // Handle Step 0 (Welcome Screen)
    if (stepId === 0) {
      return <WelcomeSection data={guide?.section_0_welcome} viewMode={viewMode} />;
    }
    // Handle Step 1 (Resume Upload) - does not depend on main guide
    else if (stepId === 1) {
      return <ResumeUploadSection />;
    }
    // Handle Step 2 (Job Description/Details) - does not depend on main guide
    else if (stepId === 2) {
      return <JobDetailsSection />;
    }

    // For steps > 2 (guide-dependent content), handle loading and error states first
    if (isLoading) {
      console.log('[renderStepContent] isLoading is true, returning StepSkeleton. stepId:', stepId);
      return <StepSkeleton />; 
    }

    if (error) {
      console.error('[renderStepContent] Error fetching guide, returning error message. stepId:', stepId, 'Error:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : 'An unknown error occurred while loading the guide.';
      return <div className="text-red-500 p-4">Error: {errorMessage}</div>;
    }

    // If not loading, no error, but still no guide for steps > 2
    if (!guide) {
      console.error('[renderStepContent] Guide is NOT available for step > 2 (and not loading/error), returning message. stepId:', stepId);
      return <div className="p-4">Guide data is not yet available for this step. Please ensure all prerequisite information has been provided or try refreshing.</div>;
    }
    
    // Debug log to see the guide data for steps > 2 (now that we know guide is present)
    console.log('StepContent - Current step:', stepId);
    console.log('StepContent - Guide data:', guide);
    console.log('StepContent - Current step (prop):', stepId, 'Type:', typeof stepId); 

    // Render step-specific content now that guide is confirmed available for steps > 2
    // UI Step 3 -> guide.section_1_company_industry
    if (stepId === 3) { 
      return <CompanyIndustrySection data={guide.section_1_company_industry} viewMode={viewMode} />;
    // UI Step 4 -> guide.section_2_department_context
    } else if (stepId === 4) { 
      // section_2_department_context does not exist on InterviewPrepV2Guide type.
      // This component might be for a section that is no longer part of the guide or needs a different data source.
      console.log('StepContent rendering DepartmentContextSection for UI Step 2 with data: undefined (original data source missing)');
      return <DepartmentContextSection data={undefined} viewMode={viewMode} />;
    } else if (stepId === 5) { // Corresponds to UI Step "Role Success Factors & Requirements"
      return <RoleSuccessFactorsSection data={guide.section_3_role_success as RoleSuccessFactorsSectionType} />;
    } else if (stepId === 6) { // Corresponds to UI Step "Candidate Fit Analysis"
      return <CandidateFitMatrixSection data={guide.section_4_role_understanding_fit_assessment as RoleUnderstandingFitAssessmentSectionData} />;
    } else if (stepId === 7) { // Corresponds to UI Step "STAR Story Development"
      return <StarStoryBankSection data={guide.section_5_star_story_bank} viewMode={viewMode} />;
    } else if (stepId === 8) { // Corresponds to UI Step "Technical Case Prep"
      return <SimpleTechCaseDisplay data={guide.section_6_technical_case_prep} viewMode={viewMode} />;
    } else if (stepId === 9) { // Corresponds to UI Step "Mock Interview Questions & Feedback"
      return <MockInterviewSection data={guide.section_7_mock_interview} viewMode={viewMode} />;
    } else if (stepId === 10) { // Corresponds to UI Step "Insider Information & Cheatsheet"
      // section_8_insider_info_cheatsheet does not exist on InterviewPrepV2Guide type
      return <InsiderCheatSheetSection data={undefined} viewMode={viewMode} />;
    } else if (stepId === 11) { // Corresponds to UI step 30-60-90 Day Plan
      return <ThirtySixtyNinetySection data={guide.section_9_thirty_sixty_ninety as ThirtySixtyNinetySectionType} viewMode={viewMode} />;
    } else if (stepId === 12) {
      return <OfferNegotiationSection data={guide.section_10_offer_negotiation as OfferNegotiationSectionType} viewMode={viewMode} />;
    } else {
      return <div>Invalid step</div>;
    }
  }

  const handleNext = () => {
    const MAX_STEP_INDEX = 12; // Welcome (0) + Resume (1) + JD (2) + 10 guide sections (UI 3-12)
    if (stepId < MAX_STEP_INDEX) { 
      const newStep = stepId + 1;
      // Trigger guide generation when moving from JD input (UI step 2) to first guide content step (UI step 3)
      if (stepId === 2) { 
        console.log('[StepContent New] Advancing from Step 1. Setting guide generation flag to true.');
        sessionStorage.setItem("guide-generation-triggered", "true");
      }

      navigate(`/interview-v2/step/${newStep}`);
    } else {
      // Logic for when all steps are completed, e.g., navigate to export/share or summary
      console.log('[StepContent New] All steps completed.');
      // Potentially navigate to a summary or export page here
    }
  }

  const handleBack = () => {
    if (stepId > 0) {
      const newStep = stepId - 1
      navigate(`/interview-v2/step/${newStep}`);
      // Clear guide generation flag if navigating back to Welcome, Resume, or JD input steps
      if (newStep <= 2) {
        console.log(`[StepContent New] Navigating back to step ${newStep}, clearing guide generation flag.`);
        sessionStorage.removeItem("guide-generation-triggered");
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-end mb-6">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          disableNext={true}
          disableBack={stepId === 0}
          isLastStep={stepId === 10}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex justify-end mb-6">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-red-600">
          Error loading guide: {error.message}
        </div>
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          disableNext={true}
          disableBack={stepId === 0}
          isLastStep={stepId === 10}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-6">
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStepContent()}
      </div>

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        disableNext={false}
        disableBack={stepId === 0}
        isLastStep={stepId === 12}
      />
    </div>
  )
}
*/
