import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";

interface InsiderCheatSheetSectionProps {
  data: any;
  viewMode: ViewMode;
}

export default function InsiderCheatSheetSection({ data, viewMode }: InsiderCheatSheetSectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
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
