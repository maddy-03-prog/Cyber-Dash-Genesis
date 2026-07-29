const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 min
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

module.exports = apiLimiter;
