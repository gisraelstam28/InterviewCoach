import { useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Old store hook
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store

interface ThirtySixtyNinetySectionProps {
  data: any;
}

export default function ThirtySixtyNinetySection({ data }: ThirtySixtyNinetySectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store();
  useEffect(() => {
    markStepComplete(11);
  }, [markStepComplete]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">30-60-90 Day Plan (v2)</h2>
      {/* TODO: render 30-60-90 day plan */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
