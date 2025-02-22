const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

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

    // Respond with the token
    res.status(201).json({ token });
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



// Login Route
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
    res.json({ token , user });
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


module.exports = router;