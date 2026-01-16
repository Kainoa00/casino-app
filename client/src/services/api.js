const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

export const register = (username, password) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

export const getProfile = () => request('/auth/profile');

// Currency
export const getBalance = () => request('/currency/balance');

export const claimDailyBonus = () =>
  request('/currency/daily-bonus', { method: 'POST' });

// Games
export const getPatternGame = (difficulty = 'medium') =>
  request(`/games/pattern-prediction/new?difficulty=${difficulty}`);

export const submitPatternGuess = (gameId, guess, betAmount) =>
  request('/games/pattern-prediction/guess', {
    method: 'POST',
    body: JSON.stringify({ gameId, guess, betAmount })
  });

// Leaderboard
export const getLeaderboard = (period = 'weekly', gameType = 'all') =>
  request(`/leaderboard?period=${period}&gameType=${gameType}`);

// Multiplayer
export const createRoom = (gameType) =>
  request('/rooms/create', {
    method: 'POST',
    body: JSON.stringify({ gameType })
  });

export const joinRoom = (roomCode) =>
  request('/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ roomCode })
  });

export const getRoomInfo = (roomCode) =>
  request(`/rooms/${roomCode}`);
