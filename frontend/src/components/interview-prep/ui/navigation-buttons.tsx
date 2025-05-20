import { Button } from "@/components/ui/button";
import { type JobDetailsSectionRef } from "../v2/sections/job-details-section"; // Adjusted import path
import React from 'react';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  disableBack: boolean;
  disableNext: boolean;
  isLastStep?: boolean;
  currentStep: number; // Added currentStep
  jobDetailsSectionRef?: React.RefObject<JobDetailsSectionRef | null>; // Added jobDetailsSectionRef
}

export default function NavigationButtons({
  onBack,
  onNext,
  disableBack,
  disableNext,
  isLastStep = false,
  currentStep,
  jobDetailsSectionRef,
}: NavigationButtonsProps) {
  const handleNextClick = () => {
    if (currentStep === 1 && jobDetailsSectionRef?.current) {
      console.log('[NavigationButtons] Calling commitLocalChangesToStore from JobDetailsSection.');
      jobDetailsSectionRef.current.commitLocalChangesToStore();
    }
    onNext(); // Call the original onNext handler
  };
  return (
    <div className="flex justify-between mt-8">
      <Button variant="outline" onClick={onBack} disabled={disableBack}>
        Back
      </Button>

      <Button onClick={handleNextClick} disabled={disableNext}>
        {isLastStep ? "Finish & Export" : "Next"}
      </Button>
    </div>
  )
}
