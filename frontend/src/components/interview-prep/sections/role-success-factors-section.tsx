"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInterviewPrepStore } from "../store/interview-prep-store"

interface EvaluatedRequirementItem {
  text: string;
  met: boolean;
  explanation?: string;
  resume_evidence?: string;
}

interface RoleSuccessFactorsSectionProps {
  data: {
    must_haves?: EvaluatedRequirementItem[];
    nice_to_haves?: EvaluatedRequirementItem[];
    job_duties?: string[]; // Kept for data model consistency, though not directly used in rendering
    qualifications?: string[]; // Kept for data model consistency
    overall_readiness?: string;
    focus_recommendations?: string[];
  } | null;
  // viewMode: ViewMode; // Removed as it's not currently used
}

export default function RoleSuccessFactorsSection({ data }: RoleSuccessFactorsSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(3)
  }, [markStepComplete])

  if (!data) {
    return null
  }

  const {
    must_haves = [],
    nice_to_haves = [],
    // job_duties and qualifications are no longer rendered directly,
    // their evaluated counterparts are shown in must_haves and nice_to_haves.
    // We keep them in props for potential future use or if data model expects them.
    // job_duties = [], 
    // qualifications = [],
    overall_readiness = "",
    focus_recommendations = [],
  } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Role Success Factors</h1>
        {overall_readiness && <p className="text-gray-700 mb-4">{overall_readiness}</p>}
      </div>

      {must_haves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Must-Have Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {must_haves.map((item, idx) => (
              <div key={idx} className="p-3 border rounded-md bg-white shadow-sm">
                <div className="flex items-start mb-1">
                  {item.met ? (
                    <span className="text-green-600 mr-2 text-lg">✓</span> // Larger checkmark
                  ) : (
                    <span className="text-red-600 mr-2 text-lg">✗</span> // Larger X
                  )}
                  <p className="font-semibold flex-1">{item.text}</p>
                </div>
                {item.explanation && <p className="text-sm text-gray-700 ml-8 mb-1 italic">{item.explanation}</p>}
                {item.resume_evidence && item.resume_evidence.toLowerCase() !== "no direct evidence found in resume." && (
                  <div className="ml-8 mt-1">
                    <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      <strong>Resume Evidence:</strong> {item.resume_evidence}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {nice_to_haves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nice-to-Have Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nice_to_haves.map((item, idx) => (
              <div key={idx} className="p-3 border rounded-md bg-white shadow-sm">
                <div className="flex items-start mb-1">
                  {item.met ? (
                    <span className="text-blue-600 mr-2 text-lg">✓</span> // Using a consistent check, color indicates nice-to-have fit
                  ) : (
                    <span className="text-yellow-600 mr-2 text-lg">?</span> // Question mark for potential gap
                  )}
                  <p className="font-semibold flex-1">{item.text}</p>
                </div>
                {item.explanation && <p className="text-sm text-gray-700 ml-8 mb-1 italic">{item.explanation}</p>}
                {item.resume_evidence && item.resume_evidence.toLowerCase() !== "no direct evidence found in resume." && (
                  <div className="ml-8 mt-1">
                    <p className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                      <strong>Resume Evidence:</strong> {item.resume_evidence}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {focus_recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Focus Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {focus_recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
