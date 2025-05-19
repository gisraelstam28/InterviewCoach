import { useState, useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../../store/interview-prep-store"; // Original old store import
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store

const DEBOUNCE_DELAY = 500; // milliseconds

export default function JobDetailsSection() {
  const storeInstance = useInterviewPrepV3Store();
  console.log('[JobDetailsSection] Raw store instance from useInterviewPrepV3Store():', storeInstance);
  // Note: To see all state and actions, you might need to access storeInstance.getState() if not directly on the instance
  // For Zustand, actions are usually directly on the object returned by the hook.
  console.log('[JobDetailsSection] Keys of raw store instance:', Object.keys(storeInstance));
  console.log('[JobDetailsSection] storeInstance.setCompanyName directly:', storeInstance.setCompanyName);
  console.log('[JobDetailsSection] storeInstance.setIndustry directly:', storeInstance.setIndustry);

  const {
    jobDescription: storeJobDescription,
    setJobDescription,
    companyName: storeCompanyName,
    setCompanyName,
    industry,
    setIndustry,
    // languageComplexity, // TODO: Add to store or remove from component
    // setLanguageComplexity, // TODO: Add to store or remove from component
  } = storeInstance;

  console.log('[JobDetailsSection] typeof setCompanyName after destructuring:', typeof setCompanyName);
  console.log('[JobDetailsSection] typeof setIndustry after destructuring:', typeof setIndustry);

  const [localJobDescription, setLocalJobDescription] = useState(storeJobDescription);
  const [localCompanyName, setLocalCompanyName] = useState(storeCompanyName);
  const [localIndustry, setLocalIndustry] = useState(industry); // Added for local industry state

  // Sync local state if global state changes from elsewhere (e.g., initial load)
  useEffect(() => {
    setLocalJobDescription(storeJobDescription);
  }, [storeJobDescription]);

  useEffect(() => {
    setLocalCompanyName(storeCompanyName);
  }, [storeCompanyName]);

  // Sync local industry if global state changes
  useEffect(() => {
    setLocalIndustry(industry);
  }, [industry]);

  // Debounce job description updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localJobDescription !== storeJobDescription) {
        console.log('[JobDetailsSection] Debounced: Setting jobDescription in store:', localJobDescription);
        setJobDescription(localJobDescription);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [localJobDescription, storeJobDescription, setJobDescription]);

  // Debounce company name updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localCompanyName !== storeCompanyName) {
        console.log('[JobDetailsSection] Debounced: Setting companyName in store:', localCompanyName);
        setCompanyName(localCompanyName);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [localCompanyName, storeCompanyName, setCompanyName]);

  // Debounce industry updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localIndustry !== industry) { // 'industry' here is storeIndustry
        console.log('[JobDetailsSection] Debounced: Setting industry in store:', localIndustry);
        setIndustry(localIndustry);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [localIndustry, industry, setIndustry]);

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col gap-4 items-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Details</h2>
      <label className="block w-full">
        <span className="text-sm font-medium text-gray-700">Job Description</span>
        <textarea
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          placeholder="Paste the job description here"
          value={localJobDescription}
          onChange={e => setLocalJobDescription(e.target.value)}
          rows={5}
        />
      </label>
      <label className="block w-full">
        <span className="text-sm font-medium text-gray-700">Company Name</span>
        <input
          type="text"
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          placeholder="e.g. ExampleCorp"
          value={localCompanyName}
          onChange={e => setLocalCompanyName(e.target.value)}
        />
      </label>
      <label className="block w-full">
        <span className="text-sm font-medium text-gray-700">Industry</span>
        <select
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          value={localIndustry}
          onChange={e => setLocalIndustry(e.target.value)}
          required
        >
          <option value="">Select an industry</option>
          <option value="Technology">Technology</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Retail">Retail</option>
          <option value="Manufacturing">Manufacturing</option>
          <option value="Consulting">Consulting</option>
          <option value="Media">Media</option>
          <option value="Other">Other</option>
        </select>
      </label>
      
      {/* <label className="block w-full">
        <span className="text-sm font-medium text-gray-700">Language Complexity</span>
        <select
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          // value={languageComplexity} // TODO: Add to store or remove from component
          // onChange={e => setLanguageComplexity(e.target.value)} // TODO: Add to store or remove from component
        >
          <option value="Simple">Simple</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label> */}
    </div>
  );
}
