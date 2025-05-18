import React from 'react';

interface QuestionCardProps {
  question: string;
  suggestedAnswer: string;
  keyPoints: string[];
  isPremium: boolean;
  onPractice: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  suggestedAnswer,
  keyPoints,
  isPremium,
  onPractice
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow card-hover">
      <h4 className="text-md font-medium text-gray-900 mb-2">
        {question}
      </h4>
      
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Suggested Answer:</h5>
        <p className={`text-gray-600 text-sm ${!expanded && 'line-clamp-3'}`}>
          {suggestedAnswer}
        </p>
        {suggestedAnswer.length > 150 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-purple-600 hover:text-purple-800 text-sm mt-1"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-1">Key Points to Emphasize:</h5>
        <ul className="list-disc pl-5 space-y-1">
          {keyPoints.map((point, i) => (
            <li key={i} className="text-gray-600 text-sm">{point}</li>
          ))}
        </ul>
      </div>
      
      {isPremium && (
        <div className="mt-3 flex justify-end">
          <button 
            onClick={onPractice}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
            </svg>
            Practice this question
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
