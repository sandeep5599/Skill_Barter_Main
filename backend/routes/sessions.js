// Place this in your API routes folder (e.g., /api/matches.js)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const Notification = require('../models/Notification');
const matchingController = require('../controllers/matchingController');
const sessionController = require('../controllers/sessionController');

// Create a new match request with time slots
// Session-related routes
router.get('/sessions', auth, matchingController.getSessions);
router.get('/user/:userId', auth, sessionController.getUserSessions);
router.post('/', auth, sessionController.createSession);
router.put('/sessions/:sessionId/complete', auth, sessionController.completeSession);
router.put('/sessions/:sessionId', auth, matchingController.updateSessionStatus);

module.exports = router;