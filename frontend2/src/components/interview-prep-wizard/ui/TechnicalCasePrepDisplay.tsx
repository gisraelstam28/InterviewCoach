import React from 'react';

export type CaseStep = {
  problem: string;
  approach: string[];
  solution: string;
};

export type GlossaryTerm = {
  term: string;
  definition: string;
};

interface TechnicalCasePrepProps {
  prompt?: string;
  sampleAnswer?: string;
  caseWalkthrough?: CaseStep;
  glossary?: GlossaryTerm[];
}

// Utility function to render text with **bold** markdown as <strong> tags
const renderBoldText = (text: string | undefined): React.ReactNode[] => {
  if (!text) return [];
  return text.split(/(\*{2}[^\*]+\*{2})/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
    }
    return part;
  });
};

const cleanFormattingArtifacts = (text: string | undefined): string => {
  if (!text) return '';
  let cleaned = text.trim();
  // Remove leading " : ", "• : ", or just ":" if it's the first non-whitespace char
  cleaned = cleaned.replace(/^(\s*[:•]\s*[:\s]*)*/, '');
  // Remove trailing "::" or ":"
  cleaned = cleaned.replace(/[:\s]+$/, '');
  return cleaned.trim();
};

export const TechnicalCasePrepDisplay: React.FC<TechnicalCasePrepProps> = ({
  prompt,
  sampleAnswer,
  caseWalkthrough,
  glossary,
}) => {
  // Check if there's any content to display
  if (!prompt && !sampleAnswer && !caseWalkthrough && !glossary) {
    return <p className="text-gray-500">No technical or case prep information available.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Prompt & Sample Answer */}
      {(prompt || sampleAnswer) && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {prompt && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Prompt</h2>
              <div className="bg-gray-50 rounded-md p-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {renderBoldText(prompt)}
              </div>
            </>
          )}
          {sampleAnswer && (
            <>
              <h2 className={`text-2xl font-semibold text-gray-800 mb-4 ${prompt ? 'mt-6' : ''}`}>Sample Answer</h2>
              <div className="bg-gray-50 rounded-md p-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {renderBoldText(sampleAnswer)}
              </div>
            </>
          )}
        </div>
      )}

      {/* Sample Case Walkthrough */}
      {caseWalkthrough && (caseWalkthrough.problem || caseWalkthrough.approach?.length > 0 || caseWalkthrough.solution) && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sample Case Walkthrough</h2>
          <div className="space-y-6">
            {caseWalkthrough.problem && (
              <div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Problem</h3>
                <div className="bg-gray-50 rounded-md p-4 text-gray-700 leading-relaxed whitespace-pre-line">
                  {renderBoldText(cleanFormattingArtifacts(caseWalkthrough.problem))}
                </div>
              </div>
            )}
            {caseWalkthrough.approach && caseWalkthrough.approach.length > 0 && (
              <div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Approach</h3>
                <ul className="list-inside list-disc space-y-3 pl-2">
                  {caseWalkthrough.approach.map((step, idx) => {
                    const cleanedStep = cleanFormattingArtifacts(step);
                    if (!cleanedStep) return null; // Don't render empty or artifact-only steps

                    const prefixMatch = cleanedStep.match(/^(\d+\.\s*)/);
                    if (prefixMatch) {
                      const prefix = prefixMatch[1];
                      const restOfStep = cleanedStep.substring(prefix.length);
                      return (
                        <li key={idx} className="text-gray-700 leading-relaxed">
                          <strong>{prefix}</strong>{renderBoldText(restOfStep)}
                        </li>
                      );
                    }
                    return (
                      <li key={idx} className="text-gray-700 leading-relaxed">
                        {renderBoldText(cleanedStep)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {caseWalkthrough.solution && (
              <div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Solution</h3>
                <div className="bg-gray-50 rounded-md p-4 text-gray-700 leading-relaxed whitespace-pre-line">
                  {renderBoldText(cleanFormattingArtifacts(caseWalkthrough.solution))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Terms Glossary */}
      {glossary && glossary.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Key Terms Glossary</h2>
          <dl className="space-y-6">
            {glossary.map(({ term, definition }) => (
              <div key={term} className="space-y-1">
                <dt className="text-lg font-medium text-gray-700">{term}</dt>
                <dd className="bg-gray-50 rounded-md p-4 text-gray-700 leading-relaxed whitespace-pre-line">
                  {renderBoldText(definition)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};
