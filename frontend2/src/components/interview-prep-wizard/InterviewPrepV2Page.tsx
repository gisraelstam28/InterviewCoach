import React from 'react';
import { useInterviewPrepWizardStore } from '../../store/interviewPrepWizardStore';
import { InterviewWizardStep } from '../../types/interviewPrepWizard';

// Import step components (we'll create these next with basic placeholders)
import ResumeUploadStep from './steps/ResumeUploadStep';
import JobDetailsStep from './steps/JobDetailsStep';
import { LoadingStep } from './steps/LoadingStep';
import GuideDisplayStep from './steps/GuideDisplayStep';

/**
 * InterviewPrepV2Page is the main orchestrator for the multi-step interview prep wizard.
 * It controls the flow and renders the current step based on the Zustand store state.
 */
const InterviewPrepV2Page: React.FC = () => {
  const currentStep = useInterviewPrepWizardStore((state) => state.currentStep);
  // const setCurrentStep = useInterviewPrepWizardStore((state) => state.actions.setCurrentStep); // Example action usage

  const renderStepContent = () => {
    switch (currentStep) {
      case InterviewWizardStep.ResumeUpload:
        return <ResumeUploadStep />;
        // return <div>Resume Upload Step Placeholder</div>;
      case InterviewWizardStep.JobDetails:
        return <JobDetailsStep />;
        // return <div>Job Details Step Placeholder</div>;
      case InterviewWizardStep.LoadingGuide:
        return <LoadingStep />;
        // return <div>Loading Guide Step Placeholder...</div>;
      case InterviewWizardStep.GuideDisplay:
        return <GuideDisplayStep />;
        // return <div>Guide Display Step Placeholder</div>;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="interview-prep-v2-page p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Interview Preparation Wizard
      </h1>
      
      {/* Placeholder for a Step Progress Bar - to be implemented later */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-sm text-gray-600">Current Step:</p>
        <p className="text-lg font-semibold">{currentStep}</p>
        {/* Example buttons to test step transitions - remove later */}
        {/* <div className="mt-4 space-x-2">
          <button onClick={() => setCurrentStep(InterviewWizardStep.ResumeUpload)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Resume</button>
          <button onClick={() => setCurrentStep(InterviewWizardStep.JobDetails)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Job Details</button>
          <button onClick={() => setCurrentStep(InterviewWizardStep.LoadingGuide)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Loading</button>
          <button onClick={() => setCurrentStep(InterviewWizardStep.GuideDisplay)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Guide</button>
        </div> */}
      </div>

      <div className="step-content bg-white shadow-md rounded-lg p-6 min-h-[300px]">
        {renderStepContent()}
      </div>

      {/* Placeholder for global navigation buttons (Next, Previous) - to be implemented later */}
      <div className="mt-8 flex justify-between">
        {/* <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Previous</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Next</button> */}
      </div>
    </div>
  );
};

export default InterviewPrepV2Page;

