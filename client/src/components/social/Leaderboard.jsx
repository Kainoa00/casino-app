import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';

export default function Leaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly');
  const [gameType, setGameType] = useState('all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period, gameType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const [boardData, rankData] = await Promise.all([
        api.getLeaderboard(period, gameType),
        api.getLeaderboard(period, gameType).then(d => {
          const rank = d.leaderboard.findIndex(e => e.id === user.id);
          return rank >= 0 ? { rank: rank + 1, score: d.leaderboard[rank]?.score } : null;
        })
      ]);
      setLeaderboard(boardData.leaderboard);
      setUserRank(rankData);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400 text-2xl';
      case 2: return 'text-gray-300 text-xl';
      case 3: return 'text-amber-600 text-xl';
      default: return 'text-gray-500';
    }
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Period</label>
          <div className="flex gap-2">
            {['daily', 'weekly', 'alltime'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  period === p
                    ? 'bg-casino-accent text-white'
                    : 'bg-casino-dark text-gray-400 hover:text-white'
                }`}
              >
                {p === 'alltime' ? 'All Time' : p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Game</label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Games' },
              { value: 'pattern_prediction', label: 'Pattern Prediction' }
            ].map(g => (
              <button
                key={g.value}
                onClick={() => setGameType(g.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  gameType === g.value
                    ? 'bg-casino-accent text-white'
                    : 'bg-casino-dark text-gray-400 hover:text-white'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {userRank && (
        <div className="card mb-6 bg-gradient-to-r from-casino-purple/30 to-casino-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Your Rank</div>
              <div className="text-2xl font-bold text-casino-gold">
                {getRankEmoji(userRank.rank)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Winnings</div>
              <div className="text-2xl font-bold text-casino-gold">
                {userRank.score?.toLocaleString() || 0} coins
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No entries yet. Be the first to play!
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                  entry.id === user.id
                    ? 'bg-casino-accent/20 border border-casino-accent/50'
                    : 'bg-casino-darker hover:bg-casino-dark'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-bold w-12 ${getRankStyle(entry.rank)}`}>
                    {getRankEmoji(entry.rank)}
                  </span>
                  <div>
                    <div className="font-medium">
                      {entry.username}
                      {entry.id === user.id && (
                        <span className="text-casino-accent text-sm ml-2">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {entry.games_played} games played
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-casino-gold font-bold">
                    {entry.score.toLocaleString()} coins
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
