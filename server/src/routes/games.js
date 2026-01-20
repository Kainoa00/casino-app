import { Router } from 'express';
import { userOps, transactionOps, gameSessionOps } from '../models/database.js';
import { authenticateRequest } from '../middleware/auth.js';
import {
  generatePattern,
  validateGuess,
  calculatePayout,
  PAYOUTS
} from '../services/games/patternPrediction.js';
import { spinSlots } from '../services/games/slots.js';
import * as blackjack from '../services/games/blackjack.js';

const router = Router();
router.use(authenticateRequest);

// Store active games in memory
const activeGames = new Map();

// --- PATTERN PREDICTION ---
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

// --- SLOTS ---
router.post('/slots/spin', (req, res) => {
  const { betAmount } = req.body;
  const bet = parseInt(betAmount);

  if (!bet || bet < 10) return res.status(400).json({ error: 'Min bet 10' });

  const user = userOps.findById(req.user.id);
  if (user.balance < bet) return res.status(400).json({ error: 'Insufficient balance' });

  const result = spinSlots();
  const payout = bet * result.payoutMultiplier;
  const netResult = payout - bet;

  userOps.addBalance(req.user.id, netResult);
  userOps.updateStats(req.user.id, bet, payout);

  // Only record big wins or every 10 spins to save DB space? No, record all for now.
  transactionOps.create(req.user.id, netResult, result.isWin ? 'win' : 'loss', 'slots', `Slots Spin`);

  res.json({
    result,
    payout,
    newBalance: userOps.findById(req.user.id).balance
  });
});

// --- BLACKJACK ---
router.post('/blackjack/play', (req, res) => {
  // Start a new game
  const { betAmount } = req.body;
  const bet = parseInt(betAmount);

  if (!bet || bet < 10) return res.status(400).json({ error: 'Min bet 10' });
  const user = userOps.findById(req.user.id);
  if (user.balance < bet) return res.status(400).json({ error: 'Insufficient balance' });

  // Deduct bet immediately for Blackjack? Or hold it? Let's deduct immediately.
  userOps.addBalance(req.user.id, -bet);

  const deck = blackjack.createDeck();
  const gameId = `bj_${Date.now()}`;
  const initial = blackjack.initialDeal(deck);

  const gameState = {
    userId: req.user.id,
    bet,
    ...initial,
    status: 'playing'
  };

  // Check for natural blackjack
  if (blackjack.calculateHandValue(initial.playerHand) === 21) {
    gameState.status = 'finished';
    gameState.result = 'blackjack';
    // Pay 3:2
    const winAmount = Math.floor(bet * 2.5); // Return bet + 1.5x
    userOps.addBalance(req.user.id, winAmount);
    gameState.payout = winAmount;
  }

  activeGames.set(gameId, gameState);

  res.json({
    gameId,
    playerHand: initial.playerHand,
    dealerHand: [initial.dealerHand[0], { value: '?', suit: '?' }], // Hide dealer 2nd card
    status: gameState.status,
    result: gameState.result,
    newBalance: userOps.findById(req.user.id).balance
  });
});

router.post('/blackjack/action', (req, res) => {
  const { gameId, action } = req.body;
  const game = activeGames.get(gameId);

  if (!game || game.userId !== req.user.id || game.status !== 'playing') {
    return res.status(400).json({ error: 'Invalid game' });
  }

  if (action === 'hit') {
    game.playerHand.push(blackjack.drawCard(game.deck));
    const playerValue = blackjack.calculateHandValue(game.playerHand);

    if (playerValue > 21) {
      game.status = 'finished';
      game.result = 'bust';
      // No payout
      activeGames.delete(gameId);
      res.json({
        gameId,
        playerHand: game.playerHand,
        dealerHand: game.dealerHand, // Reveal dealer? Usually yes on bust
        status: 'finished',
        result: 'bust',
        playerValue
      });
      return;
    }
  } else if (action === 'stand') {
    const finalState = blackjack.dealerPlay(game);

    // Calculate Payout
    let winAmount = 0;
    if (finalState.result === 'win') {
      winAmount = game.bet * 2;
    } else if (finalState.result === 'push') {
      winAmount = game.bet;
    }

    if (winAmount > 0) {
      userOps.addBalance(req.user.id, winAmount);
    }

    activeGames.delete(gameId); // Game over

    res.json({
      gameId,
      playerHand: finalState.playerHand,
      dealerHand: finalState.dealerHand,
      status: 'finished',
      result: finalState.result,
      newBalance: userOps.findById(req.user.id).balance
    });
    return;
  }

  activeGames.set(gameId, game);

  res.json({
    gameId,
    playerHand: game.playerHand,
    dealerHand: [game.dealerHand[0], { value: '?', suit: '?' }],
    status: 'playing',
    playerValue: blackjack.calculateHandValue(game.playerHand)
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
