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

// Match-related routes (keep existing routes)
// ...

// Session-related routes (expanded)
router.get('/sessions', auth, matchingController.getSessions);
router.get('/user/:userId', auth, sessionController.getUserSessions);
router.post('/', auth, sessionController.createSession);
router.put('/sessions/:sessionId/complete', auth, sessionController.completeSession);

// router.get('/sessions/:sessionId', auth, sessionController.getSessionById);
// router.put('/sessions/:sessionId/update-link', auth, sessionController.updateSessionLink);
// router.post('/sessions/:sessionId/feedback', auth, sessionController.submitFeedback);

module.exports = router;