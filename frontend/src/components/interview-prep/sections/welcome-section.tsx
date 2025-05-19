import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useInterviewPrepStore } from "../../../store/interview-prep-store";
import { Input } from "@/components/ui/input"; // Added for file and text inputs
import { CheckCircle2Icon } from "lucide-react"

type WelcomeSectionProps = object;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function WelcomeSection(_props: WelcomeSectionProps) {
  const {
    resume, // Use 'resume' (string) from store
    jobDescription,
    setResume, // Use 'setResume' (string setter) from store
    setJobDescription,
    markStepComplete
  } = useInterviewPrepStore();

  // Local state for inputs
  const [localResumeText, setLocalResumeText] = useState(resume || '');
  const [localJD, setLocalJD] = useState(jobDescription || '');
  // companyName and industry are not in the current store, so local state for them is removed for now
  // To display uploaded file name:
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("overview");
  
  
  
  

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploadedFileName(file.name); // Update local state to display file name
      // NOTE: This does not currently parse the PDF to text and set it in the store's 'resume: string' field.
      // For guide generation, resume text must be pasted.
    }
  };

  const handleSave = () => {
    console.log('[WelcomeSection] handleSave called. localResumeText:', localResumeText, 'localJD:', localJD);
    setResume(localResumeText); // Save pasted resume text to store's 'resume: string'
    setJobDescription(localJD); // Save job description to store's 'jobDescription: string'
    // setCompanyName and setIndustry calls removed as these fields are not in the current store definition
    markStepComplete(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Interview Prep</h1>
        <p className="text-gray-600">
          Prepare for your upcoming interview with our comprehensive guide. We'll help you analyze the company, role,
          and prepare your best responses.
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Guide Overview</TabsTrigger>
          <TabsTrigger value="input">Your Information</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interview Preparation Guide</CardTitle>
              <CardDescription>
                This guide will walk you through a comprehensive interview preparation process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our step-by-step guide will help you prepare thoroughly for your upcoming interview. Here's what you'll
                cover:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Research & Analysis</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Company & industry analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Department context & organizational structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Role success factors & requirements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Candidate fit analysis</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Preparation & Practice</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>STAR story development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Technical case preparation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Mock interview questions & feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Insider information & cheatsheet</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3 mt-2">
                <h3 className="font-medium">Planning & Negotiation</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>30-60-90 day plan development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Offer negotiation strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2Icon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Export & share your preparation materials</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setActiveTab("input")}>Continue to Input Your Information</Button>
          </div>
        </TabsContent>

        <TabsContent value="input" className="mt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div>
              <label htmlFor="resumeFile" className="block text-sm font-medium mb-1">
                Upload your resume (PDF)
              </label>
              <Input 
                id="resumeFile" 
                type="file" 
                accept=".pdf" 
                onChange={handleResumeFileChange} 
                className="mb-2"
              />
              {uploadedFileName && <p className="text-sm text-green-600">Resume uploaded: {uploadedFileName}</p>}
            </div>

            <div>
              <label htmlFor="resumeText" className="block text-sm font-medium mb-1">
                Or paste your resume text (optional)
              </label>
              <Textarea
                id="resumeText"
                placeholder="Paste your resume text here..."
                className="min-h-[150px]"
                value={localResumeText}
                onChange={(e) => setLocalResumeText(e.target.value)}
              />
            </div>
            </div>

            <div>
              <label htmlFor="job-description" className="block text-sm font-medium mb-1">
                Paste the job description
              </label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here..."
                className="min-h-[150px]"
                value={localJD}
                onChange={(e) => setLocalJD(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                Company Name
              </label>
              <Input 
                id="companyName" 
                type="text" 
                placeholder="Enter company name"
                // value={localCompanyName} // Removed as companyName is not in store
                // onChange={(e) => setLocalCompanyName(e.target.value)} // Removed
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium mb-1">
                Industry
              </label>
              <Input 
                id="industry" 
                type="text" 
                placeholder="Enter industry (e.g., Technology, Finance)"
                // value={localIndustry} // Removed as industry is not in store
                // onChange={(e) => setLocalIndustry(e.target.value)} // Removed
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("overview")}>
                Back to Overview
              </Button>
              <Button onClick={handleSave}>Save and Continue</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
