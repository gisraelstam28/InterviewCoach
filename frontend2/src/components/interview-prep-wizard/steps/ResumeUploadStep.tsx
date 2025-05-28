import React, { useState, ChangeEvent, FC } from 'react';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore';
import { InterviewWizardStep } from '../../../types/interviewPrepWizard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

/**
 * ResumeUploadStep: Component for handling resume file upload.
 */
const ResumeUploadStep: FC = () => {
  const setResumeFile = useInterviewPrepWizardStore((state) => state.setResumeFile);
  const setCurrentStep = useInterviewPrepWizardStore((state) => state.setCurrentStep);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (e.g., file type, size) can be added here
      // For now, just accept any file
      setResumeFile(file);
      setSelectedFileName(file.name);
      setFileError(null);
    } else {
      setResumeFile(null);
      setSelectedFileName(null);
    }
  };

  const handleNext = () => {
    if (selectedFileName) {
      setCurrentStep(InterviewWizardStep.JobDetails);
    } else {
      setFileError('Please select a resume file to continue.');
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Upload Your Resume</h2>
      <p className="text-gray-600 mb-6">
        Please upload your resume. Supported formats: PDF, DOCX, TXT.
      </p>
      
      <div className="mb-6">
        <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-1">Upload your resume</label>
        <input 
          id="resume-upload"
          type="file" 
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
        />
        {selectedFileName && (
          <div className="mt-3 p-3 bg-purple-50 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-purple-700 font-medium">Selected: {selectedFileName}</span>
          </div>
        )}
        {fileError && (
          <p className="mt-2 text-sm text-red-600">{fileError}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedFileName}>
          Next: Add Job Details
        </Button>
      </div>
    </Card>
  );
};

export default ResumeUploadStep;
