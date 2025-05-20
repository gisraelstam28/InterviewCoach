"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInterviewPrepStore } from "../../../store/interview-prep-store"
import { CheckCircle2Icon } from "lucide-react"

import type { WelcomeSection as WelcomeSectionType } from "../../../../../../types/interview-prep-v2"

interface WelcomeSectionProps {
  data: WelcomeSectionType
}

export default function WelcomeSection({ data }: WelcomeSectionProps) {
  const { resumeFile, jobDescription, setResumeFile, setJobDescription, markStepComplete } = useInterviewPrepStore()
  const [localResumeFile, setLocalResumeFile] = useState(resumeFile)
  const [localJD, setLocalJD] = useState(jobDescription)
  const [activeTab, setActiveTab] = useState<string>("overview")

  const handleSave = () => {
    setResumeFile(localResumeFile)
    setJobDescription(localJD)
    markStepComplete(0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{data.intro}</h1>
        {typeof data.progress === "number" && (
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.round(data.progress * 100)}%` }}
            />
          </div>
        )}
      </div>

      <Tabs defaultValue={data.quick_view_enabled ? "overview" : data.deep_dive_enabled ? "input" : "overview"}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full">
        <TabsList className={`grid w-full grid-cols-${data.quick_view_enabled && data.deep_dive_enabled ? 2 : 1}`}>
          {data.quick_view_enabled && <TabsTrigger value="overview">Quick Guide</TabsTrigger>}
          {data.deep_dive_enabled && <TabsTrigger value="input">Your Information</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preparation Guide</CardTitle>
              <CardDescription>
                This guide will walk you through a comprehensive interview preparation process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our step-by-step guide will help you prepare thoroughly for your upcoming interview. Here's what you'll
                cover:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Research & Analysis</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Company & industry analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Department context & organizational structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Role success factors & requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Candidate fit analysis</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Preparation & Practice</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>STAR story development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Technical case preparation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Mock interview questions & feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Insider information & cheatsheet</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 mt-2">
                <h3 className="font-medium">Planning & Negotiation</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>30-60-90 day plan development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Offer negotiation strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Export & share your preparation materials</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setActiveTab("input")}>Continue to Input Your Information</Button>
          </div>
        </TabsContent>

        <TabsContent value="input" className="mt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="resume-upload" className="block text-sm font-medium mb-1">
                Upload your resume (PDF)
              </label>
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={e => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  setLocalResumeFile(file);
                }}
              />
              {localResumeFile && (
                <div className="mt-2 text-sm text-gray-600">Selected file: {localResumeFile.name}</div>
              )}
            </div>

            <div>
              <label htmlFor="job-description" className="block text-sm font-medium mb-1">
                Paste the job description
              </label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                className="min-h-[200px]"
                value={localJD}
                onChange={(e) => setLocalJD(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("overview")}>
                Back to Overview
              </Button>
              <Button onClick={handleSave}>Save and Continue</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
