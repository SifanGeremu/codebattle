import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'codebattle.db'));

export const initDatabase = () => {
  // Enable foreign key support
  db.pragma('foreign_keys = ON');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      github_id TEXT UNIQUE,
      avatar TEXT,
      rating INTEGER DEFAULT 1200,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create challenges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
      category TEXT NOT NULL,
      initial_code TEXT NOT NULL,
      solution TEXT NOT NULL,
      test_cases TEXT NOT NULL, -- JSON string
      points INTEGER NOT NULL,
      time_limit INTEGER NOT NULL, -- in minutes
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create duels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS duels (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      player1_id TEXT NOT NULL,
      player2_id TEXT,
      player1_code TEXT DEFAULT '',
      player2_code TEXT DEFAULT '',
      status TEXT CHECK(status IN ('waiting', 'active', 'completed')) DEFAULT 'waiting',
      winner_id TEXT,
      started_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (challenge_id) REFERENCES challenges (id),
      FOREIGN KEY (player1_id) REFERENCES users (id),
      FOREIGN KEY (player2_id) REFERENCES users (id),
      FOREIGN KEY (winner_id) REFERENCES users (id)
    )
  `);

  // Create submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      code TEXT NOT NULL,
      passed_tests INTEGER DEFAULT 0,
      total_tests INTEGER DEFAULT 0,
      execution_time INTEGER, -- in milliseconds
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (challenge_id) REFERENCES challenges (id)
    )
  `);

  console.log('✅ Database initialized successfully');
  
  // Insert sample data
  insertSampleData();
};

const insertSampleData = () => {
  const sampleChallenges = [
    {
      id: 'challenge-1',
      title: 'Two Sum',
      description: 'Given an array of integers and a target sum, return the indices of two numbers that add up to the target.',
      difficulty: 'easy',
      category: 'Arrays',
      initialCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
      solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      testCases: JSON.stringify([
        { id: 'test-1', input: '[2,7,11,15], 9', expectedOutput: '[0,1]', description: 'Basic case' },
        { id: 'test-2', input: '[3,2,4], 6', expectedOutput: '[1,2]', description: 'Different indices' },
        { id: 'test-3', input: '[3,3], 6', expectedOutput: '[0,1]', description: 'Same numbers' }
      ]),
      points: 100,
      timeLimit: 30
    },
    {
      id: 'challenge-2',
      title: 'Reverse Linked List',
      description: 'Given the head of a singly linked list, reverse the list and return the new head.',
      difficulty: 'medium',
      category: 'Linked Lists',
      initialCode: 'function reverseList(head) {\n  // Your code here\n}',
      solution: 'function reverseList(head) {\n  let prev = null;\n  let current = head;\n  while (current) {\n    const next = current.next;\n    current.next = prev;\n    prev = current;\n    current = next;\n  }\n  return prev;\n}',
      testCases: JSON.stringify([
        { id: 'test-1', input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', description: 'Basic reversal' },
        { id: 'test-2', input: '[1,2]', expectedOutput: '[2,1]', description: 'Two nodes' },
        { id: 'test-3', input: '[]', expectedOutput: '[]', description: 'Empty list' }
      ]),
      points: 200,
      timeLimit: 45
    },
    {
      id: 'challenge-3',
      title: 'Binary Tree Level Order',
      description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values.',
      difficulty: 'medium',
      category: 'Trees',
      initialCode: 'function levelOrder(root) {\n  // Your code here\n}',
      solution: 'function levelOrder(root) {\n  if (!root) return [];\n  const result = [];\n  const queue = [root];\n  while (queue.length) {\n    const levelSize = queue.length;\n    const level = [];\n    for (let i = 0; i < levelSize; i++) {\n      const node = queue.shift();\n      level.push(node.val);\n      if (node.left) queue.push(node.left);\n      if (node.right) queue.push(node.right);\n    }\n    result.push(level);\n  }\n  return result;\n}',
      testCases: JSON.stringify([
        { id: 'test-1', input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', description: 'Standard tree' },
        { id: 'test-2', input: '[1]', expectedOutput: '[[1]]', description: 'Single node' },
        { id: 'test-3', input: '[]', expectedOutput: '[]', description: 'Empty tree' }
      ]),
      points: 250,
      timeLimit: 60
    },
    {
      id: 'challenge-4',
      title: 'Valid Parentheses',
      description: 'Given a string containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      difficulty: 'easy',
      category: 'Strings',
      initialCode: 'function isValid(s) {\n  // Your code here\n}',
      solution: 'function isValid(s) {\n  const stack = [];\n  const map = { ")": "(", "}": "{", "]": "[" };\n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}',
      testCases: JSON.stringify([
        { id: 'test-1', input: '"()"', expectedOutput: 'true', description: 'Simple parentheses' },
        { id: 'test-2', input: '"()[]{}"', expectedOutput: 'true', description: 'Mixed brackets' },
        { id: 'test-3', input: '"(]"', expectedOutput: 'false', description: 'Invalid pair' }
      ]),
      points: 150,
      timeLimit: 25
    },
    {
      id: 'challenge-5',
      title: 'Merge Intervals',
      description: 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals.',
      difficulty: 'hard',
      category: 'Arrays',
      initialCode: 'function merge(intervals) {\n  // Your code here\n}',
      solution: 'function merge(intervals) {\n  if (intervals.length <= 1) return intervals;\n  intervals.sort((a, b) => a[0] - b[0]);\n  const result = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const current = intervals[i];\n    const last = result[result.length - 1];\n    if (current[0] <= last[1]) {\n      last[1] = Math.max(last[1], current[1]);\n    } else {\n      result.push(current);\n    }\n  }\n  return result;\n}',
      testCases: JSON.stringify([
        { id: 'test-1', input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', description: 'Overlapping intervals' },
        { id: 'test-2', input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', description: 'Adjacent intervals' },
        { id: 'test-3', input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', description: 'Unsorted input' }
      ]),
      points: 300,
      timeLimit: 75
    }
  ];

  // Insert sample challenges
  const insertChallenge = db.prepare(`
    INSERT OR IGNORE INTO challenges 
    (id, title, description, difficulty, category, initial_code, solution, test_cases, points, time_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleChallenges.forEach(challenge => {
    insertChallenge.run(
      challenge.id,
      challenge.title,
      challenge.description,
      challenge.difficulty,
      challenge.category,
      challenge.initialCode,
      challenge.solution,
      challenge.testCases,
      challenge.points,
      challenge.timeLimit
    );
  });

  console.log('✅ Sample data inserted successfully');
};

export { db };