import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";

interface OfferNegotiationSectionProps {
  data: any;
  viewMode: ViewMode;
}

export default function OfferNegotiationSection({ data, viewMode }: OfferNegotiationSectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
  useEffect(() => {
    markStepComplete(12);
  }, [markStepComplete]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Offer Negotiation (v2)</h2>
      {/* TODO: render offer negotiation tips */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
