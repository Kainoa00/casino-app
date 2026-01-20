import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/layout/Login';
import Register from './components/layout/Register';
import Home from './components/layout/Home';
import PatternPrediction from './components/games/PatternPrediction/Game';
import Leaderboard from './components/social/Leaderboard';
import Profile from './components/social/Profile';

function ProtectedRoute({ children }) {
  const { user, loading, loginAsGuest } = useAuth();
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!loading && !user && !initializing) {
      setInitializing(true);
      loginAsGuest().catch(console.error).finally(() => setInitializing(false));
    }
  }, [loading, user, initializing, loginAsGuest]);

  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-casino-dark">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎰</div>
          <div className="text-2xl text-casino-gold">Joining Casino...</div>
        </div>
      </div>
    );
  }

  // If we still don't have a user after trying to login (error case), show retry or error
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-red-500">Failed to join. Please try again.</div>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games/pattern-prediction" element={<PatternPrediction />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
