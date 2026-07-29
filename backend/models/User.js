const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 15 },
  email: { type: String, required: false, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  isGuest: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
