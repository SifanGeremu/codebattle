import express from 'express';
import { db } from '../database/init.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get leaderboard
router.get('/', authenticateUser, (req, res) => {
  try {
    const { timeframe = 'all' } = req.query;

    let query = `
      SELECT 
        u.id, u.username, u.avatar, u.rating, u.wins, u.losses,
        COALESCE(SUM(s.passed_tests * c.points / c.test_cases), 0) as total_points,
        CASE 
          WHEN u.wins + u.losses = 0 THEN 0
          ELSE ROUND((u.wins * 100.0) / (u.wins + u.losses), 1)
        END as win_rate
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id
      LEFT JOIN challenges c ON s.challenge_id = c.id
    `;

    // Add timeframe filter
    if (timeframe === 'week') {
      query += ` WHERE s.submitted_at >= datetime('now', '-7 days') OR s.submitted_at IS NULL`;
    } else if (timeframe === 'month') {
      query += ` WHERE s.submitted_at >= datetime('now', '-30 days') OR s.submitted_at IS NULL`;
    }

    query += `
      GROUP BY u.id, u.username, u.avatar, u.rating, u.wins, u.losses
      ORDER BY total_points DESC, u.rating DESC
      LIMIT 50
    `;

    const results = db.prepare(query).all();

    // Add rank to each entry
    const leaderboard = results.map((entry, index) => ({
      user: {
        id: entry.id,
        username: entry.username,
        avatar: entry.avatar,
        rating: entry.rating,
        wins: entry.wins,
        losses: entry.losses
      },
      rank: index + 1,
      totalPoints: entry.total_points,
      winRate: entry.win_rate
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

export default router;