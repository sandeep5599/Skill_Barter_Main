// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Register a new user
exports.register = async (req, res) => {
  const { email, name, password, country, securityQuestions } = req.body;

  // Check if all required fields are provided
  if (!email || !name || !password) {
    return res.status(400).json({ msg: 'Required fields missing. Please provide email, name, and password.' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ msg: 'User already exists. Please use a different email.' });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user object
    const newUser = new User({
      email,
      name,
      password: hashedPassword,
      country: country || '' // Save country if provided
    });

    // Handle security questions if provided
    if (securityQuestions && Array.isArray(securityQuestions) && securityQuestions.length >= 2) {
      // Use the setSecurityQuestions method we already have in the User model
      await newUser.setSecurityQuestions(securityQuestions);
    }

    // Save the new user in the database
    await newUser.save();

    // Generate a JWT token for the new user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create welcome notification
    const welcomeNotification = new Notification({
      userId: newUser._id,
      type: 'welcome',
      title: 'Welcome to Skill Barter Platform!',
      message: `Welcome ${name}, to Skill Barter Platform! Start by adding skills you can teach and skills you want to learn.`,
      relatedId: newUser._id,
      relatedModel: 'User',
      read: false
    });
    
    // Save the notification
    await welcomeNotification.save();
    
    // Emit the notification through socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(newUser._id.toString()).emit('notification', welcomeNotification);
    }

    // Respond with the token and user info
    res.status(201).json({ 
      token,
      user: { 
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        country: newUser.country,
        hasSecurityQuestions: newUser.securityQuestions && newUser.securityQuestions.length > 0
      }
    });
  } catch (err) {
    console.error('Register error:', err);

    // Handle different error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid input data. Please check the fields and try again.' });
    } else if (err.name === 'MongoError' || err.code === 11000) {
      return res.status(500).json({ msg: 'Database error. Please try again later.' });
    } else {
      return res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Check if the email and password are provided 
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required.' });
  }

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist. Please check your email or register.' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials. Please check your password.' });
    }

    // Generate a JWT token upon successful login
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);

    // Handle different error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid input data.' });
    } else if (err.name === 'MongoError') {
      return res.status(500).json({ msg: 'Database error. Please try again later.' });
    } else if (err.message.includes('jwt')) {
      return res.status(500).json({ msg: 'Error generating authentication token.' });
    } else {
      return res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
  }
};

// Validate token
exports.validateToken = async (req, res) => {
  try {
    // If authenticateToken middleware passes, the user is valid
    // Fetch the full user details, excluding sensitive information
    const user = await User.findById(req.user.userId)
      .select('-password') // Exclude password
      .lean(); // Convert to plain object

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Additional optional fields you might want to include
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      // Add any other non-sensitive fields you want to return
      offeredSkills: user.offeredSkills || [],
      desiredSkills: user.desiredSkills || []
    };

    // Optionally generate a new token to extend session
    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      user: userResponse,
      token: newToken
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Internal server error during token validation' });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, return success even if email not found
      return res.status(200).json({ 
        message: 'If an account exists with this email, a reset link will be sent.' 
      });
    }

    // Generate a password reset token
    const resetToken = jwt.sign(
      { userId: user._id, purpose: 'password-reset' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    // TODO: Implement email sending logic
    // Send email with reset link containing the resetToken

    res.status(200).json({ 
      message: 'Password reset link sent if account exists.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
};

// Verify security questions
exports.verifySecurityQuestions = async (req, res) => {
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
    for (let i = 0; i < answers.length; i++) {
      const isCorrect = await user.verifySecurityAnswer(i, answers[i]);
      if (!isCorrect) {
        allCorrect = false;
        break;
      }
    }
    
    if (!allCorrect) {
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
};

// Reset password
exports.resetPassword = async (req, res) => {
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
};