import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './components/layout/Home';
import PatternPrediction from './components/games/PatternPrediction/Game';
import SlotsGame from './components/games/Slots/Game';
import BlackjackGame from './components/games/Blackjack/Game';
import Leaderboard from './components/social/Leaderboard';
import Profile from './components/social/Profile';
import Login from './components/layout/Login';
import Register from './components/layout/Register';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games/pattern-prediction" element={<PatternPrediction />} />
              <Route path="/games/slots" element={<SlotsGame />} />
              <Route path="/games/blackjack" element={<BlackjackGame />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
