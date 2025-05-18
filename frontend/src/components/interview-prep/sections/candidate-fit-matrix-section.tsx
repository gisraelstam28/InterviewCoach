import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInterviewPrepStore } from "../interview-prep-v2-UI/store/interview-prep-store"

interface RoleUnderstandingFitAssessmentData {
  role_summary?: string;
  key_responsibilities_summary?: string[];
  overall_fit_rating?: string;
  fit_assessment_details?: string;
}

interface RoleUnderstandingFitAssessmentSectionProps {
  data: RoleUnderstandingFitAssessmentData | null | undefined;
}

export default function RoleUnderstandingFitAssessmentSection({ data }: RoleUnderstandingFitAssessmentSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    // Assuming step 4 corresponds to this section in the backend/store
    if (data && (data.role_summary || data.overall_fit_rating)) {
        markStepComplete(4)
    }
  }, [markStepComplete, data])

  const { 
    role_summary = "Not available", 
    key_responsibilities_summary = [], 
    overall_fit_rating = "Not available", 
    fit_assessment_details = "Not available" 
  } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Role Understanding & Fit Assessment</h1>
        <p className="text-gray-600 mb-6">
          Understand the core aspects of the role and how your profile aligns with its requirements.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{role_summary || "No summary provided."}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Responsibilities</CardTitle>
        </CardHeader>
        <CardContent>
          {key_responsibilities_summary && key_responsibilities_summary.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {key_responsibilities_summary.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">No key responsibilities listed.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overall Fit Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold text-gray-800">{overall_fit_rating || "No rating provided."}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Fit Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{fit_assessment_details || "No detailed assessment provided."}</p>
        </CardContent>
      </Card>
    </div>
  )
}
