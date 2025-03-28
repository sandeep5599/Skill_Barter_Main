const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const auth = require('../middleware/auth');

// Match-related routes
router.get('/', auth, matchingController.getMatches);
router.get('/user/:userId', auth, matchingController.getUserMatches);
router.post('/', auth, matchingController.createMatch);
router.put('/:matchId', auth, matchingController.updateMatchStatus);
router.post('/generate', auth, matchingController.generateMatches);
router.delete('/by-skill/:skillId', auth, matchingController.deleteMatchesBySkill); // New route

router.put('/:matchId/status', auth, matchingController.updateMatchStatus);
module.exports = router;