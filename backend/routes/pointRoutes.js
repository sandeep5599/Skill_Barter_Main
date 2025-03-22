const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pointsController = require('../controllers/pointsController');

router.post('/checkin', auth, pointsController.checkIn);
router.get('/leaderboard', pointsController.getLeaderboard);
router.get('/user-points', auth, pointsController.getUserPoints);
router.get('/user-rank' ,auth, pointsController.getUserRank);

module.exports = router;
