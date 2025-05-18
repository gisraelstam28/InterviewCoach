"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import PremiumGate from "@/components/interview-prep/ui/premium-gate"
import type { ViewMode } from "@/store/interview-prep-store"
import { useInterviewPrepStore } from "../store/interview-prep-store"

interface MockInterviewSectionProps {
  data: any
  viewMode: ViewMode
}

// Mock data
const mockData = {
  premium_required: true,
  questions: [
    {
      id: 1,
      question: "Tell me about a time when you had to deal with a difficult team member. How did you handle it?",
      feedback: "Good structure, but could provide more specific details about the resolution.",
    },
    {
      id: 2,
      question: "Describe a situation where you had to make a difficult technical decision with limited information.",
      feedback: "Strong example, consider emphasizing the decision-making process more.",
    },
    {
      id: 3,
      question: "How would you design a URL shortening service like bit.ly?",
      feedback: "Good technical approach, but consider discussing scaling and analytics aspects.",
    },
    {
      id: 4,
      question: "What's your approach to debugging a complex production issue?",
      feedback: "Solid methodology, add more about how you communicate during the process.",
    },
    {
      id: 5,
      question: "How do you stay updated with the latest technologies in your field?",
      feedback: "Good examples, consider discussing how you evaluate which technologies to learn.",
    },
  ],
}

export default function MockInterviewSection({ data, viewMode }: MockInterviewSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()
  const [answers, setAnswers] = useState<Record<number, string>>({})

  useEffect(() => {
    markStepComplete(7)
  }, [markStepComplete])

  const handleAnswerChange = (id: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Mock Interview Practice</h1>
        <p className="text-gray-600 mb-6">
          Practice answering these common interview questions and receive feedback on your responses.
        </p>
      </div>

      <div className="space-y-6">
        {mockData.questions.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-lg">{item.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[120px]"
                value={answers[item.id] || ""}
                onChange={(e) => handleAnswerChange(item.id, e.target.value)}
              />

              {answers[item.id] && answers[item.id].length > 20 && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">Feedback:</div>
                  <Badge variant="outline" className="w-fit text-amber-600 bg-amber-50 border-amber-200">
                    {item.feedback}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return <PremiumGate isPremiumRequired={mockData.premium_required}>{content}</PremiumGate>
}
