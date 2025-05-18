import React from 'react';

interface PremiumUpsellProps {
  feature: 'job-search' | 'interview-prep' | 'general';
  onUpgrade: () => void;
}

const PremiumUpsell: React.FC<PremiumUpsellProps> = ({ feature, onUpgrade }) => {
  const getFeatureSpecificContent = () => {
    switch (feature) {
      case 'job-search':
        return {
          title: 'Unlock Full Job Search Capabilities',
          description: 'Upgrade to Premium to access unlimited job searches, view all job results, and get detailed match analysis.',
          benefits: [
            'Unlimited job searches',
            'View all job results (not just top 2)',
            'Detailed skill matching analysis',
            'Personalized job recommendations'
          ]
        };
      case 'interview-prep':
        return {
          title: 'Unlock Advanced Interview Preparation',
          description: 'Upgrade to Premium for unlimited interview questions, mock interviews, and personalized feedback.',
          benefits: [
            'Unlimited interview questions',
            'Interactive mock interview sessions',
            'Real-time feedback on your answers',
            'Advanced preparation strategies'
          ]
        };
      default:
        return {
          title: 'Upgrade to Premium',
          description: 'Get full access to all features and unlock the full potential of Job Search Assistant.',
          benefits: [
            'Unlimited job searches',
            'Full interview preparation toolkit',
            'Interactive mock interviews',
            'Resume tailoring suggestions'
          ]
        };
    }
  };

  const content = getFeatureSpecificContent();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-blue-100 rounded-lg p-6 animate-fadeIn">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-purple-800">{content.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{content.description}</p>
          
          <ul className="mt-3 space-y-1">
            {content.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <button
              onClick={onUpgrade}
              className="btn-premium"
            >
              Upgrade Now - $9.99/month
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpsell;
