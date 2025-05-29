import React from 'react';
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
  KeyTermItem,
  MockInterviewSectionModel,
  MockInterviewQuestionItem,
  InsiderCheatSheetSectionModel,
  RecentExecQuoteItem,
  QuestionsToAskSectionModel,
  OfferNegotiationSectionModel,
  SalaryRange,
  ExportShareSectionModel
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
      <ul className={`list-disc pl-5 space-y-1.5 mt-1 ${level > 0 ? 'ml-4' : ''}`}> {/* Increased space-y */} 
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
  
  if (typeof content === 'string' || typeof content === 'number' || React.isValidElement(content)) {
    // For simple strings/numbers, render directly without prose for more width control
    if (typeof content === 'string' || typeof content === 'number') {
      displayContent = <div className="prose max-w-none text-gray-700 text-base">{content}</div>; 
    } else { // It's a React element, render as is
      displayContent = content;
    }
  } else if (Array.isArray(content)) {
    displayContent = (
      <ul className="list-disc pl-5 space-y-2">
        {content.map((item, index) => (
          <li key={index} className="text-gray-700 text-base"> 
            {typeof item === 'object' && item !== null ? renderObject(item) : item}
          </li>
        ))}
      </ul>
    );
  } else if (typeof content === 'object' && content !== null) {
    displayContent = renderObject(content as { [key: string]: any });
  }

  return (
    <div id={String(sectionKey)} className="mb-6 scroll-mt-20"> 
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 rounded-t-lg flex justify-between items-center cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
        onClick={toggleCollapsed}
      >
        <div className="flex items-center">
          <IconComponent className="h-6 w-6 text-white mr-3" />
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {isCollapsed ? <ChevronDownIcon className="h-6 w-6 text-white" /> : <ChevronUpIcon className="h-6 w-6 text-white" />}
      </div>
      {!isCollapsed && (
        <div className="bg-white p-5 rounded-b-lg shadow-md border-x border-b border-gray-200"> 
          {displayContent}
        </div>
      )}
    </div>
  );
};

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
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-8 pb-4 border-b border-gray-200">Your Personalized Interview Guide</h2>
        
        <div className="md:flex md:gap-8">
          {/* Table of Contents - Sticky on desktop */}
          <div className="md:w-1/5 mb-6 md:mb-0">  
            <div className="hidden md:block">
              <TableOfContents sections={sections.filter(s => s.hasContent)} />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:w-4/5"> 
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
