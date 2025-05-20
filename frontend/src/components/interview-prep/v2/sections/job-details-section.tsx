import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
// import { useInterviewPrepStore } from "../../../../../store/interview-prep-store"; // Original old store import
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store

// Define the type for the exposed ref methods
export interface JobDetailsSectionRef {
  commitLocalChangesToStore: () => void;
}

const JobDetailsSection = forwardRef<JobDetailsSectionRef>((_props, ref) => {
  const storeJobDescription = useInterviewPrepV3Store(state => state.jobDescription);
  const setJobDescription = useInterviewPrepV3Store(state => state.setJobDescription);
  const storeCompanyName = useInterviewPrepV3Store(state => state.companyName);
  const setCompanyName = useInterviewPrepV3Store(state => state.setCompanyName);
  // const languageComplexity = useInterviewPrepV3Store(state => state.languageComplexity); // TODO: Add to store or remove if not used
  // const setLanguageComplexity = useInterviewPrepV3Store(state => state.setLanguageComplexity); // TODO: Add to store or remove if not used

  const [localJobDescription, setLocalJobDescription] = useState(storeJobDescription);
  const [localCompanyName, setLocalCompanyName] = useState(storeCompanyName);

  // Sync local state if global state changes from elsewhere (e.g., initial load)
  useEffect(() => {
    setLocalJobDescription(storeJobDescription);
  }, [storeJobDescription]);

  useEffect(() => {
    setLocalCompanyName(storeCompanyName);
  }, [storeCompanyName]);



  const commitLocalChangesToStore = () => {
    console.log('[JobDetailsSection] Committing local changes to store:', { localJobDescription, localCompanyName });
    if (localJobDescription !== storeJobDescription) {
      setJobDescription(localJobDescription);
    }
    if (localCompanyName !== storeCompanyName) {
      setCompanyName(localCompanyName);
    }
  };

  // Expose the commit function via ref
  useImperativeHandle(ref, () => ({
    commitLocalChangesToStore,
  }));

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
          onBlur={() => { if (localJobDescription !== storeJobDescription) setJobDescription(localJobDescription); }}
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
          onBlur={() => { if (localCompanyName !== storeCompanyName) setCompanyName(localCompanyName); }}
        />
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
});

export default JobDetailsSection;
