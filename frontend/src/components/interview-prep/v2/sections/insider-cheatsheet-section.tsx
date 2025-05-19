import { useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Old store hook
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store

interface InsiderCheatSheetSectionProps {
  data: any;
}

export default function InsiderCheatSheetSection({ data }: InsiderCheatSheetSectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store();
  useEffect(() => {
    markStepComplete(10);
  }, [markStepComplete]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Insider Cheat Sheet (v2)</h2>
      {/* TODO: render insider cheat sheet content */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
