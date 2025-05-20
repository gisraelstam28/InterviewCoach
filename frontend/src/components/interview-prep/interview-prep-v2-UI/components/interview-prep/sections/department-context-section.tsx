"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInterviewPrepV3Store } from "../../../../../../store/interview-prep-v3-store"
import mermaid from "mermaid"
// Define a local type for the OKR structure if needed, mirroring mockData or expected future structure
interface OKRItem {
  objective: string;
  keyResults: string[];
}

// Mock data
const mockData = {
  departmentName: "Engineering",
  orgChart: `
    graph TD
      CEO[CEO]
      CTO[CTO]
      VP[VP Engineering]
      EM1[Engineering Manager - Frontend]
      EM2[Engineering Manager - Backend]
      EM3[Engineering Manager - DevOps]
      TL1[Team Lead - Web]
      TL2[Team Lead - Mobile]
      TL3[Team Lead - API]
      TL4[Team Lead - Data]
      TL5[Team Lead - Infrastructure]
      
      CEO --> CTO
      CTO --> VP
      VP --> EM1
      VP --> EM2
      VP --> EM3
      EM1 --> TL1
      EM1 --> TL2
      EM2 --> TL3
      EM2 --> TL4
      EM3 --> TL5
      
      style TL1 fill:#f9f,stroke:#333,stroke-width:2px
  `,
  okrs: [
    {
      objective: "Improve system reliability",
      keyResults: [
        "Reduce system downtime by 99.9%",
        "Implement automated testing for 95% of codebase",
        "Decrease critical bugs by 50%",
      ],
    },
    {
      objective: "Accelerate feature delivery",
      keyResults: [
        "Reduce deployment time from 2 hours to 15 minutes",
        "Increase sprint velocity by 30%",
        "Implement CI/CD for all repositories",
      ],
    },
    {
      objective: "Enhance developer experience",
      keyResults: [
        "Reduce build times by 50%",
        "Implement standardized development environments",
        "Improve documentation coverage to 80%",
      ],
    },
  ],
}

export default function DepartmentContextSectionV2() {
  const { markStepComplete } = useInterviewPrepV3Store()
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    markStepComplete(3)
  }, [markStepComplete])

  useEffect(() => {
    if (chartRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: "neutral",
        securityLevel: "strict",
      })

      try {
        // Sanitize the input before rendering
        // section_2_department_context does not exist on InterviewPrepV2Guide type.
        // For now, we will rely on mockData for the chart if actual data path is unavailable.
        const chartDefinition = mockData.orgChart; 
        const sanitizedChart = chartDefinition.trim();
        mermaid.render("org-chart", sanitizedChart).then(({ svg }) => {
          if (chartRef.current) {
            chartRef.current.innerHTML = svg
          }
        })
      } catch (error) {
        console.error("Failed to render org chart:", error)
        if (chartRef.current) {
          chartRef.current.innerHTML = '<div class="p-4 text-red-500">Failed to render organization chart</div>'
        }
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Department Context</h1>
        <p className="text-gray-600 mb-6">
          Understanding the department structure and goals will help you position yourself effectively.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartRef} className="overflow-x-auto"></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OKRs & KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(mockData.okrs && Array.isArray(mockData.okrs) && mockData.okrs.length > 0) ? (
              mockData.okrs.map((okr: OKRItem, index: number) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-lg mb-2">{okr.objective || `Objective ${index + 1}`}</h3>
                  {okr.keyResults && Array.isArray(okr.keyResults) && okr.keyResults.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {okr.keyResults.map((kr, krIndex) => (
                        <li key={krIndex}>{kr}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No key results for this objective.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No OKRs available.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
