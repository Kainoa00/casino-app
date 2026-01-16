import { Router } from 'express';
import { userOps, transactionOps } from '../models/database.js';
import { authenticateRequest } from '../middleware/auth.js';

const router = Router();
const DAILY_BONUS = 1000;

router.use(authenticateRequest);

router.get('/balance', (req, res) => {
  const user = userOps.findById(req.user.id);
  res.json({ balance: user?.balance || 0 });
});

router.post('/daily-bonus', (req, res) => {
  const user = userOps.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.last_daily_bonus) {
    const lastBonus = new Date(user.last_daily_bonus);
    const now = new Date();
    const hoursSinceBonus = (now - lastBonus) / (1000 * 60 * 60);

    if (hoursSinceBonus < 24) {
      const hoursLeft = Math.ceil(24 - hoursSinceBonus);
      return res.status(400).json({
        error: `Daily bonus already claimed. Come back in ${hoursLeft} hours!`
      });
    }
  }

  userOps.updateDailyBonus(user.id, DAILY_BONUS);
  transactionOps.create(user.id, DAILY_BONUS, 'bonus', null, 'Daily login bonus');

  const updatedUser = userOps.findById(user.id);

  res.json({
    bonus: DAILY_BONUS,
    newBalance: updatedUser.balance
  });
});

router.get('/transactions', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const transactions = transactionOps.getByUser(req.user.id, limit);
  res.json({ transactions });
});

export default router;
