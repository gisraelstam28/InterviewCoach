import { useMutation } from '@tanstack/react-query';
import { useInterviewPrepV2WizardStore } from '../store/interviewPrepV2WizardStore'; // Adjusted path
import { ResumeStructured, InterviewPrepV2Guide } from '../types/interview-prep-v2'; // Adjusted path

const API_BASE_PATH = '/api/interview-v2';

// --- Parse Resume Mutation --- //
interface ParseResumePayload {
  resume_text: string;
}

export const useParseResumeMutation = () => {
  const {
    setIsParsingResume,
    setError,
    setStructuredResume,
    setParsedResumeText,
    setCurrentStep,
  } = useInterviewPrepV2WizardStore.getState(); // Use getState for actions outside of render cycle

  return useMutation<ResumeStructured, Error, string>({
    mutationFn: async (resumeText: string): Promise<ResumeStructured> => {
      const response = await fetch(`${API_BASE_PATH}/parse-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume_text: resumeText } as ParseResumePayload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Resume parsing failed with non-JSON response' }));
        throw new Error(errorData.message || 'Failed to parse resume');
      }
      return response.json();
    },
    onMutate: () => {
      setIsParsingResume(true);
      setError(null);
    },
    onSuccess: (data: ResumeStructured, resumeText: string) => {
      setStructuredResume(data);
      setParsedResumeText(resumeText);
      setIsParsingResume(false);
      setCurrentStep(2); // Advance to Job Details step
    },
    onError: (error: Error) => {
      setIsParsingResume(false);
      setError(`Resume parsing error: ${error.message}`);
    },
  });
};

// --- Generate Questions Mutation --- //
interface GenerateQuestionsPayload {
  structured_resume: ResumeStructured;
  job_description: string;
  company_name?: string;
}

// TODO: Define a specific type for the questions response if it's not just 'any'
export const useGenerateQuestionsMutation = () => {
  const {
    setIsGeneratingQuestions,
    setError,
    setGeneratedQuestions,
  } = useInterviewPrepV2WizardStore.getState();

  return useMutation<any, Error, GenerateQuestionsPayload>({
    mutationFn: async (payload: GenerateQuestionsPayload): Promise<any> => {
      const response = await fetch(`${API_BASE_PATH}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Question generation failed with non-JSON response' }));
        throw new Error(errorData.message || 'Failed to generate questions');
      }
      return response.json();
    },
    onMutate: () => {
      setIsGeneratingQuestions(true);
      setError(null);
    },
    onSuccess: (data: any, _variables: GenerateQuestionsPayload) => {
      setGeneratedQuestions(data);
      setIsGeneratingQuestions(false);
      // Advancing step or triggering next mutation will be handled by the orchestrator component
    },
    onError: (error: Error) => {
      setIsGeneratingQuestions(false);
      setError(`Question generation error: ${error.message}`);
    },
  });
};

// --- Generate Guide Mutation --- //
interface GenerateGuidePayload {
  structured_resume: ResumeStructured;
  job_description: string;
  generated_questions: any; // Matches the type from the store for now
  company_name?: string;
}

export const useGenerateGuideMutation = () => {
  const {
    setIsGeneratingGuide,
    setError,
    setInterviewGuide,
    setCurrentStep,
  } = useInterviewPrepV2WizardStore.getState();

  return useMutation<InterviewPrepV2Guide, Error, GenerateGuidePayload>({
    mutationFn: async (payload: GenerateGuidePayload): Promise<InterviewPrepV2Guide> => {
      const response = await fetch(`${API_BASE_PATH}/generate-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Guide generation failed with non-JSON response' }));
        throw new Error(errorData.message || 'Failed to generate guide');
      }
      return response.json();
    },
    onMutate: () => {
      setIsGeneratingGuide(true);
      setError(null);
    },
    onSuccess: (data: InterviewPrepV2Guide) => {
      setInterviewGuide(data);
      setIsGeneratingGuide(false);
      setCurrentStep(3); // Advance to Guide Display step
    },
    onError: (error: Error) => {
      setIsGeneratingGuide(false);
      setError(`Guide generation error: ${error.message}`);
    },
  });
};
