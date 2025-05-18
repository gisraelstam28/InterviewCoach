import React from "react";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";


interface JobPreference {
  job_title_keywords: string;
  industry: string[];
  location: string;
  employment_type: string[];
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  remote_preference: string;
  company_preferences: string;
  additional_preferences: string;
}

interface JobSearchPreferencesFormProps {
  jobPreferences: JobPreference;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const industryOptions = [
  { value: "it_software", label: "Information Technology & Software" },
  { value: "healthcare_life_sciences", label: "Healthcare & Life Sciences" },
  { value: "finance_fintech", label: "Finance & Fintech" },
  { value: "education_elearning", label: "Education & E‑Learning" },
  { value: "retail_ecommerce", label: "Retail & E‑Commerce" },
  { value: "manufacturing_industrials", label: "Manufacturing & Industrials" },
  { value: "energy_utilities_sustainability", label: "Energy, Utilities & Sustainability" },
  { value: "media_advertising_entertainment", label: "Media, Advertising & Entertainment" },
  { value: "professional_business_services", label: "Professional & Business Services" },
  { value: "government_nonprofit_social_impact", label: "Government, Non‑Profit & Social Impact" },
];

const employmentTypeOptions = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contractor", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" }
];

const experienceLevelOptions = [
  { value: "entry_level", label: "Entry-Level (0-3 years)" },
  { value: "mid_level", label: "Mid-Level (3-6 years)" },
  { value: "senior_level", label: "Senior-Level (6-15 years)" },
  { value: "executive", label: "Executive-Level (15+ years)" }
];

const remotePreferenceOptions = [
  { value: "No preference", label: "No preference" },
  { value: "Remote only", label: "Remote only" },
  { value: "On-site only", label: "On-site only" },
  { value: "Hybrid", label: "Hybrid (flexible)" }
];

const JobSearchPreferencesForm: React.FC<JobSearchPreferencesFormProps> = ({
  jobPreferences,
  isLoading,
  onChange,
  onBack,
  onSubmit
}) => (
  <form onSubmit={onSubmit}>
    <div className="bg-white shadow rounded-lg p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Job Preferences</h2>
      <p className="text-sm text-gray-600 mb-6">Tell us what you're looking for in your next role.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="md:col-span-2">
          <Label htmlFor="job_title_keywords">Desired Job Title or Keywords <span className="text-red-500">*</span></Label>
          <Input
            id="job_title_keywords"
            name="job_title_keywords"
            placeholder="e.g., Software Engineer, Product Manager"
            value={jobPreferences.job_title_keywords}
            onChange={onChange}
            required
          />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="industry">Industry (Optional, select one or more)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {industryOptions.map(option => (
              <label key={option.value} className="flex items-center bg-gray-50 rounded-md px-3 py-2 shadow-sm hover:bg-indigo-50 transition cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  name="industry"
                  value={option.value}
                  checked={jobPreferences.industry.includes(option.value)}
                  onChange={e => {
                    const checked = e.target.checked;
                    let newIndustries = [...jobPreferences.industry];
                    if (checked) {
                      newIndustries.push(option.value);
                    } else {
                      newIndustries = newIndustries.filter(val => val !== option.value);
                    }
                    onChange({
                      target: {
                        name: 'industry',
                        value: newIndustries,
                      }
                    } as any);
                  }}
                  className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">Check all that apply.</p>
        </div>
        <div>
          <Label htmlFor="location">Preferred Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g., New York, NY or Remote"
            value={jobPreferences.location}
            onChange={onChange}
            required
          />
        </div>
        <div className="md:col-span-1">
  <Label htmlFor="employment_type">Employment Type (Select one or more)</Label>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
    {employmentTypeOptions.map(option => (
      <label key={option.value} className="flex items-center bg-gray-50 rounded-md px-3 py-2 shadow-sm hover:bg-indigo-50 transition cursor-pointer border border-gray-200">
        <input
          type="checkbox"
          name="employment_type"
          value={option.value}
          checked={jobPreferences.employment_type.includes(option.value)}
          onChange={e => {
            const checked = e.target.checked;
            let newTypes = [...jobPreferences.employment_type];
            if (checked) {
              newTypes.push(option.value);
            } else {
              newTypes = newTypes.filter(val => val !== option.value);
            }
            onChange({
              target: {
                name: 'employment_type',
                value: newTypes,
              }
            } as any);
          }}
          className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="ml-3 text-sm text-gray-700">{option.label}</span>
      </label>
    ))}
  </div>
  <p className="mt-1 text-xs text-gray-500">Check all that apply.</p>
</div>
        <div className="md:col-span-1 overflow-visible">
  <Label htmlFor="experience_level">Experience Level</Label>
  <Select
    value={jobPreferences.experience_level}
    onValueChange={value => onChange({ target: { name: 'experience_level', value } } as any)}
  >
    <SelectTrigger className="w-full">
  <SelectValue placeholder="Select experience level" />
</SelectTrigger>
<SelectContent className="z-50 bg-white border border-gray-200 rounded-md">
  {experienceLevelOptions.map(option => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</SelectContent>
  </Select>
</div>
        <div className="md:col-span-2 grid grid-cols-2 gap-x-4">
          <div>
            <Label htmlFor="salary_min">Minimum Salary (USD/year)</Label>
            <Input
              id="salary_min"
              name="salary_min"
              type="number"
              min={0}
              placeholder="e.g., 80000"
              value={jobPreferences.salary_min ?? ''}
              onChange={onChange}
            />
          </div>
          <div>
            <Label htmlFor="salary_max">Maximum Salary (USD/year)</Label>
            <Input
              id="salary_max"
              name="salary_max"
              type="number"
              min={0}
              placeholder="e.g., 120000"
              value={jobPreferences.salary_max ?? ''}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="md:col-span-1 overflow-visible">
  <Label htmlFor="remote_preference">Remote Work Preference <span className="text-red-500">*</span></Label>
  <Select
    value={jobPreferences.remote_preference}
    onValueChange={value => onChange({ target: { name: 'remote_preference', value } } as any)}
  >
    <SelectTrigger className="w-full">
  <SelectValue placeholder="Select remote preference" />
</SelectTrigger>
<SelectContent className="z-50 bg-white border border-gray-200 rounded-md">
  {remotePreferenceOptions.map(option => (
    <SelectItem key={option.value} value={option.value}>
      {option.label}
    </SelectItem>
  ))}
</SelectContent>
  </Select>
</div>
        <div>
          <Label htmlFor="company_preferences">Company Preferences (Optional)</Label>
          <Input
            id="company_preferences"
            name="company_preferences"
            placeholder="e.g., Google, Amazon (comma-separated)"
            value={jobPreferences.company_preferences}
            onChange={onChange}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="additional_preferences">Additional Preferences or Keywords (Optional)</Label>
          <Textarea
            id="additional_preferences"
            name="additional_preferences"
            rows={4}
            placeholder="e.g., startup culture, must provide healthcare benefits, flexible hours"
            value={jobPreferences.additional_preferences}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <Button type="button" onClick={onBack}>Back</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Searching..." : "Search Jobs"}</Button>
      </div>
    </div>
  </form>
);

export default JobSearchPreferencesForm;
