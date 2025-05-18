"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ViewMode } from "@/store/interview-prep-store"
import { useInterviewPrepStore } from "@/store/interview-prep-store"
import mermaid from "mermaid"

interface DepartmentContextSectionProps {
  data: any
  viewMode: ViewMode
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

export default function DepartmentContextSection({ data, viewMode }: DepartmentContextSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    markStepComplete(2)
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
        const sanitizedChart = mockData.orgChart.trim()
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
            {(data?.okrs && Array.isArray(data.okrs) && data.okrs.length > 0) ? (
              data.okrs.map((okr: string[], index: number) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-lg mb-2">Objective {index + 1}</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {Array.isArray(okr) ? (
                      okr.map((kr, krIndex) => (
                        <li key={krIndex}>{kr}</li>
                      ))
                    ) : (
                      <li className="text-gray-500">No key results available.</li>
                    )}
                  </ul>
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
