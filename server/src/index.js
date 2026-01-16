import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './models/database.js';
import authRoutes from './routes/auth.js';
import currencyRoutes from './routes/currency.js';
import gameRoutes from './routes/games.js';
import leaderboardRoutes from './routes/leaderboard.js';
import roomRoutes from './routes/rooms.js';
import { setupSocketHandlers } from './socket/index.js';
import { authenticateSocket } from './middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
const corsOptions = {
  origin: clientUrl,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rooms', roomRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.io
io.use(authenticateSocket);
setupSocketHandlers(io);

// Track online users
let onlineUsers = new Set();

io.on('connection', (socket) => {
  onlineUsers.add(socket.userId);
  io.emit('online-count', onlineUsers.size);

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);
    io.emit('online-count', onlineUsers.size);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
