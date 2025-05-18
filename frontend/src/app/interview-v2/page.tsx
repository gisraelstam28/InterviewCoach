import { redirect } from "next/navigation"

// Feature flag to enable/disable v2
// Hardcoded to true for testing in preview
const V2_ENABLED = true // process.env.NEXT_PUBLIC_INTERVIEW_PREP_V2_ENABLED === "true"

export default function InterviewPrepHomePage() {
  // Redirect to the first step
  if (V2_ENABLED) {
    redirect("/interview-v2/step/0")
  }

  // If v2 is disabled, show a message
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Interview Prep v2</h1>
      <p className="text-gray-600 mb-8">This feature is currently disabled. Please check back later.</p>
    </div>
  )
}
