import { useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Old store hook
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { RoleUnderstandingFitAssessmentSectionData as FitMatrixModel } from "../../../../types/interview-prep-v2";

interface CandidateFitMatrixSectionProps {
  data: FitMatrixModel;
}

export default function CandidateFitMatrixSection({ data }: CandidateFitMatrixSectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store();
  useEffect(() => {
    markStepComplete(6); // Corresponds to section_4_role_understanding_fit_assessment if guide steps are 0-indexed for sections 1-N
  }, [markStepComplete]);

  // Ensure data is not null or undefined before trying to access its properties
  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Role Understanding & Fit Assessment</h1>
        <p className="text-gray-600">Loading data or data not available...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Role Understanding & Fit Assessment</h1>
      
      {data.role_summary && (
        <Card>
          <CardHeader><CardTitle>Role Summary</CardTitle></CardHeader>
          <CardContent><p>{data.role_summary}</p></CardContent>
        </Card>
      )}

      {data.key_responsibilities_summary && data.key_responsibilities_summary.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Key Responsibilities Summary</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {data.key_responsibilities_summary.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {data.overall_fit_rating && (
        <Card>
          <CardHeader><CardTitle>Overall Fit Rating</CardTitle></CardHeader>
          <CardContent><p>{data.overall_fit_rating}</p></CardContent>
        </Card>
      )}

      {data.fit_assessment_details && (
        <Card>
          <CardHeader><CardTitle>Fit Assessment Details</CardTitle></CardHeader>
          <CardContent><p>{data.fit_assessment_details}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
