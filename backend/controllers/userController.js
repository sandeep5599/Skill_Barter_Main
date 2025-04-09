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

// In your user controller
exports.updateUserProfile = async (req, res) => {
  try {
    const { country, securityQuestions } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update country if provided
    if (country) {
      user.country = country;
    }
    
    // Update security questions if provided
    if (securityQuestions && securityQuestions.length > 0) {
      await user.setSecurityQuestions(securityQuestions);
    }
    
    await user.save();
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        country: user.country,
        hasSecurityQuestions: user.securityQuestions && user.securityQuestions.length > 0
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};