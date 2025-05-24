import React, { useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore';
// import { shallow } from 'zustand/shallow'; // Not used with individual selectors
// import { UseBoundStore, StoreApi } from 'zustand'; // Removed as typedHook is no longer used
import {
  parseResumeAPI,
  parseJobDescriptionAPI,
  generateInterviewPrepAPI,
} from '../../../api/interviewPrepApi';
import {
  InterviewWizardStep,
  ResumeFile,
  ParseResumeRequestData,
  ParseResumeResponseData,
  ParseJobDescriptionRequestData,
  ParseJobDescriptionResponseData,
  GenerateInterviewPrepRequest,
  InterviewPrepV2Guide,
} from '../../../types/interviewPrepWizard';

// Helper function to read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const LoadingStep = () => {
  // --- Zustand State and Actions ---
  const resumeFile = useInterviewPrepWizardStore(state => state.resumeFile);
  const jobDescription = useInterviewPrepWizardStore(state => state.jobDescription);
  const companyName = useInterviewPrepWizardStore(state => state.companyName);
  // const rawResumeText = useInterviewPrepWizardStore(state => state.rawResumeText); // For chaining
  // const parsedResumeData = useInterviewPrepWizardStore(state => state.parsedResumeData); // For chaining
  // const parsedJobDescriptionData = useInterviewPrepWizardStore(state => state.parsedJobDescriptionData); // For chaining

  const setCurrentStep = useInterviewPrepWizardStore((state) => state.setCurrentStep);
  const setRawResumeText = useInterviewPrepWizardStore((state) => state.setRawResumeText);
  const setParsedResumeData = useInterviewPrepWizardStore((state) => state.setParsedResumeData);
  const setParsedJobDescriptionData = useInterviewPrepWizardStore((state) => state.setParsedJobDescriptionData);
  const setInterviewGuide = useInterviewPrepWizardStore((state) => state.setInterviewGuide);
  
  const zustandError = useInterviewPrepWizardStore(state => state.error);
  const setError = useInterviewPrepWizardStore((state) => state.setError);

  const isParsingResume = useInterviewPrepWizardStore(state => state.isParsingResume);
  const isParsingJobDescription = useInterviewPrepWizardStore(state => state.isParsingJobDescription);
  const isGeneratingGuide = useInterviewPrepWizardStore(state => state.isGeneratingGuide);
  const setIsParsingResume = useInterviewPrepWizardStore((state) => state.setIsParsingResume);
  const setIsParsingJobDescription = useInterviewPrepWizardStore((state) => state.setIsParsingJobDescription);
  const setIsGeneratingGuide = useInterviewPrepWizardStore((state) => state.setIsGeneratingGuide);

  // --- Parse Resume Mutation ---
  const parseResumeMutation = useMutation<
    ParseResumeResponseData,
    Error,
    { resumeFile: File }
  >({
    mutationFn: async ({ resumeFile: fileToParse }) => {
      if (!fileToParse) throw new Error('Resume file is missing.');
      const resumeTextContent = await readFileAsText(fileToParse);
      // Set raw_resume_text to Zustand store immediately after reading the file
      useInterviewPrepWizardStore.getState().setRawResumeText(resumeTextContent);
      const payload: ParseResumeRequestData = { resume_text: resumeTextContent };
      return parseResumeAPI(payload);
    },
    onMutate: () => {
      setError(null);
      setIsParsingResume(true);
    },
    onSuccess: (data: ParseResumeResponseData) => { // data is StructuredResume
      console.log('Resume parsed successfully:', data);
      // raw_resume_text is already set in mutationFn from file content
      setParsedResumeData(data); // data is StructuredResume, store it directly
      setIsParsingResume(false);
      // Chain to parseJobDescriptionMutation if jobDescription is available
      if (jobDescription) {
        parseJobDescriptionMutation.mutate({ jobDescription, companyName });
      } else {
        setError('Job description is missing. Cannot proceed.');
      }
    },
    onError: (error) => {
      console.error('Error parsing resume:', error);
      setError(`Resume Parsing Failed: ${error.message}`);
      setIsParsingResume(false);
    },
  });

  // --- Parse Job Description Mutation ---
  const parseJobDescriptionMutation = useMutation<
    ParseJobDescriptionResponseData,
    Error,
    { jobDescription: string; companyName?: string }
  >({
    mutationFn: async ({ jobDescription: jdText, companyName: cName }) => {
      if (!jdText) throw new Error('Job description text is missing.');
      const payload: ParseJobDescriptionRequestData = { job_description_text: jdText, company_name: cName };
      return parseJobDescriptionAPI(payload);
    },
    onMutate: () => {
      setError(null);
      setIsParsingJobDescription(true);
    },
    onSuccess: (data) => {
      console.log('Job description parsed successfully:', data);
      setParsedJobDescriptionData(data); // data is StructuredJobDescription
      setIsParsingJobDescription(false);
      // Chain to generateGuideMutation
      const currentParsedResume = useInterviewPrepWizardStore.getState().parsedResumeData;
      // data from this onSuccess is the parsedJobDescriptionData (StructuredJobDescription)
      if (currentParsedResume && data) { 
        generateGuideMutation.mutate({ resumeData: currentParsedResume, jdData: data });
      } else {
        setError('Missing structured resume or job description data for guide generation.');
        setIsParsingJobDescription(false); // Also ensure loading state is off
      }
    },
    onError: (error) => {
      console.error('Error parsing job description:', error);
      setError(`Job Description Parsing Failed: ${error.message}`);
      setIsParsingJobDescription(false);
    },
  });

  // --- Generate Guide Mutation ---
  const generateGuideMutation = useMutation<
    InterviewPrepV2Guide,
    Error,
    { resumeData: ParseResumeResponseData; jdData: ParseJobDescriptionResponseData }
  >({
    mutationFn: async ({ resumeData, jdData }) => {
      // resumeData is parsedResumeData from the store (StructuredResume)
      // jdData is parsedJobDescriptionData from the store (StructuredJobDescription)
      const state = useInterviewPrepWizardStore.getState();
      if (!resumeData || !jdData) { // Check if the objects themselves are present
        throw new Error('Structured resume or job description data is missing for guide generation.');
      }
      if (!state.rawResumeText) {
        throw new Error('Raw resume text is missing for guide generation.');
      }

      const payload: GenerateInterviewPrepRequest = {
        resume_structured: resumeData, // resumeData is StructuredResume
        jd_structured: jdData,       // jdData is StructuredJobDescription
        raw_resume_text: state.rawResumeText, 
        job_description: state.jobDescription, 
        company_name: state.companyName,     
      };
      return generateInterviewPrepAPI(payload);
    },
    onMutate: () => {
      setError(null);
      setIsGeneratingGuide(true);
    },
    onSuccess: (data) => {
      console.log('Interview guide generated successfully:', data);
      setInterviewGuide(data);
      setIsGeneratingGuide(false);
      setCurrentStep(InterviewWizardStep.GuideDisplay);
    },
    onError: (error) => {
      console.error('Error generating interview guide:', error);
      setError(`Guide Generation Failed: ${error.message}`);
      setIsGeneratingGuide(false);
    },
  });

  // --- Effect to Start the Process ---
  useEffect(() => {
    // Trigger the first mutation if resumeFile is present and it hasn't run or failed
    if (resumeFile && parseResumeMutation.isIdle && !parseResumeMutation.isError) {
      parseResumeMutation.mutate({ resumeFile });
    }
    // Chaining is handled in onSuccess of previous mutations
  }, [resumeFile, parseResumeMutation]); // Only depends on the first step's trigger conditions

  // --- Loading and Error Display Logic ---
  const isLoading = 
    isParsingResume || parseResumeMutation.isPending || 
    isParsingJobDescription || parseJobDescriptionMutation.isPending ||
    isGeneratingGuide || generateGuideMutation.isPending;
  
  const displayError = zustandError || 
                       parseResumeMutation.error?.message || 
                       parseJobDescriptionMutation.error?.message || 
                       generateGuideMutation.error?.message;
  // Ensure the error variable is robust even if a mutation hasn't been initiated or its error object is null/undefined.

  let loadingMessage = 'Processing your request...';
  if (isParsingResume || parseResumeMutation.isPending) {
    loadingMessage = 'Parsing your resume...';
  } else if (isParsingJobDescription || parseJobDescriptionMutation.isPending) {
    loadingMessage = 'Analyzing job description...';
  } else if (isGeneratingGuide || generateGuideMutation.isPending) {
    loadingMessage = 'Generating your interview guide...';
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">{loadingMessage}</p>
        <p className="text-gray-500">This might take a few moments. Please wait.</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-red-500">
        <p className="text-xl font-semibold">Error Generating Guide</p>
        <p>{displayError}</p>
        <button
          onClick={() => {
            setError(null); 
            parseResumeMutation.reset();
            parseJobDescriptionMutation.reset();
            generateGuideMutation.reset();
            setCurrentStep(InterviewWizardStep.JobDetails); 
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <p>Preparing guide...</p> 
    </div>
  );
};