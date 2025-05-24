import React, { useState, ChangeEvent } from 'react';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore';
import { InterviewWizardStep } from '../../../types/interviewPrepWizard';

/**
 * ResumeUploadStep: Component for handling resume file upload.
 */
const ResumeUploadStep: React.FC = () => {
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 1: Upload Your Resume</h2>
      <p className="mb-4 text-sm text-gray-600">
        Please upload your resume in PDF or DOCX format.
      </p>
      
      <div className="mb-4">
        <input 
          type="file" 
          accept=".pdf,.doc,.docx,text/plain"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          " 
        />
      </div>

      {selectedFileName && (
        <p className="mb-4 text-sm text-green-600">
          Selected file: {selectedFileName}
        </p>
      )}

      {fileError && (
        <p className="mb-4 text-sm text-red-600">
          {fileError}
        </p>
      )}

      <button 
        onClick={handleNext}
        disabled={!selectedFileName}
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Next: Add Job Details
      </button>
    </div>
  );
};

export default ResumeUploadStep;

