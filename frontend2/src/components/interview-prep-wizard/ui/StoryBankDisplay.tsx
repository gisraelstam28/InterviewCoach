import React from 'react';

// This type aligns with the provided example, mapping from StarStoryItem
export type StoryDisplayItem = {
  competency: string; // We might need to derive this or use a default
  behavioralQuestion: string; // Mapped from StarStoryItem.title
  situation: string;
  task: string;
  action: string;
  result: string;
  interviewerAdvice?: string; // Optional, as it's not in StarStoryItem
  tags: string[]; // Mapped from StarStoryItem.keywords
};

interface StoryBankDisplayProps {
  stories: StoryDisplayItem[];
}

export const StoryBankDisplay: React.FC<StoryBankDisplayProps> = ({ stories }) => {
  if (!stories || stories.length === 0) {
    return <p className="text-gray-500">No stories available in the story bank.</p>;
  }

  return (
    <div className="space-y-6">
      {stories.map((s, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
        >
          {/* Question Header */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            {s.competency && s.competency !== 'Competency Undefined' && (
              <h3 className="text-xl font-semibold text-indigo-700">
                {s.competency}
              </h3>
            )}
            {s.behavioralQuestion && s.behavioralQuestion !== 'Behavioral Question Undefined' && (
              <p className={`text-lg text-gray-700 ${s.competency && s.competency !== 'Competency Undefined' ? 'mt-2' : 'mt-0' }`}>
                {s.behavioralQuestion}
              </p>
            )}
          </div>

          {/* STAR Answer */}
          <dl className="space-y-4">
            {[ 
              { label: 'Situation', value: s.situation },
              { label: 'Task', value: s.task },
              { label: 'Action', value: s.action },
              { label: 'Result', value: s.result },
            ].map(item => (
              item.value ? (
                <div key={item.label}>
                  <dt className="text-sm font-semibold text-gray-700">{item.label}</dt>
                  <dd className="mt-1 text-gray-700 leading-relaxed whitespace-pre-line">{item.value}</dd>
                </div>
              ) : null
            ))}
            {s.interviewerAdvice && (
              <div>
                <dt className="text-sm font-semibold text-gray-700">Interviewer Advice</dt>
                <dd className="mt-1 text-gray-700 leading-relaxed whitespace-pre-line">{s.interviewerAdvice}</dd>
              </div>
            )}
          </dl>

          {/* Tags */}
          {s.tags && s.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
