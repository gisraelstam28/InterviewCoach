"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DownloadIcon, Share2Icon, SendIcon } from "lucide-react"
import { useInterviewPrepStore } from "../../../store/interview-prep-store";
import type { ViewMode } from "../../../store/interview-prep-store";

export default function ExportShareSection() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const { resumeFile, jobDescription } = useInterviewPrepStore()

  const handleExportPDF = () => {
    setIsExporting(true)

    // Simulate PDF generation
    setTimeout(() => {
      setIsExporting(false)
      setExportSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setExportSuccess(false)
      }, 3000)
    }, 2000)
  }

  const handleExportNotion = () => {
    // Stub for Notion export
    alert("Notion export functionality coming soon!")
  }

  const handleSendToAICoach = () => {
    // Stub for AI Coach
    alert("AI Coach functionality coming soon!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Export & Share</h1>
        <p className="text-gray-600 mb-6">Export your interview preparation materials or share them with others.</p>
      </div>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
          <TabsTrigger value="ai-coach">AI Coach</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download your interview prep materials in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button onClick={handleExportPDF} disabled={isExporting} className="flex gap-2">
                  <DownloadIcon className="h-4 w-4" />
                  {isExporting ? "Generating PDF..." : "Download PDF"}
                </Button>

                <Button variant="outline" onClick={handleExportNotion} className="flex gap-2">
                  <Share2Icon className="h-4 w-4" />
                  Export to Notion
                </Button>
              </div>

              {exportSuccess && (
                <div className="text-green-600 text-sm mt-2">
                  PDF generated successfully! Check your downloads folder.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Prep</CardTitle>
              <CardDescription>Share your interview preparation with others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Generate a shareable link to your interview preparation materials. This is useful for sharing with
                  mentors or coaches for feedback.
                </p>

                <Button variant="outline" className="flex gap-2">
                  <Share2Icon className="h-4 w-4" />
                  Generate Shareable Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-coach" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Interview Coach</CardTitle>
              <CardDescription>Get personalized feedback from our AI coach</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Send your preparation materials to our AI coach for personalized feedback and suggestions on how to
                  improve your interview responses.
                </p>

                <Button
                  onClick={handleSendToAICoach}
                  className="flex gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <SendIcon className="h-4 w-4" />
                  Send to AI Coach
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Preparation Summary</CardTitle>
          <CardDescription>Overview of your interview preparation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Resume</h3>
              <p className="text-sm mt-1 line-clamp-2">
                {resumeFile ? resumeFile.name : "No resume uploaded"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Job Description</h3>
              <p className="text-sm mt-1 line-clamp-2">
                {jobDescription ? jobDescription.substring(0, 100) + "..." : "No job description provided"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Completed Steps</h3>
              <p className="text-sm mt-1">You've completed all steps of the interview preparation process!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
