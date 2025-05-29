import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { 
  InterviewPrepV2Guide, 
  ResumeStructured, 
  // JDStructured, // Removed as type is not defined
  WelcomeSectionModel,
  CompanyIndustrySectionModel,
  // DepartmentContextSectionType, // Removed as it's stale and deleted from types
  RoleSuccessFactorsSection,
  StarStoryBankSectionModel,
  InsiderCheatSheetSectionModel,
  // OfferNegotiationSection, // Removed as feature is deprecated
  ExportShareSectionModel,
  RoleUnderstandingFitAssessmentSectionModel,
  // MockInterviewSection, // Removed as feature is deprecated
  TechnicalCasePrepSectionModel
  // ThirtySixtyNinetySection // Removed as type is not defined
} from "../types/interview-prep-v2";
import { useInterviewPrepV3Store } from "../store/interview-prep-v3-store";
import { extractTextFromPdf } from "../utils/pdfUtils";

export const INTERVIEW_PREP_V2_QUERY_KEY = "interview-prep-v2-guide"; // Changed to a string for base key



export function useInterviewPrepV2Guide() {
  // Add a local state to persist the guide data
  const [persistedGuideData, setPersistedGuideData] = useState<InterviewPrepV2Guide | null>(null);
  
  const resumeFile = useInterviewPrepV3Store(state => state.resumeFile);
  const jobDescription = useInterviewPrepV3Store(state => state.jobDescription);
  const companyName = useInterviewPrepV3Store(state => state.companyName);
  const interviewGuide = useInterviewPrepV3Store(state => state.interviewGuide);
  const shouldGenerateGuide = useInterviewPrepV3Store(state => state.shouldGenerateGuide);
  const isGeneratingInterviewPrepGuide = useInterviewPrepV3Store(state => state.isGeneratingInterviewPrepGuide);
  const jobDetailsFinalized = useInterviewPrepV3Store(state => state.jobDetailsFinalized);
  const resumeFileIsSelected = useInterviewPrepV3Store(state => state.resumeFileIsSelected);

  const setInterviewGuide = useInterviewPrepV3Store(state => state.setInterviewGuide);
  const setIsGeneratingInterviewPrepGuide = useInterviewPrepV3Store(state => state.setIsGeneratingInterviewPrepGuide);
  const setShouldGenerateGuide = useInterviewPrepV3Store(state => state.setShouldGenerateGuide);

  // Log inputs for the enabled condition
  console.log('[useInterviewPrepV2Guide] Enabled condition inputs:', {
    resumeFileExists: !!resumeFile,
    resumeFileIsSelected,
    jobDescriptionExists: !!jobDescription,
    jobDescriptionLength: jobDescription?.trim().length,
    companyNameExists: !!companyName,
    companyNameLength: companyName?.trim().length,
    jobDetailsFinalized,
    hasExistingGuide: !!interviewGuide,
    isAlreadyGenerating: isGeneratingInterviewPrepGuide,
    combinedShouldGenerateGuideFlag: shouldGenerateGuide // Added for clarity from previous logic if still relevant
  });

  // Log the current state for debugging
  useEffect(() => {
    console.log('useInterviewPrepV2Guide: Current state:', {
      hasPersistedData: !!persistedGuideData,
      hasInterviewGuide: !!interviewGuide,
      shouldGenerateGuide,
      isGeneratingInterviewPrepGuide
    });
  }, [persistedGuideData, interviewGuide, shouldGenerateGuide, isGeneratingInterviewPrepGuide]);

  const isResumeReady = !!resumeFile && resumeFileIsSelected;
  const isJobDescriptionReady = !!jobDescription && jobDescription.trim().length > 10;
  const isCompanyNameReady = !!companyName && companyName.trim().length > 0;

  console.log('[useInterviewPrepV2Guide] Detailed enabled conditions:', {
    isResumeReady,
    resumeFileIsSelected, // From store selector, directly used in isResumeReady
    isJobDescriptionReady,
    isCompanyNameReady,
    jobDetailsFinalized, // From store selector
    hasInterviewGuide: !!interviewGuide, // From store selector
    isGenerating: isGeneratingInterviewPrepGuide, // From store selector
  });

  const queryResult = useQuery<InterviewPrepV2Guide, Error>({
    enabled: isResumeReady &&
             isJobDescriptionReady &&
             isCompanyNameReady &&
             jobDetailsFinalized &&
             !interviewGuide &&
             !isGeneratingInterviewPrepGuide,
    queryKey: [INTERVIEW_PREP_V2_QUERY_KEY, companyName, jobDescription, resumeFileIsSelected ? "resume_present" : "resume_absent", jobDetailsFinalized], // Log key parts for easier debugging
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    queryFn: async () => {
      console.log('[useInterviewPrepV2Guide] queryFn: Entered.');
      setIsGeneratingInterviewPrepGuide(true);

      try {
        // Initialize resumeText and jobDescriptionText to empty strings
        let resumeText = '';
        let jobDescriptionText = '';
        console.log('[useInterviewPrepV2Guide] queryFn: Initializing texts.');

        if (resumeFile) {
          console.log('[useInterviewPrepV2Guide] queryFn: Processing resumeFile:', resumeFile.name);
          try {
            if (resumeFile.type === 'application/pdf') {
              console.log(`useInterviewPrepV2Guide: Processing file type: ${resumeFile.type}. Attempting PDF extraction.`);
              // Assuming extractTextFromPdf is imported from a utility file
              // e.g. import { extractTextFromPdf } from '../../utils/pdfUtils';
              try {
                console.log("useInterviewPrepV2Guide: Calling extractTextFromPdf...");
                resumeText = await extractTextFromPdf(resumeFile);
                console.log("useInterviewPrepV2Guide: extractTextFromPdf succeeded. Extracted text length:", resumeText.length);
              } catch (pdfError) {
                console.error("useInterviewPrepV2Guide: Error calling extractTextFromPdf:", pdfError);
                throw pdfError; // Rethrow to be caught by the outer try-catch
              }
            } else {
              console.log(`useInterviewPrepV2Guide: Processing file type: ${resumeFile.type}. Using FileReader.`);
              const reader = new FileReader();
              const textPromise = new Promise<string>((resolve, reject) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = () => reject(new Error("Failed to read resume file"));
              });
              reader.readAsText(resumeFile);
              resumeText = await textPromise;
            }
            console.log("useInterviewPrepV2Guide: Extracted text from resume file. Length:", resumeText.length);
            console.log("useInterviewPrepV2Guide: Snippet of extracted resume text (first 500 chars):\n", resumeText.substring(0, 500));
          } catch (error) {
            console.error("useInterviewPrepV2Guide: Error extracting text from resume file:", error);
            throw new Error("Failed to extract text from resume file for guide generation.");
          }
        }

        if (jobDescription) {
          jobDescriptionText = jobDescription;
          console.log('[useInterviewPrepV2Guide] queryFn: Job description available, length:', jobDescriptionText.length, 'First 100 chars:', jobDescriptionText.substring(0, 100));
        }

        if (!resumeText && !jobDescriptionText) {
          console.warn('[useInterviewPrepV2Guide] queryFn: Both resume and job description are empty. Aborting API call.');
          setIsGeneratingInterviewPrepGuide(false); // Reset flag
          throw new Error('Cannot generate guide: resume and job description are both empty.');
        }

        console.log('[useInterviewPrepV2Guide] queryFn: Preparing to call API with resumeText (len):', resumeText.length, 'jobDescriptionText (len):', jobDescriptionText.length);

        // Try to parse resume with the API
        let parsedResData: ResumeStructured;
        try {
          console.log("useInterviewPrepV2Guide: Parsing resume text...");
          const parseRes = await fetch("http://localhost:8000/api/interview-v2/parse-resume", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resume_text: resumeText }),
          });
          console.log('[useInterviewPrepV2Guide] queryFn: API call initiated to /api/interview-v2/parse-resume.');
          if (!parseRes.ok) {
            const errorText = await parseRes.text(); // Get raw text to avoid JSON parse error if response is not JSON
            console.error('[useInterviewPrepV2Guide] queryFn: API call to parse-resume failed with status', parseRes.status, 'Error text:', errorText);
            // setIsGeneratingInterviewPrepGuide(false); // Removed: Reset flag only at the end of queryFn
            throw new Error(`API Error: ${parseRes.status} ${parseRes.statusText} - ${errorText}`);
          }
          parsedResData = await parseRes.json();
          console.log('[useInterviewPrepV2Guide] queryFn: API call to /api/interview-v2/parse-resume succeeded.');
          console.log("useInterviewPrepV2Guide: Resume parsed successfully via API.");
        } catch (error) {
          console.warn("useInterviewPrepV2Guide: Failed to parse resume via API, using mock data for parsedResData:", error);
          // setIsGeneratingInterviewPrepGuide(false); // Removed: Reset flag only at the end of queryFn
          // Provide mock data when API fails that matches ResumeStructured type
          parsedResData = {
            positions: [],
            skills: [],
            achievements: []
          };
        }

        // Try to parse job description with the API
        let parsedJdData: any; // JDStructured type removed, using any for now
        try {
          console.log("useInterviewPrepV2Guide: Parsing job description...");
          const parseJdRes = await fetch("http://localhost:8000/api/interview-v2/parse-jd", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_description_text: jobDescriptionText }),
          });
          console.log('[useInterviewPrepV2Guide] queryFn: API call initiated to /api/interview-v2/parse-jd.');
          if (!parseJdRes.ok) {
            const errorText = await parseJdRes.text(); // Get raw text to avoid JSON parse error if response is not JSON
            console.error('[useInterviewPrepV2Guide] queryFn: API call to parse-jd failed with status', parseJdRes.status, 'Error text:', errorText);
            // setIsGeneratingInterviewPrepGuide(false); // Removed: Reset flag only at the end of queryFn
            throw new Error(`API Error: ${parseJdRes.status} ${parseJdRes.statusText} - ${errorText}`);
          }
          parsedJdData = await parseJdRes.json();
          console.log('[useInterviewPrepV2Guide] queryFn: API call to /api/interview-v2/parse-jd succeeded.');
          console.log("useInterviewPrepV2Guide: Job description parsed successfully via API.");
        } catch (error) {
          console.warn("useInterviewPrepV2Guide: Failed to parse job description via API, using mock data for parsedJdData:", error);
          // setIsGeneratingInterviewPrepGuide(false); // Removed: Reset flag only at the end of queryFn
          // Provide mock data when API fails that matches JDStructured type
          parsedJdData = {
            role_title: companyName ? `Role at ${companyName}` : "Role",
            requirements: [],
            responsibilities: []
          };
        }

        // Try to generate the full guide with the API
        try {
          console.log("useInterviewPrepV2Guide: queryFn: Generating full interview prep guide using /api/interview-v2/generate...");
          const genGuideBody = {
            raw_resume_text: resumeText, 
            resume_structured: parsedResData,
            job_description: jobDescriptionText,
            jd_structured: parsedJdData,
            company_name: companyName,
          };
          console.log("useInterviewPrepV2Guide: queryFn: Guide generation request body:", genGuideBody);

          const response = await fetch('http://localhost:8000/api/interview-v2/generate', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(genGuideBody),
          });

          console.log('[useInterviewPrepV2Guide] queryFn: API call initiated to http://localhost:8000/api/interview-v2/generate.');
          if (!response.ok) {
            const errorText = await response.text();
            console.error('[useInterviewPrepV2Guide] queryFn: API call to generate guide FAILED with status', response.status, 'Error text:', errorText);
            // This error will be caught by the catch block below, which will then generate a mock guide
            throw new Error(`API Error (generate guide): ${response.status} ${response.statusText} - ${errorText}`); 
          }
          const generatedGuide: InterviewPrepV2Guide = await response.json();
          console.log('[useInterviewPrepV2Guide] queryFn: API call to http://localhost:8000/api/interview-v2/generate SUCCEEDED.');
          setIsGeneratingInterviewPrepGuide(false); // Reset flag on success
          return generatedGuide;

        } catch (apiError) {
          console.warn("useInterviewPrepV2Guide: queryFn: Failed to generate guide via API, falling back to mock data:", apiError);
          // Generate a mock guide when the API fails
          const mockGuide: InterviewPrepV2Guide = {
            section_0_welcome: {
              intro: `Mock Welcome for ${companyName || 'your target company'}! Guide generated because API failed. Error: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
              quick_view_enabled: true,
              deep_dive_enabled: true,
              progress: 0
            } as WelcomeSectionModel,
            section_1_company_industry: {
              company_overview: 'Mock company overview (API fallback).',
              recent_news: [{ title: 'Mock News (API Fallback)', summary: 'Details about mock news.'}],
              industry_drivers: ['Mock driver 1 (API Fallback)']
            } as CompanyIndustrySectionModel,
            section_3_role_success: {
              must_haves: [{ text: 'Mock Must-Have (API Fallback)', met: false, explanation: 'Mock explanation' }],
              nice_to_haves: [],
              job_duties: ['Mock duty (API Fallback)'],
              qualifications: ['Mock qualification (API Fallback)'],
              overall_readiness: 'Mock readiness: Good (API Fallback)',
              focus_recommendations: ['Mock focus area (API Fallback)']
            } as RoleSuccessFactorsSection,
            section_4_role_understanding_fit_assessment: {
              role_summary: 'This role requires (mock) technical expertise and communication skills.',
              key_responsibilities_summary: ['Develop features (mock)', 'Collaborate with team (mock)'],
              overall_fit_rating: 'Good (mock)',
              fit_assessment_details: 'You have most of the required skills (mock assessment).'
            } as RoleUnderstandingFitAssessmentSectionModel,
            section_5_star_story_bank: {
              stories: [{ competency: 'Problem Solving (Mock)', situation: 'Mock S', task: 'Mock T', action: 'Mock A', result: 'Mock R' }]
            } as StarStoryBankSectionModel,
            section_6_technical_case_prep: {
              key_concepts: ['Mock concept (API Fallback)'],
              prompts: [{ question: 'Mock case question (API Fallback)?', sample_answer: 'Mock sample answer.' }],
              // sample_case_walkthrough: 'Mock sample case walkthrough not available (API Fallback).', // This field does not exist on TechnicalCasePrepSectionModel
              key_terms: [{ term: 'Mock Term (API Fallback)', definition: 'Mock Definition' }], // Corrected from key_terms_glossary to key_terms
              preparation_tips: ['Mock preparation tip (API Fallback).']
            } as TechnicalCasePrepSectionModel,
            // section_7_mock_interview removed
            section_8_insider_cheat_sheet: {
              // culture_cues: ['Mock cue (API Fallback)'], // These fields do not exist on InsiderCheatSheetSectionModel
              // glassdoor_pain_points: ['Mock pain point (API Fallback)'] // These fields do not exist on InsiderCheatSheetSectionModel
              // Minimal valid InsiderCheatSheetSectionModel:
              talking_points_from_news: ['Mock talking point (API Fallback)'],
              potential_challenges: ['Mock challenge (API Fallback)'],
              key_stakeholders: ['Mock stakeholder (API Fallback)'],
            } as InsiderCheatSheetSectionModel,
            // section_9_thirty_sixty_ninety removed
            // section_10_offer_negotiation removed
            export_share: {
              export_options: ['PDF (Mock)'], // Changed to match ExportShareSectionModel
              share_platforms: ['Email (Mock)'], // Changed to match ExportShareSectionModel
              shareable_link: 'mocklink.com/share (API Fallback)' // Changed to match ExportShareSectionModel
            } as ExportShareSectionModel,
            ...(parsedResData ? { resume_structured: parsedResData } : {}),
            ...(parsedJdData ? { job_description_structured: parsedJdData } : {})
          };
          console.log("useInterviewPrepV2Guide: queryFn: Mock guide generated successfully due to API failure.");
          setIsGeneratingInterviewPrepGuide(false); // Reset flag on error/fallback
          return mockGuide;
        }
      } catch (e) { // Catch errors from text extraction or initial checks BEFORE main API calls
        console.error('[useInterviewPrepV2Guide] queryFn: Error occurred before or during parsing/guide generation API calls:', e);
        setIsGeneratingInterviewPrepGuide(false); // Ensure flag is reset
        // If e is an error, rethrow it. Otherwise, wrap it in an error.
        if (e instanceof Error) {
          throw e; 
        }
        throw new Error(String(e)); // Rethrow the error to be handled by useQuery
      }
    }, // End of queryFn
  }); // End of useQuery

  // Store the guide data in local state and Zustand store when query is successful
  useEffect(() => {
    if (queryResult.isSuccess && queryResult.data) {
      console.log('useInterviewPrepV2Guide: Query successful (isSuccess=true), persisting guide data to local state and Zustand store.');
      const rawData = queryResult.data;
      // Ensure we provide defaults for export_share if missing from API response
      const validGuideData: InterviewPrepV2Guide = {
        ...(rawData as any), // Cast to any to spread, then reconstruct with type safety
        export_share: (rawData as any)?.export_share || {
          pdf_export_enabled: true, 
          notion_export_enabled: false, 
          send_to_coach_enabled: false, 
        },
      };
      setPersistedGuideData(validGuideData);
      
      if (setInterviewGuide) {
        setInterviewGuide(validGuideData);
      }
    }
  }, [queryResult.isSuccess, queryResult.data, setInterviewGuide]);

  // Log query status and ensure flags are reset as a safeguard
  useEffect(() => {
    if (queryResult.isSuccess) {
      // Logging for isSuccess is handled in the previous useEffect after data persistence
    } else if (queryResult.isError) {
      console.error('useInterviewPrepV2Guide: Query failed (isError=true):', queryResult.error);
      // queryFn should robustly handle resetting isGeneratingInterviewPrepGuide on its internal errors.
      // This is a final safeguard if queryResult.isError is true but the flag wasn't reset.
      if (isGeneratingInterviewPrepGuide) {
          console.warn('[useInterviewPrepV2Guide] Query error detected (isError=true), ensuring isGeneratingInterviewPrepGuide is false as a safeguard.');
          setIsGeneratingInterviewPrepGuide(false);
      }
      // also ensure shouldGenerateGuide is reset if it was true
      if (shouldGenerateGuide) {
        console.warn('[useInterviewPrepV2Guide] Query error detected (isError=true), ensuring shouldGenerateGuide is false as a safeguard.');
        setShouldGenerateGuide(false);
      }
    }
  }, [queryResult.isSuccess, queryResult.isError, isGeneratingInterviewPrepGuide, setIsGeneratingInterviewPrepGuide, shouldGenerateGuide, setShouldGenerateGuide]);

  // Return a modified result that includes the persisted data and a robust isSuccess check
  return {
    ...queryResult,
    // Use query data first, then persisted local data, then global store data as fallbacks
    data: queryResult.data || persistedGuideData || interviewGuide || undefined,
    // Consider the operation a success if data exists from any of these sources
    isSuccess: !!(queryResult.data || persistedGuideData || interviewGuide),
  };
}
