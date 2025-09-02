export interface User {
  id: string;
  email: string;
  username: string;
  githubId?: string;
  avatar?: string;
  rating: number;
  wins: number;
  losses: number;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  initialCode: string;
  solution: string;
  testCases: TestCase[];
  points: number;
  timeLimit: number; // in minutes
  createdAt: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
}

export interface Duel {
  id: string;
  challengeId: string;
  player1Id: string;
  player2Id: string;
  player1Code: string;
  player2Code: string;
  status: 'waiting' | 'active' | 'completed';
  winnerId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  totalPoints: number;
  winRate: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => void;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface DuelRoom {
  id: string;
  challenge: Challenge;
  players: User[];
  spectators: User[];
  status: 'waiting' | 'active' | 'completed';
  timeRemaining: number;
  winner?: User;
}