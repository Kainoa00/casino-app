import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';

export default function Profile() {
  const { user, updateBalance } = useAuth();
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await api.getProfile();
      setProfile(profileData.user);

      // Load transactions (would need API endpoint)
      // For now, we'll show stats from the profile
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const claimBonus = async () => {
    try {
      const data = await api.claimDailyBonus();
      updateBalance(data.newBalance);
      loadProfile();
    } catch (err) {
      console.error('Failed to claim bonus:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-8">
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  const winRate = profile?.games_played > 0
    ? ((profile.total_won / profile.total_wagered) * 100).toFixed(1)
    : 0;

  const netProfit = (profile?.total_won || 0) - (profile?.total_wagered || 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-casino-purple to-casino-accent flex items-center justify-center text-3xl">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            <p className="text-gray-400">
              Member since {new Date(profile?.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl mb-1">🪙</div>
          <div className="text-2xl font-bold text-casino-gold">
            {profile?.balance?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Balance</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-1">🎮</div>
          <div className="text-2xl font-bold">{profile?.games_played || 0}</div>
          <div className="text-sm text-gray-400">Games Played</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-1">💰</div>
          <div className="text-2xl font-bold text-casino-gold">
            {profile?.total_won?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-400">Total Won</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl mb-1">📊</div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-casino-green' : 'text-casino-accent'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Net Profit</div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Statistics</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Wagered</span>
            <span className="font-bold">{profile?.total_wagered?.toLocaleString() || 0} coins</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Won</span>
            <span className="font-bold text-casino-gold">{profile?.total_won?.toLocaleString() || 0} coins</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Return Rate</span>
            <span className={`font-bold ${parseFloat(winRate) >= 100 ? 'text-casino-green' : 'text-casino-accent'}`}>
              {winRate}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Last Login</span>
            <span className="font-bold">
              {profile?.last_login
                ? new Date(profile.last_login).toLocaleString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-casino-purple/30 to-casino-accent/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Daily Bonus</h2>
            <p className="text-gray-400">Claim 1,000 free coins every day!</p>
          </div>
          <button onClick={claimBonus} className="btn-gold">
            Claim Bonus
          </button>
        </div>
      </div>
    </div>
  );
}
