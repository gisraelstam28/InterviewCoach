import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import JobSearch from './components/JobSearch';
// import InterviewPrep from './components/InterviewPrep';
import Dashboard from './components/Dashboard';
import { UserProvider, useUser } from './context/UserContext';
import PremiumUpsell from './components/PremiumUpsell';
import StepContent from './components/interview-prep/interview-prep-v2-UI/components/interview-prep/StepContent';
import ExportPage from './components/interview-prep/interview-prep-v2-UI/components/interview-prep/ExportPage';

function StepContentWrapper() {
  const { stepId } = useParams();
  return <StepContent stepId={Number(stepId)} />;
}


const AccountPage = () => {
  const { isPremium, logout, upgradeToPremium } = useUser();
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      <p className="text-gray-600 mb-4">Manage your account settings and subscription.</p>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-medium text-gray-800 mb-2">Subscription Status</h2>
        <p className="text-gray-700">
          You are currently on the <span className="font-medium">{isPremium ? 'Premium' : 'Free'}</span> plan.
        </p>
        {!isPremium && (
          <div className="mt-4">
            <PremiumUpsell feature="general" onUpgrade={upgradeToPremium} />
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <button 
          onClick={logout}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const AppContent = () => {

  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/job-search" element={<JobSearch />} />
            {/* <Route path="/interview-prep" element={<InterviewPrep />} /> */}
            <Route path="/account" element={<AccountPage />} />
            <Route path="/interview-v2" element={<Navigate to="/interview-v2/step/0" replace />} />
            <Route path="/interview-v2/step/:stepId" element={<StepContentWrapper />} />
            <Route path="/interview-v2/export" element={<ExportPage />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-500 text-sm"> 2025 Job Search Assistant. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
