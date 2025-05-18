import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import UpgradeModal from './UpgradeModal';

interface NavbarProps {
  onUpgrade?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onUpgrade }) => {
  const { isLoggedIn, isPremium, login, logout, upgradeToPremium } = useUser();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">Job Search Assistant</Link>
          <div>
            {!isLoggedIn ? (
              <button 
                onClick={login}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-base font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {isPremium ? (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      Premium Account
                    </span>
                  ) : 'Free Account'}
                </span>
                {!isPremium && (
                  <button 
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-lg text-base font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    Upgrade to Premium
                  </button>
                )}
                <button 
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-2 overflow-x-auto scrollbar-hide">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded transition-colors">Home</Link>
            <Link to="/job-search" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded transition-colors">Job Search</Link>
            {/* <Link to="/interview-prep" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded transition-colors">Interview Prep</Link> */}
            <Link to="/interview-v2/step/0" className="text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-2 text-base rounded transition-colors ml-1">Interview Prep V2 (Beta)</Link>
            {isPremium && (
              <Link to="/saved-jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded transition-colors">Saved Jobs</Link>
            )}
            <Link to="/account" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium rounded transition-colors">Account</Link>
          </div>
        </nav>
      </header>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        feature="general"
      />
    </>
  );
};

export default Navbar;
