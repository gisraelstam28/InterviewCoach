import React from 'react';
import { useInterviewPrepWizardStore } from '../../store/interviewPrepWizardStore';
import { InterviewWizardStep } from '../../types/interviewPrepWizard';

// Import step components (we'll create these next with basic placeholders)
import ResumeUploadStep from './steps/ResumeUploadStep';
import JobDetailsStep from './steps/JobDetailsStep';
import { LoadingStep } from './steps/LoadingStep';
import GuideDisplayStep from './steps/GuideDisplayStep';
import { Layout } from './ui/Layout'; // Import the Layout component

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
    <Layout>
      <header className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-2 mb-2">
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" className="text-purple-600">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Interview Preparation Wizard</h1>
        </div>
        <div className="text-base text-gray-500">Personalized interview preparation powered by AI</div>
      </header>
      
      {/* Placeholder for a Step Progress Bar - to be implemented later */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center shadow">
        <p className="text-sm text-gray-600">Current Step:</p>
        <p className="text-lg font-semibold text-gray-700">{currentStep}</p>
        {/* Example buttons to test step transitions - remove later */}
        {/* <div className="mt-4 space-x-2">
          <button onClick={() => setCurrentStep(InterviewWizardStep.ResumeUpload)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Resume</button>
          <button onClick={() => setCurrentStep(InterviewWizardStep.JobDetails)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Job Details</button>
          <button onClick={() => setCurrentStep(InterviewWizardStep.LoadingGuide)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Loading</button>
          <button onClick={() => setCurrentStep(InterviewWizardStep.GuideDisplay)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs">To Guide</button>
        </div> */}
      </div>

      {/* The step content (e.g., ResumeUploadStep) will render its own Card component */}
      {renderStepContent()}

      {/* Placeholder for global navigation buttons (Next, Previous) - to be implemented later */}
      {/* <div className="mt-8 flex justify-between">
        <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Previous</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Next</button>
      </div> */}
    </Layout>
  );
};

export default InterviewPrepV2Page;
