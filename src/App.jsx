
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import VoterDashboard from './components/VoterDashboard';
import { VotingProvider, useVoting } from './context/VotingContext';

const MainLayout = () => {
  const { isCommissioner, error, loading } = useVoting();

  // Simple Toast for Error
  useEffect(() => {
    if (error) {
      alert(error); // Using alert for simplicity as requested "UI toast or alert"
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <div className="text-center text-indigo-400 mb-4 animate-pulse">Processing Blockchain Transaction...</div>}
        <Routes>
          <Route path="/" element={
            <>
              {isCommissioner && <AdminDashboard />}
              <VoterDashboard />
            </>
          } />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <VotingProvider>
        <MainLayout />
      </VotingProvider>
    </Router>
  );
}

export default App;
