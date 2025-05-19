"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RoleSuccessJDSectionProps {
  data: {
    must_haves: string[]
    nice_to_haves: string[]
  }
}

export default function RoleSuccessJDSection({ data }: RoleSuccessJDSectionProps) {
  useEffect(() => {
    // Optionally mark this sub-section complete if needed
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Role Success (Job Description Only)</h2>
        <p className="text-gray-600 mb-4">
          Core success factors distilled purely from the job description.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Must-Haves (JD Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {data.must_haves.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nice-to-Haves (JD Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {data.nice_to_haves.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
