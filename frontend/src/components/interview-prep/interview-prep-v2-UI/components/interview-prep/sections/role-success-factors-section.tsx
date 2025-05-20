"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInterviewPrepV3Store } from "../../../../../../store/interview-prep-v3-store";
import type { RoleSuccessFactorsSection as RoleSuccessFactorsDataProp, EvaluatedRequirementItem } from '../../../../../../types/interview-prep-v2';

interface RoleSuccessFactorsSectionProps {
  data?: RoleSuccessFactorsDataProp; 
  isLoading?: boolean;
}

export default function RoleSuccessFactorsSection({ data }: RoleSuccessFactorsSectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store()

  useEffect(() => {
    markStepComplete(4)
  }, [markStepComplete])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Role Success Factors</h1>
        <p className="text-gray-600 mb-6">
          Understanding what makes someone successful in this role will help you highlight your relevant experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Day 1 Must-Haves</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(data?.must_haves && data.must_haves.length > 0) ? (
                data.must_haves.map((item: EvaluatedRequirementItem, idx: number) => (
                  <li key={`must-have-${idx}`} className="flex items-start">
                    <span className={`mr-2 mt-1 ${item.met ? 'text-green-500' : 'text-red-500'}`}>
                      {item.met ? '✅' : '❌'}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific must-have criteria identified.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nice-to-Haves</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(data?.nice_to_haves && data.nice_to_haves.length > 0) ? (
                data.nice_to_haves.map((item: EvaluatedRequirementItem, idx: number) => (
                  <li key={`nice-to-have-${idx}`} className="flex items-start">
                    <span className={`mr-2 mt-1 ${item.met ? 'text-green-500' : 'text-red-500'}`}>
                      {item.met ? '✅' : '❌'}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific nice-to-have criteria identified.</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
