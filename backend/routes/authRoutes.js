const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Add this import
const router = express.Router();
const auth = require('../middleware/auth'); // Import the auth middleware

// Register Route
router.post('/register', async (req, res) => {
  const { email, name, password, offeredSkills, desiredSkills, availability } = req.body;

  // Check if all required fields are provided
  if (!email || !name || !password) {
    return res.status(400).json({ msg: 'All fields are required. Please provide email, name, password,' });
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
    });

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
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('Register error:', err);

    // Handle different error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid input data. Please check the fields and try again.' });
    } else if (err.name === 'MongoError') {
      return res.status(500).json({ msg: 'Database error. Please try again later.' });
    } else {
      return res.status(500).json({ msg: 'Server error. Please try again later.' });
    }
  }
});

// Login Route remains the same
router.post('/login', async (req, res) => {
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
});


// New Token Validation Route
router.post('/validate-token', auth, async (req, res) => {
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
});

// Password Reset Request Route (Optional but recommended)
router.post('/request-password-reset', async (req, res) => {
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
});

module.exports = router;