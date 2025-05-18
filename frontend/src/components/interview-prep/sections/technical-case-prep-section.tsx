import { useState, useEffect, useMemo } from "react"
import {
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ChevronDown, ChevronUp, Lightbulb, BookOpen, Code2, ListChecks, Brain, AlertTriangle } from "lucide-react"
import { useInterviewPrepStore } from "../store/interview-prep-store"

interface Resource {
  title: string;
  url: string;
}

interface CaseStudyPrompt {
  question: string;
  sample_answer: string;
  resources: Resource[];
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  time_estimate?: string;
  category?: string;
}

type TechnicalCasePrepSectionData = {
  key_concepts?: string[];
  prompts?: CaseStudyPrompt[];
  practice_prompts?: CaseStudyPrompt[];
  sample_case_walkthrough?: string;
  key_terms_glossary?: Array<{
    term: string;
    definition: string;
    related_terms?: string[];
  }>;
  preparation_tips?: string[];
}

const DifficultyBadge = ({ level }: { level?: 'Easy' | 'Medium' | 'Hard' }) => {
  if (!level) return null;
  const colors = {
    Easy: 'bg-green-100 text-green-800 hover:bg-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    Hard: 'bg-red-100 text-red-800 hover:bg-red-200',
  };
  return <Badge className={`${colors[level]} transition-colors`}>{level}</Badge>;
};

interface TechnicalCasePrepSectionProps {
  data: TechnicalCasePrepSectionData | { section_6_technical_case_prep: TechnicalCasePrepSectionData } | null;
  viewMode: 'quick' | 'deep';
}

export default function TechnicalCasePrepSection({ data, viewMode }: TechnicalCasePrepSectionProps) {
  console.log("***** MEGA DEBUG: TechnicalCasePrepSection STARTS TO RENDER NOW *****");
  // NEW LOG 1: What data is the component *actually* receiving?
  console.log("!!! TechnicalCasePrepSection VERY TOP - props.data RECEIVED:", JSON.stringify(data, null, 2));
  console.log('[DEBUG] TechnicalCasePrepSection - Component RENDERED with viewMode:', viewMode);
  console.log('[DEBUG] TechnicalCasePrepSection - Raw props:', { data });
  
  const { markStepComplete } = useInterviewPrepStore()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  
  // Normalize the data structure
  const normalizedData = useMemo(() => {
    console.log('[DEBUG] TechnicalCasePrepSection - Starting data normalization');
    
    const defaultData: TechnicalCasePrepSectionData = {
      key_concepts: [],
      prompts: [],
      preparation_tips: [],
      key_terms_glossary: [],
      sample_case_walkthrough: ''
    };

    if (!data) {
      console.warn('[WARN] TechnicalCasePrepSection - No data provided to component');
      return defaultData;
    }
    
    try {
      // Log the raw data structure for debugging
      const dataCopy = JSON.parse(JSON.stringify(data));
      console.log('[DEBUG] TechnicalCasePrepSection - Raw data structure:', dataCopy);
      
      // Handle both direct data and nested section data
      let sectionData: TechnicalCasePrepSectionData;
      
      if ('section_6_technical_case_prep' in dataCopy) {
        console.log('[DEBUG] Found nested section_6_technical_case_prep');
        sectionData = dataCopy.section_6_technical_case_prep;
      } else {
        console.log('[DEBUG] Using direct section data');
        sectionData = dataCopy;
      }
      
      console.log('[DEBUG] TechnicalCasePrepSection - Extracted section data:', sectionData);
      
      // Ensure we have a valid object with default values by explicitly pulling each field
      const normalized: TechnicalCasePrepSectionData = {
        key_concepts: sectionData.key_concepts || defaultData.key_concepts,
        prompts: sectionData.prompts || sectionData.practice_prompts || defaultData.prompts,
        // Explicitly include practice_prompts if it exists, otherwise default
        practice_prompts: sectionData.practice_prompts || defaultData.practice_prompts, 
        sample_case_walkthrough: sectionData.sample_case_walkthrough || defaultData.sample_case_walkthrough,
        key_terms_glossary: sectionData.key_terms_glossary || defaultData.key_terms_glossary,
        preparation_tips: sectionData.preparation_tips || defaultData.preparation_tips,
      };
      
      console.log("%%% TechnicalCasePrepSection INSIDE useMemo - FINAL normalized output: %%%", JSON.stringify(normalized, null, 2));
      return normalized;
    } catch (error) {
      console.error('[ERROR] TechnicalCasePrepSection - Error normalizing data:', error);
      return defaultData;
    }
  }, [data]);

  // NEW LOG 2: What does normalizedData look like *after* useMemo?
  console.log("!!! TechnicalCasePrepSection AFTER useMemo - normalizedData IS:", JSON.stringify(normalizedData, null, 2));

  // Debug: Log the raw data when component mounts or data changes
  useEffect(() => {
    console.log('TechnicalCasePrepSection - Raw data received:', data);
    console.log('TechnicalCasePrepSection - Normalized data:', normalizedData);
    
    if (normalizedData) {
      console.log('TechnicalCasePrepSection - Available sections:', {
        hasPrompts: !!(normalizedData.prompts && normalizedData.prompts.length > 0),
        hasKeyConcepts: !!(normalizedData.key_concepts && normalizedData.key_concepts.length > 0),
        hasSampleCaseWalkthrough: !!normalizedData.sample_case_walkthrough,
        hasKeyTermsGlossary: !!(normalizedData.key_terms_glossary && normalizedData.key_terms_glossary.length > 0),
        hasPreparationTips: !!(normalizedData.preparation_tips && normalizedData.preparation_tips.length > 0)
      });
    }
    
    markStepComplete(6);
  }, [data, normalizedData, markStepComplete]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!normalizedData || Object.keys(normalizedData).length === 0) {
    console.log('TechnicalCasePrepSection - No data available');
    return (
      <Card className="text-center p-8 border-dashed border-yellow-400 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-yellow-700">
            <AlertTriangle className="w-8 h-8 mr-3" />
            Content Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-600">
            The technical case preparation content is currently unavailable. 
            This might be due to ongoing processing or an issue with data generation.
            Please try again later or ensure the job description and resume have been fully processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Debug: Log section visibility flags
  const hasPrompts = Boolean(normalizedData.prompts && normalizedData.prompts.length > 0);
  const hasKeyConcepts = Boolean(normalizedData.key_concepts && normalizedData.key_concepts.length > 0);
  const hasSampleCaseWalkthrough = Boolean(normalizedData.sample_case_walkthrough);
  const hasKeyTermsGlossary = Boolean(normalizedData.key_terms_glossary && normalizedData.key_terms_glossary.length > 0);
  const hasPreparationTips = Boolean(normalizedData.preparation_tips && normalizedData.preparation_tips.length > 0);

  // Debug: Log what sections will be rendered
  console.log('[DEBUG] TechnicalCasePrepSection - Section visibility:', {
    hasPrompts,
    hasKeyConcepts,
    hasSampleCaseWalkthrough,
    hasKeyTermsGlossary,
    hasPreparationTips,
    promptsCount: normalizedData.prompts?.length || 0,
    keyConceptsCount: normalizedData.key_concepts?.length || 0,
    keyTermsCount: normalizedData.key_terms_glossary?.length || 0,
    prepTipsCount: normalizedData.preparation_tips?.length || 0,
  });

  // If no content is available, show a helpful message
  const hasAnyContent = hasPrompts || hasKeyConcepts || hasSampleCaseWalkthrough || hasKeyTermsGlossary || hasPreparationTips;
  
  if (!hasAnyContent) {
    return (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">No content available</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The Technical Case Prep section doesn't contain any content yet. This could be because:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>The data is still being loaded</li>
                <li>There was an error generating this section</li>
                <li>No technical case preparation is required for this role</li>
              </ul>
              <div className="mt-3 p-3 bg-white rounded-md border border-yellow-200">
                <p className="text-xs font-mono text-gray-600 overflow-x-auto">
                  {JSON.stringify(normalizedData, null, 2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Log final section visibility state
  console.log('TechnicalCasePrepSection - Final section visibility:', {
    hasPrompts,
    hasKeyConcepts,
    hasSampleCaseWalkthrough,
    hasKeyTermsGlossary,
    hasPreparationTips,
    hasAnyContent
  });

  if (!hasAnyContent) {
    return (
      <Card className="text-center p-8 border-dashed border-gray-300 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-center text-gray-600">
            <BookOpen className="w-8 h-8 mr-3" />
            No Technical Prep Content Generated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            It seems no specific technical preparation content was generated for this role.
            This can happen if the job description didn't highlight specific technical skills that map to our content generation.
            Focus on general technical interview principles and practice common problems in your field.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log("TechnicalCasePrepSection - data:", data);
  console.log("%%% MEGA VISIBILITY CHECK: TechnicalCasePrepSection IS ABOUT TO RENDER MAIN CONTENT %%%");

  return (
    <>
      <h1 style={{ backgroundColor: 'lime', color: 'black', fontSize: '32px', padding: '20px', textAlign: 'center', border: '5px solid red', zIndex: '9999', position: 'relative' }}>MEGA VISIBILITY CHECK: MAIN RETURN</h1>

    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-800">Technical Case Prep</h2>
      </div>

      {/* Practice Case Studies Section */}
      {hasPrompts && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />Practice Case Studies</CardTitle>
            <CardDescription>Engage with these scenarios to sharpen your problem-solving skills.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {normalizedData.prompts?.map((prompt: CaseStudyPrompt, index: number) => (
              <Card key={`prompt-${index}`} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-slate-50 to-gray-50">
                <CardHeader
                  onClick={() => toggleExpand(`prompt-${index}`)}
                  className="cursor-pointer flex flex-row items-center justify-between p-4 bg-gray-100/50 hover:bg-gray-200/50 transition-colors"
                >
                  <div className="flex-grow">
                    <CardTitle className="text-base font-medium text-gray-700">Case Study {index + 1}: {prompt.category || 'General Case'}</CardTitle>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{prompt.question}</p>
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                      <DifficultyBadge level={prompt.difficulty} />
                      {prompt.time_estimate && (
                        <Badge variant="outline" className="text-xs">⏱️ {prompt.time_estimate}</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    {expandedItems[`prompt-${index}`] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                {expandedItems[`prompt-${index}`] && (
                  <CardContent className="p-4 space-y-4 bg-white">
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-gray-600">Full Prompt:</h4>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap p-3 bg-gray-50 rounded-md">{prompt.question}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-gray-600">Sample Answer:</h4>
                      <div className="border rounded-md p-3 bg-gray-50 overflow-y-auto" style={{ maxHeight: '250px' }}>
                        {/* Content of sample answer should be parsed if it's Markdown, for now direct render */}
                        <p className="whitespace-pre-wrap">{prompt.sample_answer}</p>
                      </div>
                    </div>
                    {prompt.resources && prompt.resources.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-gray-600">Resources:</h4>
                        <ul className="list-disc list-inside space-y-1 pl-1">
                          {prompt.resources.map((res: Resource, i: number) => (
                            <li key={`res-${index}-${i}`} className="text-xs">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                {res.title || res.url} <ExternalLink className="h-3 w-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Technical Concepts Section */}
      {/* Key Technical Concepts Section - SIMPLIFIED DEBUG */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Brain className="w-5 h-5 mr-2 text-purple-600" />Key Technical Concepts (DEBUG)</CardTitle>
          <CardDescription>Attempting to display raw key_concepts data.</CardDescription>
        </CardHeader>
        <CardContent>
          <h1 style={{ color: 'red', backgroundColor: 'yellow', padding: '10px', fontSize: '20px' }}>DEBUG: KEY CONCEPTS SECTION IS RENDERING</h1>
          <p style={{ color: 'blue', margin: '10px 0' }}>Raw data prop (first level):</p>
          <pre style={{ border: '1px solid green', padding: '5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
          <p style={{ color: 'blue', margin: '10px 0' }}>Normalized key_concepts:</p>
          <pre style={{ border: '1px solid purple', padding: '5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {normalizedData?.key_concepts ? JSON.stringify(normalizedData.key_concepts, null, 2) : "normalizedData.key_concepts is null or undefined"}
          </pre>
          <p style={{ color: 'blue', margin: '10px 0' }}>Checking 'section_6_technical_case_prep' directly in data:</p>
          <pre style={{ border: '1px solid orange', padding: '5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {data && typeof data === 'object' && 'section_6_technical_case_prep' in data && (data as any).section_6_technical_case_prep ?
              JSON.stringify((data as any).section_6_technical_case_prep.key_concepts, null, 2) :
              "data.section_6_technical_case_prep or its key_concepts is not available"
            }
          </pre>
        </CardContent>
      </Card>

      {/* Sample Case Walkthrough Section */}
      {hasSampleCaseWalkthrough && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Code2 className="w-5 h-5 mr-2 text-blue-600" />Sample Case Walkthrough</CardTitle>
            <CardDescription>An example walkthrough of a typical case.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Assuming sample_case_walkthrough is a string, potentially Markdown. For now, direct render. */}
            <div className="prose prose-sm max-w-none whitespace-pre-wrap p-3 border rounded-md bg-gray-50 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {normalizedData.sample_case_walkthrough}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Glossary Section */}
      {hasKeyTermsGlossary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BookOpen className="w-5 h-5 mr-2 text-teal-600" />Technical Glossary</CardTitle>
            <CardDescription>Definitions of key technical terms you might encounter.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pr-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {normalizedData.key_terms_glossary?.map((term: { term: string; definition: string; related_terms?: string[] }, index: number) => (
                <div key={`term-${index}`} className="p-3 border rounded-md bg-muted/20">
                  <h4 className="font-semibold text-sm text-gray-800">{term.term}</h4>
                  <p className="text-xs text-gray-600 mt-1 mb-2 whitespace-pre-wrap">{term.definition}</p>
                  {term.related_terms && term.related_terms.length > 0 && (
                    <div className="mt-1">
                      <span className="text-xs font-medium text-gray-500">Related: </span>
                      {term.related_terms?.map((rt: string, i: number) => (
                        <Badge key={`rt-${index}-${i}`} variant="secondary" className="text-xs mr-1 mb-1">{rt}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preparation Tips Section */}
      {hasPreparationTips && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="w-5 h-5 mr-2 text-orange-600" />Preparation Tips</CardTitle>
            <CardDescription>Actionable tips to help you prepare effectively.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-decimal space-y-3 pl-5 text-sm text-gray-700">
              {normalizedData.preparation_tips?.map((tip: string, index: number) => (
                <li key={`tip-${index}`}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
