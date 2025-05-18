import React, { useState } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

import JobSearchPreferencesForm from './JobSearchPreferencesForm';


interface JobPreference {
  job_title_keywords: string;
  industry: string[];
  location: string;
  employment_type: string[];
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  remote_preference: string;
  company_preferences: string;
  additional_preferences: string;
}

interface JobListing {
  job_title: string;
  company: string;
  location: string;
  details_link?: string;
  match_score: number;
  reason: string;
  // Optionally, keep legacy/extra fields for compatibility
  // title?: string;
  // company_name?: string;
  // description?: string;
  // apply_options?: { title: string; link: string }[];
  // job_id?: string;
}

interface JobSearchPaginatedResponse {
  jobs: JobListing[];
  remaining: JobListing[];
  next_page_token: string | null;
  has_more: boolean;
  error?: string | null;
} // For paginated response

const JobSearch: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobPreferences, setJobPreferences] = useState<JobPreference>({
    job_title_keywords: '',
    industry: [],
    location: '',
    employment_type: [],
    experience_level: '',
    salary_min: null,
    salary_max: null,
    remote_preference: 'No preference',
    company_preferences: '',
    additional_preferences: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
const [remaining, setRemaining] = useState<JobListing[]>([]);

const [hasMore, setHasMore] = useState<boolean>(false);
const [searchResultsError, setSearchResultsError] = useState<string | null>(null);

  // ...rest of the component

  // Helper to format preferences for display


  // Render search results
  const renderSearchResults = () => {
    if (searchResultsError) {
      return (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-red-600 font-semibold">{searchResultsError}</div>
        </div>
      );
    }
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800">Job Search Results</h2>
        <button
          onClick={() => { setStep(2); }}
          className="btn-secondary"
        >
          Modify Search
        </button>
        {jobs.length === 0 ? (
          <div className="mt-4 text-gray-500">No jobs found.</div>
        ) : (
          <div className="grid gap-6 mt-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-white shadow-md rounded-lg p-6 border border-gray-200 relative mb-4">
                <div className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Match: {job.match_score}/10
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{job.job_title}</h3>
                <p className="text-gray-600 mb-2">{job.company}</p>
                <p className="text-sm text-gray-500 mb-2 italic">Reason: {job.reason}</p>
                <p className="text-xs text-gray-400 mb-2">Location: {job.location}</p>
                {job.details_link ? (
                  <a
                    href={job.details_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    View Job Listing
                  </a>
                ) : (
                  <span className="inline-flex items-center text-gray-400 cursor-not-allowed">No Link Available</span>
                )}
              </div>
            ))}
          </div>
        )}
        {(hasMore || remaining.length > 0) && (
          <button
            onClick={handleLoadMore}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none"
            disabled={isLoading || (remaining.length === 0 && !hasMore)}
          >
            {isLoading ? <LoadingSpinner /> : 'Load More'}
          </button>
        )}
      </div>
    );
  };

  const handleLoadMore = () => {
    if (remaining.length > 0) {
      setJobs(prev => [...prev, ...remaining.slice(0, 8)]);
      setRemaining(prev => prev.slice(8));
    } else if (hasMore) {
      handleSubmit(true);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[JobSearch] Resume upload input changed:', e.target.files);

    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('[JobSearch] File selected:', files[0]);
      setResumeFile(files[0]);
      if (files[0].type !== 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setResumeText(event.target.result);
            console.log('[JobSearch] Resume text loaded from file:', event.target.result?.slice(0, 200));
          }
        };
        reader.readAsText(files[0]);
      } else {
        setResumeText('');
        console.log('[JobSearch] PDF file uploaded; resume text input cleared.');
      }
    }
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    console.log('[JobSearch] Preference changed:', e.target.name, e.target.value);
    const { name, value, type } = e.target;

    if (type === 'select-multiple') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
      setJobPreferences(prev => ({
        ...prev,
        [name]: selectedOptions
      }));
    } else if (name === 'salary_min' || name === 'salary_max') {
      const numValue = value === '' ? null : parseInt(value, 10);
      setJobPreferences(prev => ({
        ...prev,
        [name]: isNaN(numValue as number) ? null : numValue
      }));
    } else {
      setJobPreferences(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (broadenSearch: boolean = false, pageToken?: string) => {
    console.log('[JobSearch] handleSubmit called. Broaden search:', broadenSearch);
    if (!resumeFile && !resumeText.trim()) {
      setError('Please upload a resume file or paste your resume text.');
      return;
    }
    if (!jobPreferences.job_title_keywords.trim()) {
      setError('Please enter your desired Job Title or Keywords.');
      return;
    }
    if (!jobPreferences.location.trim()) {
      setError('Please enter your preferred Location.');
      return;
    }

    setIsLoading(true);
    console.log('[JobSearch] Submitting search with preferences:', jobPreferences, 'Resume file:', !!resumeFile, 'Resume text:', resumeText.slice(0, 100));
    setError('');
    setJobs(pageToken ? jobs : []); // If loading more, append; else reset
    // setNextPageToken removed (no longer needed)null);
    setHasMore(false);
    setSearchResultsError(null);

    // Prepare request for new /api/job-search endpoint
    const reqBody: any = {
      resume_text: resumeText,
      preferences: jobPreferences,
    };
    if (pageToken) reqBody.next_page_token = pageToken;

    try {
      const response = await axios.post<JobSearchPaginatedResponse>('/api/job-search', reqBody);
      const resp = response.data;
      setJobs(resp.jobs || []);
      setRemaining(resp.remaining || []);
      // setNextPageToken removed (no longer needed)resp.next_page_token || null);
      setHasMore(resp.has_more || false);
      setSearchResultsError(resp.error || null);
      setStep(3);
    } catch (err: any) {
      console.error('[JobSearch] Job search error:', err);
      let errorMessage = 'An error occurred during the job search.';
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.detail || err.response.data?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSearchResultsError(errorMessage);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => {
    const stages = ['Upload Resume', 'Job Preferences', 'Search Results'];
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              1
            </div>
            <span>{stages[0]}</span>
          </div>
          <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              2
            </div>
            <span>{stages[1]}</span>
          </div>
          <div className={`h-0.5 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>
              3
            </div>
            <span>{stages[2]}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderResumeUpload = () => {
    return (
      <div>
        <div className="mb-6">
          <label htmlFor="resume-file-input" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume
          </label>
          <input
            id="resume-file-input"
            name="resume-file-input"
            type="file"
            accept=".pdf,.txt"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onChange={handleResumeUpload}
          />
          <p className="text-xs text-gray-500">PDF or TXT up to 10MB</p>
          {resumeFile && (
            <p className="mt-2 text-sm text-green-600">
              Resume file uploaded: {resumeFile.name}
            </p>
          )}
        </div>
        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">OR</span>
          </div>
        </div>
        {/* Text Area Input */}
        <div className="mb-6">
          <label htmlFor="resume-text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Paste Resume Text
          </label>
          <textarea
            id="resume-text-input"
            name="resume-text-input"
            rows={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            disabled={!!resumeFile}
          ></textarea>
          {resumeFile && (
            <p className="mt-1 text-xs text-gray-500">Resume text input disabled because a file was uploaded.</p>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {/* Navigation */}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => {
              if (!resumeFile && !resumeText.trim()) {
                setError('Please upload a resume file or paste resume text.');
                return;
              }
              setError('');
              setStep(2);
            }}
            disabled={!resumeFile && !resumeText.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next: Preferences
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderProgressBar()}
      {step === 1 && renderResumeUpload()}
      {step === 2 && (
        <JobSearchPreferencesForm
          jobPreferences={jobPreferences}
          isLoading={isLoading}
          onChange={handlePreferenceChange}
          onBack={() => setStep(1)}
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        />
      )}
      {step === 3 && renderSearchResults()}
    </div>
  );
};

export default JobSearch;
