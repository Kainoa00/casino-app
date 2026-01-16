import { userOps, roomOps } from '../models/database.js';
import { generatePattern, validateGuess, calculatePayout } from '../services/games/patternPrediction.js';

// Store active multiplayer games
const multiplayerGames = new Map();

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join a game room
    socket.on('join-room', async (roomCode) => {
      const room = roomOps.findByCode(roomCode);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // Check if user is a player in this room
      const players = roomOps.getPlayers(room.id);
      const isPlayer = players.some(p => p.user_id === socket.userId);

      if (!isPlayer) {
        socket.emit('error', { message: 'Not a member of this room' });
        return;
      }

      socket.join(roomCode);
      socket.roomCode = roomCode;

      // Get user info
      const user = userOps.findById(socket.userId);

      // Notify room
      io.to(roomCode).emit('player-joined', {
        playerId: socket.userId,
        username: user?.username
      });

      // Send current room state
      socket.emit('room-state', {
        roomCode: room.room_code,
        status: room.status,
        hostId: room.host_id,
        players,
        currentRound: room.current_round
      });
    });

    // Host starts the game
    socket.on('start-game', (roomCode) => {
      const room = roomOps.findByCode(roomCode);

      if (!room || room.host_id !== socket.userId) {
        socket.emit('error', { message: 'Only host can start the game' });
        return;
      }

      if (room.status !== 'waiting') {
        socket.emit('error', { message: 'Game already started' });
        return;
      }

      // Update room status
      roomOps.updateStatus(room.id, 'playing');

      // Start first round
      startNewRound(io, roomCode, room.id);
    });

    // Player submits a guess
    socket.on('submit-guess', ({ roomCode, guess, guessType, betAmount }) => {
      const game = multiplayerGames.get(roomCode);

      if (!game) {
        socket.emit('error', { message: 'No active game' });
        return;
      }

      if (game.submitted.has(socket.userId)) {
        socket.emit('error', { message: 'Already submitted a guess' });
        return;
      }

      const user = userOps.findById(socket.userId);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      const bet = Math.min(Math.max(parseInt(betAmount) || 100, 10), user.balance);

      // Process guess
      const isCorrect = validateGuess(game.pattern, guess, guessType);
      const payout = calculatePayout(bet, guessType, isCorrect);
      const netResult = payout - bet;

      // Update balance
      userOps.addBalance(socket.userId, netResult);

      // Update room player score
      if (isCorrect) {
        roomOps.updatePlayerScore(game.roomId, socket.userId, payout);
      }

      // Record submission
      game.submitted.set(socket.userId, {
        guess,
        guessType,
        bet,
        isCorrect,
        payout,
        username: user.username
      });

      // Notify room of submission
      io.to(roomCode).emit('player-submitted', {
        playerId: socket.userId,
        username: user.username
      });

      // Send result to the player
      const updatedUser = userOps.findById(socket.userId);
      socket.emit('guess-result', {
        correct: isCorrect,
        payout,
        newBalance: updatedUser.balance
      });

      // Check if all players submitted
      const playerCount = roomOps.getPlayerCount(game.roomId);

      if (game.submitted.size >= playerCount) {
        endRound(io, roomCode, game);
      }
    });

    // Leave room
    socket.on('leave-room', () => {
      if (socket.roomCode) {
        const user = userOps.findById(socket.userId);

        io.to(socket.roomCode).emit('player-left', {
          playerId: socket.userId,
          username: user?.username
        });

        socket.leave(socket.roomCode);
        socket.roomCode = null;
      }
    });

    // Chat message
    socket.on('chat-message', ({ roomCode, message }) => {
      if (!roomCode || !message) return;

      const user = userOps.findById(socket.userId);

      io.to(roomCode).emit('chat-message', {
        playerId: socket.userId,
        username: user?.username,
        message: message.slice(0, 200),
        timestamp: Date.now()
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      if (socket.roomCode) {
        const user = userOps.findById(socket.userId);

        io.to(socket.roomCode).emit('player-left', {
          playerId: socket.userId,
          username: user?.username
        });
      }
    });
  });
}

function startNewRound(io, roomCode, roomId) {
  const room = roomOps.findByCode(roomCode);
  const difficulties = ['easy', 'medium', 'hard'];
  const currentRound = room?.current_round || 0;
  const difficulty = difficulties[Math.min(currentRound, 2)];

  const pattern = generatePattern(null, difficulty);

  // Store game state
  multiplayerGames.set(roomCode, {
    roomId,
    pattern,
    difficulty,
    round: currentRound + 1,
    submitted: new Map(),
    startTime: Date.now()
  });

  // Update round number
  roomOps.incrementRound(roomId);

  // Send pattern to all players
  io.to(roomCode).emit('new-round', {
    round: currentRound + 1,
    patternType: pattern.type,
    sequence: pattern.sequence,
    difficulty,
    timeLimit: 30
  });

  // Auto-end round after time limit
  setTimeout(() => {
    const game = multiplayerGames.get(roomCode);
    if (game && game.round === currentRound + 1) {
      endRound(io, roomCode, game);
    }
  }, 32000);
}

function endRound(io, roomCode, game) {
  // Get all player results
  const results = [];
  game.submitted.forEach((submission, playerId) => {
    results.push({
      playerId,
      ...submission
    });
  });

  // Sort by payout
  results.sort((a, b) => b.payout - a.payout);

  // Get updated scores
  const players = roomOps.getPlayers(game.roomId);
  players.sort((a, b) => b.score - a.score);

  // Send round results
  io.to(roomCode).emit('round-ended', {
    round: game.round,
    answer: game.pattern.answer,
    results,
    standings: players
  });

  // Check if game should continue
  if (game.round < 10) {
    setTimeout(() => {
      startNewRound(io, roomCode, game.roomId);
    }, 5000);
  } else {
    roomOps.updateStatus(game.roomId, 'finished');
    multiplayerGames.delete(roomCode);

    io.to(roomCode).emit('game-over', {
      finalStandings: players
    });
  }
}
