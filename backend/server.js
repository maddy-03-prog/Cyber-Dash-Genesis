// Cyber Dash: Genesis - Production Node.js & Express & Socket.IO Server

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const apiLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express & HTTP Server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB Atlas
connectDB();

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use('/api/', apiLimiter);

// REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/save', require('./routes/saveRoutes'));

// Production Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'CYBER DASH GENESIS API BACKEND',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Socket.IO Integration
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});
require('./sockets/roomSocket')(io);

// Global Error Handler
app.use(errorHandler);

// Port Configuration for Render & Local Testing
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`⚡ CYBER DASH BACKEND SERVER ONLINE ON PORT: ${PORT}`);
  console.log(`📡 HEALTH ENDPOINT: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
