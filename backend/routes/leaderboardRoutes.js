const express = require('express');
const router = express.Router();
const { getLeaderboard, submitScore } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

router.get('/', getLeaderboard);
router.post('/submit', protect, submitScore);

module.exports = router;
