const User = require('../models/User');

// Add skills
exports.addSkill = async (req, res) => {
  try {
    const { userId, skillType, skillName } = req.body;

    const updateField = skillType === 'teach' ? 'teachingSkills' : 'learningSkills';
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { [updateField]: skillName } },
      { new: true }
    );

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
