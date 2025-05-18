import React from 'react';
import { useUser } from '../context/UserContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'job-search' | 'interview-prep' | 'general';
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose,
  feature = 'general'
}) => {
  const { upgradeToPremium } = useUser();

  const handleUpgrade = () => {
    upgradeToPremium();
    onClose();
  };

  if (!isOpen) return null;

  const getFeatureContent = () => {
    switch (feature) {
      case 'job-search':
        return {
          title: 'Upgrade to Premium for Unlimited Job Searches',
          benefits: [
            'Unlimited job searches',
            'View all job results (not just top 2)',
            'Detailed skill matching analysis',
            'Personalized job recommendations'
          ]
        };
      case 'interview-prep':
        return {
          title: 'Upgrade to Premium for Advanced Interview Prep',
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
          benefits: [
            'Unlimited job searches',
            'Full interview preparation toolkit',
            'Interactive mock interviews',
            'Resume tailoring suggestions'
          ]
        };
    }
  };

  const content = getFeatureContent();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{content.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600 mb-4">
            Upgrade to our premium plan to unlock all features and get the most out of Job Search Assistant.
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-purple-800 mb-2">Premium Benefits:</h4>
            <ul className="space-y-2">
              {content.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Premium Plan</span>
              <span className="text-xl font-bold text-blue-800">$9.99/month</span>
            </div>
            <p className="text-gray-500 text-sm">Cancel anytime. No long-term commitment required.</p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              Maybe Later
            </button>
            <button 
              onClick={handleUpgrade}
              className="btn-premium"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
