// routes/userStatusRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userStatusController = require('../controllers/userStatusController');

// Get single user status
router.get('/:userId', auth, userStatusController.getUserStatus);

// Get multiple user statuses
router.post('/bulk', auth, userStatusController.getBulkUserStatus);

module.exports = router;