/*
import { Suspense } from "react"
import { notFound } from "next/navigation"
import StepContent from "@/components/interview-prep/step-content-new"
import StepSkeleton from "@/components/interview-prep/step-skeleton"

// Feature flag to enable/disable v2
// Hardcoded to true for testing in preview
const V2_ENABLED = true // process.env.NEXT_PUBLIC_INTERVIEW_PREP_V2_ENABLED === "true"

export default function StepPage({ params }: { params: { stepId: string } }) {
  // If v2 is disabled, return 404
  if (!V2_ENABLED) {
    notFound()
  }

  const stepId = Number.parseInt(params.stepId)

  // Validate step ID is between 0-10
  if (isNaN(stepId) || stepId < 0 || stepId > 10) {
    notFound()
  }

  return (
    <Suspense fallback={<StepSkeleton />}>
      <StepContent stepId={stepId} />
    </Suspense>
  )
}
*/
