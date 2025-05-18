"use client"

import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom";

import { useInterviewPrepStore } from "../../store/interview-prep-store"
import ViewToggle from "@/components/interview-prep/ui/view-toggle"
import NavigationButtons from "@/components/interview-prep/ui/navigation-buttons"
import WelcomeSection from "@/components/interview-prep/sections/welcome-section"
import CompanyIndustrySection from "@/components/interview-prep/sections/company-industry-section"
import DepartmentContextSection from "@/components/interview-prep/sections/department-context-section"
import RoleSuccessFactorsSection from "@/components/interview-prep/sections/role-success-factors-section"
import CandidateFitMatrixSection from "@/components/interview-prep/sections/candidate-fit-matrix-section"
import StarStoryBankSection from "@/components/interview-prep/sections/star-story-bank-section"
import SimpleTechCaseDisplay from '../../../sections/SimpleTechCaseDisplay';
import MockInterviewSection from "@/components/interview-prep/sections/mock-interview-section"
import InsiderCheatSheetSection from "@/components/interview-prep/sections/insider-cheatsheet-section"
import ThirtySixtyNinetySection from "@/components/interview-prep/sections/thirty-sixty-ninety-section"
import OfferNegotiationSection from "@/components/interview-prep/sections/offer-negotiation-section"

import { useInterviewPrepV2Guide } from '../../../../../hooks/useInterviewPrepV2Guide';

export default function StepContent({ stepId }: { stepId: number }) {
  const { viewMode, setViewMode, setCurrentStep, resumeFile, jobDescription, companyName, industry, resetStore, currentStep: storeCurrentStep } = useInterviewPrepStore()
  const navigate = useNavigate();
  const { data: guide, isLoading, error } = useInterviewPrepV2Guide()

  // Log Zustand store values relevant to the 'enabled' condition of useInterviewPrepV2Guide
  console.log('[StepContent] Store values for guide query:', {
    resumeFileExists: !!resumeFile,
    jobDescriptionExists: !!jobDescription,
    companyNameExists: !!companyName,
    industryExists: !!industry,
    isResumeFileObject: resumeFile instanceof File,
    resumeFile: resumeFile, // Log the actual value for inspection
    jobDescription: jobDescription, // Log the actual value
    companyName: companyName, // Log the actual value
    industry: industry // Log the actual value
  });

  useEffect(() => {
    // Sync store's currentStep with stepId from URL if they differ
    if (storeCurrentStep !== stepId) {
      setCurrentStep(stepId);
    }

    // Initial setup for step 0:
    // This runs if stepId is 0 (either by URL or store sync)
    // AND if a marker 'step0_initialized_for_session' is not set in sessionStorage.
    if (stepId === 0 && !sessionStorage.getItem('step0_initialized_for_session')) {
      console.log('[StepContent Effect] Initializing Step 0: Resetting store and guide generation flag.');
      resetStore();
      sessionStorage.removeItem('guide-generation-triggered');
      sessionStorage.setItem('step0_initialized_for_session', 'true'); // Mark that step 0 has been initialized for this session
    }

    // If we navigate away from step 0, clear the initialization flag so it can re-initialize if we return.
    if (stepId !== 0) {
      sessionStorage.removeItem('step0_initialized_for_session');
    }
  }, [stepId, storeCurrentStep, setCurrentStep, resetStore]);

  // Import the V2 components using React.lazy for code splitting
  const ResumeUploadSection = React.lazy(() => import('../../../v2/sections/resume-upload-section'));
  const JobDetailsSection = React.lazy(() => import('../../../v2/sections/job-details-section'));
  const CompanyIndustrySectionV2 = React.lazy(() => import('../../../v2/sections/company-industry-section'));
  const DepartmentContextSectionV2 = React.lazy(() => import('../../../v2/sections/department-context-section'));
  const RoleSuccessFactorsSectionV2 = React.lazy(() => import('../../../v2/sections/role-success-factors-section'));
  const CandidateFitMatrixSectionV2 = React.lazy(() => import('../../../v2/sections/candidate-fit-matrix-section'));
  const StarStoryBankSectionV2 = React.lazy(() => import('../../../v2/sections/star-story-bank-section'));
  const TechnicalCasePrepSectionV2 = React.lazy(() => import('../../../v2/sections/technical-case-prep-section'));
  const MockInterviewSectionV2 = React.lazy(() => import('../../../v2/sections/mock-interview-section'));
  const InsiderCheatsheetSectionV2 = React.lazy(() => import('../../../v2/sections/insider-cheatsheet-section'));
  const ThirtySixtyNinetySectionV2 = React.lazy(() => import('../../../v2/sections/thirty-sixty-ninety-section'));
  const OfferNegotiationSectionV2 = React.lazy(() => import('../../../v2/sections/offer-negotiation-section'));

  const renderStepContent = () => {
    console.log('[renderStepContent] Called. Current stepId prop:', stepId, 'Is guide available?', !!guide);

    // Common suspense fallback
    const fallback = <div className="p-4 text-center">Loading section...</div>;

    // Steps 0 and 1 don't require the guide to be available
    if (stepId === 0) {
      console.log('[renderStepContent] Rendering ResumeUploadSection for stepId: 0');
      return (
        <React.Suspense fallback={fallback}>
          <ResumeUploadSection />
        </React.Suspense>
      );
    } else if (stepId === 1) {
      console.log('[renderStepContent] Rendering JobDetailsSection for stepId: 1');
      return (
        <React.Suspense fallback={fallback}>
          <JobDetailsSection />
        </React.Suspense>
      );
    }
    
    // For steps 2+, we need the guide data
    if (!guide && stepId >= 2) {
      console.error('[renderStepContent] Guide is NOT available for stepId:', stepId, ', returning null.');
      return <div className="p-4 text-center text-amber-600">Please complete the previous steps to generate the guide data.</div>;
    }
    
    // Render the appropriate V2 component based on stepId
    if (stepId === 2) {
      // Section 1: Company & Industry Context (Corresponds to guide.section_1_company_industry)
      // console.log('[renderStepContent] Rendering CompanyIndustrySection for stepId: 2. Guide data for section_1:', guide?.section_1_company_industry);
      return (
        <React.Suspense fallback={fallback}>
          <CompanyIndustrySection data={guide?.section_1_company_industry} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 3) {
      return (
        <React.Suspense fallback={fallback}>
          <DepartmentContextSectionV2 data={guide?.section_2_calendar_invites} viewMode={viewMode} />
        </React.Suspense>
      );
    }

    // Debug log to see the guide data (only logs if guide is available for steps >= 2)
    if (guide) {
      console.log('StepContent - Current step:', stepId);
      console.log('StepContent - Guide data:', guide);
    }
    
    // Continue rendering V2 components for steps 4-11
    if (stepId === 4) {
      return (
        <React.Suspense fallback={fallback}>
          <RoleSuccessFactorsSectionV2 data={guide?.section_3_role_success} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 5) {
      return (
        <React.Suspense fallback={fallback}>
          <CandidateFitMatrixSectionV2 data={guide?.section_4_role_understanding_fit_assessment} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 6) {
      return (
        <React.Suspense fallback={fallback}>
          <StarStoryBankSectionV2 data={guide?.section_5_star_story_bank} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 7) {
      return (
        <React.Suspense fallback={fallback}>
          <TechnicalCasePrepSectionV2 data={guide?.section_6_technical_case_prep} />
        </React.Suspense>
      );
    } else if (stepId === 8) {
      return (
        <React.Suspense fallback={fallback}>
          <MockInterviewSectionV2 data={guide?.section_7_mock_interview} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 9) {
      return (
        <React.Suspense fallback={fallback}>
          <InsiderCheatsheetSectionV2 data={guide?.section_8_insider_cheat_sheet} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 10) {
      return (
        <React.Suspense fallback={fallback}>
          <ThirtySixtyNinetySectionV2 data={guide?.section_9_thirty_sixty_ninety} viewMode={viewMode} />
        </React.Suspense>
      );
    } else if (stepId === 11) {
      return (
        <React.Suspense fallback={fallback}>
          <OfferNegotiationSectionV2 data={guide?.section_10_offer_negotiation} viewMode={viewMode} />
        </React.Suspense>
      );
    } else {
      return <div className="p-4 text-center text-red-600">Invalid step ID: {stepId}</div>;
    }
  }

  const handleNext = () => {
    if (stepId < 11) {
      const newStep = stepId + 1;
      setCurrentStep(newStep);

      // If moving from step 1 to step 2, set the guide generation trigger flag
      if (stepId === 1) {
        console.log('[StepContent] Moving from step 1 to 2, triggering guide generation');
        sessionStorage.setItem('guide-generation-triggered', 'true');
      }

      // Client-side route transition without full page reload
      navigate(`/interview-v2/step/${newStep}`);
    } else {
      // Potentially navigate to export/share page
      navigate('/interview-v2/export');
    }
  }

  const handleBack = () => {
    if (stepId > 0) {
      const newStep = stepId - 1;
      if (newStep === 0) {
        console.log('[StepContent handleBack] Navigating back to Step 0. Resetting store explicitly.');
        resetStore(); 
        sessionStorage.removeItem('guide-generation-triggered');
        sessionStorage.setItem('step0_initialized_for_session', 'true'); // Mark as initialized because we are forcing a reset
      }
      setCurrentStep(newStep);
      navigate(`/interview-v2/step/${newStep}`);
    }
  };

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
        disableNext={stepId >= 10}
        disableBack={stepId === 0}
        isLastStep={stepId === 10}
      />
    </div>
  )
}
