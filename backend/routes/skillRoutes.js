const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');

// @route   POST api/skills
router.post('/', auth, async (req, res) => {
  try {
    const newSkill = new Skill({
      userId: req.user.id,
      skillName: req.body.skillName,
      proficiencyLevel: req.body.proficiencyLevel,
      isTeaching: req.body.isTeaching,
      isLearning: req.body.isLearning,
      description: req.body.description
    });

    const skill = await newSkill.save();
    // console.log(skill);
    res.json(skill);
  } catch (err) {
    console.error(`Error for skills routes: ${err.message}`);
    res.status(500).send('Server error');
  }
});


router.get('/:userId', auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.params.userId });
    res.json({
      teachingSkills: skills.filter(skill => skill.isTeaching),
      learningSkills: skills.filter(skill => skill.isLearning),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// @route   GET api/skills/requests/counts/:userId
// @desc    Get counts of teaching and learning requests for a user
// @access  Private
router.get('/requests/counts/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get teaching skills count
    const teachingRequestsCount = await Skill.countDocuments({ 
      userId: userId,
      isTeaching: true
    });
    
    // Get learning skills count
    const learningRequestsCount = await Skill.countDocuments({ 
      userId: userId,
      isLearning: true
    });
    
    res.json({
      teachingRequestsCount,
      learningRequestsCount
    });
  } catch (err) {
    console.error('Error fetching request counts:', err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:skillId', auth, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.skillId); // Use findByIdAndDelete instead

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    res.json({ msg: 'Skill removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});



module.exports = router;