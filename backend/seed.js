// Seed database script for MongoDB Atlas
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Leaderboard = require('./models/Leaderboard');

const seedData = [
  { username: 'CYBER_GHOST_99', avatar: '🥷', score: 984500, distance: 12450, coins: 3240, bossesKilled: 12, timeframe: 'alltime' },
  { username: 'NEXUS_BREACHER', avatar: '🤖', score: 850200, distance: 10120, coins: 2890, bossesKilled: 10, timeframe: 'alltime' },
  { username: 'Maddy_VIT', avatar: '🧑‍🎤', score: 720100, distance: 8940, coins: 2535, bossesKilled: 8, timeframe: 'alltime' }
];

const seedDB = async () => {
  await connectDB();
  await Leaderboard.deleteMany();
  await Leaderboard.insertMany(seedData.map(d => ({ ...d, userId: new mongoose.Types.ObjectId() })));
  console.log('[SEED SUCCESS] Default Hall of Fame leaderboard entries seeded!');
  process.exit(0);
};

seedDB();
