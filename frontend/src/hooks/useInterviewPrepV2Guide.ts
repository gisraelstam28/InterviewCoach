import React from 'react'; // Import React for useEffect
import { useQuery } from "@tanstack/react-query";
import { InterviewPrepV2Guide, ResumeStructured, JDStructured } from "@/types/interview-prep-v2";
import { useInterviewPrepStore } from "../components/interview-prep/interview-prep-v2-UI/store/interview-prep-store";

export const INTERVIEW_PREP_V2_QUERY_KEY = "interview-prep-v2-guide"; // Changed to a string for base key

// Add a flag to the store to control when guide generation should happen
const GUIDE_GENERATION_FLAG = "guide-generation-triggered";

export function useInterviewPrepV2Guide() {
  const { resumeFile, jobDescription, companyName, industry, currentStep } = useInterviewPrepStore(); // Added currentStep
  
  // Check if the guide generation has been manually triggered
  const hasTriggered = sessionStorage.getItem(GUIDE_GENERATION_FLAG) === "true";

  const queryResult = useQuery<InterviewPrepV2Guide, Error>({
    queryKey: [INTERVIEW_PREP_V2_QUERY_KEY, companyName, jobDescription, resumeFile instanceof File ? resumeFile.name : String(resumeFile), industry, currentStep], // Added currentStep to queryKey for safety
    queryFn: async () => {
      console.log("useInterviewPrepV2Guide: queryFn started. Dependencies:", { resumeFile, jobDescription, companyName, industry });

      let extractedResumeText: string;
      if (resumeFile instanceof File) {
        console.log("useInterviewPrepV2Guide: Uploading resume file...");
        const uploadForm = new FormData();
        uploadForm.append("file", resumeFile);
        const uploadRes = await fetch("http://localhost:8000/api/upload-resume", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ detail: "Resume upload failed" }));
          throw new Error(`Resume upload failed: ${errorData.detail}`);
        }
        const uploadData = await uploadRes.json();
        extractedResumeText = uploadData.extracted_text;
        if (!extractedResumeText) throw new Error("Failed to extract text from uploaded resume");
        console.log("useInterviewPrepV2Guide: Resume uploaded and text extracted.");
      } else if (typeof resumeFile === 'string') {
        extractedResumeText = resumeFile;
        console.log("useInterviewPrepV2Guide: Using existing resume text.");
      } else {
        throw new Error("Invalid or missing resumeFile in store for guide generation.");
      }

      console.log("useInterviewPrepV2Guide: Parsing resume text...");
      const parseRes = await fetch("http://localhost:8000/api/interview-v2/parse-resume", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: extractedResumeText }),
      });
      if (!parseRes.ok) {
        const errorData = await parseRes.json().catch(() => ({ detail: "Resume parsing failed" }));
        throw new Error(`Resume parsing failed: ${errorData.detail}`);
      }
      const parsedResData: ResumeStructured = await parseRes.json();
      console.log("useInterviewPrepV2Guide: Resume parsed.");

      if (typeof jobDescription !== 'string' || !jobDescription.trim()) {
        throw new Error("Invalid or missing jobDescription in store for guide generation.");
      }
      console.log("useInterviewPrepV2Guide: Parsing job description...");
      const parseJdRes = await fetch("http://localhost:8000/api/interview-v2/parse-jd", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description_text: jobDescription }),
      });
      if (!parseJdRes.ok) {
        const errorData = await parseJdRes.json().catch(() => ({ detail: "Job description parsing failed" }));
        throw new Error(`Job description parsing failed: ${errorData.detail}`);
      }
      const parsedJdData: JDStructured = await parseJdRes.json();
      console.log("useInterviewPrepV2Guide: Job description parsed.");

      console.log("useInterviewPrepV2Guide: Generating full interview prep guide...");
      const genGuideBody = {
        raw_resume_text: extractedResumeText,
        resume_structured: parsedResData,
        job_description: jobDescription,
        jd_structured: parsedJdData,
        company_name: companyName,
        industry: industry,
      };
      console.log("useInterviewPrepV2Guide: Guide generation request body:", genGuideBody);

      const genRes = await fetch("http://localhost:8000/api/interview-v2/generate", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genGuideBody),
      });

      if (!genRes.ok) {
        const errorText = await genRes.text();
        console.error("Guide generation failed. Server response:", errorText);
        try {
            const errorData = JSON.parse(errorText);
            throw new Error(`Guide generation failed: ${errorData.detail || errorText}`);
        } catch (e) {
            throw new Error(`Guide generation failed: ${errorText}`);
        }
      }
      const generatedGuide: InterviewPrepV2Guide = await genRes.json();
      console.log("useInterviewPrepV2Guide: Interview prep guide generated successfully.");
      return generatedGuide;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: currentStep >= 2 && // Ensures query only runs on/after Step 2
             hasTriggered && 
             !!resumeFile && 
             !!jobDescription && jobDescription.trim().length > 20 && 
             !!companyName && companyName.trim().length > 1,
  });

  React.useEffect(() => {
    // Clear the flag only if it was set (hasTriggered) and the query is no longer in a pending state.
    if (hasTriggered && !queryResult.isPending) {
      console.log(`useInterviewPrepV2Guide: Query finished (status: ${queryResult.status}), clearing guide generation flag.`);
      sessionStorage.removeItem(GUIDE_GENERATION_FLAG);
    }
  }, [queryResult.isPending, queryResult.status, hasTriggered]); // Add queryResult.status to dependency array for robustness

  return queryResult;
}

