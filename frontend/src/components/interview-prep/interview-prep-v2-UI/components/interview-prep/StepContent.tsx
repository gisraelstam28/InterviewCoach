"use client"

import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { InterviewPrepV2Guide } from "../../../../../types/interview-prep-v2";

// import { useInterviewPrepStore } from "../../store/interview-prep-store"; // Old V2 store (via re-export)
import { useInterviewPrepV3Store } from "../../../../../store/interview-prep-v3-store"; // New V3 store
import { type JobDetailsSectionRef } from '../../../v2/sections/job-details-section';
import type { CompanyIndustrySection as CompanyIndustrySectionTypeFromV2Types } from "../../../../../types/interview-prep-v2";

import NavigationButtons from "@/components/interview-prep/ui/navigation-buttons"
// import DepartmentContextSection from '../../../v2/sections/department-context-section'; // Removed as component was deleted

import { useInterviewPrepV2Guide } from '../../../../../hooks/useInterviewPrepV2Guide';

export default function StepContent({ stepId }: { stepId: number }) {
  const jobDetailsSectionRef = useRef<JobDetailsSectionRef>(null);
  const prevCurrentStepRef = React.useRef<number | undefined>();
  const {
    currentStep,
    setCurrentStep,
    completedSteps,
    markStepComplete,
    interviewGuide,
    setInterviewGuide,
    resetStore,
    setShouldGenerateGuide,
    jobDetailsFinalized,
    setJobDetailsFinalized,
    // Add any other state/actions needed from the store here e.g.:
    // jobDescription, 
    // companyName, 
    // shouldGenerateGuide, 
    // isGeneratingInterviewPrepGuide, 
    // resumeFile
  } = useInterviewPrepV3Store((state) => state);
  const navigate = useNavigate();

  React.useEffect(() => {
    prevCurrentStepRef.current = currentStep;
  });
  const prevCurrentStep = prevCurrentStepRef.current;
  const { data: guide, isLoading, error, isSuccess } = useInterviewPrepV2Guide() as { data: InterviewPrepV2Guide | undefined, isLoading: boolean, error: Error | null, isSuccess: boolean }

  // Memoized data for different sections
  const memoizedCompanyData = React.useMemo((): CompanyIndustrySectionTypeFromV2Types | undefined => {
    if (!guide) return { company_overview: "", recent_news: [], industry_drivers: [] };
    const sectionData = guide.section_1_company_industry;
    if (!sectionData) return undefined; // Explicitly return undefined if sectionData is missing
    return {
      company_overview: sectionData?.company_overview || "",
      recent_news: sectionData?.recent_news?.map(news => ({
        url: news.url || "",
        title: news.title || "",
        summary: news.summary || "",
        date: news.date || new Date().toISOString(),
        // Removed 'id' property as it's not in NewsItemType
        // Assuming 'news' here is correctly typed as NewsItemType from the guide structure
        // so news.url, news.title, news.summary, news.date are accessed correctly.
        // CompanyIndustrySectionV2 uses item.url for its key, which is fine.
      })) || [],
      industry_drivers: sectionData?.industry_drivers || []
    };
  }, [guide]);

  const memoizedRoleSuccessData = React.useMemo(() => {
    if (!guide) return { must_haves: [], nice_to_haves: [], job_duties: [], qualifications: [], overall_readiness: undefined, focus_recommendations: undefined };
    return guide.section_3_role_success || { must_haves: [], nice_to_haves: [], job_duties: [], qualifications: [], overall_readiness: undefined, focus_recommendations: undefined };
  }, [guide]);

  const memoizedFitData = React.useMemo(() => {
    if (!guide) return { role_summary: '', key_responsibilities_summary: [], overall_fit_rating: '', fit_assessment_details: '' };
    return guide.section_4_role_understanding_fit_assessment || {
      role_summary: '',
      key_responsibilities_summary: [],
      overall_fit_rating: '',
      fit_assessment_details: '',
    };
  }, [guide]);

  const memoizedStarData = React.useMemo(() => {
    if (!guide) return { stories: [] };
    return guide.section_5_star_story_bank || { stories: [] };
  }, [guide]);

  const memoizedTechData = React.useMemo(() => {
    if (!guide) return { key_concepts: [], prompts: [], sample_case_walkthrough: '', key_terms_glossary: [], preparation_tips: [] };
    return guide.section_6_technical_case_prep || {
      key_concepts: [],
      prompts: [],
      sample_case_walkthrough: '',
      key_terms_glossary: [],
      preparation_tips: [],
    };
  }, [guide]);

  const memoizedMockData = React.useMemo(() => {
    if (!guide) return { interview_format_overview: '', sample_questions: [], tips_for_success: [], questions: [], feedback: [], premium_required: false };
    return guide.section_7_mock_interview || {
      interview_format_overview: '',
      sample_questions: [],
      tips_for_success: [],
      questions: [],
      feedback: [],
      premium_required: false,
    };
  }, [guide]);

  const memoizedInsiderData = React.useMemo(() => {
    if (!guide) return {}; 
    return guide.section_8_insider_cheat_sheet || {};
  }, [guide]);

  // Helper function to check if guide is available for the current step
  const isGuideAvailableForStep = (step: number): boolean => {
    // For step 0 and 1, we don't need the guide
    if (step <= 1) return true;
    
    // For other steps, check if guide is available and loaded successfully
    return !!guide && isSuccess && !isLoading;
  };

  // Log the top-level keys of the guide object when it's available
  useEffect(() => {
    if (guide) {
      console.log('[StepContent Effect] Guide object received. Keys:', JSON.stringify(Object.keys(guide)));
      // Store the guide in the interviewGuide state if not already there
      if (!interviewGuide && setInterviewGuide) {
        console.log('[StepContent Effect] Storing guide in interviewGuide state');
        setInterviewGuide(guide);
      }
    }
  }, [guide, interviewGuide, setInterviewGuide]);
  
  // Enhanced logging for debugging guide availability issues
  useEffect(() => {
    console.log('[StepContent] Guide availability status:', {
      isGuideAvailable: !!guide,
      isLoading,
      isSuccess,
      hasError: !!error,
      stepId,
      currentStep
    });
  }, [guide, isLoading, isSuccess, error, stepId, currentStep]);


  // Effect 1: Sync stepId from props to currentStep in store
  useEffect(() => {
    if (currentStep !== stepId) {
      console.log(`[StepContent Effect Sync Step] stepId (${stepId}) !== currentStep (${currentStep} from store). Calling setCurrentStep(${stepId}).`);
      setCurrentStep(stepId);
    }
  }, [stepId, currentStep, setCurrentStep]);

  // Effect 2: Handle Step 0 Initialization
  useEffect(() => {
    if (stepId === 0) {
      const step0Initialized = sessionStorage.getItem('step0_initialized_for_session');

      // Reset the store ONLY on the very first visit to step 0 in a browser session.
      // Once the flag is set, avoid further resets—even if currentStep changes—so that
      // data such as resumeFile and jobDescription persist when the user advances to
      // subsequent steps.
      if (!step0Initialized) {
        console.log('[StepContent Effect Step 0 Init] First visit to step 0 → resetting store.');
        resetStore();
        sessionStorage.setItem('step0_initialized_for_session', 'true');
      }
    } else {
      // When leaving step 0, clear the session flag so that a fresh visit in a *new* page
      // load (e.g. browser refresh on /step/0) re-initialises the flow.
      sessionStorage.removeItem('step0_initialized_for_session');
    }
  }, [stepId, resetStore]);

  // Effect 3: Mark step as complete
  useEffect(() => {
    // Ensure currentStep from store is synchronized with stepId prop before trying to mark complete
    if (currentStep === stepId && currentStep > 1) { 
      if (isGuideAvailableForStep(currentStep)) { // isGuideAvailableForStep depends on guide, isLoading, isSuccess
        if (!completedSteps.includes(currentStep)) {
          console.log(`[StepContent Effect Mark Complete] Marking step ${currentStep} complete.`);
          markStepComplete(currentStep);
        }
      }
    }
  }, [currentStep, stepId, completedSteps, markStepComplete, guide, isLoading, isSuccess]); // Dependencies of isGuideAvailableForStep are guide, isLoading, isSuccess

  // Effect to set jobDetailsFinalized when moving from Job Details (step 1) to the next step
  useEffect(() => {
    if (prevCurrentStep === 1 && currentStep > 1 && !jobDetailsFinalized) {
      console.log('[StepContent Effect] Moved from Job Details (step 1). Setting jobDetailsFinalized to true.');
      setJobDetailsFinalized(true);
    }
  }, [currentStep, prevCurrentStep, jobDetailsFinalized, setJobDetailsFinalized]);

  // Effect to reset jobDetailsFinalized if user returns to step 0 or store is reset (covered by step 0 resetStore)
  useEffect(() => {
    if (currentStep === 0 && jobDetailsFinalized) {
      console.log('[StepContent Effect] Returned to step 0. Resetting jobDetailsFinalized to false.');
      setJobDetailsFinalized(false);
    }
    // Note: resetStore in the step 0 initialization effect already resets jobDetailsFinalized to its initial false state.
  }, [currentStep, jobDetailsFinalized, setJobDetailsFinalized]);

  // Import the V2 components using React.lazy for code splitting
  const ResumeUploadSection = React.lazy(() => import('../../../v2/sections/resume-upload-section'));
  const JobDetailsSection = React.lazy(() => import('../../../v2/sections/job-details-section'));
  const CompanyIndustrySectionV2 = React.lazy(() => import('./sections/company-industry-section'));
  // const DepartmentContextSectionV2 = React.lazy(() => import('../../../v2/sections/department-context-section')); // Removed as component was deleted
  const RoleSuccessFactorsSectionV2 = React.lazy(() => import('../../../v2/sections/role-success-factors-section'));
  const CandidateFitMatrixSectionV2 = React.lazy(() => import('../../../v2/sections/candidate-fit-matrix-section'));
  const StarStoryBankSectionV2 = React.lazy(() => import('../../../v2/sections/star-story-bank-section'));
  const TechnicalCasePrepSectionV2 = React.lazy(() => import('../../../v2/sections/technical-case-prep-section'));
  const MockInterviewSectionV2 = React.lazy(() => import('../../../v2/sections/mock-interview-section'));
  const InsiderCheatsheetSectionV2 = React.lazy(() => import('../../../v2/sections/insider-cheatsheet-section'));

  const renderStepContent = () => {
    const isGuideDataAvailable = !!guide && !isLoading && isSuccess;
    
    console.log('[renderStepContent] Called. Current stepId prop:', stepId, 
      'Is guide data available?', isGuideDataAvailable, 
      'isLoading:', isLoading, 
      'isSuccess:', isSuccess, 
      'Has guide object:', !!guide);

    const fallback = <div className="p-4 text-center">Loading section...</div>;

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
          <JobDetailsSection ref={jobDetailsSectionRef} />
        </React.Suspense>
      );
    }

    // For steps 2 and beyond, we might need the guide.
    // The isGuideAvailableForStep(stepId) check already handles if guide is strictly needed and available.

    if (stepId === 2) {
      if (!isGuideAvailableForStep(stepId)) {
        console.log('[renderStepContent] Placeholder for step 2 as guide not ready. isLoading:', isLoading, 'isSuccess:', isSuccess);
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Company & Industry Analysis</h2>
            <p className="text-gray-700 mb-4">The company and industry analysis is being prepared...</p>
          </div>
        );
      }

      if (!memoizedCompanyData) {
        // This case handles when guide data is available, but section_1_company_industry specifically is missing or empty.
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Company & Industry Analysis</h2>
            <p className="text-gray-700 mb-4">Company and industry information is being prepared or is not available for this guide.</p>
          </div>
        );
      }
      
      // If we have memoizedCompanyData, render the actual component
      console.log('[renderStepContent] Rendering CompanyIndustrySectionV2 for stepId: 2 with data:', memoizedCompanyData);
      return (
        <React.Suspense fallback={fallback}> {/* Ensure fallback is defined in this scope */}
          <CompanyIndustrySectionV2 data={memoizedCompanyData} />
        </React.Suspense>
      );

    }
    if (stepId === 4) {
      if (!isGuideAvailableForStep(stepId)) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Role Success Factors</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <RoleSuccessFactorsSectionV2 data={memoizedRoleSuccessData} />
        </React.Suspense>
      );
    } else if (stepId === 5) {
      if (!isGuideAvailableForStep(stepId)) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Candidate Fit Matrix</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <CandidateFitMatrixSectionV2 data={memoizedFitData} />
        </React.Suspense>
      );
    } else if (stepId === 6) {
      if (!isGuideAvailableForStep(stepId)) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">STAR Story Bank</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <StarStoryBankSectionV2 data={memoizedStarData} />
        </React.Suspense>
      );
    } else if (stepId === 7) {
      if (!isGuideAvailableForStep(stepId)) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Technical Case Prep</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <TechnicalCasePrepSectionV2 data={memoizedTechData} />
        </React.Suspense>
      );
    } else if (stepId === 8) {
      if (!isGuideAvailableForStep(stepId)) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Mock Interview</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <MockInterviewSectionV2 data={memoizedMockData} />
        </React.Suspense>
      );
    } else if (stepId === 9) {
      if (!isGuideAvailableForStep(stepId)) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Insider Cheat Sheet</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <InsiderCheatsheetSectionV2 data={memoizedInsiderData} />
        </React.Suspense>
      );
    } else if (stepId === 10) {
      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">30-60-90 Day Plan</h2>
          <p className="text-gray-700 mb-4">This section is coming soon!</p>
        </div>
      );
    } else if (stepId === 11) {
      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Offer Negotiation</h2>
          <p className="text-gray-700 mb-4">This section is coming soon!</p>
        </div>
      );
    } else {
      return <div className="p-4 text-center text-red-600">Invalid step ID: {stepId}</div>;
    }
  }

  const handleNext = () => {
    if (stepId < 11) {
      const newStep = stepId + 1;
      setCurrentStep(newStep);

      // If moving from step 1 to step 2, set the guide generation trigger flags
      if (stepId === 1) {
        console.log('[StepContent] Moving from step 1 to 2, triggering guide generation via store');
        setShouldGenerateGuide(true);
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
        sessionStorage.setItem('step0_initialized_for_session', 'true'); // Mark as initialized because we are forcing a reset
      }
      setCurrentStep(newStep);
      navigate(`/interview-v2/step/${newStep}`);
    }
  };

  // Show loading state only if we're beyond step 1 and the guide is loading
  // For steps 0-1, we don't need to wait for the guide to load
  if (isLoading && stepId > 1) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <NavigationButtons
          currentStep={currentStep}
          onBack={handleBack}
          onNext={handleNext}
          disableNext={true}
          disableBack={stepId === 0}
          isLastStep={stepId === 10}
          jobDetailsSectionRef={jobDetailsSectionRef}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-red-600">
          Error loading guide: {error.message}
        </div>
        <NavigationButtons
          currentStep={currentStep}
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
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStepContent()}
      </div>

      <NavigationButtons
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        disableNext={stepId >= 10}
        disableBack={stepId === 0}
        isLastStep={stepId === 10}
      />
    </div>
  )
}
