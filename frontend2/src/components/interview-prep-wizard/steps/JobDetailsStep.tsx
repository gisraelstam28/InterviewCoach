import React, { ChangeEvent } from 'react';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore';
import { InterviewWizardStep } from '../../../types/interviewPrepWizard';

/**
 * JobDetailsStep: Component for collecting job description and company name.
 */
const JobDetailsStep: React.FC = () => {
  const jobDescription = useInterviewPrepWizardStore((state) => state.jobDescription);
  const companyName = useInterviewPrepWizardStore((state) => state.companyName);
  const setJobDescription = useInterviewPrepWizardStore((state) => state.setJobDescription);
  const setCompanyName = useInterviewPrepWizardStore((state) => state.setCompanyName);
  const setJobDetailsFinalized = useInterviewPrepWizardStore((state) => state.setJobDetailsFinalized);
  const setCurrentStep = useInterviewPrepWizardStore((state) => state.setCurrentStep);

  const handleJobDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(event.target.value);
  };

  const handleCompanyNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCompanyName(event.target.value);
  };

  const handleNext = () => {
    // Basic validation: ensure fields are not empty
    if (jobDescription.trim() && companyName.trim()) {
      setJobDetailsFinalized(true);
      // TODO: Determine the actual next step. For now, assuming a loading step for API calls.
      setCurrentStep(InterviewWizardStep.LoadingGuide); 
    } else {
      // Simple alert for now, consider a more user-friendly error display
      alert('Please fill in both Job Description and Company Name.');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 2: Provide Job Details</h2>
      
      <div className="mb-6">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          rows={6}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={handleJobDescriptionChange}
        />
        <p className="mt-1 text-xs text-gray-500">Paste the full job description for the role you're applying for.</p>
      </div>

      <div className="mb-6">
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
          placeholder="E.g., Google, Microsoft, OpenAI"
          value={companyName}
          onChange={handleCompanyNameChange}
        />
        <p className="mt-1 text-xs text-gray-500">Enter the name of the company you're interviewing with.</p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Next: Generate Guide Outline
        </button>
      </div>
    </div>
  );
};

export default JobDetailsStep;

