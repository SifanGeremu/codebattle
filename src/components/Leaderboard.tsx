import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { api } from '../services/api';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard?timeframe=${timeframe}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</div>;
    }
  };

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1: return 'border-l-4 border-yellow-500';
      case 2: return 'border-l-4 border-gray-400';
      case 3: return 'border-l-4 border-amber-600';
      default: return 'border-l-4 border-transparent';
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          See how you rank against other coders
        </p>
      </motion.div>

      {/* Timeframe Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'month', label: 'This Month' },
            { key: 'week', label: 'This Week' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setTimeframe(option.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeframe === option.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ${getRankBorder(entry.rank)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>

                {/* User Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {entry.user.username}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Rating: {entry.user.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Win Rate: {entry.winRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {entry.totalPoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  points
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {entry.user.wins}W / {entry.user.losses}L
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {leaderboard.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No rankings yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete some challenges to see the leaderboard
          </p>
        </motion.div>
      )}
    </div>
  );
};