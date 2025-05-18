import React from 'react';

import { useUser } from '../context/UserContext';

const Dashboard: React.FC = () => {
  const { isPremium } = useUser();
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Welcome to Job Search Assistant
        </h2>
        <p className="text-gray-600">
          Discover curated job opportunities and prepare for interviews with our AI-powered assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-3">
            🔍 Targeted Job Search
          </h3>
          <p className="text-gray-700 mb-4">
            Upload your resume and set your preferences to discover relevant job opportunities.
          </p>
          <a href="/job-search" className="block w-full">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Start Job Search
            </button>
          </a>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <h3 className="text-lg font-medium text-purple-800 mb-3">
            🎤 Interview Preparation
          </h3>
          <p className="text-gray-700 mb-4">
            Get personalized interview questions and answers based on your resume and job description.
          </p>
          <a href="/interview-prep" className="block w-full">
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium">
              Prepare for Interview
            </button>
          </a>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          💸 Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-2">Free Plan</h4>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">1 job search per day</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">3 interview questions per job</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">2 job results per search</span>
              </li>
            </ul>
            <p className="text-xl font-bold text-gray-800 mb-4">$0</p>
            {isPremium ? (
              <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                Downgrade
              </button>
            ) : (
              <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                Current Plan
              </button>
            )}
          </div>

          <div className="border border-blue-200 rounded-lg p-6 bg-gradient-to-b from-white to-blue-50">
            <h4 className="text-lg font-medium text-blue-800 mb-2">Premium Plan</h4>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">Unlimited job searches</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">Full interview prep toolkit</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">Full job result access</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600">Resume tailoring tips</span>
              </li>
            </ul>
            <p className="text-xl font-bold text-blue-800 mb-4">$9.99/month</p>
            {isPremium ? (
              <button className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium">
                Current Plan
              </button>
            ) : (
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                Upgrade to Premium
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
