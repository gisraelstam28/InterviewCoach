import React, { useState } from 'react';
import axios from 'axios';

interface MockInterviewProps {
  isPremium: boolean;
  jobDescription: string;
  resumeText: string;
  companyName: string;
  initialQuestion: string;
}

interface MockInterviewResponse {
  feedback: string;
  follow_up_question: string;
  premium_required: boolean;
}

const MockInterview: React.FC<MockInterviewProps> = ({ 
  isPremium, 
  jobDescription, 
  resumeText, 
  companyName, 
  initialQuestion 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'question' | 'answer' | 'feedback', text: string}>>([
    { type: 'question', text: initialQuestion }
  ]);
  const [error, setError] = useState('');

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer to the question');
      return;
    }

    if (!isPremium) {
      setError('This feature is only available for premium users');
      return;
    }

    setIsLoading(true);
    setError('');

    // Add user answer to conversation history
    setConversationHistory(prev => [...prev, { type: 'answer', text: userAnswer }]);

    try {
      // Call the backend API
      const response = await axios.post('http://localhost:8000/api/mock-interview', {
        previous_question: currentQuestion,
        candidate_answer: userAnswer,
        job_description: jobDescription,
        resume_text: resumeText,
        company_name: companyName
      });

      const result: MockInterviewResponse = response.data;

      if (result.premium_required && !isPremium) {
        setError('This feature is only available for premium users');
      } else {
        // Add feedback and follow-up question to conversation history
        setConversationHistory(prev => [
          ...prev, 
          { type: 'feedback', text: result.feedback },
          { type: 'question', text: result.follow_up_question }
        ]);

        setFeedback(result.feedback);
        setCurrentQuestion(result.follow_up_question);
        setUserAnswer('');
      }
    } catch (err) {
      console.error('Error in mock interview:', err);
      setError('An error occurred during the mock interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-8 rounded-2xl border border-purple-200 shadow-lg max-w-xl mx-auto mt-8">
        <h3 className="text-2xl font-bold text-purple-800 mb-3 flex items-center">
          <svg className="w-6 h-6 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
          Premium Feature: Mock Interview
        </h3>
        <p className="text-purple-700 mb-6 text-base">
          The interactive mock interview feature is available exclusively for premium users. Upgrade to access this and other premium features.
        </p>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg text-base font-semibold shadow hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Mock Interview Session</h2>
      <p className="text-gray-600 mb-8 text-lg">
        Practice answering interview questions and receive AI-powered feedback in real-time.
      </p>

      <div className="mb-8 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl max-h-96 overflow-y-auto scrollbar-hide">
        {conversationHistory.map((item, index) => (
          <div key={index} className={`mb-6 ${item.type === 'answer' ? 'pl-8' : ''}`}>
            {item.type === 'question' && (
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                  <span className="text-purple-800 font-bold text-lg">Q</span>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-900 text-base">{item.text}</p>
                </div>
              </div>
            )}
            {item.type === 'answer' && (
              <div className="flex items-start justify-end">
                <div className="bg-blue-100 p-4 rounded-lg shadow">
                  <p className="text-gray-900 text-base">{item.text}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center ml-3">
                  <span className="text-blue-800 font-bold text-lg">A</span>
                </div>
              </div>
            )}
            {item.type === 'feedback' && (
              <div className="flex items-start mt-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-3">
                  <span className="text-green-800 font-bold text-lg">F</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow">
                  <p className="text-gray-900 text-base">{item.text}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
        <label htmlFor="answer" className="block text-base font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <textarea
          id="answer"
          name="answer"
          rows={4}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Type your answer to the current question..."
          className="mt-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-md text-base border border-gray-300 rounded-lg p-3 resize-none transition-all"
        />
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg font-semibold text-base">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmitAnswer}
          disabled={isLoading || !userAnswer.trim()}
          className={`px-6 py-2 rounded-lg text-base font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isLoading || !userAnswer.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
};

export default MockInterview;
