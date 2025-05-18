import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2Icon, DollarSignIcon, CalendarIcon, BriefcaseIcon } from "lucide-react"
import PremiumGate from "@/components/interview-prep/ui/premium-gate"
import type { ViewMode } from "@/store/interview-prep-store"
import { useInterviewPrepStore } from "../store/interview-prep-store"
import type { OfferNegotiationSection as OfferNegotiationSectionData } from "@/types/interview-prep-v2";

interface OfferNegotiationSectionProps {
  data: OfferNegotiationSectionData | undefined | null; // Use the imported type
  viewMode: ViewMode
}

// Mock data
const mockData = {
  premium_required: true,
  salaryRange: {
    low: "$120,000",
    median: "$145,000",
    high: "$170,000",
  },
  negotiationTips: [
    "Always negotiate - most companies expect it and build in room for negotiation",
    "Focus on total compensation, not just base salary",
    "Use market data and your specific skills as leverage",
    "Get the offer in writing before serious negotiation",
    "Be professional and collaborative, not adversarial",
  ],
  benefitsToConsider: [
    {
      category: "Financial",
      items: [
        "Base salary",
        "Signing bonus",
        "Equity/stock options",
        "Performance bonuses",
        "401(k) matching",
        "Profit sharing",
      ],
    },
    {
      category: "Work-Life Balance",
      items: [
        "Vacation/PTO policy",
        "Remote work flexibility",
        "Flexible hours",
        "Parental leave",
        "Sabbatical options",
      ],
    },
    {
      category: "Professional Growth",
      items: [
        "Professional development budget",
        "Conference attendance",
        "Education reimbursement",
        "Career advancement opportunities",
        "Mentorship programs",
      ],
    },
  ],
  responseTemplates: [
    {
      scenario: "Initial offer response",
      template:
        "Thank you for the offer. I'm excited about the possibility of joining [Company]. I'd like to take some time to review the details. When would you need my decision by?",
    },
    {
      scenario: "Negotiating salary",
      template:
        "I appreciate the offer of [Original Salary]. Based on my experience in [specific skills] and the market rate for this role, I was expecting something closer to [Target Salary]. Is there flexibility on the base compensation?",
    },
    {
      scenario: "Requesting more equity",
      template:
        "The equity package is important to me as I'm looking to join a company where I can contribute to long-term growth. Would it be possible to discuss an increase in the equity component of my offer?",
    },
  ],
}

export default function OfferNegotiationSection({ data /*, viewMode */ }: OfferNegotiationSectionProps) {
  // The 'data' prop is now typed according to OfferNegotiationSection from interview-prep-v2.ts
  // This means data.comp_range_benchmarks will be a string? or undefined.
  // The mockData below has a different structure for comp_range_benchmarks (implicitly, as it's not there)
  // and salaryRange (object vs string|number in the type for low/median/high).
  // This discrepancy might cause issues if mockData is used directly without transformation
  // or if the component's rendering logic expects the mockData structure.

  // For now, to avoid breaking the component if data is null/undefined:
  // if (!data) {
  //   return <PremiumGate isPremiumRequired={mockData.premium_required || true}>{/* Fallback for no data */}</PremiumGate>; 
  // }


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
              <div className="text-lg font-bold">{mockData.salaryRange.low}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Median</div>
              <div className="text-xl font-bold text-green-600">{mockData.salaryRange.median}</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">High</div>
              <div className="text-lg font-bold">{mockData.salaryRange.high}</div>
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
            {mockData.negotiationTips.map((tip, index) => (
              <li key={index} className="flex gap-2">
                <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {mockData.benefitsToConsider.map((section, index) => (
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
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Templates</CardTitle>
          <CardDescription>Customize these templates for your situation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockData.responseTemplates.map((template, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{template.scenario}</h3>
              <p className="text-gray-700 italic">"{template.template}"</p>
            </div>
          ))}
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

  // If data exists and has premium_required, use it, otherwise fallback to mockData or true
  const isPremium = data?.premium_required ?? mockData.premium_required;
  return <PremiumGate isPremiumRequired={isPremium}>{content}</PremiumGate>;
}
