import React, { useEffect } from "react";
import type { ViewMode } from "@/store/interview-prep-store";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyIndustrySectionProps {
  data: any;
  viewMode: ViewMode;
}

export default function CompanyIndustrySection({ data, viewMode }: CompanyIndustrySectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
  useEffect(() => {
    markStepComplete(3);
  }, [markStepComplete]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Company & Industry Analysis</h1>
      <p className="text-gray-600">Understanding the company and its industry position will help you contextualize your interview responses.</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.company_overview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
            <CardDescription>Stay up to date with the latest company developments</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.recent_news.map(item => (
                <li key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 p-2 -m-2 rounded transition-colors">
                    <h3 className="font-medium text-blue-600 hover:underline">{item.headline}</h3>
                    <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Drivers</CardTitle>
            <CardDescription>Key trends affecting the company's market position</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {data.industry_drivers.map((driver, idx) => (
                <li key={idx}>{driver}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
