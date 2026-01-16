import { Router } from 'express';
import { userOps } from '../models/database.js';
import { authenticateRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { period = 'weekly', gameType = 'all', limit = 50 } = req.query;

  const leaderboard = userOps.getLeaderboard(parseInt(limit));

  res.json({
    period,
    gameType,
    leaderboard
  });
});

router.get('/rank', authenticateRequest, (req, res) => {
  const user = userOps.findById(req.user.id);
  const leaderboard = userOps.getLeaderboard(1000);

  const rankIndex = leaderboard.findIndex(e => e.id === req.user.id);
  const rank = rankIndex >= 0 ? rankIndex + 1 : leaderboard.length + 1;

  res.json({
    rank,
    score: user?.total_won || 0
  });
});

export default router;
