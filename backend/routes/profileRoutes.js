const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path as necessary
const authMiddleware = require('../middleware/auth'); // Adjust the path as necessary
const bcrypt = require('bcryptjs');

router.put('/security-questions', authMiddleware, async (req, res) => {
    try {
      const { securityQuestions } = req.body;
      
      if (!securityQuestions || !Array.isArray(securityQuestions) || securityQuestions.length < 2) {
        return res.status(400).json({ message: 'At least two security questions are required' });
      }
      
      // Validate all questions have answers
      const validQuestions = securityQuestions.every(q => 
        q.question && q.question.trim() && q.answer && q.answer.trim()
      );
      
      if (!validQuestions) {
        return res.status(400).json({ message: 'All security questions must have questions and answers' });
      }
      
      // Find the user
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Hash and save security questions
      await user.setSecurityQuestions(securityQuestions);
      await user.save();
      
      return res.status(200).json({ 
        message: 'Security questions updated successfully',
        hasSecurityQuestions: true
      });
    } catch (error) {
      console.error('Error updating security questions:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });


  // In your routes file (e.g., profileRoutes.js or userRoutes.js)
router.put('/update', authMiddleware, async (req, res) => {
    try {
      const { name, email, country, currentPassword, newPassword } = req.body;
      
      // Find the user
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update user fields
      user.name = name;
      
      // Check if email is being changed
      if (email !== user.email) {
        // Check if email is already in use
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
        user.email = email;
      }
      
      // Update country if provided
      if (country) {
        user.country = country;
      }
      
      // Update password if provided
      if (newPassword) {
        user.password = newPassword; // Assuming your model has a pre-save hook to hash the password
      }
      
      await user.save();
      
      return res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          name: user.name,
          email: user.email,
          country: user.country
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;