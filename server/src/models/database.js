import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'database.json');

// Default database structure
const defaultDb = {
  users: [],
  transactions: [],
  gameSessions: [],
  gameRooms: [],
  roomPlayers: []
};

let db = null;

function loadDb() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2));
    return { ...defaultDb };
  }

  try {
    const data = readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { ...defaultDb };
  }
}

function saveDb() {
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function getDb() {
  if (!db) {
    db = loadDb();
  }
  return db;
}

export function initDatabase() {
  db = loadDb();
  console.log('Database initialized (JSON file storage)');
}

// Auto-increment ID generator
function getNextId(collection) {
  const items = db[collection] || [];
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// User operations
export const userOps = {
  create(username, passwordHash) {
    const user = {
      id: getNextId('users'),
      username,
      password_hash: passwordHash,
      balance: 10000,
      total_wagered: 0,
      total_won: 0,
      games_played: 0,
      created_at: new Date().toISOString(),
      last_login: null,
      last_daily_bonus: null
    };
    db.users.push(user);
    saveDb();
    return user;
  },

  findByUsername(username) {
    return db.users.find(u => u.username === username);
  },

  findById(id) {
    return db.users.find(u => u.id === id);
  },

  updateBalance(id, balance) {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.balance = balance;
      saveDb();
    }
    return user;
  },

  addBalance(id, amount) {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.balance += amount;
      saveDb();
    }
    return user;
  },

  updateLastLogin(id) {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.last_login = new Date().toISOString();
      saveDb();
    }
    return user;
  },

  updateDailyBonus(id, bonus) {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.last_daily_bonus = new Date().toISOString();
      user.balance += bonus;
      saveDb();
    }
    return user;
  },

  updateStats(id, wagered, won) {
    const user = db.users.find(u => u.id === id);
    if (user) {
      user.games_played += 1;
      user.total_wagered += wagered;
      user.total_won += won;
      saveDb();
    }
    return user;
  },

  getLeaderboard(limit = 50) {
    return [...db.users]
      .filter(u => u.total_won > 0)
      .sort((a, b) => b.total_won - a.total_won)
      .slice(0, limit)
      .map((u, i) => ({
        rank: i + 1,
        id: u.id,
        username: u.username,
        score: u.total_won,
        games_played: u.games_played,
        total_wagered: u.total_wagered
      }));
  }
};

// Transaction operations
export const transactionOps = {
  create(userId, amount, type, gameType, description) {
    const tx = {
      id: getNextId('transactions'),
      user_id: userId,
      amount,
      type,
      game_type: gameType,
      description,
      created_at: new Date().toISOString()
    };
    db.transactions.push(tx);
    saveDb();
    return tx;
  },

  getByUser(userId, limit = 20) {
    return db.transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }
};

// Game session operations
export const gameSessionOps = {
  create(userId, gameType, patternType, difficulty, betAmount) {
    const session = {
      id: getNextId('gameSessions'),
      user_id: userId,
      game_type: gameType,
      pattern_type: patternType,
      difficulty,
      bet_amount: betAmount,
      result: null,
      payout: 0,
      is_multiplayer: false,
      room_code: null,
      created_at: new Date().toISOString(),
      ended_at: null
    };
    db.gameSessions.push(session);
    saveDb();
    return session;
  },

  update(id, result, payout) {
    const session = db.gameSessions.find(s => s.id === id);
    if (session) {
      session.result = result;
      session.payout = payout;
      session.ended_at = new Date().toISOString();
      saveDb();
    }
    return session;
  }
};

// Room operations
export const roomOps = {
  create(roomCode, gameType, hostId) {
    const room = {
      id: getNextId('gameRooms'),
      room_code: roomCode,
      game_type: gameType,
      host_id: hostId,
      status: 'waiting',
      max_players: 8,
      current_round: 0,
      created_at: new Date().toISOString()
    };
    db.gameRooms.push(room);
    saveDb();
    return room;
  },

  findByCode(roomCode) {
    return db.gameRooms.find(r => r.room_code === roomCode);
  },

  updateStatus(id, status) {
    const room = db.gameRooms.find(r => r.id === id);
    if (room) {
      room.status = status;
      saveDb();
    }
    return room;
  },

  incrementRound(id) {
    const room = db.gameRooms.find(r => r.id === id);
    if (room) {
      room.current_round += 1;
      saveDb();
    }
    return room;
  },

  addPlayer(roomId, userId) {
    const existing = db.roomPlayers.find(rp => rp.room_id === roomId && rp.user_id === userId);
    if (existing) return existing;

    const player = {
      id: getNextId('roomPlayers'),
      room_id: roomId,
      user_id: userId,
      score: 0,
      joined_at: new Date().toISOString()
    };
    db.roomPlayers.push(player);
    saveDb();
    return player;
  },

  getPlayers(roomId) {
    const players = db.roomPlayers.filter(rp => rp.room_id === roomId);
    return players.map(p => {
      const user = db.users.find(u => u.id === p.user_id);
      return {
        ...p,
        username: user?.username
      };
    });
  },

  updatePlayerScore(roomId, userId, score) {
    const player = db.roomPlayers.find(rp => rp.room_id === roomId && rp.user_id === userId);
    if (player) {
      player.score += score;
      saveDb();
    }
    return player;
  },

  removePlayer(roomId, userId) {
    const index = db.roomPlayers.findIndex(rp => rp.room_id === roomId && rp.user_id === userId);
    if (index !== -1) {
      db.roomPlayers.splice(index, 1);
      saveDb();
    }
  },

  getPlayerCount(roomId) {
    return db.roomPlayers.filter(rp => rp.room_id === roomId).length;
  }
};
