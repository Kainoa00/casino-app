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
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-serif font-bold mb-4 bg-gradient-to-r from-casino-gold via-yellow-200 to-casino-gold bg-clip-text text-transparent drop-shadow-md">
          {user && !user.isGuest ? `Welcome back, ${user.username}` : 'Welcome to Royal Casino'}
        </h1>
        <p className="text-gray-400 text-lg">The premium destination for excessive entertainment</p>
      </div>

      {user && !user.isGuest && (
        <div className="card mb-12 border-casino-gold/30 bg-gradient-to-r from-casino-darker to-casino-dark relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-casino-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-casino-gold/10 transition-all duration-700"></div>

          <div className="flex items-center justify-between relative z-10 px-4">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-casino-gold font-serif">Daily High-Roller Bonus</h2>
              <p className="text-gray-300">Claim your complimentary chips to keep the action going!</p>
              {bonusMessage && (
                <p className={`mt-2 font-bold ${bonusMessage.includes('received') ? 'text-casino-green' : 'text-red-400'}`}>
                  {bonusMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleClaimBonus}
              disabled={claimingBonus}
              className="btn-gold shadow-lg shadow-yellow-500/20"
            >
              {claimingBonus ? 'Processing...' : 'Claim Chips'}
            </button>
          </div>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 font-serif border-l-4 border-casino-accent pl-4">Live Tables</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/games/pattern-prediction" className="game-card group h-full">
          <div className="flex items-start gap-4">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🔮</span>
            <div>
              <h3 className="text-2xl font-bold text-white group-hover:text-casino-gold transition-colors font-serif">
                Oracle Roulette
              </h3>
              <p className="text-gray-400 mt-2">
                Predict the sequence, beat the house. High risk, higher rewards.
              </p>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-casino-accent/20 text-casino-accent text-xs font-bold rounded-full uppercase tracking-wider border border-casino-accent/30">
                  Hot
                </span>
                <span className="px-3 py-1 bg-casino-gold/20 text-casino-gold text-xs font-bold rounded-full uppercase tracking-wider border border-casino-gold/30">
                  Featured
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/games/blackjack" className="game-card group h-full">
          <div className="flex items-start gap-4">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🃏</span>
            <div>
              <h3 className="text-2xl font-bold text-white group-hover:text-casino-gold transition-colors font-serif">
                Blackjack VIP
              </h3>
              <p className="text-gray-400 mt-2">
                Standard 3:2 payouts. Dealer stands on 17. High stakes permitted.
              </p>
              <span className="inline-block px-3 py-1 bg-green-900/40 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider mt-4 border border-green-800">
                Play Now
              </span>
            </div>
          </div>
        </Link>

        <Link to="/games/slots" className="game-card group h-full">
          <div className="flex items-start gap-4">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🎰</span>
            <div>
              <h3 className="text-2xl font-bold text-white group-hover:text-casino-gold transition-colors font-serif">
                Golden Slots
              </h3>
              <p className="text-gray-400 mt-2">
                Progressive jackpots. Spin to win big with up to 100x multipliers.
              </p>
              <span className="inline-block px-3 py-1 bg-yellow-900/40 text-yellow-400 text-xs font-bold rounded-full uppercase tracking-wider mt-4 border border-yellow-800">
                Play Now
              </span>
            </div>
          </div>
        </Link>

        <div className="game-card opacity-60 cursor-not-allowed border-none bg-black/40">
          <div className="flex items-start gap-4">
            <span className="text-5xl grayscale">🎲</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-500 font-serif">High Stakes Craps</h3>
              <p className="text-gray-500 mt-2">
                Roll the dice. The real classic casino experience.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider mt-4">
                Opening Soon
              </span>
            </div>
          </div>
        </div>

        <div className="game-card opacity-60 cursor-not-allowed border-none bg-black/40">
          <div className="flex items-start gap-4">
            <span className="text-5xl grayscale">🏛️</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-500 font-serif">Baccarat Royale</h3>
              <p className="text-gray-500 mt-2">
                The game of high rollers. Player or Banker?
              </p>
              <span className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider mt-4">
                Opening Soon
              </span>
            </div>
          </div>
        </div>

        <div className="game-card opacity-60 cursor-not-allowed border-none bg-black/40">
          <div className="flex items-start gap-4">
            <span className="text-5xl grayscale">♠️</span>
            <div>
              <h3 className="text-2xl font-bold text-gray-500 font-serif">Texas Hold'em</h3>
              <p className="text-gray-500 mt-2">
                Action-packed poker tables. Bluff your way to victory.
              </p>
              <span className="inline-block px-3 py-1 bg-gray-800 text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider mt-4">
                Opening Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
