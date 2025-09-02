import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/init.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get active duels
router.get('/active', authenticateUser, (req, res) => {
  try {
    const duels = db.prepare(`
      SELECT d.*, c.title as challenge_title, c.difficulty, c.time_limit,
             u1.username as player1_username, u2.username as player2_username
      FROM duels d
      JOIN challenges c ON d.challenge_id = c.id
      JOIN users u1 ON d.player1_id = u1.id
      LEFT JOIN users u2 ON d.player2_id = u2.id
      WHERE d.status IN ('waiting', 'active')
      ORDER BY d.created_at DESC
    `).all();

    res.json(duels);
  } catch (error) {
    console.error('Get active duels error:', error);
    res.status(500).json({ message: 'Failed to fetch duels' });
  }
});

// Create new duel
router.post('/create', authenticateUser, (req, res) => {
  try {
    const { challengeId } = req.body;

    // Verify challenge exists
    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const duelId = uuidv4();
    
    db.prepare(`
      INSERT INTO duels (id, challenge_id, player1_id, status)
      VALUES (?, ?, ?, 'waiting')
    `).run(duelId, challengeId, req.userId);

    const duel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId);
    
    // Broadcast new duel to all connected clients
    const io = req.app.get('io');
    io.emit('duel-created', duel);

    res.status(201).json(duel);
  } catch (error) {
    console.error('Create duel error:', error);
    res.status(500).json({ message: 'Failed to create duel' });
  }
});

// Join duel
router.post('/:id/join', authenticateUser, (req, res) => {
  try {
    const duelId = req.params.id;

    // Get duel
    const duel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId);
    if (!duel) {
      return res.status(404).json({ message: 'Duel not found' });
    }

    if (duel.status !== 'waiting') {
      return res.status(400).json({ message: 'Duel is not available' });
    }

    if (duel.player1_id === req.userId) {
      return res.status(400).json({ message: 'Cannot join your own duel' });
    }

    // Update duel
    db.prepare(`
      UPDATE duels 
      SET player2_id = ?, status = 'active', started_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(req.userId, duelId);

    const updatedDuel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId);
    const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(duel.challenge_id);

    // Parse test cases
    challenge.testCases = JSON.parse(challenge.test_cases);

    // Broadcast duel joined
    const io = req.app.get('io');
    io.emit('duel-joined', updatedDuel);

    res.json({ duel: updatedDuel, challenge });
  } catch (error) {
    console.error('Join duel error:', error);
    res.status(500).json({ message: 'Failed to join duel' });
  }
});

// Submit duel solution
router.post('/:id/submit', authenticateUser, async (req, res) => {
  try {
    const { code } = req.body;
    const duelId = req.params.id;

    const duel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId);
    if (!duel) {
      return res.status(404).json({ message: 'Duel not found' });
    }

    if (duel.status !== 'active') {
      return res.status(400).json({ message: 'Duel is not active' });
    }

    // Update player code
    const isPlayer1 = duel.player1_id === req.userId;
    const updateField = isPlayer1 ? 'player1_code' : 'player2_code';
    
    db.prepare(`UPDATE duels SET ${updateField} = ? WHERE id = ?`).run(code, duelId);

    // Check if both players have submitted
    const updatedDuel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId);
    
    if (updatedDuel.player1_code && updatedDuel.player2_code) {
      // Both players submitted, determine winner
      const challenge = db.prepare('SELECT * FROM challenges WHERE id = ?').get(duel.challenge_id);
      const testCases = JSON.parse(challenge.test_cases);

      // For demo, randomly determine winner
      const winnerId = Math.random() > 0.5 ? duel.player1_id : duel.player2_id;
      
      db.prepare(`
        UPDATE duels 
        SET status = 'completed', winner_id = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(winnerId, duelId);

      // Update user stats
      const loserId = winnerId === duel.player1_id ? duel.player2_id : duel.player1_id;
      db.prepare('UPDATE users SET wins = wins + 1, rating = rating + 50 WHERE id = ?').run(winnerId);
      db.prepare('UPDATE users SET losses = losses + 1, rating = rating - 25 WHERE id = ?').run(loserId);

      // Broadcast duel completion
      const io = req.app.get('io');
      io.to(`duel-${duelId}`).emit('duel-complete', { duelId, winnerId });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Submit duel solution error:', error);
    res.status(500).json({ message: 'Failed to submit solution' });
  }
});

export default router;