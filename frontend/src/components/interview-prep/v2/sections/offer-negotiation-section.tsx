import { useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Old store hook
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store

interface OfferNegotiationSectionProps {
  data: any;
}

export default function OfferNegotiationSection({ data }: OfferNegotiationSectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store();
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
