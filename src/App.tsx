import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { AuthForm } from './components/AuthForm';
import { ChallengeList } from './components/ChallengeList';
import { CodeEditor } from './components/CodeEditor';
import { Leaderboard } from './components/Leaderboard';
import { DuelLobby } from './components/DuelLobby';
import { Challenge, Duel } from './types';
import { socketService } from './services/socket';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeDuel, setActiveDuel] = useState<Duel | null>(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  useEffect(() => {
    // Handle GitHub OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/';
    } else if (error) {
      console.error('GitHub OAuth error:', error);
    }
  }, []);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedChallenge(null);
    setActiveDuel(null);
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setCurrentView('editor');
  };

  const handleStartDuel = (duel: Duel, challenge: Challenge) => {
    setActiveDuel(duel);
    setSelectedChallenge(challenge);
    setCurrentView('duel');
  };

  const handleBackFromEditor = () => {
    setSelectedChallenge(null);
    setActiveDuel(null);
    setCurrentView(activeDuel ? 'duels' : 'challenges');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-6"
        >
          {currentView === 'challenges' && (
            <ChallengeList onSelectChallenge={handleSelectChallenge} />
          )}
          
          {currentView === 'duels' && (
            <DuelLobby onStartDuel={handleStartDuel} />
          )}
          
          {currentView === 'leaderboard' && (
            <Leaderboard />
          )}
          
          {(currentView === 'editor' || currentView === 'duel') && selectedChallenge && (
            <CodeEditor
              challenge={selectedChallenge}
              onBack={handleBackFromEditor}
              isDuel={currentView === 'duel'}
              timeRemaining={activeDuel ? 1800 : undefined} // 30 minutes default
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;