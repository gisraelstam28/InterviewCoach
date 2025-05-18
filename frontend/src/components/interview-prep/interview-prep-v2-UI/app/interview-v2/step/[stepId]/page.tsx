import { Suspense } from "react"

// This is a simplified version of the page component that doesn't rely on Next.js features
// The actual functionality is handled by the React Router setup in App.tsx

export default function StepPage({ params }: { params: { stepId: string } }) {
  const stepId = Number.parseInt(params.stepId || '0')
  
  // Simple error message component instead of using Next.js notFound()
  const ErrorMessage = () => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-medium text-red-800">Invalid Step</h2>
      <p className="text-red-700 mt-1">The requested step is not available.</p>
    </div>
  )

  // Validate step ID is between 0-10
  if (isNaN(stepId) || stepId < 0 || stepId > 10) {
    return <ErrorMessage />
  }

  return (
    <div className="p-4">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
      <p className="mt-4 text-gray-500 text-sm">Loading step content...</p>
    </div>
  )
}
