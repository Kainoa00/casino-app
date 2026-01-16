import { Router } from 'express';
import { roomOps } from '../models/database.js';
import { authenticateRequest } from '../middleware/auth.js';

const router = Router();
router.use(authenticateRequest);

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

router.post('/create', (req, res) => {
  const { gameType = 'pattern_prediction' } = req.body;

  // Generate unique room code
  let roomCode;
  let attempts = 0;
  do {
    roomCode = generateRoomCode();
    const existing = roomOps.findByCode(roomCode);
    if (!existing || existing.status === 'closed') break;
    attempts++;
  } while (attempts < 10);

  if (attempts >= 10) {
    return res.status(500).json({ error: 'Could not generate room code' });
  }

  // Create room
  const room = roomOps.create(roomCode, gameType, req.user.id);

  // Add host as first player
  roomOps.addPlayer(room.id, req.user.id);

  res.json({
    roomCode,
    roomId: room.id,
    gameType,
    isHost: true
  });
});

router.post('/join', (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode) {
    return res.status(400).json({ error: 'Room code required' });
  }

  const room = roomOps.findByCode(roomCode.toUpperCase());

  if (!room || room.status !== 'waiting') {
    return res.status(404).json({ error: 'Room not found or game already started' });
  }

  // Check player count
  const playerCount = roomOps.getPlayerCount(room.id);
  if (playerCount >= room.max_players) {
    return res.status(400).json({ error: 'Room is full' });
  }

  // Add player (handles duplicates)
  roomOps.addPlayer(room.id, req.user.id);

  res.json({
    roomCode: room.room_code,
    roomId: room.id,
    gameType: room.game_type,
    isHost: room.host_id === req.user.id
  });
});

router.get('/:roomCode', (req, res) => {
  const { roomCode } = req.params;

  const room = roomOps.findByCode(roomCode.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const players = roomOps.getPlayers(room.id);

  res.json({
    room: {
      code: room.room_code,
      gameType: room.game_type,
      status: room.status,
      hostId: room.host_id,
      currentRound: room.current_round,
      maxPlayers: room.max_players
    },
    players: players.map(p => ({
      id: p.user_id,
      username: p.username,
      score: p.score,
      isHost: p.user_id === room.host_id
    })),
    isHost: room.host_id === req.user.id
  });
});

router.post('/:roomCode/leave', (req, res) => {
  const { roomCode } = req.params;

  const room = roomOps.findByCode(roomCode.toUpperCase());

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  roomOps.removePlayer(room.id, req.user.id);

  // If host leaves, close the room
  if (room.host_id === req.user.id) {
    roomOps.updateStatus(room.id, 'closed');
  }

  res.json({ success: true });
});

export default router;
