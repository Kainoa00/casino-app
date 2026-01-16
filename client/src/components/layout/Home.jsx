import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';

export default function Home() {
  const { user, updateBalance } = useAuth();
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');

  const handleClaimBonus = async () => {
    setClaimingBonus(true);
    setBonusMessage('');
    try {
      const data = await api.claimDailyBonus();
      updateBalance(data.newBalance);
      setBonusMessage(`You received ${data.bonus.toLocaleString()} coins!`);
    } catch (err) {
      setBonusMessage(err.message);
    } finally {
      setClaimingBonus(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-gray-400">What would you like to play today?</p>
      </div>

      <div className="card mb-8 bg-gradient-to-r from-casino-purple/30 to-casino-accent/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Daily Bonus</h2>
            <p className="text-gray-400">Claim your free coins every day!</p>
            {bonusMessage && (
              <p className={`mt-2 ${bonusMessage.includes('received') ? 'text-casino-green' : 'text-casino-accent'}`}>
                {bonusMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleClaimBonus}
            disabled={claimingBonus}
            className="btn-gold"
          >
            {claimingBonus ? 'Claiming...' : 'Claim Bonus'}
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/games/pattern-prediction" className="game-card group">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🎯</span>
            <div>
              <h3 className="text-xl font-bold group-hover:text-casino-gold transition-colors">
                Pattern Prediction
              </h3>
              <p className="text-gray-400 mt-1">
                Spot the pattern and predict what comes next. Test your pattern recognition skills!
              </p>
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 bg-casino-accent/20 text-casino-accent text-xs rounded">
                  Cards
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  Numbers
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                  Colors
                </span>
              </div>
            </div>
          </div>
        </Link>

        <div className="game-card opacity-50 cursor-not-allowed">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🎲</span>
            <div>
              <h3 className="text-xl font-bold">Dice Strategy</h3>
              <p className="text-gray-400 mt-1">
                Roll dice and choose how to combine them to hit target numbers.
              </p>
              <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded mt-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="game-card opacity-50 cursor-not-allowed">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🧠</span>
            <div>
              <h3 className="text-xl font-bold">Memory Clash</h3>
              <p className="text-gray-400 mt-1">
                Match pairs and increase your bets as you reveal more cards.
              </p>
              <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded mt-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        <div className="game-card opacity-50 cursor-not-allowed">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🍬</span>
            <div>
              <h3 className="text-xl font-bold">Cascading Wins</h3>
              <p className="text-gray-400 mt-1">
                Match symbols in cascading combos for multiplying wins!
              </p>
              <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded mt-3">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
