"use client"; 

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown, ChevronUp, Lightbulb, BookOpen, ListChecks, Brain, AlertTriangle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useInterviewPrepStore } from "../../../store/interview-prep-store"; 

interface Resource {
  title: string;
  url: string;
}

interface CaseStudyPrompt {
  question: string;
  sample_answer: string;
  resources?: Resource[]; 
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
}

export default function TechnicalCasePrepSection({ data }: TechnicalCasePrepSectionProps) {
  // Custom H3 renderer to add more distinction for Sample Case Walkthrough sections
  const CustomH3 = ({ node, ...props }: any) => {
    // mt-6 adds top margin, pt-4 adds top padding, border-t adds a top border
    // border-gray-300 dark:border-gray-600 for theme-aware border color
    return <h3 className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600" {...props} />;
  };

  // console.log("***** MEGA DEBUG: TechnicalCasePrepSection (interview-prep-v2-UI version) STARTS TO RENDER NOW *****");
  // console.log("!!! TechnicalCasePrepSection VERY TOP - props.data RECEIVED:", JSON.stringify(data, null, 2));
  // console.log('[DEBUG] TechnicalCasePrepSection - Component RENDERED with viewMode:', viewMode);

  const { markStepComplete } = useInterviewPrepStore();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const normalizedData = useMemo(() => {
    // console.log('[DEBUG] TechnicalCasePrepSection - Starting data normalization');
    const defaultData: TechnicalCasePrepSectionData = {
      key_concepts: [],
      prompts: [],
      practice_prompts: [],
      sample_case_walkthrough: '',
      key_terms_glossary: [],
      preparation_tips: [],
    };

    if (!data) {
      // console.warn('[WARN] TechnicalCasePrepSection - No data provided to component');
      return defaultData;
    }

    try {
      const dataCopy = JSON.parse(JSON.stringify(data)); 
      let sectionData: TechnicalCasePrepSectionData;

      if ('section_6_technical_case_prep' in dataCopy && dataCopy.section_6_technical_case_prep) {
        // console.log('[DEBUG] Found nested section_6_technical_case_prep');
        sectionData = dataCopy.section_6_technical_case_prep;
      } else {
        // console.log('[DEBUG] Using direct data object as section data');
        sectionData = dataCopy as TechnicalCasePrepSectionData; 
      }
      
      // console.log('[DEBUG] TechnicalCasePrepSection - Extracted section data:', sectionData);

      const normalized: TechnicalCasePrepSectionData = {
        key_concepts: sectionData.key_concepts || defaultData.key_concepts,
        prompts: sectionData.prompts || sectionData.practice_prompts || defaultData.prompts,
        practice_prompts: sectionData.practice_prompts || defaultData.practice_prompts,
        sample_case_walkthrough: sectionData.sample_case_walkthrough || defaultData.sample_case_walkthrough,
        key_terms_glossary: sectionData.key_terms_glossary || defaultData.key_terms_glossary,
        preparation_tips: sectionData.preparation_tips || defaultData.preparation_tips,
      };
      
      // console.log("%%% TechnicalCasePrepSection INSIDE useMemo - FINAL normalized output: %%%", JSON.stringify(normalized, null, 2));
      return normalized;
    } catch (error) {
      // console.error('[ERROR] TechnicalCasePrepSection - Error normalizing data:', error);
      return defaultData;
    }
  }, [data]);

  // console.log("!!! TechnicalCasePrepSection AFTER useMemo - normalizedData IS:", JSON.stringify(normalizedData, null, 2));

  useEffect(() => {
    // console.log('TechnicalCasePrepSection - Normalized data in useEffect:', normalizedData);
    
    markStepComplete(6); 
  }, [normalizedData, markStepComplete]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!normalizedData || Object.keys(normalizedData).length === 0) {
    
    return (
      <Card className="text-center p-8 border-dashed border-yellow-400 bg-yellow-50">
        <CardHeader><CardTitle className="flex items-center justify-center text-yellow-700"><AlertTriangle className="w-8 h-8 mr-3" />Content Not Available</CardTitle></CardHeader>
        <CardContent><p className="text-yellow-600">Initial data for technical case prep is missing.</p></CardContent>
      </Card>
    );
  }

  const hasPrompts = Boolean(normalizedData.prompts && normalizedData.prompts.length > 0);
  const hasKeyTermsGlossary = Boolean(normalizedData.key_terms_glossary && normalizedData.key_terms_glossary.length > 0);
  const hasKeyConcepts = Boolean(normalizedData.key_concepts && normalizedData.key_concepts.length > 0 && !hasKeyTermsGlossary);
  const hasSampleCaseWalkthrough = Boolean(normalizedData.sample_case_walkthrough && normalizedData.sample_case_walkthrough.trim() !== '');
  const hasPreparationTips = Boolean(normalizedData.preparation_tips && normalizedData.preparation_tips.length > 0);
  const hasAnyContent = hasPrompts || hasKeyConcepts || hasSampleCaseWalkthrough || hasKeyTermsGlossary || hasPreparationTips;

  // console.log('[DEBUG] TechnicalCasePrepSection - Final Section visibility:', { hasPrompts, hasKeyConcepts, hasSampleCaseWalkthrough, hasKeyTermsGlossary, hasPreparationTips, hasAnyContent });

  if (!hasAnyContent) {
    return (
      <Card className="text-center p-8 border-dashed border-gray-300 bg-gray-50">
        <CardHeader><CardTitle className="flex items-center justify-center text-gray-600"><BookOpen className="w-8 h-8 mr-3" />No Technical Prep Content Generated</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-500">
            It seems no specific technical preparation content was generated for this role.
            This can happen if the job description didn't highlight specific technical skills that map to our content generation.
            Focus on general technical interview principles and practice common problems in your field.
          </p>
           <div className="mt-3 p-3 bg-white rounded-md border border-yellow-200">
            <p className="text-xs font-mono text-gray-600 overflow-x-auto">
              Normalized Data (empty): {JSON.stringify(normalizedData, null, 2)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // console.log("%%% MEGA VISIBILITY CHECK: TechnicalCasePrepSection IS ABOUT TO RENDER MAIN CONTENT %%%");

  return (
    <>
      {/* <h1 style={{ backgroundColor: 'lime', color: 'black', fontSize: '20px', padding: '10px', textAlign: 'center', border: '3px solid red', zIndex: '9999', position: 'relative', margin:'10px' }}>
        MEGA VISIBILITY CHECK: MAIN RETURN (v2-UI file)
      </h1> */}

      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-800">Technical Case Prep</h2>
          
        </div>

        
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

        
        {hasKeyConcepts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Brain className="w-5 h-5 mr-2 text-purple-600" />Key Technical Concepts</CardTitle>
              <CardDescription>Core concepts relevant to technical cases in this domain.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    {normalizedData.key_concepts?.map((concept, index) => (
                        <li key={`concept-${index}`}>{concept}</li>
                    ))}
                </ul>
            </CardContent>
          </Card>
        )}

        
        {hasSampleCaseWalkthrough && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 mr-3 text-blue-500" />
                <CardTitle className="text-xl font-semibold">Sample Case Walkthrough</CardTitle>
              </div>
              <CardDescription>An example walkthrough of a typical case.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none p-3 border rounded-md bg-gray-50 overflow-y-auto" style={{ maxHeight: '300px' }}>
                <ReactMarkdown components={{ h3: CustomH3 }}>{normalizedData.sample_case_walkthrough || ''}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        
        {hasKeyTermsGlossary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><BookOpen className="w-5 h-5 mr-2 text-teal-600" />Technical Glossary</CardTitle>
              <CardDescription>Definitions of key technical terms you might encounter.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pr-2 overflow-y-auto" style={{ maxHeight: '400px' }}>
                {normalizedData.key_terms_glossary?.map((term, index: number) => (
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
