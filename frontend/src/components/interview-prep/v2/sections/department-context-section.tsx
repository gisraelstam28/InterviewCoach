import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { DepartmentContextSection as DeptContextModel } from "@/types/interview-prep-v2";

interface DepartmentContextSectionProps {
  data: DeptContextModel;
  viewMode: ViewMode;
}

export default function DepartmentContextSection({ data, viewMode }: DepartmentContextSectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
  useEffect(() => {
    markStepComplete(4);
  }, [markStepComplete]);
  useEffect(() => {
    console.log('DepartmentContextSection data:', data);
  }, [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Department & Team Context</h1>
      <p className="text-gray-600">Get a sense of the team’s structure and objectives.</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Org Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded font-mono overflow-auto">{data.org_chart_mermaid}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OKRs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {data.okrs.map((okr, idx) => (
                <li key={idx}>{okr}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
