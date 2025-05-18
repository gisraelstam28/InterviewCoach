import { useEffect } from "react";
import { useInterviewPrepStore } from "../../interview-prep-v2-UI/store/interview-prep-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { TechnicalCasePrepSection as TechCaseModel, PracticePrompt } from "@/types/interview-prep-v2";

interface TechnicalCasePrepSectionProps {
  data: TechCaseModel;
}

export default function TechnicalCasePrepSection({ data }: TechnicalCasePrepSectionProps) {
  const { markStepComplete } = useInterviewPrepStore();
  useEffect(() => {
    markStepComplete(8);
  }, [markStepComplete]);
  useEffect(() => {
    console.log('TechCasePrep: TechnicalCasePrepSection full data prop:', data);
  }, [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technical / Case Prep</h1>
      <p className="text-gray-600">Practice technical scenarios, review key concepts, and learn important terms to prepare for coding and system design questions.</p>

      {/* Key Concepts Section */}
      {(() => {
        console.log('TechCasePrep: Checking key_concepts:', data?.key_concepts, 'Length:', data?.key_concepts?.length);
        return data && data.key_concepts && data.key_concepts.length > 0;
      })() && (
        <Card>
          <CardHeader>
            <CardTitle>Key Concepts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.key_concepts.map((concept, idx) => (
                <li key={idx}>{concept}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Practice Prompts Section */}
      {data && data.prompts && data.prompts.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">Practice Scenarios & Case Prompts</h2>
          <div className="space-y-4">
            {data.prompts.map((prompt: PracticePrompt, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>Case Prompt {idx + 1}{prompt.category ? `: ${prompt.category}` : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-md">Scenario:</h3>
                  <p className="mb-3 text-sm">{prompt.question}</p>
                  
                  <h3 className="font-semibold text-md mt-3">Sample Answer:</h3>
                  <p className="mb-3 text-sm whitespace-pre-wrap">{prompt.sample_answer}</p>
                  
                  {prompt.resources && prompt.resources.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-md">Helpful Resources:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {prompt.resources.map((resource, lIdx) => (
                          <li key={lIdx}>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {resource.title || resource.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-4 border-t pt-3 text-xs text-gray-500 flex justify-between flex-wrap">
                    <span>{prompt.difficulty && <><strong>Difficulty:</strong> {prompt.difficulty}</>}</span>
                    <span className="mt-1 sm:mt-0 sm:ml-4">{prompt.time_estimate && <><strong>Est. Time:</strong> {prompt.time_estimate}</>}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Sample Case Walkthrough Section */}
      {(() => {
        console.log('TechCasePrep: Checking sample_case_walkthrough:', data?.sample_case_walkthrough);
        return data && data.sample_case_walkthrough;
      })() && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Case Walkthrough</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-4 rounded-md shadow-sm">{data.sample_case_walkthrough}</pre>
          </CardContent>
        </Card>
      )}

      {/* Key Terms Glossary Section */}
      {(() => {
        console.log('TechCasePrep: Checking key_terms_glossary:', data?.key_terms_glossary, 'Length:', data?.key_terms_glossary?.length);
        return data && data.key_terms_glossary && data.key_terms_glossary.length > 0;
      })() && (
        <Card>
          <CardHeader>
            <CardTitle>Key Terms Glossary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.key_terms_glossary.map((item, idx) => (
              <div key={idx} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                <h4 className="font-semibold text-md">{item.term}</h4>
                <p className="text-sm text-gray-700 ml-1">{item.definition}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Preparation Tips Section */}
      {(() => {
        console.log('TechCasePrep: Checking preparation_tips:', data?.preparation_tips, 'Length:', data?.preparation_tips?.length);
        return data && data.preparation_tips && data.preparation_tips.length > 0;
      })() && (
        <Card>
          <CardHeader>
            <CardTitle>Preparation Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {data.preparation_tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
