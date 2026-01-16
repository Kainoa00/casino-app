import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/games/pattern-prediction', label: 'Pattern Prediction', icon: '🎯' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { path: '/profile', label: 'Profile', icon: '👤' }
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-casino-dark border-r border-gray-800 p-4">
      <nav className="space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-casino-accent text-white'
                  : 'text-gray-400 hover:bg-casino-darker hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 p-4 bg-gradient-to-br from-casino-purple/20 to-casino-accent/20 rounded-lg border border-casino-purple/30">
        <h3 className="font-bold text-casino-gold mb-2">Coming Soon</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>🎲 Dice Strategy</li>
          <li>🧠 Memory Clash</li>
          <li>🍬 Cascading Wins</li>
        </ul>
      </div>
    </aside>
  );
}
