import { Suspense } from "react"
import ExportShareSection from "@/components/interview-prep/sections/export-share-section"

// Feature flag to enable/disable v2
// Hardcoded to true for testing in preview
const V2_ENABLED = true // process.env.NEXT_PUBLIC_INTERVIEW_PREP_V2_ENABLED === "true"

export default function ExportPage() {
  // If v2 is disabled, return 404
  if (!V2_ENABLED) {
    return <div>Feature not available</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense fallback={<div>Loading export options...</div>}>
        <ExportShareSection />
      </Suspense>
    </div>
  )
}
