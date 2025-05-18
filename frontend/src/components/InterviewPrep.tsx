import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useUser } from '../context/UserContext';
import MockInterview from './MockInterview';
import { InterviewPrepV2Guide, ResumeStructured, JDStructured } from '../types/interview-prep-v2';

const InterviewPrep = () => {
  // Premium restrictions removed for testing purposes
  const { isPremium } = useUser();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [prepResults, setPrepResults] = useState<InterviewPrepV2Guide | null>(null);
  const [showMockInterview, setShowMockInterview] = useState(false);

  // State for guide navigation
  const [currentPage, setCurrentPage] = useState(0);

  // Check if user has interview preps remaining
  // Premium restriction removed: all users have access for testing
  useEffect(() => {
    // No-op: allow all users
  }, []);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setResumeFile(files[0]);
      
      // Read file content for API
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setResumeText(event.target.result);
        }
      };
      reader.readAsText(files[0]); // Add call to read the file
    }
  }; // Add closing braces for onload and handleResumeUpload

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Premium restriction removed: allow all users to submit
    // if (!isPremium && interviewPrepsRemaining <= 0) {
    //   // setShowUpgrade(true);
    //   return;
    // }

    if (!resumeFile && !resumeText) {
      // setError('Please upload your resume');
      return;
    }

    if (!jobDescription) {
      // setError('Please enter the job description');
      return;
    }

    setIsLoading(true);
    // setError('');

    // Parse resume to structured JSON
    let parsedRes: ResumeStructured | null = null;
    try {
      const parsedResRes = await axios.post<ResumeStructured>(
        'http://localhost:8000/api/interview-v2/parse-resume',
        new URLSearchParams({ resume_text: resumeText }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      parsedRes = parsedResRes.data;
      console.log('Parsed resume:', parsedRes);
    } catch (parseErr) {
      console.error('Error parsing resume:', parseErr);
    }

    // Parse job description to structured JSON
    let parsedJd: JDStructured | null = null;
    try {
      const jdRes = await axios.post<JDStructured>(
        'http://localhost:8000/api/interview-v2/parse-jd',
        new URLSearchParams({ jd_text: jobDescription }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      parsedJd = jdRes.data;
      console.log('Parsed JD:', parsedJd);
    } catch (jdErr) {
      console.error('Error parsing job description:', jdErr);
    }

    // Ensure parsing succeeded before generating guide
    if (!parsedRes || !parsedJd) {
      console.error('Cannot generate guide: resume or JD parsing failed');
      setIsLoading(false);
      return;
    }

    try {
      // Send structured data to generate endpoint
      const response = await axios.post<InterviewPrepV2Guide>(
        'http://localhost:8000/api/interview-v2/generate',
        {
          resume_structured: parsedRes,
          job_description_structured: parsedJd,
          resume_text: resumeText,
          job_description: jobDescription,
          company_name: companyName,
          industry,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setPrepResults(response.data);
      setStep(3); // Move to results page
    } catch (err) {
      console.error('Error preparing interview:', err);
      // setError('An error occurred while preparing interview materials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 1 ? 'bg-purple-100' : 'bg-gray-100'}`}>
            1
          </div>
          <span>Resume</span>
        </div>
        <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 2 ? 'bg-purple-100' : 'bg-gray-100'}`}>
            2
          </div>
          <span>Job Details</span>
        </div>
        <div className={`h-0.5 w-16 ${step >= 3 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${step >= 3 ? 'bg-purple-100' : 'bg-gray-100'}`}>
            3
          </div>
          <span>Preparation</span>
        </div>
      </div>
    </div>
  );

  const renderResumeUpload = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Resume</h2>
      <p className="text-lg font-medium text-gray-600 mb-2 mb-6">
        We'll analyze your resume to create personalized interview preparation materials.
      </p>

      {!isPremium && (
        <div className="mb-6 p-3 bg-purple-50 rounded-lg flex items-center">
          <svg className="h-6 w-6 text-purple-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.25 12l2.846.813a4.5 4.5 0 0 1 3.09 3.09L22.75 18l-.813 2.846a4.5 4.5 0 0 1-3.09 3.09L18.25 24l-2.846-.813a4.5 4.5 0 0 1-3.09-3.09L11.5 18l.813-2.846a4.5 4.5 0 0 1 3.09-3.09L18.25 12Z" />
          </svg>
          <span className="text-sm text-purple-700 font-medium">Premium: Get feedback on unlimited answers and advanced analytics!</span>
          {/* <button onClick={() => setShowUpgrade(true)} className="ml-auto text-sm font-semibold text-purple-600 hover:text-purple-800">Upgrade Now</button> */}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 015.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Upload your resume</h3>
        <p className="mt-1 text-sm text-gray-500">Supported format: PDF (max 5MB)</p>
        <div className="mt-6">
          <div className="flex items-center justify-center">
            <label htmlFor="resume-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500 ${resumeFile ? 'hidden' : ''}`}>
              <span>Select a file</span>
              <input id="resume-upload" name="resume-upload" type="file" className="sr-only" accept=".pdf" onChange={handleResumeUpload} />
            </label>
            <div className={`flex items-center ${!resumeFile ? 'hidden' : ''}`}>
              <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700 mr-2">{resumeFile?.name}</span>
              <button
                onClick={() => { setResumeFile(null); setResumeText(''); }}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Next Button Container */}
      <div className="mt-6 flex justify-center">
        <button
          disabled={!resumeFile}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            resumeFile
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => setStep(2)}
        >
          Next: Job Details
        </button>
      </div>
    </div>
  );

  const renderJobDetails = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows={6}
            value={jobDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Company Name (Optional)
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={companyName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry (Optional)
          </label>
          <select
            id="industry"
            name="industry"
            value={industry}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading || !jobDescription}
            className={`relative px-4 py-2 rounded-md text-sm font-medium text-white flex items-center transition ${
              isLoading || !jobDescription
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Analyzing...' : 'Generate Prep'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPrepResults = () => {
    if (!prepResults) return null;

    const sectionKeys = [
      'section_0_welcome',
      'section_1_company_industry',
      'section_2_department_context',
      'section_3_role_success',
      'section_3b_jd_role_success',
      'section_4_fit_matrix',
      'section_5_star_story_bank',
      'section_6_technical_case_prep',
      'section_7_mock_interview',
      'section_8_insider_cheat_sheet',
      'section_9_thirty_sixty_ninety',
      'section_10_offer_negotiation',
      'export_share'
    ] as const;
    const sectionTitles: Record<typeof sectionKeys[number], string> = {
      section_0_welcome: 'Welcome & Navigation',
      section_1_company_industry: 'Company & Industry Snapshot',
      section_2_department_context: 'Department / Team Context',
      section_3_role_success: 'Role Success Factors',
      section_3b_jd_role_success: 'JD-Only Role Success',
      section_4_fit_matrix: 'Candidate Fit Matrix',
      section_5_star_story_bank: 'STAR Story Bank',
      section_6_technical_case_prep: 'Technical / Case Prep',
      section_7_mock_interview: 'Mock Interview & Feedback',
      section_8_insider_cheat_sheet: 'Insider Cheat Sheet',
      section_9_thirty_sixty_ninety: '30-60-90 Day Plan',
      section_10_offer_negotiation: 'Offer & Negotiation Tips',
      export_share: 'Export & Share'
    };

    const renderSectionContent = (pageIndex: number) => {
      const key = sectionKeys[pageIndex];
      const section = prepResults ? (prepResults as any)[key] : null;
      if (key === 'section_4_fit_matrix') {
        const rows = (section as any).rows;
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spin/Gap Fix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.job_requirement}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <ul className="list-disc list-inside">
                        {row.evidence.map((e: string, j: number) => <li key={j}>{e}</li>)}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.spin_or_gap_fix}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.color_code === 'green' ? 'bg-green-100 text-green-800' : row.color_code === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {row.color_code}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      if (key === 'section_5_star_story_bank') {
        const stories = (section as any).stories;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stories.map((story: any, idx: number) => (
              <div key={idx} className="p-4 border rounded-lg bg-white shadow">
                <h4 className="font-semibold text-purple-700 mb-2">{story.competency}</h4>
                <p className="text-sm"><strong>S:</strong> {story.situation}</p>
                <p className="text-sm"><strong>T:</strong> {story.task}</p>
                <p className="text-sm"><strong>A:</strong> {story.action}</p>
                <p className="text-sm mb-2"><strong>R:</strong> {story.result}</p>
                {story.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {story.tags.map((tag: string, j: number) => (
                      <span key={j} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">{tag}</span>
                    ))}
                  </div>
                )}
                {story.evidence?.length > 0 && (
                  <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-600">
                    “{story.evidence[0]}”
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        );
      }
      if (key === 'section_6_technical_case_prep') {
        const prompts = (section as any).prompts;
        return (
          <div className="space-y-4">
            {prompts.map((p: any, i: number) => (
              <div key={i} className="p-4 border rounded bg-white shadow">
                <h4 className="font-semibold mb-2">{p.prompt}</h4>
                <p className="text-sm text-gray-700 mb-2"><strong>Answer:</strong> {p.gold_standard_answer}</p>
                {p.resource_links?.length > 0 && (
                  <div>
                    <strong>Resources:</strong>{' '}
                    {p.resource_links.map((url: string, j: number) => (
                      <a key={j} href={url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline mr-2">{url}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
      return <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(section, null, 2)}</pre>;
    };

    return (
      <div className="bg-white shadow rounded-lg p-6 mt-8 flex gap-6">
        {/* Table of Contents (Sidebar) */}
        <div className="w-1/4 border-r pr-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 sticky top-4">Guide Sections</h3>
          <nav className="space-y-2 sticky top-16">
            {sectionKeys.map((key, index) => (
              <button
                key={key}
                onClick={() => setCurrentPage(index)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out ${currentPage === index
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {index + 1}. {sectionTitles[key]}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="w-3/4 pl-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{sectionTitles[sectionKeys[currentPage]]}</h2>
          
          {/* Section specific content */}
          <div className="prose max-w-none prose-purple">
            {renderSectionContent(currentPage)}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium shadow hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-500">Page {currentPage + 1} of {sectionKeys.length}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(sectionKeys.length - 1, prev + 1))}
              disabled={currentPage === sectionKeys.length - 1}
              className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium shadow hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main component return statement
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-100 flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-2xl mx-auto">
        <header className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" className="text-purple-600"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Interview Assistant</h1>
          </div>
          <div className="text-base text-gray-500">Personalized interview preparation powered by AI</div>
        </header>
        <main>
          {showMockInterview ? (
            <div>
              <button 
                onClick={() => setShowMockInterview(false)}
                className="mb-4 px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Preparation
              </button>
              <MockInterview 
                isPremium={isPremium}
                jobDescription={jobDescription}
                resumeText={resumeText}
                companyName={companyName}
                initialQuestion="Tell me about yourself."
              />
            </div>
          ) : (
            <div>
              {renderProgressBar()} 
              <div className="space-y-8">
                {step === 1 && renderResumeUpload()}
                {step === 2 && renderJobDetails()}
                {step === 3 && renderPrepResults()}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InterviewPrep;
