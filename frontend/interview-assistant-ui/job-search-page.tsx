"use client"

import { useState } from "react"
import JobPreferencesForm from "./job-preferences-form"
import type { InterviewPrepV2Guide, GenerateInterviewPrepRequest } from "./types"

export default function JobSearchPage() {
  const [step, setStep] = useState(1)
  const [resumeText, setResumeText] = useState("")
  const [jobPreferences, setJobPreferences] = useState<any | null>(null)
  const [results, setResults] = useState<InterviewPrepV2Guide | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [tempResumeText, setTempResumeText] = useState(""); // Temporary state for step 1 textarea

  const handleResumeUpload = (text: string) => {
    setResumeText(text)
    setStep(2)
  }

  const handleJobPreferencesSubmit = async (preferences: any) => {
    setJobPreferences(preferences)
    setIsLoading(true)
    setError("")
    setResults(null)

    const payload: GenerateInterviewPrepRequest = {
      raw_resume_text: resumeText,
      resume_structured: {},
      jd_structured: {
        role_title: preferences.jobTitle || null,
        company_details: {
          company_name: null,
          industry: preferences.industry?.[0] || null,
          company_overview: null,
        },
        requirements: [],
        responsibilities: [],
      },
      company_name: null,
      industry: preferences.industry?.[0] || null,
      job_description: null,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/interview-v2/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: InterviewPrepV2Guide = await response.json();
      setResults(data);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the interview prep guide. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className={`ml-2 text-sm font-medium ${step >= 1 ? "text-blue-600" : "text-gray-600"}`}>
                Resume Upload
              </div>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div className={`ml-2 text-sm font-medium ${step >= 2 ? "text-blue-600" : "text-gray-600"}`}>
                Job Preferences
              </div>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <div className={`ml-2 text-sm font-medium ${step >= 3 ? "text-blue-600" : "text-gray-600"}`}>Results</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* START: Added simple UI for Step 1: Resume Upload */}
          {step === 1 && (
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Step 1: Provide Your Resume</h2>
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition mb-4"
                placeholder="Paste your resume text here..."
                value={tempResumeText}
                onChange={(e) => setTempResumeText(e.target.value)}
              />
              <button
                onClick={() => handleResumeUpload(tempResumeText)}
                disabled={!tempResumeText.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
              >
                Next: Job Preferences
              </button>
            </div>
          )}
          {/* END: Added simple UI for Step 1 */}

          {step === 2 && <JobPreferencesForm onSubmit={handleJobPreferencesSubmit} onBack={handleBack} />}

          {/* START: Added section for displaying Interview Prep Guide */}
          {step === 3 && results && !isLoading && !error && (
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Your Interview Prep Guide</h2>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Back
                </button>
              </div>

              {/* Section 0: Welcome & Navigation */}
              {results.section_0_welcome && (
                <div className="mb-8 p-5 bg-sky-50 rounded-xl shadow">
                  <h3 className="text-xl font-semibold text-sky-800 mb-3">🎯 Welcome & Navigation</h3>
                  {results.section_0_welcome.introduction && (
                    <p className="text-sky-700 mb-2 whitespace-pre-line">{results.section_0_welcome.introduction}</p>
                  )}
                  {results.section_0_welcome.tell_me_about_yourself && (
                    <>
                      <h4 className="text-md font-semibold text-sky-700 mt-3 mb-1">Tell Me About Yourself (Tailored):</h4>
                      <p className="text-sky-700 whitespace-pre-line">{results.section_0_welcome.tell_me_about_yourself}</p>
                    </>
                  )}
                </div>
              )}

              {/* Section 1: Company & Industry Snapshot */}
              {results.section_1_company_industry && (
                <div className="mb-8 p-5 bg-amber-50 rounded-xl shadow">
                  <h3 className="text-xl font-semibold text-amber-800 mb-3">🏢 Company & Industry Snapshot</h3>
                  {results.section_1_company_industry.company_overview && (
                    <>
                      <h4 className="text-md font-semibold text-amber-700 mt-3 mb-1">Company Overview:</h4>
                      <p className="text-amber-700 whitespace-pre-line">{results.section_1_company_industry.company_overview}</p>
                    </>
                  )}
                  {results.section_1_company_industry.recent_news && results.section_1_company_industry.recent_news.length > 0 && (
                    <>
                      <h4 className="text-md font-semibold text-amber-700 mt-4 mb-2">Recent News:</h4>
                      <ul className="list-disc list-inside space-y-2">
                        {results.section_1_company_industry.recent_news.map((newsItem, index) => (
                          <li key={index} className="text-amber-700">
                            <a href={newsItem.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">{newsItem.title}</a>
                            {newsItem.summary && <p className="text-sm text-amber-600 ml-4">{newsItem.summary}</p>}
                            {newsItem.so_what && <p className="text-sm text-amber-600 font-semibold ml-4">So what? {newsItem.so_what}</p>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {results.section_1_company_industry.industry_drivers && results.section_1_company_industry.industry_drivers.length > 0 && (
                     <>
                      <h4 className="text-md font-semibold text-amber-700 mt-4 mb-2">Industry Drivers:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.section_1_company_industry.industry_drivers.map((driver, index) => (
                          <li key={index} className="text-amber-700">{driver}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              
              {/* Debug: Display raw JSON */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Raw API Response (for debugging):</h4>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            </div>
          )}
          {/* END: Added section */}

          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for the perfect jobs for you...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <button
                onClick={() => handleJobPreferencesSubmit(jobPreferences)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
