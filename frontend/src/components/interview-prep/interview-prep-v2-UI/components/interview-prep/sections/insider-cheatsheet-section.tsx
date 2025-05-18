"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, DollarSignIcon, MessageSquareQuoteIcon, TrendingUpIcon, BuildingIcon } from "lucide-react"
import type { ViewMode } from "../../../store/interview-prep-store";
import { useInterviewPrepStore } from "../../../store/interview-prep-store";

import type { InsiderCheatSheetSection as InsiderCheatSheetSectionType } from "../../../../../../types/interview-prep-v2"

interface InsiderCheatSheetSectionProps {
  data: InsiderCheatSheetSectionType
  viewMode: ViewMode
}



export default function InsiderCheatSheetSection({ data, viewMode }: InsiderCheatSheetSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(8)
  }, [markStepComplete])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Insider Cheatsheet</h1>
        <p className="text-gray-600 mb-6">
          Get insider information to help you stand out and ask insightful questions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BuildingIcon className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Culture Cues</CardTitle>
              <CardDescription>Key cultural elements to align with</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.culture_cues && data.culture_cues.length > 0 ? (
                data.culture_cues.map((cue, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{cue}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No culture cues available.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquareQuoteIcon className="h-5 w-5 text-purple-500" />
            <div>
              <CardTitle>Executive Quotes</CardTitle>
              <CardDescription>What leadership is saying</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data.recent_exec_quotes && data.recent_exec_quotes.length > 0) ? (
                data.recent_exec_quotes.map((quote, index: number) => (
                  <div key={index} className="space-y-1">
                    <blockquote className="border-l-4 border-purple-200 pl-4 italic">"{typeof quote === 'string' ? quote : quote.quote}"</blockquote>
                    {typeof quote === 'object' && quote.speaker && (
                      <p className="text-sm text-gray-600 text-right">— {quote.speaker}</p>
                    )}
                    {typeof quote === 'object' && quote.context_url && (
                      <a 
                        href={quote.context_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Source
                      </a>
                    )}
                  </div>
                ))
              ) : (data.exec_quotes && data.exec_quotes.length > 0) ? (
                data.exec_quotes.map((quote: string, index: number) => (
                  <blockquote key={index} className="border-l-4 border-purple-200 pl-4 italic">"{quote}"</blockquote>
                ))
              ) : (
                <p className="text-gray-500">No executive quotes available.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <DollarSignIcon className="h-5 w-5 text-green-500" />
            <div>
              <CardTitle>Financial Snapshot</CardTitle>
              <CardDescription>Company performance metrics</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {data.financial_snapshot ? (
                <span className="hot">{data.financial_snapshot}</span>
              ) : (
                <span className="text-gray-500">No financial snapshot available.</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <InfoIcon className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>Glassdoor Pain Points</CardTitle>
              <CardDescription>Common employee concerns</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertTitle className="text-amber-800">Be aware of these potential issues</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {data.glassdoor_pain_points && data.glassdoor_pain_points.length > 0 ? (
                    data.glassdoor_pain_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">No pain points available.</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions to Ask</CardTitle>
          <CardDescription>Impress your interviewer with these thoughtful questions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.tailored_questions && data.tailored_questions.length > 0 ? (
              data.tailored_questions.map((question, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-blue-500 font-bold">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No tailored questions available.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
