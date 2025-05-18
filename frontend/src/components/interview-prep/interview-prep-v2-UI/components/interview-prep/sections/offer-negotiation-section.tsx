"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon, DollarSignIcon, CalendarIcon, BriefcaseIcon } from "lucide-react"
import PremiumGate from "@/components/interview-prep/ui/premium-gate"

import { useInterviewPrepStore, type ViewMode } from "../../../store/interview-prep-store";
import type { OfferNegotiationSection as OfferNegotiationSectionType } from '../../../../../../types/interview-prep-v2'

interface OfferNegotiationSectionProps {
  data: OfferNegotiationSectionType;
  viewMode: ViewMode; // Added viewMode
}

// Mock data

export default function OfferNegotiationSection({ data }: OfferNegotiationSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(10)
  }, [markStepComplete])

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Offer Negotiation</h1>
        <p className="text-gray-600 mb-6">
          Strategies and templates to help you negotiate the best possible compensation package.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <DollarSignIcon className="h-5 w-5 text-green-500" />
          <div>
            <CardTitle>Salary Expectations</CardTitle>
            <CardDescription>Market rates for this position</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Low</div>
              <div className="text-lg font-bold">{data?.salaryRange?.low || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Median</div>
              <div className="text-xl font-bold text-green-600">{data?.salaryRange?.median || 'N/A'}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">High</div>
              <div className="text-lg font-bold">{data?.salaryRange?.high || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Negotiation Strategy</CardTitle>
          <CardDescription>Key tips for effective negotiation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Array.isArray(data?.negotiationTips) && data.negotiationTips.length > 0 ? (
              data.negotiationTips.map((tip: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No negotiation tips available.</li>
            )} 
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {Array.isArray(data?.benefitsToConsider) && data.benefitsToConsider.length > 0 ? (
          data.benefitsToConsider.map((section: { category: string; items: string[] }, index: number) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center gap-2">
                {index === 0 ? (
                  <DollarSignIcon className="h-5 w-5 text-blue-500" />
                ) : index === 1 ? (
                  <CalendarIcon className="h-5 w-5 text-purple-500" />
                ) : (
                  <BriefcaseIcon className="h-5 w-5 text-amber-500" />
                )}
                <CardTitle>{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {Array.isArray(section.items) && section.items.length > 0 ? (
                    section.items.map((item: string, itemIndex: number) => (
                      <li key={itemIndex} className="flex gap-2">
                        <span className="text-blue-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No items available.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-gray-500">No benefits information available.</div>
        )} 
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Templates</CardTitle>
          <CardDescription>Customize these templates for your situation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.isArray(data?.responseTemplates) && data.responseTemplates.length > 0 ? (
            data.responseTemplates.map((template: { scenario: string; template: string }, index: number) => (
              <div key={index} className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{template.scenario}</h3>
                <p className="text-gray-700 italic">"{template.template}"</p>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No response templates available.</div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertTitle>Pro Tip</AlertTitle>
        <AlertDescription>
          Always get competing offers when possible. Having alternatives gives you leverage and helps you understand
          your market value.
        </AlertDescription>
      </Alert>
    </div>
  )

  return <PremiumGate isPremiumRequired={data.premium_required}>{content}</PremiumGate>;
}
