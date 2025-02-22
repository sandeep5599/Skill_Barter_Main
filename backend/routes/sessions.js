const express = require('express');
const { createSession } = require('../controllers/sessionController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createSession);

module.exports = router;
