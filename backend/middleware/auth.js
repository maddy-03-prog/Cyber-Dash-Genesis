const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cyber_dash_super_secret_quantum_key_2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

module.exports = { protect };
