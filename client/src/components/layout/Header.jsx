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
          <span className="text-3xl text-casino-gold">♠️</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-casino-gold via-yellow-200 to-casino-gold bg-clip-text text-transparent drop-shadow-sm font-serif">
            Royal Casino
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-casino-green' : 'bg-red-500'}`} />
            <span>{onlineCount} active</span>
          </div>

          {user && !user.isGuest ? (
            <>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-full">
                <span className="text-casino-gold text-xl">🪙</span>
                <span className="font-bold text-casino-gold font-mono tracking-wider">
                  {user?.balance?.toLocaleString() || 0}
                </span>
              </div>

              <Link to="/profile" className="flex items-center gap-2 hover:text-casino-gold transition-colors">
                <span className="text-xl">👤</span>
                <span className="font-medium text-gray-200">{user?.username}</span>
              </Link>

              <button
                onClick={logout}
                className="text-gray-400 hover:text-casino-accent transition-colors uppercase text-xs font-bold tracking-widest"
              >
                Cash Out
              </button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 rounded-lg bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
