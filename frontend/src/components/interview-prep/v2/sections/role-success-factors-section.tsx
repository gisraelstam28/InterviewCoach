import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { RoleSuccessFactorsSection as RoleSuccessModel } from "@/types/interview-prep-v2";

interface RoleSuccessFactorsSectionProps {
  data: RoleSuccessModel;
  viewMode: ViewMode;
}

export default function RoleSuccessFactorsSection({ data, viewMode }: RoleSuccessFactorsSectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
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
                <li key={idx}>{item}</li>
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
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
