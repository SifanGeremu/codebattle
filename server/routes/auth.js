import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    db.prepare(`
      INSERT INTO users (id, email, username, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(userId, email, username, passwordHash);

    // Get created user
    const user = db.prepare(`
      SELECT id, email, username, rating, wins, losses, created_at
      FROM users WHERE id = ?
    `).get(userId);

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GitHub OAuth (simplified for demo)
router.get('/github', (req, res) => {
  
  const mockGitHubUser = {
    id: uuidv4(),
    email: 'github.user@example.com',
    username: 'GitHubUser',
    githubId: '12345',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
  };

  try {
    // Check if GitHub user exists
    let user = db.prepare('SELECT * FROM users WHERE github_id = ?').get(mockGitHubUser.githubId);
    
    if (!user) {
      // Create new user
      db.prepare(`
        INSERT INTO users (id, email, username, github_id, avatar)
        VALUES (?, ?, ?, ?, ?)
      `).run(mockGitHubUser.id, mockGitHubUser.email, mockGitHubUser.username, mockGitHubUser.githubId, mockGitHubUser.avatar);
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(mockGitHubUser.id);
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=oauth_failed`);
  }
});

// Get current user
router.get('/me', authenticateUser, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, username, github_id, avatar, rating, wins, losses, created_at
      FROM users WHERE id = ?
    `).get(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router;