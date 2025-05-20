"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useInterviewPrepV3Store } from "../../../../../../store/interview-prep-v3-store";
import { useEffect } from "react"

import type { CompanyIndustrySection as CompanyIndustrySectionType } from "../../../../../../types/interview-prep-v2"

interface CompanyIndustrySectionProps {
  data: CompanyIndustrySectionType
}

export default function CompanyIndustrySection({ data }: CompanyIndustrySectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store()

  // Mark step as viewed/completed
  useEffect(() => {
    markStepComplete(1)
  }, [markStepComplete])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Company & Industry Analysis</h1>
        <p className="text-gray-600 mb-6">
          Understanding the company and its industry position will help you contextualize your interview responses.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{data.company_overview || "Company overview not available."}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
            <CardDescription>Stay up to date with the latest company developments</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {(data.recent_news && data.recent_news.length > 0) ? data.recent_news.map((item) => (
                <li key={item.url} className="border-b pb-3 last:border-0 last:pb-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                  >
                    <h3 className="font-medium text-blue-600 hover:underline">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="text-sm text-gray-700 mt-1">{item.summary}</p>
                  </a>
                </li>
              )) : <li><p className="text-gray-500 italic">No recent news available.</p></li>}
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
              {(data.industry_drivers && data.industry_drivers.length > 0) ? data.industry_drivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              )) : <li><p className="text-gray-500 italic">No industry drivers available.</p></li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
