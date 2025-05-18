import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";

interface ThirtySixtyNinetySectionProps {
  data: any;
  viewMode: ViewMode;
}

export default function ThirtySixtyNinetySection({ data, viewMode }: ThirtySixtyNinetySectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
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
