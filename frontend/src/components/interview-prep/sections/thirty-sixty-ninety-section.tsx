"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import PremiumGate from "@/components/interview-prep/ui/premium-gate"
import type { ViewMode } from "@/store/interview-prep-store"
import { useInterviewPrepStore } from "../store/interview-prep-store"
import type { ThirtySixtyNinetySection as ThirtySixtyNinetySectionData } from "@/types/interview-prep-v2";

// The local OfferNegotiationSectionData interface seems to conflict with the one implicitly
// used by OfferNegotiationSection (which should now align with @/types/interview-prep-v2.ts).
// If this interface was specifically for ThirtySixtyNinetySection's data structure, it should be named accordingly.
// For now, assuming ThirtySixtyNinetySectionProps should use ThirtySixtyNinetySectionData type from the main types file.

interface ThirtySixtyNinetySectionProps {
  data?: ThirtySixtyNinetySectionData | null; // Use the imported type
  viewMode: ViewMode;
}


// mockData has been removed as it's no longer used.

export default function ThirtySixtyNinetySection({ data /*, viewMode */ }: ThirtySixtyNinetySectionProps) {
  if (!data) {
    console.error("ThirtySixtyNinetySection: 'data' prop is null or undefined.");
    // Optionally, mark step complete even if data is missing, if that's the desired behavior
    // const { markStepComplete } = useInterviewPrepStore();
    // useEffect(() => { markStepComplete(9); }, [markStepComplete]); 
    return null; // Or some fallback UI
  }
  // Ensure data prop is correctly typed if possible, e.g.:
  // interface ThirtySixtyNinetySectionProps {
  //   data: {
  //     premium_required?: boolean;
  //     thirty_sixty_ninety_plan?: string | null;
  //   } | null | undefined;
  //   viewMode: ViewMode;
  // }
  const { markStepComplete } = useInterviewPrepStore()

  console.log('[ThirtySixtyNinetySection] Component invoked. Data prop:', JSON.stringify(data));
  if (data) {
    console.log('[ThirtySixtyNinetySection] data.premium_required is:', data.premium_required);
  } else {
    console.log('[ThirtySixtyNinetySection] data prop is null or undefined before any specific access.');
  }

  useEffect(() => {
    markStepComplete(10) // This section corresponds to UI Step 10
  }, [markStepComplete])

  console.log('[ThirtySixtyNinetySection] About to access data.milestone_goals and data.premium_required.');
  // Use milestone_goals as the plan content. Adjust if another field or combination is preferred.
  const planContent = data?.milestone_goals && data.milestone_goals.length > 0 ? data.milestone_goals.join('\n- ') : null;
  const planDisplay = planContent ? `- ${planContent}` : null; 
  const isPremiumFeature = data?.premium_required ?? false;
  console.log('[ThirtySixtyNinetySection] Calculated isPremiumFeature:', isPremiumFeature, 'from data.premium_required:', data?.premium_required);

  // If there's no plan content AND it's not a premium feature (which would show the gate),
  // then render nothing. The step is marked complete by useEffect regardless.
  if (!planDisplay && !isPremiumFeature) {
    return null;
  }

  // If it IS a premium feature, PremiumGate will handle showing the gate or content.
  // If it's NOT premium BUT there IS a plan, it will show the content.
  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">30-60-90 Day Plan</h1>
        <p className="text-gray-600 mb-6">
          Impress your interviewer with a structured plan for your first three months on the job.
        </p>
      </div>

            {planDisplay ? (
        <Card>
          <CardHeader>
            <CardTitle>Your 30-60-90 Day Plan Highlights</CardTitle> {/* Title updated slightly */}
          </CardHeader>
          <CardContent>
            <div style={{ whiteSpace: 'pre-wrap' }}>{planDisplay}</div>
          </CardContent>
        </Card>
      ) : (
        // This fallback content is now primarily for the case where isPremiumFeature is true
        // but planFromTheBackend is null/empty. The PremiumGate would be shown.
        // If !isPremiumFeature and !planFromTheBackend, we return null above.
        <p className="text-gray-500 italic">
          The 30-60-90 day plan is a premium feature or is not currently populated.
        </p>
      )}
    </div>
  )

    // isPremiumFeature is already defined above
  console.log('[ThirtySixtyNinetySection] About to return PremiumGate. isPremiumFeature:', isPremiumFeature);
  return <PremiumGate isPremiumRequired={isPremiumFeature}>{content}</PremiumGate>
}
