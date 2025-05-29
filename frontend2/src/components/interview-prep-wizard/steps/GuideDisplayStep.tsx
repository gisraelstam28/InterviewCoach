import React from 'react';
import { RoleCriterionDisplay, RoleCriterionItem } from '../ui/RoleCriterionDisplay';
import { StoryBankDisplay, StoryDisplayItem } from '../ui/StoryBankDisplay';
import { TechnicalCasePrepDisplay, CaseStep } from '../ui/TechnicalCasePrepDisplay';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore'; 
import {
  InterviewPrepV2Guide,
  WelcomeSectionModel,
  CompanyIndustrySectionModel,
  CalendarInvitesSectionModel,
  RoleSuccessSectionModel,
  RoleUnderstandingFitAssessmentSectionModel,
  StarStoryBankSectionModel,
  StarStoryItem,
  TechnicalCasePrepSectionModel,
  TechnicalCasePrepPromptItem,
  KeyTermItem, // KeyTermItem from backend
  MockInterviewSectionModel,
  MockInterviewQuestionItem,
  InsiderCheatSheetSectionModel,
  RecentExecQuoteItem,
  QuestionsToAskSectionModel,
  OfferNegotiationSectionModel,
  SalaryRange,
  ExportShareSectionModel
  // CaseWalkthroughModel and GlossaryTerm are not used from here or not found
} from '../../../types/interviewPrepWizard';

import {
  AcademicCapIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  SparklesIcon,
  StarIcon,
  UserGroupIcon,
  ArrowPathIcon, 
  ArrowUpIcon, 
} from '@heroicons/react/24/outline';

// Helper function to render key-value pairs
const renderKeyValue = (label: string, value: any, isPreformatted: boolean = false, valueClassName: string = 'text-gray-800 leading-relaxed text-base') => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return null;
  
  let displayValueNode: React.ReactNode;
  const urlRegex = /^(ftp|http|https):\/\/[^ "\r\n]+$/;

  if (typeof value === 'string' && urlRegex.test(value)) {
    displayValueNode = <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline break-all">{value}</a>;
  } else if (isPreformatted) { // isPreformatted means it's a long string needing <pre> for whitespace
    // Use div with pre-wrap for consistent styling with other values, but respect whitespace
    displayValueNode = <div className={`bg-gray-100 p-3 rounded-md mt-1 ${valueClassName} whitespace-pre-wrap`}>{String(value)}</div>;
  } else if (typeof value === 'object' && value !== null) {
    // If it's an object/array and not preformatted, delegate to renderObject
    return (
      <div className="mb-3"> {/* Increased mb */}
        <strong className="text-sm font-semibold text-gray-900 block mb-1">{label}:</strong> {/* Bolder label */}
        <div className="pl-3 border-l-2 border-gray-200 mt-1"> {/* Indent nested object */}
          {renderObject(value, 0, true)} {/* isSubObject = true to avoid redundant labels for top-level object keys */}
        </div>
      </div>
    );
  } else { // Simple string/number value
    displayValueNode = <div className={`bg-gray-100 p-3 rounded-md mt-1 ${valueClassName}`}>{String(value)}</div>;
  }

  return (
    <div className="mb-3"> {/* Increased mb */}
      <strong className="text-sm font-semibold text-gray-900 block mb-0.5">{label}:</strong> {/* Bolder label, tighter margin to value */}
      {displayValueNode}
    </div>
  );
};

// Helper function to render complex objects (recursive)
const renderObject = (obj: any, level: number = 0, isSubObject: boolean = false): React.ReactNode => {
  if (typeof obj !== 'object' || obj === null) {
    // Handle primitive types if passed directly to renderObject
    const urlRegex = /^(ftp|http|https):\/\/[^ "\r\n]+$/;
    if (typeof obj === 'string' && urlRegex.test(obj)) {
      return <a href={obj} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline break-all">{obj}</a>;
    }
    return <span className="text-gray-700 leading-relaxed text-base">{String(obj)}</span>; // Ensure base size
  }

  if (Array.isArray(obj)) {
    // Special handling for arrays of news-like items
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null && ('title' in obj[0] || 'summary' in obj[0])) {
      return (
        <ul className="space-y-4 mt-1"> {/* Increased space-y */} 
          {obj.map((item, index) => (
            <li key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {item.title && (
                <h5 className="font-semibold text-indigo-700 mb-1 text-md">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.title}
                    </a>
                  ) : item.title}
                </h5>
              )}
              {item.summary && <p className={`text-base text-gray-700 whitespace-pre-wrap mb-2 ${item.title ? 'mt-1' : ''}`}>{item.summary}</p>}
              {item.date && <p className="text-sm text-gray-500">Date: {new Date(item.date).toLocaleDateString()}</p>}
              {item.source && <p className="text-sm text-gray-500">Source: {item.source}</p>}
              {/* Render other properties if they exist and aren't handled above */}
              {Object.entries(item).map(([key, val]) => {
                if (['title', 'url', 'summary', 'date', 'source'].includes(key)) return null;
                return renderKeyValue(key.replace(/_/g, ' ').replace(/\b(\w)/g, char => char.toUpperCase()), val, typeof val === 'string' && val.length > 80);
              })}
            </li>
          ))}
        </ul>
      );
    }
    // Generic array rendering
    return (
      <ul className={`list-disc pl-6 mt-4 space-y-1.5${level > 0 ? 'ml-4' : ''}`}> {/* Increased space-y */} 
        {obj.map((item, index) => (
          <li key={index} className="text-base text-gray-700 leading-relaxed">
            {renderObject(item, level + 1, true)}
          </li>
        ))}
      </ul>
    );
  }

  // Generic object rendering
  return (
    <div className={`space-y-2.5 ${level > 0 && !isSubObject ? 'pl-3 border-l-2 border-gray-200' : ''} ${isSubObject ? '' : 'mt-1'}`}> 
      {Object.entries(obj).map(([entryKey, entryValue]) => {
        const formattedDisplayLabel = entryKey.replace(/_/g, ' ').replace(/\b(\w)/g, char => char.toUpperCase());
        const renderedValueElement = renderKeyValue(
          formattedDisplayLabel,
          entryValue,
          typeof entryValue === 'string' && entryValue.length > 80,
          'text-base text-gray-700 leading-relaxed'
        );

        // Ensure a key is added if the element is valid
        if (React.isValidElement(renderedValueElement)) {
          return React.cloneElement(renderedValueElement, { key: entryKey });
        }
        return renderedValueElement; // Should be null if not a valid element already handled by renderKeyValue
      })}
    </div>
  );
};

/**
 * Helper function to render a section if data exists.
 */
const renderSection = (title: string, content: any, sectionKey: keyof InterviewPrepV2Guide | string, toggleCollapsed: () => void, isCollapsed: boolean = false) => {
  if (!content || (typeof content === 'object' && content !== null && Object.keys(content).length === 0 && !Array.isArray(content))) return null;

  let displayContent;
  let IconComponent: React.ElementType = DocumentTextIcon;
  if (sectionKey === 'section_1_company_industry') IconComponent = BriefcaseIcon;
  else if (sectionKey === 'section_2_calendar_invites') IconComponent = CalendarDaysIcon;
  else if (sectionKey === 'section_3_role_success') IconComponent = ChartBarIcon;
  else if (sectionKey === 'section_4_role_understanding_fit_assessment') IconComponent = UserGroupIcon;
  else if (sectionKey === 'section_5_star_story_bank') IconComponent = StarIcon;
  else if (sectionKey === 'section_6_technical_case_prep') IconComponent = AcademicCapIcon;
  else if (sectionKey === 'section_7_mock_interview') IconComponent = ChatBubbleLeftRightIcon;
  else if (sectionKey === 'section_8_insider_cheat_sheet') IconComponent = LightBulbIcon;
  else if (sectionKey === 'section_9_questions_to_ask') IconComponent = PresentationChartLineIcon;

  if (sectionKey === 'section_3_role_success') {
    const roleSuccessContent = content as RoleSuccessSectionModel;
    const elements: React.ReactNode[] = [];
    const propertyOrder: (keyof RoleSuccessSectionModel)[] = ['must_haves', 'nice_to_haves', 'qualifications', 'job_duties', 'overall_readiness', 'focus_recommendations'];
    for (const key of propertyOrder) {
      const value = roleSuccessContent[key];
      if (value === undefined || value === null) continue;
      const title = (key as string).split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      if ((key === 'must_haves' || key === 'nice_to_haves') && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'text' in value[0] && 'met' in value[0] && 'explanation' in value[0]) {
        const items = value.filter(item => typeof item.text === 'string' && typeof item.met === 'boolean' && typeof item.explanation === 'string') as RoleCriterionItem[];
        if (items.length > 0) {
          elements.push(
            <div key={key} className='mb-6'>
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h4>
              <RoleCriterionDisplay items={items} />
            </div>
          );
        }
      } else if (Array.isArray(value)) {
        elements.push(
          <div key={key} className="mb-4">
            <strong className="text-md font-semibold text-gray-900 block mb-2">{title}:</strong>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              {value.map((item: any, index: number) => (
                <li key={index} className="text-base text-gray-700 leading-relaxed">{renderObject(item, 0, true)}</li>
              ))}
            </ul>
          </div>
        );
      } else if (typeof value === 'object' && value !== null) {
        elements.push(
          <div key={key} className="mb-4">
            <strong className="text-md font-semibold text-gray-900 block mb-2">{title}:</strong>
            {renderObject(value, 0, true)}
          </div>
        );
      } else {
        elements.push(renderKeyValue(title, value, typeof value === 'string' && value.length > 80));
      }
    }
    displayContent = <div className="space-y-6">{elements}</div>;
  } else if (sectionKey === 'section_4_role_understanding_fit_assessment') {
    const fitContent = content as RoleUnderstandingFitAssessmentSectionModel;
    const elements: React.ReactNode[] = [];
    const propertyOrder: (keyof RoleUnderstandingFitAssessmentSectionModel)[] = ['role_summary', 'key_responsibilities_summary', 'overall_fit_rating', 'fit_assessment_details'];
    
    for (const key of propertyOrder) {
      const value = fitContent[key];
      if (value === undefined || (value === null && key !== 'fit_assessment_details')) continue;

      const title = (key as string).split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      if (key === 'fit_assessment_details') {
        let fitDetailsParsed: RoleCriterionItem[] | null = null;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.every(item => typeof item.text === 'string' && typeof item.met === 'boolean' && typeof item.explanation === 'string')) {
              fitDetailsParsed = parsed;
            }
          } catch (error) {
            // console.warn("[GuideDisplayStep] Failed to parse fit_assessment_details (string) for section_4:", error);
          }
        } else if (Array.isArray(value) && value.every(item => item && typeof item.text === 'string' && typeof item.met === 'boolean' && typeof item.explanation === 'string')) {
          fitDetailsParsed = value as RoleCriterionItem[];
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) { // Handle if it's a single object instead of array
            const singleItem = value as RoleCriterionItem;
            if (singleItem && typeof singleItem.text === 'string' && typeof singleItem.met === 'boolean' && typeof singleItem.explanation === 'string') {
                fitDetailsParsed = [singleItem];
            }
        }

        if (fitDetailsParsed && fitDetailsParsed.length > 0) {
          elements.push(<div key={key} className='mb-6'><h4 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h4><RoleCriterionDisplay items={fitDetailsParsed} /></div>);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) { 
          elements.push(<div key={key} className="mb-4"><strong className="text-md font-semibold text-gray-900 block mb-2">{title}:</strong>{renderObject(value, 0, true)}</div>);
        } else if (value && (typeof value === 'string' || Array.isArray(value))) { 
           elements.push(renderKeyValue(title, value, typeof value === 'string' && value.length > 80));
        } else if (value) {
           elements.push(renderKeyValue(title, String(value)));
        }
      } else if (key === 'key_responsibilities_summary' && Array.isArray(value)) {
        elements.push(
          <div key={key} className="mb-4">
            <strong className="text-md font-semibold text-gray-900 block mb-2">{title}:</strong>
            {value.length > 0 ? (
              <ul className="list-disc pl-6 mt-1 space-y-1">
                {value.map((item: string, index: number) => (
                  <li key={index} className="text-base text-gray-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-700 leading-relaxed italic">N/A</p>
            )}
          </div>
        );
      } else {
        elements.push(renderKeyValue(title, value, typeof value === 'string' && value.length > 80));
      }
    }
    displayContent = <div className="space-y-4">{elements}</div>;
  } else if (sectionKey === 'section_5_star_story_bank') {
    const storyBankContent = content as StarStoryBankSectionModel;
    if (storyBankContent.stories && storyBankContent.stories.length > 0) {
      const displayStories: StoryDisplayItem[] = storyBankContent.stories.map((story: StarStoryItem, index: number) => ({
        title: story.behavioral_question || story.title || `STAR Story ${index + 1}`,
        competency: story.competency || 'N/A',
        behavioralQuestion: story.behavioral_question || 'N/A',
        situation: story.situation || 'N/A',
        task: story.task || 'N/A',
        action: story.action || 'N/A',
        result: story.result || 'N/A',
        interviewer_advice: story.interviewer_advice || 'N/A',
        tags: story.tags || [],
        key_contributions: story.key_contributions || [],
        skills_demonstrated: story.skills_demonstrated || [],
        tailoring_suggestions: story.tailoring_suggestions || [],
      }));
      displayContent = <StoryBankDisplay stories={displayStories} />;
    } else {
      displayContent = <p className="text-gray-500">No STAR stories available for this section.</p>;
    }
  } else if (sectionKey === 'section_6_technical_case_prep') {
    const techCaseContent = content as TechnicalCasePrepSectionModel;
    let displayPrompt: string | undefined = undefined;
    let displaySampleAnswer: string | undefined = undefined;
    let displayCaseWalkthrough: CaseStep | undefined = undefined;
    let displayGlossary: Array<{ term: string; definition: string }> | undefined = undefined;

    if (techCaseContent && techCaseContent.prompts && techCaseContent.prompts.length > 0) {
      const firstPrompt = techCaseContent.prompts[0] as TechnicalCasePrepPromptItem;
      if (firstPrompt) {
        displayPrompt = firstPrompt.question;
        displaySampleAnswer = firstPrompt.sample_answer;
      }
    }

    if (techCaseContent && typeof techCaseContent.sample_case_walkthrough === 'string') {
      const walkthroughText = techCaseContent.sample_case_walkthrough;
      const problemMatch = walkthroughText.match(/###\s*Problem\s*([\s\S]*?)(?=###\s*Approach|$)/i);
      const approachMatch = walkthroughText.match(/###\s*Approach\s*([\s\S]*?)(?=###\s*Solution|$)/i);
      const solutionMatch = walkthroughText.match(/###\s*Solution\s*([\s\S]*)/i);

      const problemText = problemMatch ? problemMatch[1].trim() : '';
      const approachText = approachMatch ? approachMatch[1].trim() : '';
      const solutionText = solutionMatch ? solutionMatch[1].trim() : '';
      
      const approachStepsArray = approachText ? approachText.split(/\r?\n/).map((step: string) => step.trim()).filter((step: string) => step) : [];

      if (problemText || approachStepsArray.length > 0 || solutionText) {
        displayCaseWalkthrough = {
          problem: problemText,
          approach: approachStepsArray, 
          solution: solutionText,
        };
      }
    }

    if (techCaseContent && techCaseContent.key_terms_glossary && techCaseContent.key_terms_glossary.length > 0) {
      displayGlossary = techCaseContent.key_terms_glossary
        .filter((item: KeyTermItem) => typeof item.term === 'string' && typeof item.definition === 'string')
        .map((item: KeyTermItem) => ({
          term: item.term!,
          definition: item.definition!,
        }));
    }
    
    if (displayPrompt || displaySampleAnswer || displayCaseWalkthrough || (displayGlossary && displayGlossary.length > 0)) {
      displayContent = (
        <TechnicalCasePrepDisplay
          prompt={displayPrompt}
          sampleAnswer={displaySampleAnswer}
          caseWalkthrough={displayCaseWalkthrough} 
          glossary={displayGlossary} 
        />
      );
    } else {
      displayContent = <p className="text-gray-500">No technical or case prep information available for this section.</p>;
    }
  } else if (sectionKey === 'section_7_mock_interview') {
    const mockInterviewContent = content as MockInterviewSectionModel;
    if (mockInterviewContent.questions && mockInterviewContent.questions.length > 0) {
      const questions = mockInterviewContent.questions.map((q: MockInterviewQuestionItem, index: number) => (
        <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold text-gray-700">{q.question}</p>
          {q.sample_answer && <p className="text-sm text-gray-600 mt-1 whitespace-pre-line"><strong>Sample Answer:</strong> {q.sample_answer}</p>}
          {q.tips && q.tips.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-500">Tips:</p>
              <ul className="list-disc list-inside pl-2 text-xs text-gray-500">
                {q.tips.map((tip: string, tipIndex: number) => <li key={tipIndex}>{tip}</li>)}
              </ul>
            </div>
          )}
        </div>
      ));
      displayContent = <div className="space-y-4">{questions}</div>;
    } else {
      displayContent = <p className="text-gray-500">No mock interview questions available.</p>;
    }
  } else if (sectionKey === 'section_8_insider_cheat_sheet') {
    const cheatSheetContent = content as InsiderCheatSheetSectionModel;
    const elements: React.ReactNode[] = [];
    const propertyOrder: (keyof InsiderCheatSheetSectionModel)[] = ['culture_cues', 'recent_exec_quotes', 'financial_snapshot', 'glassdoor_pain_points'];
    
    for (const key of propertyOrder) {
      const value = cheatSheetContent[key];
      if (value === undefined || value === null && key !== 'financial_snapshot') continue;
      const title = (key as string).split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      if (Array.isArray(value)) {
        if (key === 'recent_exec_quotes') {
          elements.push(
            <div key={key} className="mb-4">
              <strong className="text-md font-semibold text-gray-900 block mb-2">{title}:</strong>
              {value.length > 0 ? (
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  {(value as { quote: string; speaker: string; context_url?: string }[]).map((item, index) => (
                    <li key={`${key}-${index}`} className="text-base text-gray-700 leading-relaxed mb-2">
                      <p className="italic">"{item.quote}"</p>
                      <p className="text-sm text-gray-600">- {item.speaker}</p>
                      {item.context_url && (
                        <a href={item.context_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                          Source
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed italic">N/A</p>
              )}
            </div>
          );
        } else { // For other arrays like culture_cues, glassdoor_pain_points
          elements.push(
            <div key={key} className="mb-4">
              <strong className="text-md font-semibold text-gray-900 block mb-2">{title}:</strong>
              {value.length > 0 ? (
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  {value.map((item: string, index: number) => (
                    <li key={`${key}-${index}`} className="text-base text-gray-700 leading-relaxed">{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-gray-700 leading-relaxed italic">N/A</p>
              )}
            </div>
          );
        }
      } else if (key === 'financial_snapshot') {
         elements.push(<div key={key}>{renderKeyValue(title, value || "N/A")}</div>);
      } else {
        elements.push(<div key={key}>{renderKeyValue(title, value, typeof value === 'string' && value.length > 80)}</div>);
      }
    }
    displayContent = <div className="space-y-4">{elements}</div>;
  } else if (sectionKey === 'section_9_questions_to_ask') {
    const questionsToAskContent = content as QuestionsToAskSectionModel;
    const elements: React.ReactNode[] = [];
    const categoryOrder: (keyof QuestionsToAskSectionModel)[] = ['for_hiring_manager', 'for_peers_team', 'for_leadership', 'general_questions'];

    for (const categoryKey of categoryOrder) {
      const questionsInCategory = questionsToAskContent[categoryKey];
      if (questionsInCategory && Array.isArray(questionsInCategory) && questionsInCategory.length > 0) {
        const categoryTitle = (categoryKey as string)
          .replace('for_', 'For ')
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        elements.push(
          <div key={categoryKey} className="mb-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-3">{categoryTitle}</h4>
            <ul className="list-disc pl-6 space-y-2">
              {questionsInCategory.map((question: string, index: number) => (
                <li key={index} className="text-base text-gray-700 leading-relaxed">{question}</li>
              ))}
            </ul>
          </div>
        );
      }
    }
    if (elements.length > 0) {
      displayContent = <div className="space-y-6">{elements}</div>;
    } else {
      displayContent = <p className="text-gray-500">No suggested questions to ask are available.</p>;
    }
  } else if (sectionKey === 'section_10_offer_negotiation') {
    const offerNegotiationContent = content as OfferNegotiationSectionModel;
    const elements: React.ReactNode[] = [];
    const propertyOrder: (keyof OfferNegotiationSectionModel)[] = ['negotiation_levers', 'salary_research_summary', 'counter_offer_strategy', 'walk_away_point', 'non_salary_benefits_to_consider', 'timeline_and_communication_tips'];
    if (offerNegotiationContent.expected_salary_range) {
      elements.push(
        renderKeyValue(
          'Expected Salary Range',
          `Min: ${offerNegotiationContent.expected_salary_range.min_salary}, Max: ${offerNegotiationContent.expected_salary_range.max_salary}, Currency: ${offerNegotiationContent.expected_salary_range.currency}`
        )
      );
    }
    for (const key of propertyOrder) {
      const value = offerNegotiationContent[key];
      if (value === undefined || value === null) continue;
      const title = (key as string).split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      elements.push(renderKeyValue(title, value, typeof value === 'string' && value.length > 80));
    }
    displayContent = <div className="space-y-4">{elements}</div>;
  } else if (sectionKey === 'section_0_welcome' || sectionKey === 'section_11_export_share') {
    displayContent = renderObject(content, 0);
  } else {
    // console.warn(`[GuideDisplayStep] Unhandled section key: ${sectionKey}. Using default object rendering.`);
    displayContent = renderObject(content, 0);
  }

  return (
    <div id={sectionKey.toString()} className="mb-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <button
        onClick={toggleCollapsed}
        className="w-full flex justify-between items-center text-left text-2xl font-semibold text-gray-800 mb-4 focus:outline-none"
      >
        <div className="flex items-center">
          <IconComponent className="h-7 w-7 mr-3 text-indigo-600" />
          {title}
        </div>
        {isCollapsed ? <ChevronDownIcon className="h-6 w-6 text-gray-500" /> : <ChevronUpIcon className="h-6 w-6 text-gray-500" />}
      </button>
      {!isCollapsed && (
        <div className="mt-4 prose prose-indigo max-w-none prose-p:text-gray-700 prose-li:text-gray-700 prose-headings:text-gray-800 prose-strong:text-gray-700 leading-relaxed text-base">
          {displayContent}
        </div>
      )}
    </div>
  );
}

// Table of Contents Component
const TableOfContents: React.FC<{ sections: Array<{ id: string, title: string, hasContent: boolean }> }> = ({ sections }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow sticky top-8">
      <h4 className="text-lg font-semibold text-indigo-700 mb-3">Table of Contents</h4>
      <ul className="space-y-2">
        {sections.map(section => (
          section.hasContent && (
            <li key={section.id}>
              <a 
                href={`#${section.id}`} 
                className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-150 text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section.title}
              </a>
            </li>
          )
        ))}
      </ul>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-4 w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-3 rounded-md border border-indigo-200 hover:bg-indigo-50 transition-colors duration-150"
      >
        Back to Top
      </button>
    </div>
  );
};

/**
 * GuideDisplayStep: Component for displaying the generated interview guide.
 */
const GuideDisplayStep: React.FC = () => {
  const guide = useInterviewPrepWizardStore((state) => state.interviewGuide);
  const { 
    section_1_company_industry,
    section_2_calendar_invites,
    section_3_role_success,
    section_4_role_understanding_fit_assessment,
    section_5_star_story_bank,
    section_6_technical_case_prep,
    section_7_mock_interview,
    section_8_insider_cheat_sheet,
    section_9_questions_to_ask,
    section_10_offer_negotiation,
    export_share
  } = guide || {};

  const sections: Array<{ id: string; title: string; hasContent: boolean }> = [
    { id: 'section_1_company_industry', title: 'Company & Industry Insights', hasContent: !!(section_1_company_industry && typeof section_1_company_industry === 'object' && Object.keys(section_1_company_industry).length > 0) },
    { id: 'section_2_calendar_invites', title: 'Calendar Invites & Scheduling', hasContent: !!(section_2_calendar_invites && typeof section_2_calendar_invites === 'object' && Object.keys(section_2_calendar_invites).length > 0) },
    { id: 'section_3_role_success', title: 'Understanding Role Success', hasContent: !!(section_3_role_success && typeof section_3_role_success === 'object' && Object.keys(section_3_role_success).length > 0) },
    { id: 'section_4_role_understanding_fit_assessment', title: 'Role Understanding & Fit Assessment', hasContent: !!(section_4_role_understanding_fit_assessment && typeof section_4_role_understanding_fit_assessment === 'object' && Object.keys(section_4_role_understanding_fit_assessment).length > 0) },
    { id: 'section_5_star_story_bank', title: 'STAR Story Bank', hasContent: !!(section_5_star_story_bank && typeof section_5_star_story_bank === 'object' && Object.keys(section_5_star_story_bank).length > 0) },
    { id: 'section_6_technical_case_prep', title: 'Technical & Case Prep', hasContent: !!(section_6_technical_case_prep && typeof section_6_technical_case_prep === 'object' && Object.keys(section_6_technical_case_prep).length > 0) },
    { id: 'section_7_mock_interview', title: 'Mock Interview Practice', hasContent: !!(section_7_mock_interview && typeof section_7_mock_interview === 'object' && Object.keys(section_7_mock_interview).length > 0) },
    { id: 'section_8_insider_cheat_sheet', title: 'Insider Cheat Sheet', hasContent: !!(section_8_insider_cheat_sheet && typeof section_8_insider_cheat_sheet === 'object' && Object.keys(section_8_insider_cheat_sheet).length > 0) },
    { id: 'section_9_questions_to_ask', title: 'Questions to Ask Interviewers', hasContent: !!(section_9_questions_to_ask && typeof section_9_questions_to_ask === 'object' && Object.keys(section_9_questions_to_ask).length > 0) },
    { id: 'section_10_offer_negotiation', title: 'Offer Negotiation Strategy', hasContent: !!(section_10_offer_negotiation && typeof section_10_offer_negotiation === 'object' && Object.keys(section_10_offer_negotiation).length > 0) },
    { id: 'export_share', title: 'Export & Share Options', hasContent: !!(export_share && typeof export_share === 'object' && Object.keys(export_share).length > 0) },
  ];

  const [expandedSections, setExpandedSections] = React.useState<string[]>([]); 
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  const toggleSection = (sectionId: string) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!guide) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-500">Loading guide...</p>
        {/* You might want to add a spinner here */}
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto"> {/* Changed from max-w-7xl to max-w-screen-2xl */} 
      <div className="bg-white rounded-xl shadow-lg px-4 py-6 md:px-6 md:py-8 mb-8"> {/* Adjusted padding */} 
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8 pb-4 border-b border-gray-200">Your Personalized Interview Guide</h2>
        
        <div className="md:flex md:gap-8">
          {/* Table of Contents - Sticky on desktop */}
          <div className="md:w-64 flex-none mb-6 md:mb-0">  
            <div className="hidden md:block">
              <TableOfContents sections={sections.filter(s => s.hasContent)} />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1"> 
            {renderSection('Company & Industry Insights', section_1_company_industry, 'section_1_company_industry', () => toggleSection('section_1_company_industry'), !expandedSections.includes('section_1_company_industry'))} 
            {renderSection('Calendar Invites & Scheduling', section_2_calendar_invites, 'section_2_calendar_invites', () => toggleSection('section_2_calendar_invites'), !expandedSections.includes('section_2_calendar_invites'))}
            {renderSection('Understanding Role Success', section_3_role_success, 'section_3_role_success', () => toggleSection('section_3_role_success'), !expandedSections.includes('section_3_role_success'))}
            {renderSection('Role Understanding & Fit Assessment', section_4_role_understanding_fit_assessment, 'section_4_role_understanding_fit_assessment', () => toggleSection('section_4_role_understanding_fit_assessment'), !expandedSections.includes('section_4_role_understanding_fit_assessment'))}
            {renderSection('STAR Story Bank', section_5_star_story_bank, 'section_5_star_story_bank', () => toggleSection('section_5_star_story_bank'), !expandedSections.includes('section_5_star_story_bank'))}
            {renderSection('Technical & Case Prep', section_6_technical_case_prep, 'section_6_technical_case_prep', () => toggleSection('section_6_technical_case_prep'), !expandedSections.includes('section_6_technical_case_prep'))}
            {renderSection('Mock Interview Practice', section_7_mock_interview, 'section_7_mock_interview', () => toggleSection('section_7_mock_interview'), !expandedSections.includes('section_7_mock_interview'))}
            {renderSection('Insider Cheat Sheet', section_8_insider_cheat_sheet, 'section_8_insider_cheat_sheet', () => toggleSection('section_8_insider_cheat_sheet'), !expandedSections.includes('section_8_insider_cheat_sheet'))}
            {renderSection('Questions to Ask Interviewers', section_9_questions_to_ask, 'section_9_questions_to_ask', () => toggleSection('section_9_questions_to_ask'), !expandedSections.includes('section_9_questions_to_ask'))}
            {renderSection('Offer Negotiation Strategy', section_10_offer_negotiation, 'section_10_offer_negotiation', () => toggleSection('section_10_offer_negotiation'), !expandedSections.includes('section_10_offer_negotiation'))}
            {renderSection('Export & Share Options', export_share, 'export_share', () => toggleSection('export_share'), !expandedSections.includes('export_share'))}
          </div>
        </div>
      </div>
      
      {/* Back to Top Button - Fixed at bottom right */}
      {showBackToTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200 focus:outline-none z-50"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default GuideDisplayStep;
