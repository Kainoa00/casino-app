import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/games/pattern-prediction', label: 'Pattern Prediction', icon: '🎯' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

const protectedNavItems = [
    { path: '/profile', label: 'Profile', icon: '👤' }
]

export default function Sidebar() {
  const { user } = useAuth();
  const items = user && !user.isGuest ? [...navItems, ...protectedNavItems] : navItems;
  return (
    <aside className="w-64 bg-casino-dark border-r border-gray-800 p-4">
      <nav className="space-y-2">
        {items.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:bg-casino-darker hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
        <h3 className="font-bold text-pink-400 mb-2">Coming Soon</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>🚀 Space Shooter</li>
          <li>🧩 Puzzle Quest</li>
          <li>🏎️ Nitro Racers</li>
        </ul>
      </div>
    </aside>
  );
}
