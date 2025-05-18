import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { CandidateFitMatrixSection as FitMatrixModel, FitMatrixRow } from "@/types/interview-prep-v2";

interface CandidateFitMatrixSectionProps {
  data: FitMatrixModel;
  viewMode: ViewMode;
}

export default function CandidateFitMatrixSection({ data, viewMode }: CandidateFitMatrixSectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
  useEffect(() => {
    markStepComplete(6);
  }, [markStepComplete]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Candidate Fit Matrix</h1>
      <p className="text-gray-600">Compare your evidence to job requirements and identify gaps to prep your narrative.</p>

      <Card>
        <CardHeader>
          <CardTitle>Fit Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="min-w-full text-left divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2">Requirement</th>
                  <th className="px-4 py-2">Your Evidence</th>
                  <th className="px-4 py-2">Spin / Gap Fix</th>
                  <th className="px-4 py-2">Fit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.rows.map((row: FitMatrixRow, idx: number) => (
                  <tr
                    key={idx}
                    className={
                      row.color_code === 'green'
                        ? 'bg-green-50'
                        : row.color_code === 'yellow'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }
                  >
                    <td className="px-4 py-2">{row.job_requirement}</td>
                    <td className="px-4 py-2">{row.your_evidence}</td>
                    <td className="px-4 py-2">{row.spin_or_gap_fix}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          `inline-block px-2 py-1 rounded text-white ` +
                          (row.color_code === 'green'
                            ? 'bg-green-600'
                            : row.color_code === 'yellow'
                            ? 'bg-yellow-600'
                            : 'bg-red-600')
                        }
                      >
                        {row.color_code.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
