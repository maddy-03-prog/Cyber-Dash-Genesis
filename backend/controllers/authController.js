const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'cyber_dash_super_secret_quantum_key_2026', {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const user = await User.create({ username, passwordHash: password });
    const profile = await Profile.create({ userId: user._id, displayName: username });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username: user.username },
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const profile = await Profile.findOne({ userId: user._id });
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username },
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.guest = async (req, res) => {
  try {
    const guestId = `Guest_${Math.floor(Math.random() * 899999 + 100000)}`;
    const user = await User.create({ username: guestId, passwordHash: 'guestPass123', isGuest: true });
    const profile = await Profile.create({ userId: user._id, displayName: guestId });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, username: user.username, isGuest: true },
      profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
