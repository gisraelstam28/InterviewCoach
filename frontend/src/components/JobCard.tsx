import React from 'react';

export interface JobCardProps {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  matchReasoning: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  recommendations?: string[];
  isPremium: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  description,
  url,
  matchScore,
  matchReasoning,
  matchingSkills,
  missingSkills,
  recommendations,
  isPremium
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const getScoreColor = () => {
    if (matchScore >= 0.8) return 'bg-green-100 text-green-800';
    if (matchScore >= 0.6) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow card-hover">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div className="mb-3 md:mb-0">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-gray-600">{company} • {location}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center mb-1">
            <div className={`w-10 h-10 rounded-full ${getScoreColor()} flex items-center justify-center mr-2`}>
              <span className="font-semibold">{Math.round(matchScore * 100)}%</span>
            </div>
            <span className="text-sm text-gray-500">Match</span>
          </div>
          {url && (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-700 underline font-semibold hover:text-blue-900 text-sm mt-1"
              style={{ wordBreak: 'break-all' }}
            >
              🔗 View Full Job Posting
            </a>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Job Description</h4>
        <p className={`text-gray-600 text-sm ${!expanded && 'line-clamp-3'}`}>
          {description}
        </p>
        {description.length > 200 && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-blue-600 hover:text-blue-800 text-sm mt-1"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      
      <div className="mt-3">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Why This Matches You</h4>
        <p className="text-gray-600 text-sm">{matchReasoning}</p>
      </div>
      
      {matchingSkills && matchingSkills.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Matching Skills</h4>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map((skill, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {missingSkills && missingSkills.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Skills to Develop</h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {isPremium && recommendations && recommendations.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-700 mb-1">Personalized Recommendations</h4>
          <ul className="list-disc pl-5 space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-gray-600 text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobCard;
