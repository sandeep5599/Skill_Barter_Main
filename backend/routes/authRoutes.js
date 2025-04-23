// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Validate token
router.post('/validate-token', auth, authController.validateToken);

// Request password reset via email
router.post('/request-password-reset', authController.requestPasswordReset);

// Forgot password (security questions)
router.post('/forgot-password', authController.forgotPassword);

// Verify security questions
router.post('/verify-security-questions', authController.verifySecurityQuestions);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;