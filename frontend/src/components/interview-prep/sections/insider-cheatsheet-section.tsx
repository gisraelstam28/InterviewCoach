import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, DollarSignIcon, MessageSquareQuoteIcon, /*TrendingUpIcon,*/ BuildingIcon } from "lucide-react"
// TrendingUpIcon removed as financial_snapshot is now a string
import { useInterviewPrepStore } from "../store/interview-prep-store"

// TypeScript interfaces matching Pydantic models
interface RecentExecQuoteType {
  quote?: string | null
  speaker?: string | null
  context_url?: string | null
}

interface InsiderCheatSheetDataType {
  culture_cues?: string[] | null
  recent_exec_quotes?: RecentExecQuoteType[] | null
  financial_snapshot?: string | null
  glassdoor_pain_points?: string[] | null
  tailored_questions?: string[] | null
}

interface InsiderCheatSheetSectionProps {
  data?: InsiderCheatSheetDataType | null
}

export default function InsiderCheatSheetSection({ data }: InsiderCheatSheetSectionProps) {
  console.log('%c[InsiderCheatSheetSection] Component invoked. UI Step 9. Data received:', 'color: #228B22; font-weight: bold; font-size: 1.1em;', data);

  // Original content continues below, ensure the function signature matches if you copy-pasted only the log line. data /*, viewMode*/ }: InsiderCheatSheetSectionProps) {
  console.log('[InsiderCheatSheetSection] Rendering - Data received:', JSON.stringify(data));
  // viewMode is currently unused in this component's rendering logic
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(9) // UI Step 9 is Insider Cheat Sheet // Corresponds to UI Step 9 (0-indexed) in store & step-content-new.tsx case 9
  }, [markStepComplete])

  if (!data) {
    console.error('[InsiderCheatSheetSection] Data prop is null or undefined. Rendering error message.');
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Insider Cheatsheet</h1>
          <p className="text-gray-600 mb-6">
            Get insider information to help you stand out and ask insightful questions.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Insider cheat sheet data is not available. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  console.log('[InsiderCheatSheetSection] Data is present, proceeding to render main content.');
  return (
    <div className="space-y-6">
      <h1 style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', border: '2px solid red', padding: '10px' }}>INSIDER CHEAT SHEET COMPONENT HAS RENDERED THIS TEST HEADER</h1>
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
            {(data.culture_cues && data.culture_cues.length > 0) ? (
              <ul className="space-y-2">
                {data.culture_cues.map((cue, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Culture cues not available.</p>
            )}
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
            {(data.recent_exec_quotes && data.recent_exec_quotes.length > 0) ? (
              <div className="space-y-4">
                {data.recent_exec_quotes.map((item, index) => (
                  <div key={index}>
                    {item.quote && <blockquote className="border-l-4 border-purple-200 pl-4 italic">"{item.quote}"</blockquote>}
                    {item.speaker && <p className="text-sm text-right mt-1 font-medium">— {item.speaker}</p>}
                    {item.context_url && <a href={item.context_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline text-right block mt-1">Source</a>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Executive quotes not available.</p>
            )}
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
            {data.financial_snapshot ? (
              <p className="text-sm">{data.financial_snapshot}</p>
            ) : (
              <p className="text-sm text-gray-500">Financial snapshot not available.</p>
            )}
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
              {/* Changed variant to default as 'warning' is not typical for ShadCN Alert, styled with classes instead */}
              <AlertTitle className="text-amber-800">Be aware of these potential issues</AlertTitle>
              <AlertDescription>
                {(data.glassdoor_pain_points && data.glassdoor_pain_points.length > 0) ? (
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {data.glassdoor_pain_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">No specific pain points identified or available.</p>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tailored Questions to Ask</CardTitle>
          <CardDescription>Impress your interviewer with these thoughtful questions</CardDescription>
        </CardHeader>
        <CardContent>
          {(data.tailored_questions && data.tailored_questions.length > 0) ? (
            <ul className="space-y-2">
              {data.tailored_questions.map((question, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-blue-500 font-bold">{index + 1}.</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Tailored questions not available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
