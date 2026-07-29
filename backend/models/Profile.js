const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String, default: '🧑‍🎤' },
  runnerColor: { type: String, default: '#00f3ff' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  credits: { type: Number, default: 0 },
  equippedCharacter: { type: String, default: 'velocity' },
  highScore: { type: Number, default: 0 },
  bestDistance: { type: Number, default: 0 },
  bossesKilled: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Profile', ProfileSchema);
