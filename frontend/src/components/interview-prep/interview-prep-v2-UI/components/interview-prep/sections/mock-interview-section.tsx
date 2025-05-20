"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import PremiumGate from "@/components/interview-prep/ui/premium-gate"
import type { ViewMode } from "../../../store/interview-prep-store";
import { useInterviewPrepStore } from "../../../store/interview-prep-store";
import { MockInterviewFeedback } from '../../../../../../types/interview-prep-v2';

// Define the expected structure for the 'data' prop
interface MockInterviewContent {
  questions: string[];
  feedback: MockInterviewFeedback[];
  premium_required?: boolean;
}

interface MockInterviewSectionProps {
  data: MockInterviewContent; // Use the specific type
  viewMode: ViewMode;
}

export default function MockInterviewSection({ data, viewMode }: MockInterviewSectionProps) {
  console.log("MockInterviewSection received data:", data); 
  console.log("Type of MockInterviewSection data:", typeof data);
  const { markStepComplete } = useInterviewPrepStore()
  const [answers, setAnswers] = useState<Record<number, string>>({})

  useEffect(() => {
    // Ensure data is valid before trying to mark step complete or process
    if (data && data.questions && data.feedback) {
        markStepComplete(7) // Corresponds to section_7_mock_interview
    }
  }, [markStepComplete, data])

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
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Practice answering these common interview questions. For each question, type your answer and then review the AI-generated feedback.
        </p>
      </div>

      <div className="space-y-8">
        {(data?.questions && data.questions.length > 0) ? (
          data.questions.map((questionText: string, idx: number) => {
            const specificFeedback = (data.feedback && data.feedback.length > idx) ? data.feedback[idx] : null;

            return (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">Q{idx + 1}: {questionText}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                    value={answers[idx] || ""}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    disabled={viewMode === "quick"}
                  />

                  {viewMode === "deep" && answers[idx] && specificFeedback && (
                    <div className="mt-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                      <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">AI Feedback:</h4>
                      
                      {/* Display the question text from the feedback object if it helps, or assume it matches questionText */}
                      {/* <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Regarding: "{specificFeedback.question}"</p> */}

                      {specificFeedback.answer && specificFeedback.answer.trim() !== "" && (
                        <div className="mb-2">
                          <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Example Answer Idea:</p>
                          <p className="text-sm italic text-gray-700 dark:text-gray-300">"{specificFeedback.answer}"</p>
                        </div>
                      )}

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Critique:</span> {specificFeedback.feedback}
                      </p>

                      {specificFeedback.score > 0 && (
                        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Preliminary Score Indication:</span> {specificFeedback.score}/10
                        </p>
                      )}

                      {specificFeedback.rubric && Object.keys(specificFeedback.rubric).length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm text-gray-600 dark:text-gray-400">Evaluation Rubric Focus Points:</p>
                          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 pl-4">
                            {Object.entries(specificFeedback.rubric).map(([key, value]) => (
                              <li key={key}><span className="capitalize">{key.replace(/_/g, ' ')}</span>: {String(value)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {viewMode === "deep" && answers[idx] && !specificFeedback && (
                     <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm">No specific feedback available for this question yet.</div>
                  )}
                   {viewMode === "quick" && specificFeedback && (
                     <div className="mt-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                       <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200">AI Generated Feedback:</h4>
                       <p className="text-sm text-gray-700 dark:text-gray-300">
                         <span className="font-medium text-gray-600 dark:text-gray-400">Critique:</span> {specificFeedback.feedback}
                       </p>
                        {specificFeedback.score > 0 && (
                        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Preliminary Score Indication:</span> {specificFeedback.score}/10
                        </p>
                      )}
                     </div>
                   )

                  }
                </CardContent>
              </Card>
            )}
          )
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">No mock interview questions available at the moment.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Please try generating the guide again or check back later.</p>
          </div>
        )}
      </div>
    </div>
  )

  // Ensure data itself is not null/undefined before checking premium_required
  const isPremium = data?.premium_required === true;
  return <PremiumGate isPremiumRequired={isPremium}>{content}</PremiumGate>;
}
