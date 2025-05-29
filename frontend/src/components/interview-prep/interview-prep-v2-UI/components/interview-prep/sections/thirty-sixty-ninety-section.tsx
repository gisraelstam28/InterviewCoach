"use client"

import { useEffect } from "react"
import PremiumGate from "@/components/interview-prep/ui/premium-gate"
import { useInterviewPrepStore } from "../../../store/interview-prep-store";

// ThirtySixtyNinetySectionType is missing from types, this section is part of offer negotiation which is being removed.

interface ThirtySixtyNinetySectionProps {
  // data: any; // Data prop removed as its type is missing and section content is disabled
}

export const ThirtySixtyNinetySection: React.FC<ThirtySixtyNinetySectionProps> = () => {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    // Assuming step 9 was for this section.
    // If this step is entirely removed from the flow, this effect might also need removal.
    markStepComplete(9)
  }, [markStepComplete])

  return (
    <PremiumGate isPremiumRequired={true}> {/* Assuming this section was premium, or adjust as needed */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">30-60-90 Day Plan</h2>
        <p className="text-gray-500">This section is currently unavailable.</p>
      </div>
    </PremiumGate>
  );
}
