const Leaderboard = require('../models/Leaderboard');

exports.getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'alltime', limit = 10 } = req.query;
    const scores = await Leaderboard.find({ timeframe })
      .sort({ score: -1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, count: scores.length, timeframe, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitScore = async (req, res) => {
  try {
    const { username, score, distance, coins, bossesKilled, timeframe = 'alltime' } = req.body;
    const entry = await Leaderboard.create({
      userId: req.user.id,
      username: username || 'RUNNER',
      score,
      distance,
      coins,
      bossesKilled,
      timeframe
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
