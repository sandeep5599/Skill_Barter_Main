const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); // Add this import
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
router.get('/', auth, matchingController.getSessions);
router.get('/user/:userId', auth, sessionController.getUserSessions);
router.post('/', auth, sessionController.createSession);
router.put('/:sessionId/complete', auth, sessionController.completeSession);
// Add this new route
router.put('/:sessionId/confirm', auth, sessionController.confirmSession);
router.get('/:sessionId', auth, sessionController.getSessionById);
// Add this new route to get sessions by match ID
// router.get('/match/:matchId', auth, sessionController.getSessionByMatchId);
router.put('/:sessionId/meeting-link', auth, sessionController.updateSessionLink);
router.post('/sessions/:sessionId/feedback', auth, sessionController.submitFeedback);
// Add this new route for session cancellation
router.put('/:sessionId/cancel', auth, sessionController.cancelSession);
router.post(
  '/:id/teacher-feedback',
  [
    auth,
    [
      check('feedback', 'Feedback is required').not().isEmpty()
    ]
  ],
  sessionController.submitTeacherFeedback
);

module.exports = router;