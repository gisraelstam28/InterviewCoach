"use client"

import { useEffect } from "react"

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

import { useInterviewPrepV2Guide } from "@/hooks/useInterviewPrepV2Guide"

export default function StepContent({ stepId }: { stepId: number }) {
  const { viewMode, setViewMode, setCurrentStep, resetStore, currentStep: storeCurrentStep } = useInterviewPrepStore()
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
    console.log('[renderStepContent] Called. Current stepId prop:', stepId, 'Is guide available?', !!guide);
    if (!guide) {
      console.error('[renderStepContent] Guide is NOT available, returning null. stepId:', stepId);
      return null;
    }
    
    // Debug log to see the guide data
    console.log('StepContent - Current step:', stepId);
    console.log('StepContent - Guide data:', guide);
    console.log('StepContent - Current step (prop):', stepId, 'Type:', typeof stepId); 
    // console.log('FORCE REFRESH LOG (before component selection) - stepId:', stepId, 'Time:', new Date().toLocaleTimeString()); // Original log, can be noisy

    // Temporary refactor to if/else if for debugging step 9/10 issue
    if (stepId === 0) {
      return <WelcomeSection data={guide.section_0_welcome} viewMode={viewMode} />;
    } else if (stepId === 1) {
      return <CompanyIndustrySection data={guide.section_1_company_industry} viewMode={viewMode} />;
    } else if (stepId === 2) { // Corresponds to UI Step "Department Context"
      // section_2_department_context does not exist on InterviewPrepV2Guide type.
      // This component might be for a section that is no longer part of the guide or needs a different data source.
      console.log('StepContent rendering DepartmentContextSection for UI Step 2 with data: undefined (original data source missing)');
      return <DepartmentContextSection data={undefined} viewMode={viewMode} />;
    } else if (stepId === 3) {
      return <RoleSuccessFactorsSection data={guide.section_3_role_success as RoleSuccessFactorsSectionType} />;
    } else if (stepId === 4) {
      console.log('StepContent rendering CandidateFitMatrixSection for UI Step 4 with data:', guide.section_4_role_understanding_fit_assessment);
      return <CandidateFitMatrixSection data={guide.section_4_role_understanding_fit_assessment as RoleUnderstandingFitAssessmentSectionData | undefined} />;
    } else if (stepId === 5) { // UI Step 5 & 6 are StarStoryBank (using section_5_data)
      console.log('StepContent rendering StarStoryBankSection for UI Step 5/6 with data:', guide.section_5_star_story_bank);
      return <StarStoryBankSection data={guide.section_5_star_story_bank} viewMode={viewMode} />;
    } else if (stepId === 6) { // UI Step 6 also StarStoryBank, covered by stepId === 5 now
      console.log('StepContent rendering StarStoryBankSection for UI Step 6 with data:', guide.section_5_star_story_bank);
      return <StarStoryBankSection data={guide.section_5_star_story_bank} viewMode={viewMode} />;
    } else if (stepId === 7) {
      console.log('StepContent rendering SimpleTechCaseDisplay for UI Step 7 with data:', guide.section_6_technical_case_prep);
      return <SimpleTechCaseDisplay data={guide.section_6_technical_case_prep} viewMode={viewMode} />;
    } else if (stepId === 8) {
      console.log('StepContent rendering MockInterviewSection for UI Step 8 with data:', guide.section_7_mock_interview);
      return <MockInterviewSection data={guide.section_7_mock_interview} viewMode={viewMode} />;
    } else if (stepId === 9) {
      console.log(`[StepContent] Branch for stepId === 9. Value: ${stepId}, Type: ${typeof stepId}. Guide defined: ${!!guide}. section_8_insider_cheat_sheet defined: ${!!guide?.section_8_insider_cheat_sheet}`);
      if (guide && guide.section_8_insider_cheat_sheet) {
        console.log('[StepContent] Rendering InsiderCheatSheetSection with data:', guide.section_8_insider_cheat_sheet);
      } else {
        console.error('[StepContent] CRITICAL: Cannot render InsiderCheatSheetSection for step 9, data missing. guide exists:', !!guide, 'section_8_insider_cheat_sheet:', guide?.section_8_insider_cheat_sheet);
      }
      return <InsiderCheatSheetSection data={guide.section_8_insider_cheat_sheet} viewMode={viewMode} />;

    } else if (stepId === 10) {
      console.log(`[StepContent] Branch for stepId === 10. Value: ${stepId}, Type: ${typeof stepId}. Guide defined: ${!!guide}. section_10_offer_negotiation defined: ${!!guide?.section_10_offer_negotiation}`);
      if (guide && guide.section_10_offer_negotiation) {
        console.log('[StepContent] Rendering ThirtySixtyNinetySection with data:', guide.section_10_offer_negotiation);
      } else {
        console.error('[StepContent] CRITICAL: Cannot render ThirtySixtyNinetySection for step 10, data missing. guide exists:', !!guide, 'section_10_offer_negotiation:', guide?.section_10_offer_negotiation);
      }
      return <ThirtySixtyNinetySection data={guide.section_9_thirty_sixty_ninety as ThirtySixtyNinetySectionType} viewMode={viewMode} />;

    } else if (stepId === 11) {
      console.log('StepContent rendering OfferNegotiationSection for UI Step 11 with data:', guide.section_10_offer_negotiation);
      return <OfferNegotiationSection data={guide.section_10_offer_negotiation as OfferNegotiationSectionType} viewMode={viewMode} />;
    } else {
      return <div>Invalid step</div>;
    }
  }

  const handleNext = () => {
    if (stepId < 11) { // Assuming 11 is the max step index (0-10 for 11 sections, then export)
      const newStep = stepId + 1;
      if (stepId === 1) { // Transitioning from Job Details (Step 1) to Guide Content (e.g., Step 2)
        console.log('[StepContent New] Advancing from Step 1. Setting guide generation flag to true.');
        sessionStorage.setItem("guide-generation-triggered", "true");
      }
      setCurrentStep(newStep);
    } else {
      // Logic for when all steps are completed, e.g., navigate to export/share or summary
      console.log('[StepContent New] All steps completed.');
      // Potentially navigate to a summary or export page here
    }
  }

  const handleBack = () => {
    if (stepId > 0) {
      const newStep = stepId - 1
      setCurrentStep(newStep)
      if (newStep === 0 || newStep === 1) {
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
        isLastStep={stepId === 10}
      />
    </div>
  )
}
