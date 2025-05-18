"use client"

import { useState } from "react"
import JobPreferencesForm from "./job-preferences-form"

export default function DemoPage() {
  const [step, setStep] = useState(2) // Start at job preferences step for demo

  const handleBack = () => {
    console.log("Back button clicked")
    // In a real app, this would go back to the previous step
  }

  const handleSubmit = (data) => {
    console.log("Form submitted with data:", data)
    // In a real app, this would process the form data and move to the next step
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">1</div>
              <div className="ml-2 text-sm font-medium text-blue-600">Resume Upload</div>
            </div>
            <div className="flex-1 h-1 mx-4 bg-blue-600"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 text-white">2</div>
              <div className="ml-2 text-sm font-medium text-blue-600">Job Preferences</div>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-600">3</div>
              <div className="ml-2 text-sm font-medium text-gray-600">Results</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <JobPreferencesForm onBack={handleBack} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
