import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { useAuth } from '../../../context/AuthContext';
import * as api from '../../../services/api';
import MultiplayerGame from './MultiplayerGame';

export default function MultiplayerLobby({ onBack }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [view, setView] = useState('lobby'); // lobby, waiting, playing
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('room-state', (state) => {
      setRoom(state);
      setPlayers(state.players);
      setRoomCode(state.roomCode);
      setView('waiting');
    });

    socket.on('player-joined', ({ playerId, username }) => {
      setPlayers(prev => [...prev, { user_id: playerId, username, score: 0 }]);
    });

    socket.on('player-left', ({ playerId }) => {
      setPlayers(prev => prev.filter(p => p.user_id !== playerId));
    });

    socket.on('new-round', () => {
      setView('playing');
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off('room-state');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('new-round');
      socket.off('error');
    };
  }, [socket]);

  const createRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.createRoom('pattern_prediction');
      setRoomCode(data.roomCode);
      socket?.emit('join-room', data.roomCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      setError('Enter a room code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.joinRoom(joinCode.toUpperCase());
      setRoomCode(data.roomCode);
      socket?.emit('join-room', data.roomCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    if (players.length < 2) {
      setError('Need at least 2 players to start');
      return;
    }
    socket?.emit('start-game', roomCode);
  };

  const leaveRoom = () => {
    socket?.emit('leave-room');
    setView('lobby');
    setRoom(null);
    setPlayers([]);
    setRoomCode('');
  };

  if (view === 'playing') {
    return (
      <MultiplayerGame
        roomCode={roomCode}
        players={players}
        isHost={room?.hostId === user.id}
        onLeave={leaveRoom}
      />
    );
  }

  if (view === 'waiting') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Waiting Room</h2>
            <button onClick={leaveRoom} className="text-gray-400 hover:text-white">
              Leave Room
            </button>
          </div>

          <div className="bg-casino-darker p-4 rounded-lg mb-6 text-center">
            <div className="text-sm text-gray-400 mb-1">Room Code</div>
            <div className="text-4xl font-mono font-bold text-casino-gold tracking-widest">
              {roomCode}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Share this code with friends to join
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-3">Players ({players.length}/8)</h3>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div
                  key={player.user_id}
                  className="flex items-center gap-3 bg-casino-darker p-3 rounded-lg"
                >
                  <span className="text-casino-gold">#{index + 1}</span>
                  <span className="font-medium">{player.username}</span>
                  {player.user_id === room?.hostId && (
                    <span className="text-xs bg-casino-accent px-2 py-1 rounded">Host</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {room?.hostId === user.id ? (
            <button
              onClick={startGame}
              disabled={players.length < 2}
              className="btn-gold w-full py-3"
            >
              Start Game ({players.length}/2 minimum)
            </button>
          ) : (
            <div className="text-center text-gray-400">
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Multiplayer</h1>
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          &larr; Back
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Create Room</h2>
          <p className="text-gray-400 mb-4">
            Start a new game room and invite friends to join.
          </p>
          <button
            onClick={createRoom}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Join Room</h2>
          <p className="text-gray-400 mb-4">
            Enter a room code to join an existing game.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCD12"
              className="input-field flex-1 uppercase font-mono tracking-widest"
              maxLength={6}
            />
            <button
              onClick={joinRoom}
              disabled={loading || !joinCode.trim()}
              className="btn-secondary"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-xl font-bold mb-4">How Multiplayer Works</h2>
        <ul className="space-y-2 text-gray-400">
          <li>• 2-8 players compete in real-time</li>
          <li>• Everyone sees the same pattern</li>
          <li>• 30 seconds to make your prediction</li>
          <li>• First correct answer gets a bonus</li>
          <li>• 10 rounds per game</li>
          <li>• Highest total score wins!</li>
        </ul>
      </div>
    </div>
  );
}
