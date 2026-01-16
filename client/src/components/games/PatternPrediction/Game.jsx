import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import * as api from '../../../services/api';
import PatternDisplay from './PatternDisplay';
import BettingPanel from './BettingPanel';
import ResultModal from './ResultModal';
import MultiplayerLobby from './MultiplayerLobby';

export default function PatternPrediction() {
  const { user, updateBalance } = useAuth();
  const { socket } = useSocket();

  const [mode, setMode] = useState('menu'); // menu, single, multiplayer
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [patternType, setPatternType] = useState('');
  const [result, setResult] = useState(null);
  const [betAmount, setBetAmount] = useState(100);

  const startSinglePlayer = async () => {
    setLoading(true);
    try {
      const data = await api.getPatternGame(difficulty);
      setGame(data);
      setMode('single');
      setResult(null);
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async (guess, guessType) => {
    if (!game) return;

    setLoading(true);
    try {
      const data = await api.submitPatternGuess(game.gameId, guess, guessType, betAmount);
      setResult(data);
      updateBalance(data.newBalance);
    } catch (err) {
      console.error('Failed to submit guess:', err);
    } finally {
      setLoading(false);
    }
  };

  const playAgain = () => {
    setResult(null);
    setGame(null);
    startSinglePlayer();
  };

  const backToMenu = () => {
    setMode('menu');
    setGame(null);
    setResult(null);
  };

  if (mode === 'menu') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Pattern Prediction</h1>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">How to Play</h2>
          <p className="text-gray-400 mb-4">
            Observe the pattern sequence and predict what comes next. Choose your prediction type:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-casino-gold">5x</span>
              <span>Exact Match - Predict the exact next item</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-casino-gold">2x</span>
              <span>Category - Predict the category (suit, odd/even, color)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-casino-gold">1.5x</span>
              <span>Binary - Simple yes/no prediction (higher/lower, red/black)</span>
            </li>
          </ul>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Game Settings</h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    difficulty === d
                      ? 'bg-casino-accent text-white'
                      : 'bg-casino-darker text-gray-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Pattern Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPatternType('')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  patternType === ''
                    ? 'bg-casino-accent text-white'
                    : 'bg-casino-darker text-gray-400 hover:text-white'
                }`}
              >
                Random
              </button>
              {['cards', 'numbers', 'colors'].map(t => (
                <button
                  key={t}
                  onClick={() => setPatternType(t)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    patternType === t
                      ? 'bg-casino-accent text-white'
                      : 'bg-casino-darker text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={startSinglePlayer}
            disabled={loading}
            className="btn-primary py-4 text-lg"
          >
            {loading ? 'Loading...' : 'Play Solo'}
          </button>
          <button
            onClick={() => setMode('multiplayer')}
            className="btn-secondary py-4 text-lg"
          >
            Multiplayer
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'multiplayer') {
    return <MultiplayerLobby onBack={backToMenu} />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={backToMenu} className="text-gray-400 hover:text-white">
          &larr; Back to Menu
        </button>
        <div className="text-sm text-gray-400">
          {game?.patternType && (
            <span className="capitalize">{game.patternType} Pattern</span>
          )}
          {' '}&bull;{' '}
          <span className="capitalize">{difficulty}</span>
        </div>
      </div>

      {game && (
        <>
          <PatternDisplay
            patternType={game.patternType}
            sequence={game.sequence}
            answer={result?.answer}
            showAnswer={!!result}
          />

          {!result && (
            <BettingPanel
              patternType={game.patternType}
              sequence={game.sequence}
              payouts={game.payouts}
              balance={user.balance}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              onSubmit={submitGuess}
              loading={loading}
            />
          )}

          {result && (
            <ResultModal
              result={result}
              onPlayAgain={playAgain}
              onBackToMenu={backToMenu}
            />
          )}
        </>
      )}
    </div>
  );
}
