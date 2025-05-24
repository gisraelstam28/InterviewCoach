"use client"

import React, { useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

// import { useInterviewPrepStore } from "../../store/interview-prep-store"; // Old V2 store (via re-export)
// import { useInterviewPrepV3Store } from "../../../../../store/interview-prep-v3-store"; // No longer used here
import { useInterviewPrepV2WizardStore } from '../../../../../store/interviewPrepV2WizardStore'; // CORRECTED STORE
import { type JobDetailsSectionRef } from '../../../v2/sections/job-details-section';
import { type CompanyIndustrySectionModel as CompanyIndustrySectionTypeFromV2Types } from '../../../../../types/interview-prep-v2';
import NavigationButtons from './ui/navigation-buttons';

export default function StepContent({ stepId }: { stepId: number }) {
  const jobDetailsSectionRef = useRef<JobDetailsSectionRef>(null);
  const prevCurrentStepRef = React.useRef<number | undefined>(undefined);

  const {
    // UserInputSlice states and actions
    jobDescription,
    companyName,
    jobDetailsFinalized, // state value
    setJobDetailsFinalized, // action
    resetUserInput,

    // ProcessedDataSlice actions
    resetProcessedData,

    // GuideSlice states and actions
    interviewGuide,
    resetGuide,

    // UiSlice states and actions
    // currentStep, // stepId prop is used as primary source of truth for current step in this component
    isGeneratingQuestions,
    isGeneratingGuide,
    error: wizardError, // aliased to avoid conflict with local 'error' variable if any
    // setCurrentStep, // Action, if needed for dispatching from here
    // setError, // Action, if needed for dispatching from here
    resetUiState,
  } = useInterviewPrepV2WizardStore((state) => ({
    // UserInputSlice
    jobDescription: state.jobDescription,
    companyName: state.companyName,
    jobDetailsFinalized: state.jobDetailsFinalized,
    setJobDetailsFinalized: state.setJobDetailsFinalized,
    resetUserInput: state.resetUserInput,

    // ProcessedDataSlice
    resetProcessedData: state.resetProcessedData,

    // GuideSlice
    interviewGuide: state.interviewGuide,
    resetGuide: state.resetGuide,

    // UiSlice
    // currentStep: state.currentStep, 
    isGeneratingQuestions: state.isGeneratingQuestions,
    isGeneratingGuide: state.isGeneratingGuide,
    error: state.error,
    // setCurrentStep: state.setCurrentStep,
    // setError: state.setError,
    resetUiState: state.resetUiState,
  }));
  
  const navigate = useNavigate();

  React.useEffect(() => {
    prevCurrentStepRef.current = stepId;
  });
  const prevCurrentStep = prevCurrentStepRef.current;

  // --- Derive guide, isLoading, error, and isSuccess from useInterviewPrepV2WizardStore --- 
  const guide = interviewGuide;
  const isLoading = isGeneratingQuestions || isGeneratingGuide;
  const error = wizardError; // Use the aliased error from the store
  const isSuccess = !!guide && !error; // Define isSuccess to resolve lint errors

  // Note: The conditional `if (stepId >= 2 && jobDetailsFinalized)` for using guide data
  // is implicitly handled because `interviewGuide` will only be populated after these conditions are met
  // and the generation process completes successfully.
  // The `isLoading` flag will reflect the generation process triggered after jobDetailsFinalized.
  // For stepId < 2 or if jobDetailsFinalized is false, 'guide' remains undefined,
  // 'isLoading' remains false, etc., providing stable values.
  // The `useInterviewPrepV2Guide` hook internally handles falling back to the store's `interviewGuide` if its own query isn't active or data isn't available.

  // Effect to handle initialization and reset for Step 0, and session flag management
  useEffect(() => {
    const step0Initialized = sessionStorage.getItem('step0_initialized_for_session');
    console.log('[StepContent Step 0 Effect] stepId:', stepId, 'step0Initialized:', step0Initialized, 'prevCurrentStep:', prevCurrentStep);

    if (stepId === 0) {
      if (!step0Initialized) {
        // First time entering step 0 this session
        console.log('[StepContent Step 0 Effect] Initializing and resetting store for step 0 (first time this session).');
        resetUserInput();
        resetProcessedData();
        resetGuide();
        resetUiState();
        sessionStorage.setItem('step0_initialized_for_session', 'true');
      } else if (prevCurrentStep !== undefined && prevCurrentStep !== 0) {
        // Navigating back to step 0 from another step in the same session
        console.log('[StepContent Step 0 Effect] Resetting store for step 0 (navigating back this session).');
        resetUserInput();
        resetProcessedData();
        resetGuide();
        resetUiState();
      }
    } else {
      // If we navigate away from step 0, clear the session flag so it resets if we come back to step 0 later.
      if (step0Initialized) { // Only remove if it was set
        console.log('[StepContent Step 0 Effect] Navigated away from step 0. Clearing step0_initialized_for_session flag.');
        sessionStorage.removeItem('step0_initialized_for_session');
      }
    }
  }, [stepId, prevCurrentStep, resetUserInput, resetProcessedData, resetGuide, resetUiState]);

  // Enhanced logging for debugging guide availability issues
  useEffect(() => {
    console.log('[StepContent] Guide availability status:', {
      isGuideAvailable: !!guide,
      isLoading,
      isSuccess,
      hasError: !!error,
      stepId
    });
  }, [guide, isLoading, isSuccess, error, stepId]);

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
    if (!guide || !guide.section_3_role_success) return undefined;
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

  const memoizedStarStoryBankData = React.useMemo(() => {
    if (!guide || !guide.section_5_star_story_bank) return { stories: [] };
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
    const sectionData = guide?.section_7_mock_interview;

    // Base structure for MockInterviewContent with defaults
    // This assumes MockInterviewContent has these fields. Adjust if its actual definition differs.
    const baseMockContentData = {
      interview_format_overview: "Focus on common behavioral questions. Prepare STAR stories for each competency required for the role. Practice articulating your experiences clearly and concisely.",
      sample_questions: [], // Default to empty array as MockInterviewSectionModel doesn't provide this specific field. If MockInterviewContent expects questions here, they should come from sectionData.questions later.
      tips_for_success: [
        "Understand the role and company deeply.",
        "Listen actively to the interviewer.",
        "Ask thoughtful questions at the end.",
        "Be confident and authentic."
      ],
      premium_required: false, // Default value
      // Ensure all fields expected by MockInterviewContent are present
    };

    if (!sectionData) {
      // If no specific mock interview data from the guide, return the default structure
      return {
        ...baseMockContentData,
        questions: [], // MockInterviewSectionModel's 'questions' field
        feedback: [],  // MockInterviewSectionModel's 'feedback' field
      };
    }

    // If sectionData (from MockInterviewSectionModel) exists, merge its relevant parts
    return {
      ...baseMockContentData, // Start with defaults
      questions: sectionData.questions ?? [], // Overlay with actual questions if available
      feedback: sectionData.feedback ?? [],   // Overlay with actual feedback if available
      // If MockInterviewSectionModel had a 'premium_required' or other fields that also exist on MockInterviewContent,
      // you could override baseMockContentData properties here:
      // premium_required: sectionData.premium_required_from_model ?? baseMockContentData.premium_required,
    };
  }, [guide]);

  const memoizedInsiderData = React.useMemo(() => {
    if (!guide) return {}; 
    return guide.section_8_insider_cheat_sheet || {};
  }, [guide]);

  // Helper function to check if guide is available
  const isGuideAvailableForStep = (): boolean => {
    // console.log('[StepContent] Checking guide availability for step:', step, 'Guide:', guide);
    // Check if the guide object exists and is not empty
    if (!guide || Object.keys(guide).length === 0) {
      // console.log('[StepContent] Guide not available or empty for step:', step);
      return false;
    }
    // // Check if all *previous* steps leading up to this step are marked as complete
    // // Temporarily commenting out completedSteps logic as it's not in V2WizardStore
    // for (let i = 0; i < step; i++) {
    //   if (!completedSteps[i]) {
    //     // console.log('[StepContent] Previous step', i, 'not complete for current step:', step);
    //     return false; // A previous step is not complete
    //   }
    // }
    // console.log('[StepContent] Guide available for step:', step);
    return true; // Temporarily simplified: Guide exists implies availability for now.
  };

  // Effect to set jobDetailsFinalized when moving from Job Details (step 1) to the next step
  useEffect(() => {
    if (prevCurrentStep === 1 && stepId > 1 && !jobDetailsFinalized) {
      console.log('[StepContent Effect] Moved from Job Details (step 1). Setting jobDetailsFinalized to true.');
      setJobDetailsFinalized(true);
    }
  }, [stepId, prevCurrentStep, jobDetailsFinalized, setJobDetailsFinalized]);

  // Effect to reset jobDetailsFinalized if user returns to step 0 or store is reset (covered by step 0 resetStore)
  useEffect(() => {
    if (stepId === 0 && jobDetailsFinalized) {
      console.log('[StepContent Effect] Returned to step 0. Resetting jobDetailsFinalized to false.');
      setJobDetailsFinalized(false);
    }
    // Note: resetStore in the step 0 initialization effect already resets jobDetailsFinalized to its initial false state.
  }, [stepId, jobDetailsFinalized, setJobDetailsFinalized]);

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
      if (!isGuideAvailableForStep()) {
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
      if (!isGuideAvailableForStep()) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Role Success Factors</h2><p>Being prepared...</p></div>;
      }

      if (!memoizedRoleSuccessData) {
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Role Success Factors</h2>
            <p className="text-gray-700 mb-4">Role success factor information is being prepared or is not available for this guide.</p>
          </div>
        );
      }

      return (
        <React.Suspense fallback={fallback}>
          <RoleSuccessFactorsSectionV2 data={memoizedRoleSuccessData} />
        </React.Suspense>
      );
    } else if (stepId === 5) {
      if (!isGuideAvailableForStep()) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Candidate Fit Matrix</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <CandidateFitMatrixSectionV2 data={memoizedFitData} />
        </React.Suspense>
      );
    } else if (stepId === 6) {
      if (!isGuideAvailableForStep()) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">STAR Story Bank</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <StarStoryBankSectionV2 data={memoizedStarStoryBankData} />
        </React.Suspense>
      );
    } else if (stepId === 7) {
      if (!isGuideAvailableForStep()) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Technical Case Prep</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <TechnicalCasePrepSectionV2 data={memoizedTechData} />
        </React.Suspense>
      );
    } else if (stepId === 8) {
      if (!isGuideAvailableForStep()) {
        return <div className="p-4"><h2 className="text-2xl font-bold mb-4">Mock Interview</h2><p>Being prepared...</p></div>;
      }

      return (
        <React.Suspense fallback={fallback}>
          <MockInterviewSectionV2 data={memoizedMockData} />
        </React.Suspense>
      );
    } else if (stepId === 9) {
      if (!isGuideAvailableForStep()) {
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
      if (stepId === 1) {
        // Commit local job details before proceeding
        if (jobDetailsSectionRef.current) {
          jobDetailsSectionRef.current.commitLocalChangesToStore();
        }
        // Check if job details are filled
        if (!jobDescription || !companyName) {
          alert('Please fill in both the job description and company name before proceeding.');
          return;
        }
        setJobDetailsFinalized(true);
        // setShouldGenerateGuide(true); // Removed: Mutations are triggered by JobDetailsSection or an orchestrator
      }
      navigate(`/interview-v2/step/${newStep}`);
    } else {
      navigate('/interview-v2/export');
    }
  }

  const handleBack = () => {
    if (stepId > 0) {
      const newStep = stepId - 1;
      if (newStep === 0) {
        console.log('[StepContent handleBack] Navigating back to Step 0. Resetting store slices explicitly.');
        resetUserInput();
        resetProcessedData();
        resetGuide();
        resetUiState(); 
        // Note: resetUiState() should set currentStep back to its initial value (e.g., 1 or 0 based on store design)
        // It also resets loading flags and errors.
        sessionStorage.setItem('step0_initialized_for_session', 'true');
      }
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
        <div className="bg-white rounded-lg shadow-md p-6 text-red-600">
          Error loading guide: {error}
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
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStepContent()}
      </div>

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        disableNext={(stepId === 1 && (!jobDescription || !companyName)) || stepId >= 10}
        disableBack={stepId === 0}
        isLastStep={stepId === 10}
      />
    </div>
  )
}
