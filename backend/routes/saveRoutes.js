const express = require('express');
const router = express.Router();
const { saveCloudData, loadCloudData } = require('../controllers/saveController');
const { protect } = require('../middleware/auth');

router.post('/sync', protect, saveCloudData);
router.get('/load', protect, loadCloudData);

module.exports = router;
