const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, required: true },
  skinColor: { type: String, required: true },
  hpBonus: { type: Number, default: 0 },
  speedBonus: { type: Number, default: 1.0 },
  passiveAbility: { type: String },
  ultimateAbility: { type: String }
});

module.exports = mongoose.model('Character', CharacterSchema);
