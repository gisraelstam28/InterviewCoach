import React from 'react';
import { useInterviewPrepV2WizardStore } from '../../../store/interviewPrepV2WizardStore';
// import { InterviewPrepV2Guide } from '../../../types/interview-prep-v2'; // Keep for future typed rendering

const GuideDisplaySections: React.FC = () => {
  const { interviewGuide, error } = useInterviewPrepV2WizardStore((state) => ({
    interviewGuide: state.interviewGuide,
    error: state.error, // Though error is primarily handled in InterviewPrepV2Page
  }));

  if (error) {
    // This component might not need to render its own error if InterviewPrepV2Page handles it globally.
    // However, it can be a fallback or for specific errors related to guide display.
    return <p className="text-red-600">An error occurred while preparing the guide.</p>;
  }

  if (!interviewGuide) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg text-center">
        <p className="text-gray-600">
          Your interview guide is not yet available. It might still be generating, or an issue occurred.
        </p>
      </div>
    );
  }

  // For now, display the raw JSON. Later, implement structured rendering based on InterviewPrepV2Guide type.
  // const typedGuide = interviewGuide as InterviewPrepV2Guide; 
  // When InterviewPrepV2Guide has a defined structure, you can use: 
  // e.g. <h1>{typedGuide.title}</h1>, etc.

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Your Custom Interview Guide
      </h2>
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Raw Guide Data:</h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-600 overflow-x-auto bg-gray-100 p-3 rounded">
          {JSON.stringify(interviewGuide, null, 2)}
        </pre>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Note: This is a raw view of the generated guide. Structured display will be implemented soon.
      </p>
    </div>
  );
};

export default GuideDisplaySections;
