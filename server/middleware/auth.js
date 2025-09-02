import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};