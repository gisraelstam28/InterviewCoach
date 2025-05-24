import React from 'react';
import { useInterviewPrepWizardStore } from '../../../store/interviewPrepWizardStore';
import {
  InterviewPrepV2Guide,
  // Import section models if you need to access their specific typed properties directly
  // For now, renderSection handles 'any'
} from '../../../types/interviewPrepWizard';

/**
 * Helper function to render a section if data exists.
 */
const renderSection = (title: string, content: any) => {
  if (!content) return null;

  let displayContent;
  if (typeof content === 'string') {
    displayContent = <p className="text-gray-700 whitespace-pre-wrap">{content}</p>;
  } else if (Array.isArray(content)) {
    // Assuming array of simple strings or objects with a 'point' or 'questionText' property
    displayContent = (
      <ul className="list-disc list-inside pl-4 text-gray-700">
        {content.map((item, index) => (
          <li key={index}>{typeof item === 'object' ? item.point || item.questionText : item}</li>
        ))}
      </ul>
    );
  } else if (typeof content === 'object') {
    // For complex objects, stringify them for now
    displayContent = <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{JSON.stringify(content, null, 2)}</pre>;
  } else {
    displayContent = <p className="text-gray-700">{String(content)}</p>;
  }

  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {displayContent}
    </div>
  );
};

/**
 * GuideDisplayStep: Component for displaying the generated interview guide.
 */
const GuideDisplayStep: React.FC = () => {
  const interviewGuide = useInterviewPrepWizardStore((state) => state.interviewGuide);

  if (!interviewGuide) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Step 4: Your Interview Guide</h2>
        <p className="text-center text-gray-600">Loading your guide...</p>
        {/* You could add a spinner here */}
      </div>
    );
  }

  // Data is now nested within sections
  const { 
    section_0_welcome,
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
  } = interviewGuide;

  // The main title for the guide might come from a specific section or be static.
  // For example, section_0_welcome might contain an overall title or greeting.
  // The old top-level `title` and `createdAt` are not in InterviewPrepV2Guide.

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">Your Personalized Interview Guide</h2>
      {/* Render sections based on the new structure */}
      {renderSection('Welcome & Introduction', section_0_welcome?.introduction || section_0_welcome)} 
      {renderSection('Company & Industry Insights', section_1_company_industry)} 
      {renderSection('Calendar Invites & Scheduling', section_2_calendar_invites)}
      {renderSection('Understanding Role Success', section_3_role_success)}
      {renderSection('Role Understanding & Fit Assessment', section_4_role_understanding_fit_assessment)}
      {renderSection('STAR Story Bank', section_5_star_story_bank)}
      {renderSection('Technical & Case Prep', section_6_technical_case_prep)}
      {renderSection('Mock Interview Practice', section_7_mock_interview)}
      {renderSection('Insider Cheat Sheet', section_8_insider_cheat_sheet)}
      {renderSection('Questions to Ask Interviewers', section_9_questions_to_ask)}
      {renderSection('Offer Negotiation Strategy', section_10_offer_negotiation)}
      {renderSection('Export & Share Options', export_share)}

    </div>
  );
};

export default GuideDisplayStep;

