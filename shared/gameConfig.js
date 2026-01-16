// Shared game configuration constants

export const GAMES = {
  PATTERN_PREDICTION: 'pattern_prediction',
  DICE_STRATEGY: 'dice_strategy',
  MEMORY_CLASH: 'memory_clash',
  CASCADING_WINS: 'cascading_wins'
};

export const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const PATTERN_TYPES = {
  CARDS: 'cards',
  NUMBERS: 'numbers',
  COLORS: 'colors'
};

export const PAYOUTS = {
  pattern_prediction: {
    exact: 5,
    category: 2,
    binary: 1.5
  }
};

export const LIMITS = {
  MIN_BET: 10,
  MAX_BET: 10000,
  STARTING_BALANCE: 10000,
  DAILY_BONUS: 1000,
  MAX_ROOM_PLAYERS: 8,
  ROUNDS_PER_GAME: 10,
  ROUND_TIME_LIMIT: 30
};

export const TRANSACTION_TYPES = {
  BET: 'bet',
  WIN: 'win',
  BONUS: 'bonus',
  DAILY_BONUS: 'daily_bonus'
};
