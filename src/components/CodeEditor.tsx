import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  RotateCcw, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Sword
} from 'lucide-react';
import { Challenge, User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface CodeEditorProps {
  challenge: Challenge;
  onBack: () => void;
  isDuel?: boolean;
  opponent?: User;
  timeRemaining?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  challenge, 
  onBack, 
  isDuel = false, 
  opponent,
  timeRemaining 
}) => {
  const { theme } = useTheme();
  const [code, setCode] = useState(challenge.initialCode);
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    try {
      const response = await api.post('/challenges/run', {
        challengeId: challenge.id,
        code
      });
      
      setOutput(response.data.output);
      setTestResults(response.data.testResults);
    } catch (error: any) {
      setOutput(error.response?.data?.error || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/challenges/submit', {
        challengeId: challenge.id,
        code
      });
      
      if (response.data.success) {
        setOutput('Solution submitted successfully!');
        setTestResults(response.data.testResults);
      }
    } catch (error: any) {
      setOutput(error.response?.data?.error || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCode = () => {
    setCode(challenge.initialCode);
    setOutput('');
    setTestResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          >
            ← Back
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {challenge.title}
            </h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                challenge.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                challenge.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {challenge.difficulty.toUpperCase()}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {challenge.category}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {challenge.points} points
              </span>
            </div>
          </div>
        </div>

        {/* Duel Info */}
        {isDuel && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center space-x-4"
          >
            {opponent && (
              <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-lg">
                <Sword className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">
                  vs {opponent.username}
                </span>
              </div>
            )}
            
            {timeRemaining !== undefined && (
              <div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-y-auto"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Problem Description
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Test Cases */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Test Cases
            </h3>
            <div className="space-y-3">
              {challenge.testCases.slice(0, 3).map((testCase, index) => (
                <div key={testCase.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Example {index + 1}: {testCase.description}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Input:</span>
                      <pre className="mt-1 bg-white dark:bg-gray-800 p-2 rounded border text-gray-800 dark:text-gray-200">
                        {testCase.input}
                      </pre>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Output:</span>
                      <pre className="mt-1 bg-white dark:bg-gray-800 p-2 rounded border text-gray-800 dark:text-gray-200">
                        {testCase.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Code Editor and Output */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col space-y-4"
        >
          {/* Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Code2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Code Editor</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetCode}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                  title="Reset code"
                >
                  <RotateCcw className="h-4 w-4" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Play className="h-4 w-4" />
                  <span>{isRunning ? 'Running...' : 'Run'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitSolution}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </motion.button>
              </div>
            </div>
            
            <div className="h-96">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-48 overflow-y-auto">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Output</h3>
            
            {testResults.length > 0 ? (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                      Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                {output || 'Click "Run" to execute your code...'}
              </pre>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};