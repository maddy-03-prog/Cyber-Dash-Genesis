const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '🧑‍🎤' },
  score: { type: Number, required: true, index: true },
  distance: { type: Number, required: true },
  coins: { type: Number, default: 0 },
  bossesKilled: { type: Number, default: 0 },
  difficulty: { type: String, default: 'medium' },
  timeframe: { type: String, enum: ['daily', 'weekly', 'monthly', 'alltime'], default: 'alltime', index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
