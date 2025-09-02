import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Moon, 
  Sun, 
  User, 
  Trophy, 
  Sword,
  LogOut,
  Github
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'challenges', label: 'Challenges', icon: Code2 },
    { id: 'duels', label: 'Duels', icon: Sword },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CodeBattle
          </span>
        </motion.div>

        {/* Navigation Items */}
        {user && (
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </motion.button>

          {user ? (
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.username}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Rating: {user.rating}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange('auth')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              <Github className="h-4 w-4" />
              <span className="font-medium">Sign In</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden mt-3 flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};