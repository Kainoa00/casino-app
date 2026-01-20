import { useState } from 'react';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const SUIT_SYMBOLS = {
  hearts: { symbol: '♥', color: 'text-red-500' },
  diamonds: { symbol: '♦', color: 'text-red-500' },
  clubs: { symbol: '♣', color: 'text-white' },
  spades: { symbol: '♠', color: 'text-white' }
};

export default function BettingPanel({
  patternType,
  sequence,
  payouts,
  balance,
  betAmount,
  setBetAmount,
  onSubmit,
  loading
}) {
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [guessType, setGuessType] = useState('binary');

  const quickBets = [50, 100, 250, 500, 1000];

  const handleSubmit = () => {
    if (!selectedGuess) return;
    onSubmit(selectedGuess, guessType);
  };

  const renderGuessOptions = () => {
    if (guessType === 'binary') {
      return renderBinaryOptions();
    } else if (guessType === 'category') {
      return renderCategoryOptions();
    } else {
      return renderExactOptions();
    }
  };

  const renderBinaryOptions = () => {
    if (patternType === 'cards') {
      return (
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => setSelectedGuess({ isRed: true, color: 'red' })}
            className={`h-32 rounded-xl border-4 transition-all transform hover:scale-105 shadow-xl flex flex-col items-center justify-center relative overflow-hidden ${selectedGuess?.color === 'red'
                ? 'border-casino-gold bg-red-900/80 shadow-red-500/20'
                : 'border-red-800 bg-red-950/40 hover:bg-red-900/60'
              }`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <span className="text-8xl">♥</span>
            </div>
            <span className="text-5xl text-red-500 mb-2 drop-shadow-lg">RED</span>
            <div className="text-xs tracking-widest uppercase text-red-200">Hearts & Diamonds</div>
          </button>
          <button
            onClick={() => setSelectedGuess({ isRed: false, color: 'black' })}
            className={`h-32 rounded-xl border-4 transition-all transform hover:scale-105 shadow-xl flex flex-col items-center justify-center relative overflow-hidden ${selectedGuess?.color === 'black'
                ? 'border-casino-gold bg-gray-900/90 shadow-gray-500/20'
                : 'border-gray-800 bg-black/40 hover:bg-black/60'
              }`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <span className="text-8xl text-white">♠</span>
            </div>
            <span className="text-5xl text-gray-200 mb-2 drop-shadow-lg">BLACK</span>
            <div className="text-xs tracking-widest uppercase text-gray-400">Spades & Clubs</div>
          </button>
        </div>
      );
    } else if (patternType === 'numbers') {
      const lastNum = sequence[sequence.length - 1]?.value;
      return (
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => setSelectedGuess({ higher: true })}
            className={`h-32 rounded-xl border-4 transition-all transform hover:scale-105 shadow-xl flex flex-col items-center justify-center ${selectedGuess?.higher === true
                ? 'border-casino-gold bg-green-900/80'
                : 'border-green-800 bg-green-950/40 hover:bg-green-900/60'
              }`}
          >
            <span className="text-5xl text-green-400 mb-2">High ▲</span>
            <div className="text-sm text-green-200">Higher than {lastNum}</div>
          </button>
          <button
            onClick={() => setSelectedGuess({ higher: false })}
            className={`h-32 rounded-xl border-4 transition-all transform hover:scale-105 shadow-xl flex flex-col items-center justify-center ${selectedGuess?.higher === false
                ? 'border-casino-gold bg-red-900/80'
                : 'border-red-800 bg-red-950/40 hover:bg-red-900/60'
              }`}
          >
            <span className="text-5xl text-red-400 mb-2">Low ▼</span>
            <div className="text-sm text-red-200">Lower than {lastNum}</div>
          </button>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedGuess({ warm: true })}
            className={`p-6 rounded-xl border-2 transition-all ${selectedGuess?.warm === true
                ? 'border-casino-gold bg-orange-900/50'
                : 'border-orange-900/30 hover:border-orange-700 bg-black/20'
              }`}
          >
            <div className="flex gap-2 justify-center text-3xl mb-2">
              <span className="text-red-500 drop-shadow-lg">●</span>
              <span className="text-orange-500 drop-shadow-lg">●</span>
              <span className="text-yellow-500 drop-shadow-lg">●</span>
            </div>
            <div className="text-xl font-bold text-orange-400">Warm Colors</div>
          </button>
          <button
            onClick={() => setSelectedGuess({ warm: false })}
            className={`p-6 rounded-xl border-2 transition-all ${selectedGuess?.warm === false
                ? 'border-casino-gold bg-blue-900/50'
                : 'border-blue-900/30 hover:border-blue-700 bg-black/20'
              }`}
          >
            <div className="flex gap-2 justify-center text-3xl mb-2">
              <span className="text-green-500 drop-shadow-lg">●</span>
              <span className="text-blue-500 drop-shadow-lg">●</span>
              <span className="text-purple-500 drop-shadow-lg">●</span>
            </div>
            <div className="text-xl font-bold text-blue-400">Cool Colors</div>
          </button>
        </div>
      );
    }
  };

  const renderCategoryOptions = () => {
    if (patternType === 'cards') {
      return (
        <div className="grid grid-cols-4 gap-2">
          {SUITS.map(suit => (
            <button
              key={suit}
              onClick={() => setSelectedGuess({ suit })}
              className={`p-3 rounded-lg border-2 transition-all ${selectedGuess?.suit === suit
                  ? 'border-casino-gold bg-casino-accent/20'
                  : 'border-gray-700 hover:border-gray-500'
                }`}
            >
              <span className={`text-3xl ${SUIT_SYMBOLS[suit].color}`}>
                {SUIT_SYMBOLS[suit].symbol}
              </span>
            </button>
          ))}
        </div>
      );
    } else if (patternType === 'numbers') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedGuess({ value: 0 })} // Even
            className={`p-4 rounded-lg border-2 transition-all ${selectedGuess?.value === 0
                ? 'border-casino-gold bg-blue-500/20'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            <div className="text-2xl font-bold">2, 4, 6...</div>
            <div className="mt-2 font-bold">Even Number</div>
          </button>
          <button
            onClick={() => setSelectedGuess({ value: 1 })} // Odd
            className={`p-4 rounded-lg border-2 transition-all ${selectedGuess?.value === 1
                ? 'border-casino-gold bg-purple-500/20'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            <div className="text-2xl font-bold">1, 3, 5...</div>
            <div className="mt-2 font-bold">Odd Number</div>
          </button>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-3 gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => setSelectedGuess({ color })}
              className={`p-3 rounded-lg border-2 transition-all ${selectedGuess?.color === color
                  ? 'border-casino-gold'
                  : 'border-gray-700 hover:border-gray-500'
                }`}
            >
              <span className={`text-3xl bg-${color}-500 w-8 h-8 rounded-full inline-block`}
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
        </div>
      );
    }
  };

  const renderExactOptions = () => {
    if (patternType === 'cards') {
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Suit</label>
            <div className="grid grid-cols-4 gap-2">
              {SUITS.map(suit => (
                <button
                  key={suit}
                  onClick={() => setSelectedGuess(prev => ({ ...prev, suit }))}
                  className={`p-2 rounded-lg border-2 transition-all ${selectedGuess?.suit === suit
                      ? 'border-casino-gold bg-casino-accent/20'
                      : 'border-gray-700 hover:border-gray-500'
                    }`}
                >
                  <span className={`text-2xl ${SUIT_SYMBOLS[suit].color}`}>
                    {SUIT_SYMBOLS[suit].symbol}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Select Value</label>
            <div className="grid grid-cols-7 gap-1">
              {CARD_VALUES.map(value => (
                <button
                  key={value}
                  onClick={() => setSelectedGuess(prev => ({ ...prev, value }))}
                  className={`p-2 rounded-lg border-2 transition-all text-sm ${selectedGuess?.value === value
                      ? 'border-casino-gold bg-casino-accent/20'
                      : 'border-gray-700 hover:border-gray-500'
                    }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (patternType === 'numbers') {
      return (
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Enter your guess</label>
          <input
            type="number"
            value={selectedGuess?.value || ''}
            onChange={(e) => setSelectedGuess({ value: parseInt(e.target.value) })}
            className="input-field text-center text-2xl"
            placeholder="?"
          />
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-6 gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => setSelectedGuess({ color, shape: 'circle' })}
              className={`p-3 rounded-lg border-2 transition-all ${selectedGuess?.color === color
                  ? 'border-casino-gold'
                  : 'border-gray-700 hover:border-gray-500'
                }`}
            >
              <div
                className="w-8 h-8 rounded-full mx-auto"
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Bet Amount</label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(10, Math.min(balance, parseInt(e.target.value) || 0)))}
            className="input-field w-32 text-center"
            min={10}
            max={balance}
          />
          <div className="flex gap-2">
            {quickBets.map(amount => (
              <button
                key={amount}
                onClick={() => setBetAmount(Math.min(amount, balance))}
                disabled={amount > balance}
                className={`px-3 py-1 rounded text-sm transition-colors ${betAmount === amount
                    ? 'bg-casino-gold text-black'
                    : 'bg-casino-darker text-gray-400 hover:text-white disabled:opacity-50'
                  }`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Prediction Type</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => { setGuessType('binary'); setSelectedGuess(null); }}
            className={`p-3 rounded-lg border-2 transition-all ${guessType === 'binary'
                ? 'border-casino-gold bg-casino-gold/10'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            <div className="text-casino-gold font-bold">{payouts?.binary || 1.5}x</div>
            <div className="text-sm text-gray-400">Binary</div>
          </button>
          <button
            onClick={() => { setGuessType('category'); setSelectedGuess(null); }}
            className={`p-3 rounded-lg border-2 transition-all ${guessType === 'category'
                ? 'border-casino-gold bg-casino-gold/10'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            <div className="text-casino-gold font-bold">{payouts?.category || 2}x</div>
            <div className="text-sm text-gray-400">Category</div>
          </button>
          <button
            onClick={() => { setGuessType('exact'); setSelectedGuess(null); }}
            className={`p-3 rounded-lg border-2 transition-all ${guessType === 'exact'
                ? 'border-casino-gold bg-casino-gold/10'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            <div className="text-casino-gold font-bold">{payouts?.exact || 5}x</div>
            <div className="text-sm text-gray-400">Exact</div>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Your Prediction</label>
        {renderGuessOptions()}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-gray-400">
          Potential Win:{' '}
          <span className="text-casino-gold font-bold">
            {Math.floor(betAmount * (payouts?.[guessType] || 1))} coins
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedGuess}
          className="btn-gold px-8"
        >
          {loading ? 'Submitting...' : 'Place Bet'}
        </button>
      </div>
    </div>
  );
}
