import { useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Old store hook
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { RoleSuccessFactorsSection as RoleSuccessModel } from "@/types/interview-prep-v2";

interface RoleSuccessFactorsSectionProps {
  data: RoleSuccessModel;
}

export default function RoleSuccessFactorsSection({ data }: RoleSuccessFactorsSectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store();
  useEffect(() => {
    markStepComplete(4);
  }, [markStepComplete]);
  useEffect(() => {
    console.log('RoleSuccessFactorsSection data:', data);
  }, [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Role Success Factors</h1>
      <p className="text-gray-600">Key skills and requirements for success in this role.</p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Must-Haves</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {data.must_haves.map((item, idx) => (
                <li key={idx} className="p-3 border rounded-md bg-white shadow-sm mb-2 last:mb-0">
                  <div className="flex items-start mb-1">
                    {item.met ? (
                      <span className="text-green-600 mr-2 text-lg">✓</span>
                    ) : (
                      <span className="text-red-600 mr-2 text-lg">✗</span>
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
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nice-to-Haves</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {data.nice_to_haves.map((item, idx) => (
                <li key={idx} className="p-3 border rounded-md bg-white shadow-sm mb-2 last:mb-0">
                  <div className="flex items-start mb-1">
                    {item.met ? (
                      <span className="text-blue-600 mr-2 text-lg">✓</span>
                    ) : (
                      <span className="text-yellow-600 mr-2 text-lg">?</span>
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
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
