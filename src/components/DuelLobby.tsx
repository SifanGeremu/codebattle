import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, 
  Users, 
  Clock,
  Play,
  UserPlus,
  Crown,
  Zap
} from 'lucide-react';
import { Challenge, Duel, User } from '../types';
import { api } from '../services/api';
import { socketService } from '../services/socket';

interface DuelLobbyProps {
  onStartDuel: (duel: Duel, challenge: Challenge) => void;
}

export const DuelLobby: React.FC<DuelLobbyProps> = ({ onStartDuel }) => {
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingDuel, setCreatingDuel] = useState(false);

  useEffect(() => {
    fetchData();
    setupSocketListeners();
    return () => {
      socketService.getSocket()?.off('duel-created');
      socketService.getSocket()?.off('duel-joined');
    };
  }, []);

  const fetchData = async () => {
    try {
      const [duelsResponse, challengesResponse] = await Promise.all([
        api.get('/duels/active'),
        api.get('/challenges')
      ]);
      
      setActiveDuels(duelsResponse.data);
      setAvailableChallenges(challengesResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    const socket = socketService.getSocket();
    
    socket?.on('duel-created', (duel: Duel) => {
      setActiveDuels(prev => [...prev, duel]);
    });

    socket?.on('duel-joined', (duel: Duel) => {
      setActiveDuels(prev => prev.map(d => d.id === duel.id ? duel : d));
    });
  };

  const createDuel = async (challengeId: string) => {
    setCreatingDuel(true);
    try {
      const response = await api.post('/duels/create', { challengeId });
      const duel = response.data;
      // Socket will handle adding to list
    } catch (error) {
      console.error('Failed to create duel:', error);
    } finally {
      setCreatingDuel(false);
    }
  };

  const joinDuel = async (duelId: string) => {
    try {
      const response = await api.post(`/duels/${duelId}/join`);
      const { duel, challenge } = response.data;
      onStartDuel(duel, challenge);
    } catch (error) {
      console.error('Failed to join duel:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="bg-gradient-to-r from-red-500 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Sword className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Duel Arena
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Challenge other coders to real-time coding battles
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Duels */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Active Duels</span>
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {activeDuels.map((duel, index) => {
                const challenge = availableChallenges.find(c => c.id === duel.challengeId);
                
                return (
                  <motion.div
                    key={duel.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {challenge?.title || 'Unknown Challenge'}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            challenge?.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                            challenge?.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {challenge?.difficulty.toUpperCase()}
                          </span>
                          <Clock className="h-4 w-4" />
                          <span>{challenge?.timeLimit} min</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {duel.status === 'waiting' ? 'Waiting for opponent' : 'In Progress'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          1/{duel.player2Id ? '2' : '1'} players
                        </div>
                      </div>
                    </div>

                    {duel.status === 'waiting' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => joinDuel(duel.id)}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-purple-700 transition-all duration-200"
                      >
                        <Sword className="h-4 w-4" />
                        <span className="font-medium">Join Duel</span>
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {activeDuels.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Sword className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active duels. Create one to get started!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Create New Duel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Start New Duel</span>
          </h2>
          
          <div className="space-y-4">
            {availableChallenges.slice(0, 5).map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {challenge.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    challenge.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {challenge.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{challenge.timeLimit} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Crown className="h-4 w-4" />
                      <span>{challenge.points} pts</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => createDuel(challenge.id)}
                    disabled={creatingDuel}
                    className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Create</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};