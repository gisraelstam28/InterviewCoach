import React, { useState, ChangeEvent, FC } from 'react';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore';
import { InterviewWizardStep } from '../../../types/interviewPrepWizard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * JobDetailsStep: Component for collecting job description and company name.
 */
const JobDetailsStep: FC = () => {
  const setJobDescription = useInterviewPrepWizardStore((state) => state.setJobDescription);
  const setCompanyName = useInterviewPrepWizardStore((state) => state.setCompanyName);
  const setJobDetailsFinalized = useInterviewPrepWizardStore((state) => state.setJobDetailsFinalized);
  const setCurrentStep = useInterviewPrepWizardStore((state) => state.setCurrentStep);
  
  const [localJobDescription, setLocalJobDescription] = useState('');
  const [localCompanyName, setLocalCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const handleJobDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalJobDescription(event.target.value);
  };

  const handleCompanyNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalCompanyName(event.target.value);
  };

  const handleJobTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJobTitle(event.target.value);
  };

  const handleNext = () => {
    // Basic validation: ensure fields are not empty
    if (localJobDescription.trim() && localCompanyName.trim() && jobTitle.trim()) {
      // Save the job details to the store
      setJobDescription(localJobDescription);
      setCompanyName(localCompanyName);
      setJobDetailsFinalized(true);
      
      // Move to the next step (LoadingGuide)
      setCurrentStep(InterviewWizardStep.LoadingGuide);
    } else {
      // Simple alert for now, consider a more user-friendly error display
      alert('Please fill in all fields.');
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Job Details</h2>
      <p className="text-gray-600 mb-6">
        Please provide the job description and company information.
      </p>

      <div className="space-y-6">
        <div>
          <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
          <input
            id="job-title"
            type="text"
            value={jobTitle}
            onChange={handleJobTitleChange}
            placeholder="Enter job title"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            id="company-name"
            type="text"
            value={localCompanyName}
            onChange={handleCompanyNameChange}
            placeholder="Enter company name"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            id="job-description"
            value={localJobDescription}
            onChange={handleJobDescriptionChange}
            placeholder="Paste the full job description here..."
            rows={8}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 resize-vertical"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={() => setCurrentStep(InterviewWizardStep.ResumeUpload)}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!localJobDescription.trim() || !localCompanyName.trim() || !jobTitle.trim()}>
          Generate Interview Guide
        </Button>
      </div>
    </Card>
  );
};

export default JobDetailsStep;
