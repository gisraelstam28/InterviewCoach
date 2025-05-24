import React, { useState, useEffect } from 'react';
import { useInterviewPrepV2WizardStore } from '../../../store/interviewPrepV2WizardStore';
import {
  useGenerateQuestionsMutation,
  useGenerateGuideMutation,
} from '../../../hooks/useInterviewPrepV2Mutations';
import { ResumeStructured } from '../../../types/interview-prep-v2'; // For type checking

const JobDetailsSection: React.FC = () => {
  const {
    jobDescription: storeJobDescription,
    companyName: storeCompanyName,
    setJobDescription,
    setCompanyName,
    setJobDetailsFinalized,
    structuredResume,
    // generatedQuestions, // Not needed from store here; using mutation result directly
    isGeneratingQuestions: isGeneratingQuestionsFromStore,
    isGeneratingGuide: isGeneratingGuideFromStore,
    error: storeError,
  } = useInterviewPrepV2WizardStore((state) => ({
    jobDescription: state.jobDescription,
    companyName: state.companyName,
    setJobDescription: state.setJobDescription,
    setCompanyName: state.setCompanyName,
    setJobDetailsFinalized: state.setJobDetailsFinalized,
    structuredResume: state.structuredResume,
    // generatedQuestions: state.generatedQuestions,
    isGeneratingQuestions: state.isGeneratingQuestions,
    isGeneratingGuide: state.isGeneratingGuide,
    error: state.error,
  }));

  const [localJobDescription, setLocalJobDescription] = useState(storeJobDescription);
  const [localCompanyName, setLocalCompanyName] = useState(storeCompanyName);

  useEffect(() => {
    setLocalJobDescription(storeJobDescription);
  }, [storeJobDescription]);

  useEffect(() => {
    setLocalCompanyName(storeCompanyName);
  }, [storeCompanyName]);

  const generateQuestionsMutation = useGenerateQuestionsMutation();
  const generateGuideMutation = useGenerateGuideMutation();

  const handleGenerateGuideAndQuestions = () => {
    if (!structuredResume) {
      // This should ideally not happen if flow is correct, but good to guard
      useInterviewPrepV2WizardStore.getState().setError('Resume data is missing. Please go back to Step 1.');
      return;
    }
    if (!localJobDescription.trim()) {
      useInterviewPrepV2WizardStore.getState().setError('Job description cannot be empty.');
      return;
    }

    setJobDescription(localJobDescription);
    setCompanyName(localCompanyName); // Allow empty company name
    setJobDetailsFinalized(true);

    generateQuestionsMutation.mutate(
      {
        structured_resume: structuredResume as ResumeStructured, // Type assertion
        job_description: localJobDescription,
        company_name: localCompanyName || undefined, // Send undefined if empty
      },
      {
        onSuccess: (questionsData) => {
          // Now trigger guide generation with the newly generated questions
          if (structuredResume) { // Double check, should always be true here
            generateGuideMutation.mutate({
              structured_resume: structuredResume as ResumeStructured,
              job_description: localJobDescription,
              generated_questions: questionsData, // Use questions from this mutation's success
              company_name: localCompanyName || undefined,
            });
          }
        },
        // onError for generateQuestionsMutation is handled by its own definition
      }
    );
  };

  const isLoading = generateQuestionsMutation.isPending || isGeneratingQuestionsFromStore || generateGuideMutation.isPending || isGeneratingGuideFromStore;
  const error = generateQuestionsMutation.error?.message || generateGuideMutation.error?.message || storeError;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Step 2: Job & Company Details</h2>
      <p className="text-gray-600">
        Provide the job description and company name. This information will help in generating targeted questions and a personalized interview guide.
      </p>
      <div>
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          id="jobDescription"
          value={localJobDescription}
          onChange={(e) => setLocalJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name (Optional)
        </label>
        <input
          type="text"
          id="companyName"
          value={localCompanyName}
          onChange={(e) => setLocalCompanyName(e.target.value)}
          placeholder="Enter the company name..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          disabled={isLoading}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">Error: {error}</p>
      )}
      <button
        onClick={handleGenerateGuideAndQuestions}
        disabled={isLoading || !localJobDescription.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Questions & Interview Guide'
        )}
      </button>
    </div>
  );
};

export default JobDetailsSection;
