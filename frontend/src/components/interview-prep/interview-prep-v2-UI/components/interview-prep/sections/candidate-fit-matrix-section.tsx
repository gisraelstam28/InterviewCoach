"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ViewMode } from "../../../store/interview-prep-store";
import { useInterviewPrepStore } from "../../../store/interview-prep-store";
import type { FitMatrixRow, CandidateFitMatrixSection as CandidateFitMatrixSectionType } from '../../../../../../types/interview-prep-v2'

// Types imported from src/types/interview-prep-v2.ts

interface CandidateFitMatrixSectionProps {
  data: CandidateFitMatrixSectionType
  viewMode: ViewMode
}

export default function CandidateFitMatrixSection({ data }: CandidateFitMatrixSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(5)
  }, [markStepComplete])

  function getColorClass(color: string) {
    switch (color) {
      case 'green':
        return 'bg-green-400 border-green-400';
      case 'yellow':
        return 'bg-yellow-400 border-yellow-400';
      case 'red':
        return 'bg-red-400 border-red-400';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-100 text-green-800 border-green-300"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "red":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Candidate Fit Matrix</h1>
        <p className="text-gray-600 mb-6">
          Analyze how your experience matches the job requirements and prepare to address any gaps.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requirements Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Requirement</TableHead>
                  <TableHead className="w-1/4">Your Evidence</TableHead>
                  <TableHead className="w-1/3">Spin/Gap Strategy</TableHead>
                  <TableHead className="w-1/6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.rows && data.rows.length > 0) ? (
                  data.rows.map((row: FitMatrixRow, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.job_requirement}</TableCell>
                      <TableCell>{row.your_evidence}</TableCell>
                      <TableCell>{row.spin_or_gap_fix}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-block w-full py-1 px-2 text-xs font-medium rounded border ${getColorClass(row.color_code)}`}
                        >
                          {row.color_code.charAt(0).toUpperCase() + row.color_code.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-gray-500 text-center py-4">No fit matrix data available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
