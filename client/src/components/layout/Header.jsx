import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { connected, onlineCount } = useSocket();

  return (
    <header className="bg-casino-dark border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl">🎰</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-casino-gold to-yellow-300 bg-clip-text text-transparent">
            Social Casino
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{onlineCount} online</span>
          </div>

          <div className="flex items-center gap-2 bg-casino-darker px-4 py-2 rounded-lg">
            <span className="text-casino-gold text-xl">🪙</span>
            <span className="font-bold text-casino-gold">
              {user?.balance?.toLocaleString() || 0}
            </span>
          </div>

          <Link to="/profile" className="flex items-center gap-2 hover:text-casino-accent transition-colors">
            <span className="text-xl">👤</span>
            <span className="font-medium">{user?.username}</span>
          </Link>

          <button
            onClick={logout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </header>
  );
}
