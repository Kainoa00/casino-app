import { Router } from 'express';
import { userOps, transactionOps, gameSessionOps } from '../models/database.js';
import { authenticateRequest } from '../middleware/auth.js';
import {
  generatePattern,
  validateGuess,
  calculatePayout,
  PAYOUTS
} from '../services/games/patternPrediction.js';

const router = Router();
router.use(authenticateRequest);

// Store active games in memory
const activeGames = new Map();

router.get('/pattern-prediction/new', (req, res) => {
  const { difficulty = 'medium', patternType } = req.query;

  const pattern = generatePattern(patternType, difficulty);
  const gameId = `pp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store game state
  activeGames.set(gameId, {
    pattern,
    difficulty,
    userId: req.user.id,
    createdAt: new Date(),
    betPlaced: false
  });

  // Return sequence without answer
  res.json({
    gameId,
    patternType: pattern.type,
    sequence: pattern.sequence,
    difficulty,
    payouts: PAYOUTS
  });
});

router.post('/pattern-prediction/guess', (req, res) => {
  const { gameId, guess, guessType, betAmount } = req.body;

  // Validate game exists
  const game = activeGames.get(gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found or expired' });
  }

  if (game.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not your game' });
  }

  // Validate bet amount
  const bet = parseInt(betAmount);
  if (!bet || bet < 10) {
    return res.status(400).json({ error: 'Minimum bet is 10 coins' });
  }

  if (bet > 10000) {
    return res.status(400).json({ error: 'Maximum bet is 10,000 coins' });
  }

  // Check balance
  const user = userOps.findById(req.user.id);
  if (!user || user.balance < bet) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Validate guess type
  if (!['exact', 'category', 'binary'].includes(guessType)) {
    return res.status(400).json({ error: 'Invalid guess type' });
  }

  // Process guess
  const isCorrect = validateGuess(game.pattern, guess, guessType);
  const payout = calculatePayout(bet, guessType, isCorrect);
  const netResult = payout - bet;

  // Update user balance and stats
  userOps.addBalance(req.user.id, netResult);
  userOps.updateStats(req.user.id, bet, payout);

  // Record transaction
  transactionOps.create(
    req.user.id,
    netResult,
    isCorrect ? 'win' : 'bet',
    'pattern_prediction',
    isCorrect ? `Won ${guessType} prediction` : `Lost ${guessType} prediction`
  );

  // Record game session
  gameSessionOps.create(
    req.user.id,
    'pattern_prediction',
    game.pattern.type,
    game.difficulty,
    bet
  );

  // Get new balance
  const updatedUser = userOps.findById(req.user.id);

  // Remove game from active games
  activeGames.delete(gameId);

  res.json({
    correct: isCorrect,
    answer: game.pattern.answer,
    payout,
    newBalance: updatedUser.balance,
    guessType
  });
});

// Get pattern types and payouts info
router.get('/pattern-prediction/info', (req, res) => {
  res.json({
    patternTypes: ['cards', 'numbers', 'colors'],
    difficulties: ['easy', 'medium', 'hard'],
    payouts: PAYOUTS,
    minBet: 10,
    maxBet: 10000
  });
});

export default router;
