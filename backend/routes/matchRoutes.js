const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// Match-related routes
router.get('/', auth, matchingController.getMatches);
router.post('/', auth, matchingController.createMatch);
router.put('/:matchId', auth, matchingController.updateMatchStatus);
router.post('/generate', auth, matchingController.generateMatches);

// Session-related routes
router.get('/sessions', auth, matchingController.getSessions);
router.post('/sessions', auth, sessionController.createSession);
router.put('/sessions/:sessionId/complete', auth, sessionController.completeSession);
router.put('/sessions/:sessionId', auth, matchingController.updateSessionStatus);

module.exports = router;