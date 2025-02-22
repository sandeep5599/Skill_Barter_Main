const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const { addSkill, getUserProfile } = require('../controllers/userController');
const router = express.Router();

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


module.exports = router;
