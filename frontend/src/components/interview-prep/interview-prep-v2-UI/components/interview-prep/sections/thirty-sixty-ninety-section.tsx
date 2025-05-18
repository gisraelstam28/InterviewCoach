"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PremiumGate from "@/components/interview-prep/ui/premium-gate"

import { useInterviewPrepStore, type ViewMode } from "../../../store/interview-prep-store";
import type { ThirtySixtyNinetySection as ThirtySixtyNinetySectionType } from '../../../../../../types/interview-prep-v2'

interface ThirtySixtyNinetySectionProps {
  data: ThirtySixtyNinetySectionType
  viewMode: ViewMode
}

export default function ThirtySixtyNinetySection({ data }: ThirtySixtyNinetySectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(9)
  }, [markStepComplete])

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">30-60-90 Day Plan</h1>
        <p className="text-gray-600 mb-6">
          Impress your interviewer with a structured plan for your first three months on the job.
        </p>
      </div>

      <Tabs defaultValue="thirty" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="thirty">First 30 Days</TabsTrigger>
          <TabsTrigger value="sixty">Days 31-60</TabsTrigger>
          <TabsTrigger value="ninety">Days 61-90</TabsTrigger>
        </TabsList>

        <TabsContent value="thirty" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>First 30 Days</CardTitle>
                <CardDescription>Onboarding Checklist</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(data?.onboarding_checklist && data.onboarding_checklist.length > 0) ? (
                    data.onboarding_checklist.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No onboarding checklist items available.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sixty" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Days 31-90</CardTitle>
                <CardDescription>Milestone Goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(data?.milestone_goals && data.milestone_goals.length > 0) ? (
                    data.milestone_goals.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No milestone goals available.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ninety" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Days 31-90</CardTitle>
                <CardDescription>Milestone Goals</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(data?.milestone_goals && data.milestone_goals.length > 0) ? (
                    data.milestone_goals.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No milestone goals available.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  return <PremiumGate isPremiumRequired={data.premium_required}>{content}</PremiumGate>
}
