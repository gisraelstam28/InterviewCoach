"use client"

import { useState } from "react"
import { ChevronLeft, Search } from "lucide-react"

export default function JobPreferencesForm({ onBack, onSubmit }) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: [],
    location: "",
    employmentType: [],
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    remotePreference: "",
    companyPreferences: "",
    additionalPreferences: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const current = [...prev[field]]
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Marketing",
    "Retail",
    "Manufacturing",
    "Consulting",
  ]
  const employmentTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship"]
  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive"]
  const remoteOptions = ["Remote", "Hybrid", "On-site", "No preference"]

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Job Preferences</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div className="form-group">
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title / Keywords
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            placeholder="e.g. Software Engineer, Product Manager"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Industry */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {industries.map((industry) => (
              <div
                key={industry}
                onClick={() => handleMultiSelect("industry", industry)}
                className={`px-4 py-2 border rounded-lg cursor-pointer transition ${
                  formData.industry.includes(industry)
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {industry}
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Select all that apply</p>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g. San Francisco, CA or Remote"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Employment Type */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {employmentTypes.map((type) => (
              <div
                key={type}
                onClick={() => handleMultiSelect("employmentType", type)}
                className={`px-4 py-2 border rounded-lg cursor-pointer transition ${
                  formData.employmentType.includes(type)
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {type}
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Select all that apply</p>
        </div>

        {/* Experience Level */}
        <div className="form-group">
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          >
            <option value="">Select experience level</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Salary (USD)
            </label>
            <input
              type="number"
              id="salaryMin"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleInputChange}
              placeholder="e.g. 50000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div className="form-group">
            <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Salary (USD)
            </label>
            <input
              type="number"
              id="salaryMax"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleInputChange}
              placeholder="e.g. 100000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        {/* Remote Preference */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">Remote Preference</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {remoteOptions.map((option) => (
              <div
                key={option}
                onClick={() => setFormData((prev) => ({ ...prev, remotePreference: option }))}
                className={`px-4 py-2 border rounded-lg cursor-pointer transition text-center ${
                  formData.remotePreference === option
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        </div>

        {/* Company Preferences */}
        <div className="form-group">
          <label htmlFor="companyPreferences" className="block text-sm font-medium text-gray-700 mb-1">
            Company Preferences (Optional)
          </label>
          <textarea
            id="companyPreferences"
            name="companyPreferences"
            value={formData.companyPreferences}
            onChange={handleInputChange}
            placeholder="e.g. Startups, Fortune 500, specific companies"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Additional Preferences */}
        <div className="form-group">
          <label htmlFor="additionalPreferences" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Preferences (Optional)
          </label>
          <textarea
            id="additionalPreferences"
            name="additionalPreferences"
            value={formData.additionalPreferences}
            onChange={handleInputChange}
            placeholder="e.g. Benefits, work culture, growth opportunities"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search Jobs
            <Search className="w-4 h-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  )
}
