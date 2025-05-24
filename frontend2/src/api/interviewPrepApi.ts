import {
  ParseResumeRequestData,
  ParseResumeResponseData,
  ParseJobDescriptionRequestData,
  ParseJobDescriptionResponseData,
  GenerateInterviewPrepRequest,
  InterviewPrepV2Guide,
} from '../types/interviewPrepWizard';

// Assuming this type is or will be in '../types/interviewPrepWizard.ts'
// export interface UploadResumeResponseData {
//   filename: string;
//   extracted_text: string;
// }
// For the purpose of this tool call, let's define it here if not already present in the import
interface UploadResumeResponseData {  // If this causes issues, ensure it's correctly defined and imported
  filename: string;
  extracted_text: string;
}

// Define the base URL for your backend API
// IMPORTANT: Replace with your actual backend URL if different
const API_BASE_URL = 'http://localhost:8000'; // Common default for FastAPI

/**
 * Helper function to handle API requests.
 */
async function handleApiRequest<T>(url: string, method: string, body?: any): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`API Error (${response.status}): ${errorData.detail || errorData.message || 'Unknown error'}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`Error during API call to ${url}:`, error);
    throw error; // Re-throw to be caught by React Query's onError
  }
}

/**
 * Calls the backend API to parse a resume.
 * Endpoint: POST /api/interview-v2/parse-resume
 */
export const parseResumeAPI = async (
  requestData: ParseResumeRequestData
): Promise<ParseResumeResponseData> => {
  const url = `${API_BASE_URL}/api/interview-v2/parse-resume`;
  console.log(`Calling parseResumeAPI with payload:`, requestData);
  const response = await handleApiRequest<ParseResumeResponseData>(url, 'POST', requestData);
  console.log(`parseResumeAPI response:`, response);
  return response;
};

/**
 * Calls the backend API to parse a job description.
 * Endpoint: POST /api/interview-v2/parse-jd
 */
export const parseJobDescriptionAPI = async (
  requestData: ParseJobDescriptionRequestData
): Promise<ParseJobDescriptionResponseData> => {
  const url = `${API_BASE_URL}/api/interview-v2/parse-jd`;
  console.log(`Calling parseJobDescriptionAPI with payload:`, requestData);
  const response = await handleApiRequest<ParseJobDescriptionResponseData>(url, 'POST', requestData);
  console.log(`parseJobDescriptionAPI response:`, response);
  return response;
};

/**
 * Calls the backend API to generate the full interview prep guide.
 * Endpoint: POST /api/interview-v2/generate
 */
export const generateInterviewPrepAPI = async (
  requestData: GenerateInterviewPrepRequest
): Promise<InterviewPrepV2Guide> => {
  const url = `${API_BASE_URL}/api/interview-v2/generate`;
  console.log(`Calling generateInterviewPrepAPI with payload:`, requestData);
  const response = await handleApiRequest<InterviewPrepV2Guide>(url, 'POST', requestData);
  console.log(`generateInterviewPrepAPI response:`, response);
  return response;
};

