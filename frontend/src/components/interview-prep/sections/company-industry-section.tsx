"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useInterviewPrepStore } from "../store/interview-prep-store"
import { useEffect } from "react"
import type { CompanyIndustrySection as CompanyIndustrySectionData } from "../../../types/interview-prep-v2";

interface CompanyIndustrySectionProps {
  data: CompanyIndustrySectionData | undefined; // Allow undefined to handle cases where guide.section_1_company_industry might not exist
}

export default function CompanyIndustrySection({ data }: CompanyIndustrySectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  // Mark step as viewed/completed
  useEffect(() => {
    markStepComplete(1)
  }, [markStepComplete])

  // Safely access data with fallbacks for when data is undefined
  const companyOverview = typeof data?.company_overview === 'string' && data.company_overview ? data.company_overview : 'No company overview available. Please complete the previous steps to generate this content.';
  const recentNews = data?.recent_news || [];
  const industryDrivers = data?.industry_drivers || [];

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
            <p>{companyOverview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
            <CardDescription>Stay up to date with the latest company developments</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentNews.map((item) => (
                <li key={item.url} className="border-b pb-3 last:border-0 last:pb-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
                  >
                    <h3 className="font-medium text-blue-600 hover:underline">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.date}</p>
                    {item.summary && <p className="text-sm text-gray-700 mt-1">{item.summary}</p>}
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
              {industryDrivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
