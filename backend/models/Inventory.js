const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  helmets: [{ type: String }],
  armors: [{ type: String }],
  weapons: [{ type: String }],
  equippedHelmet: { type: String, default: 'helm_scout' },
  equippedArmor: { type: String, default: 'suit_light' },
  equippedWeapon: { type: String, default: 'sword' }
});

module.exports = mongoose.model('Inventory', InventorySchema);
