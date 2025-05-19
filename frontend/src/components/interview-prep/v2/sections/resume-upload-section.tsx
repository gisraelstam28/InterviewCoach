import React from "react";
import { useForm } from "react-hook-form";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Original old store import
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store

export default function ResumeUploadSection() {
  const { setResumeFile } = useInterviewPrepV3Store(); // Use setResumeFile from V3 store
  const [fileName, setFileName] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  // react-hook-form setup
  const { register, setValue, formState: { errors } } = useForm<{ resume: FileList }>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        setFileName("");
        console.log('[ResumeUploadSection] Clearing resume in store (handleFileChange error)');
        setResumeFile(null);
        setValue("resume", null as any);
        return;
      }
      setFileName(file.name);
      setError(null);
      console.log('[ResumeUploadSection] Setting resume in store with file name:', file.name);
      setResumeFile(file); // Set resume in main store with file name (temporary)
      setValue("resume", files);
    }
  };

  const handleRemove = () => {
    setFileName("");
    console.log('[ResumeUploadSection] Clearing resume in store (handleRemove)');
    setResumeFile(null); // Clear resume in main store
    setError(null);
    setValue("resume", null as any);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Your Resume (PDF)</h2>
      <input
        type="file"
        accept=".pdf"
        className="mb-3"
        {...register("resume", { required: "Please upload your resume (PDF)", validate: {
          isPdf: (files) => {
            if (!files || files.length === 0) return "Please upload your resume (PDF)";
            return files[0].type === "application/pdf" || "Only PDF files are allowed.";
          },
        } })}
        onChange={handleFileChange}
      />
      {fileName && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-green-700 font-medium">{fileName}</span>
          <button
            className="text-xs text-red-600 hover:underline ml-2"
            onClick={handleRemove}
            type="button"
          >
            Remove
          </button>
        </div>
      )}
      {(error || errors.resume) && <div className="text-red-600 text-sm mb-2">{error || errors.resume?.message}</div>}
      <p className="text-xs text-gray-500 mb-4">PDF only, up to 10MB.</p>

      {/* Fallback textarea for parse errors (hidden by default, to be toggled on error) */}
      {/* <Collapse in={showFallbackTextarea}>
        <Textarea ... />
      </Collapse> */}
    </div>
  );
}
