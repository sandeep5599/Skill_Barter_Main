const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pointsController = require('../controllers/pointsController');

router.post('/checkin', auth, pointsController.checkIn);
router.get('/leaderboard', pointsController.getLeaderboard);

module.exports = router;
