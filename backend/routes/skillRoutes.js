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

// @route   GET api/skills/:userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const { includeTeaching, includeLearning } = req.query;
    
    const filter = { userId: req.params.userId };
    
    // Apply filtering based on query parameters if specified
    if (includeTeaching === 'true' && includeLearning === 'true') {
      // Include both teaching and learning skills
      filter.$or = [{ isTeaching: true }, { isLearning: true }];
    } else if (includeTeaching === 'true') {
      filter.isTeaching = true;
    } else if (includeLearning === 'true') {
      filter.isLearning = true;
    }

    const skills = await Skill.find(filter);

    res.json({
      teachingSkills: skills.filter(skill => skill.isTeaching),
      learningSkills: skills.filter(skill => skill.isLearning)
    });
  } catch (err) {
    console.error(err.message);
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