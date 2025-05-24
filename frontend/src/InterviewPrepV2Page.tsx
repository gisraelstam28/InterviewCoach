import React from 'react';
import { useInterviewPrepV2WizardStore } from './store/interviewPrepV2WizardStore'; // Adjusted path

import ResumeUploadSection from './components/interview-prep/v2/ResumeUploadSection';

import JobDetailsSection from './components/interview-prep/v2/JobDetailsSection';

import GuideDisplaySections from './components/interview-prep/v2/GuideDisplaySections';

// --- Placeholder Components (to be replaced with actual imports) ---
// TODO: Replace with actual component imports and pass necessary props
const LoadingIndicatorSection = ({ message }: { message: string }) => (
  <div className="p-4 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
    <p className="text-lg font-semibold">{message}</p>
  </div>
);
// const GuideDisplaySections = () => <div className="p-4 border rounded-lg shadow-md">Guide Display Sections Placeholder</div>; // Replaced by import

const StepProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-1">
        {[...Array(totalSteps)].map((_, i) => (
          <span key={i} className={`text-sm font-medium ${i + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            Step {i + 1}
          </span>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
// --- End Placeholder Components ---

const InterviewPrepV2Page: React.FC = () => {
  const {
    currentStep,
    isParsingResume,
    isGeneratingQuestions,
    isGeneratingGuide,
    error,
  } = useInterviewPrepV2WizardStore((state) => ({
    currentStep: state.currentStep,
    isParsingResume: state.isParsingResume,
    isGeneratingQuestions: state.isGeneratingQuestions,
    isGeneratingGuide: state.isGeneratingGuide,
    error: state.error,
  }));

  const totalSteps = 3; // 1: Resume, 2: Job Details, 3: Guide

  const renderContent = () => {
    if (isParsingResume) {
      return <LoadingIndicatorSection message="Parsing your resume..." />;
    }
    if (isGeneratingQuestions) {
      return <LoadingIndicatorSection message="Generating interview questions..." />;
    }
    if (isGeneratingGuide) {
      return <LoadingIndicatorSection message="Crafting your interview guide..." />;
    }

    if (error) {
      return <div className="p-4 text-red-600 bg-red-100 border border-red-400 rounded-lg">Error: {error}</div>;
    }

    switch (currentStep) {
      case 1:
        return <ResumeUploadSection />;
      case 2:
        return <JobDetailsSection />;
      case 3:
        return <GuideDisplaySections />;
      default:
        return <div>Invalid step. Please refresh.</div>; // Or reset to step 1
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Interview Preparation Wizard V2</h1>
      <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default InterviewPrepV2Page;
