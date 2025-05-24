import React, { useState, useEffect } from 'react';
import { useInterviewPrepV2WizardStore } from '../../../store/interviewPrepV2WizardStore';
import { useParseResumeMutation } from '../../../hooks/useInterviewPrepV2Mutations';

const ResumeUploadSection: React.FC = () => {
  const {
    parsedResumeText,
    setParsedResumeText,
    isParsingResume: isParsingFromStore, // Renaming to avoid conflict with mutation's isLoading
    error: storeError,
  } = useInterviewPrepV2WizardStore((state) => ({
    parsedResumeText: state.parsedResumeText,
    setParsedResumeText: state.setParsedResumeText,
    isParsingResume: state.isParsingResume,
    error: state.error,
  }));

  const [localResumeText, setLocalResumeText] = useState(parsedResumeText);

  const parseResumeMutation = useParseResumeMutation();

  useEffect(() => {
    // Sync local state if global state changes (e.g., on reset or if populated externally)
    setLocalResumeText(parsedResumeText);
  }, [parsedResumeText]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalResumeText(event.target.value);
  };

  const handleSubmitResume = () => {
    if (localResumeText.trim()) {
      // Update the store immediately with the local text for optimistic UI if desired,
      // though the mutation's onSuccess will also set it.
      setParsedResumeText(localResumeText);
      parseResumeMutation.mutate(localResumeText);
    }
  };

  // Determine loading and error states, preferring mutation's direct state if available
  const isLoading = parseResumeMutation.isPending || isParsingFromStore;
  const error = parseResumeMutation.error?.message || storeError;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Step 1: Provide Your Resume</h2>
      <p className="text-gray-600">
        Please paste your resume text into the text area below. This will be used to understand your experience and tailor the interview preparation.
      </p>
      <textarea
        value={localResumeText}
        onChange={handleTextChange}
        placeholder="Paste your resume text here..."
        className="w-full h-60 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
        disabled={isLoading}
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">Error: {error}</p>
      )}
      <button
        onClick={handleSubmitResume}
        disabled={isLoading || !localResumeText.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Parsing...
          </span>
        ) : (
          'Parse Resume & Continue'
        )}
      </button>
      <p className="text-xs text-gray-500 mt-2">
        Note: For now, please paste the text content of your resume. File upload (PDF, DOCX) will be supported in a future update.
      </p>
    </div>
  );
};

export default ResumeUploadSection;
