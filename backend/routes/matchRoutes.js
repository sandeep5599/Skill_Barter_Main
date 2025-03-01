const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const auth = require('../middleware/auth');


router.post('/matches', auth, matchingController.createMatch);
router.get('/', auth, matchingController.getMatches);
router.put('/matches/:matchId', auth, matchingController.updateMatchStatus);
router.get('/sessions', auth, matchingController.getSessions);
router.put('/sessions/:sessionId', auth, matchingController.updateSessionStatus);
router.post('/generate', auth, matchingController.generateMatches);

  
module.exports = router;