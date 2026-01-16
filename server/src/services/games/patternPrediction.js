// Pattern types
const PATTERN_TYPES = ['cards', 'numbers', 'colors'];

// Card definitions
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon'];

// Payout multipliers
const PAYOUTS = {
  exact: 5,      // Exact match
  category: 2,   // Category match (suit, color group, etc.)
  binary: 1.5    // Higher/lower, red/black, etc.
};

function generateCardPattern(difficulty) {
  const patterns = [];

  if (difficulty === 'easy') {
    // Repeating suit or color pattern
    const isColorPattern = Math.random() > 0.5;
    if (isColorPattern) {
      // Alternating red/black
      const startRed = Math.random() > 0.5;
      for (let i = 0; i < 6; i++) {
        const isRed = (i % 2 === 0) === startRed;
        const suit = isRed
          ? (Math.random() > 0.5 ? 'hearts' : 'diamonds')
          : (Math.random() > 0.5 ? 'clubs' : 'spades');
        const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
        patterns.push({ suit, value, isRed });
      }
    } else {
      // Same suit
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      for (let i = 0; i < 6; i++) {
        const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
        const isRed = suit === 'hearts' || suit === 'diamonds';
        patterns.push({ suit, value, isRed });
      }
    }
  } else if (difficulty === 'medium') {
    // Ascending or descending values
    const ascending = Math.random() > 0.5;
    const startIndex = ascending
      ? Math.floor(Math.random() * 7)
      : Math.floor(Math.random() * 7) + 6;

    for (let i = 0; i < 6; i++) {
      const valueIndex = ascending ? startIndex + i : startIndex - i;
      const value = CARD_VALUES[valueIndex];
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      const isRed = suit === 'hearts' || suit === 'diamonds';
      patterns.push({ suit, value, isRed });
    }
  } else {
    // Hard: Combined pattern (value + suit rotation)
    const suitRotation = [...SUITS].sort(() => Math.random() - 0.5);
    const startValue = Math.floor(Math.random() * 6);

    for (let i = 0; i < 6; i++) {
      const value = CARD_VALUES[(startValue + i) % CARD_VALUES.length];
      const suit = suitRotation[i % 4];
      const isRed = suit === 'hearts' || suit === 'diamonds';
      patterns.push({ suit, value, isRed });
    }
  }

  return {
    type: 'cards',
    sequence: patterns.slice(0, 5),
    answer: patterns[5],
    hints: getCardHints(patterns, difficulty)
  };
}

function generateNumberPattern(difficulty) {
  const sequence = [];
  let answer;

  if (difficulty === 'easy') {
    // Simple arithmetic (+2, +3, etc.)
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < 6; i++) {
      sequence.push(start + step * i);
    }
  } else if (difficulty === 'medium') {
    // Geometric or alternating
    const isGeometric = Math.random() > 0.5;
    if (isGeometric) {
      const start = Math.floor(Math.random() * 3) + 2;
      const ratio = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < 6; i++) {
        sequence.push(start * Math.pow(ratio, i));
      }
    } else {
      // Alternating addition
      const start = Math.floor(Math.random() * 10) + 1;
      const step1 = Math.floor(Math.random() * 3) + 1;
      const step2 = Math.floor(Math.random() * 3) + 2;
      let current = start;
      for (let i = 0; i < 6; i++) {
        sequence.push(current);
        current += i % 2 === 0 ? step1 : step2;
      }
    }
  } else {
    // Fibonacci-like or complex
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    sequence.push(a, b);
    for (let i = 2; i < 6; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2]);
    }
  }

  answer = sequence.pop();

  return {
    type: 'numbers',
    sequence: sequence.map(n => ({ value: n })),
    answer: { value: answer },
    hints: getNumberHints(sequence, answer, difficulty)
  };
}

function generateColorPattern(difficulty) {
  const sequence = [];

  if (difficulty === 'easy') {
    // Simple repetition (ABAB or AABB)
    const colorA = COLORS[Math.floor(Math.random() * COLORS.length)];
    let colorB = COLORS[Math.floor(Math.random() * COLORS.length)];
    while (colorB === colorA) {
      colorB = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    const pattern = Math.random() > 0.5 ? [colorA, colorB] : [colorA, colorA, colorB, colorB];
    for (let i = 0; i < 6; i++) {
      sequence.push({
        color: pattern[i % pattern.length],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]
      });
    }
  } else if (difficulty === 'medium') {
    // Three color rotation
    const selectedColors = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 3);
    for (let i = 0; i < 6; i++) {
      sequence.push({
        color: selectedColors[i % 3],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]
      });
    }
  } else {
    // Color + shape combined pattern
    const selectedColors = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 3);
    const selectedShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, 2);

    for (let i = 0; i < 6; i++) {
      sequence.push({
        color: selectedColors[i % 3],
        shape: selectedShapes[i % 2]
      });
    }
  }

  const answer = sequence.pop();

  return {
    type: 'colors',
    sequence,
    answer,
    hints: getColorHints(sequence, answer, difficulty)
  };
}

function getCardHints(patterns, difficulty) {
  const answer = patterns[5];
  return {
    exact: `${answer.value} of ${answer.suit}`,
    category: answer.suit,
    binary: answer.isRed ? 'red' : 'black'
  };
}

function getNumberHints(sequence, answer, difficulty) {
  const lastNum = sequence[sequence.length - 1];
  return {
    exact: answer,
    category: answer % 2 === 0 ? 'even' : 'odd',
    binary: answer > lastNum ? 'higher' : 'lower'
  };
}

function getColorHints(sequence, answer, difficulty) {
  return {
    exact: `${answer.color} ${answer.shape}`,
    category: answer.color,
    binary: COLORS.indexOf(answer.color) < 3 ? 'warm' : 'cool'
  };
}

export function generatePattern(patternType, difficulty = 'medium') {
  const type = patternType || PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];

  switch (type) {
    case 'cards':
      return generateCardPattern(difficulty);
    case 'numbers':
      return generateNumberPattern(difficulty);
    case 'colors':
      return generateColorPattern(difficulty);
    default:
      return generateNumberPattern(difficulty);
  }
}

export function validateGuess(pattern, guess, guessType) {
  const answer = pattern.answer;

  switch (guessType) {
    case 'exact':
      if (pattern.type === 'cards') {
        return guess.suit === answer.suit && guess.value === answer.value;
      } else if (pattern.type === 'numbers') {
        return guess.value === answer.value;
      } else {
        return guess.color === answer.color && guess.shape === answer.shape;
      }

    case 'category':
      if (pattern.type === 'cards') {
        return guess.suit === answer.suit;
      } else if (pattern.type === 'numbers') {
        return (guess.value % 2 === 0) === (answer.value % 2 === 0);
      } else {
        return guess.color === answer.color;
      }

    case 'binary':
      if (pattern.type === 'cards') {
        const guessRed = guess.isRed || guess.color === 'red';
        const answerRed = answer.isRed;
        return guessRed === answerRed;
      } else if (pattern.type === 'numbers') {
        const lastVal = pattern.sequence[pattern.sequence.length - 1].value;
        const guessHigher = guess.higher;
        const actualHigher = answer.value > lastVal;
        return guessHigher === actualHigher;
      } else {
        const guessWarm = guess.warm;
        const actualWarm = COLORS.indexOf(answer.color) < 3;
        return guessWarm === actualWarm;
      }

    default:
      return false;
  }
}

export function calculatePayout(betAmount, guessType, isCorrect) {
  if (!isCorrect) return 0;
  return Math.floor(betAmount * PAYOUTS[guessType]);
}

export { PAYOUTS, PATTERN_TYPES, SUITS, CARD_VALUES, COLORS, SHAPES };
