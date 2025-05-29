import React from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';

export type RoleCriterionItem = {
  text: string;
  met: boolean;
  explanation: string;
  resumeEvidence?: string; // Optional, as it might not always be present
};

interface RoleCriterionDisplayProps {
  items: RoleCriterionItem[];
  title?: string; // Optional title for the whole section of criteria
}

export const RoleCriterionDisplay: React.FC<RoleCriterionDisplayProps> = ({ items, title }) => {
  if (!items || items.length === 0) {
    return null; // Or some placeholder if no items are provided
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>}
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
        >
          {/* Criterion Text */}
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{item.text}</h3>

          {/* Met/Not Met Indicator */}
          <div className="flex items-center mb-6">
            {item.met ? (
              <CheckCircle2Icon className="h-7 w-7 text-green-500 flex-shrink-0" />
            ) : (
              <XCircleIcon className="h-7 w-7 text-red-500 flex-shrink-0" />
            )}
            <span className={`ml-3 text-lg font-medium ${item.met ? 'text-green-600' : 'text-red-600'}`}>
              {item.met ? "Met" : "Not Met"}
            </span>
          </div>

          {/* Explanation */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-1">
              Explanation
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {item.explanation}
            </p>
          </div>

          {/* Resume Evidence (if available) */}
          {item.resumeEvidence && (
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-1">
                Resume Evidence
              </h4>
              <p className="text-gray-700 leading-relaxed italic bg-gray-50 p-3 rounded-md">
                {item.resumeEvidence}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
