const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { addSkill, getUserProfile } = require('../controllers/userController');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Add this import

// Protected Route
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/add-skill', addSkill);

router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  // console.log("User ID:", user._id);

  if (!user) {
      return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

router.get('/profile/:userId', getUserProfile);

// Password reset request route - Step 1
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // For security reasons, don't reveal if the user exists or not
    if (!user) {
      return res.status(404).json({ message: 'If an account with that email exists, security questions will be sent.' });
    }
    
    // Check if user has security questions set up
    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return res.status(400).json({ 
        message: 'No security questions found for this account. Please contact support.' 
      });
    }
    
    // Return only the questions (not the hashed answers)
    const questions = user.securityQuestions.map((q, index) => ({
      index,
      question: q.question
    }));
    
    // Generate a temporary reset token that expires in 10 minutes
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 600000; // 10 minutes
    await user.save();
    
    return res.status(200).json({
      message: 'Please answer your security questions to reset your password',
      questions,
      resetToken
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify security questions - Step 2
router.post('/verify-security-questions', async (req, res) => {
  try {
    const { resetToken, answers } = req.body;
    
    if (!resetToken || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    
    // Find user with the reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset token is invalid or has expired' 
      });
    }
    
    // Verify all answers
    let allCorrect = true;
    
    // Make sure we have the right number of answers
    if (answers.length !== user.securityQuestions.length) {
      return res.status(400).json({ message: 'Incorrect number of security answers provided' });
    }
    
    for (let i = 0; i < answers.length; i++) {
      const isCorrect = await user.verifySecurityAnswer(i, answers[i]);
      if (!isCorrect) {
        allCorrect = false;
        break;
      }
    }
    
    if (!allCorrect) {
      // Rate limiting should be implemented here to prevent brute force attempts
      return res.status(400).json({ message: 'One or more security answers are incorrect' });
    }
    
    // Generate a new verification token for the password reset
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordVerified = verificationToken;
    await user.save();
    
    return res.status(200).json({
      message: 'Security questions verified successfully',
      verificationToken
    });
  } catch (error) {
    console.error('Error verifying security questions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset password after security questions verified - Step 3
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, verificationToken, newPassword } = req.body;
    
    if (!resetToken || !verificationToken || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Find user with valid tokens
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordVerified: verificationToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Password reset session is invalid or has expired' 
      });
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    // Update password and clear reset tokens
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordVerified = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
