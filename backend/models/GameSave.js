const mongoose = require('mongoose');

const GameSaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  saveData: { type: Object, required: true }, // Complete LocalStorage state JSON
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameSave', GameSaveSchema);
