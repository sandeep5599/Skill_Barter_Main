const Skill = require('../models/Skill');

exports.addSkill = async (req, res) => {
  try {
    const { name, level, type } = req.body;
    const userId = req.user.id; // From auth middleware

    const skill = new Skill({
      userId,
      name,
      level,
      type
    });

    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.findMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user's teaching and learning skills
    const userSkills = await Skill.find({ userId });
    const teachingSkills = userSkills.filter(skill => skill.type === 'teaching');
    const learningSkills = userSkills.filter(skill => skill.type === 'learning');

    // Find potential matches
    const matches = await Skill.aggregate([
      // Match users who are teaching what we want to learn
      {
        $match: {
          type: 'teaching',
          name: { $in: learningSkills.map(skill => skill.name) }
        }
      },
      // Group by userId to find users who also want to learn what we teach
      {
        $lookup: {
          from: 'skills',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$type', 'learning'] },
                    { $in: ['$name', teachingSkills.map(skill => skill.name)] }
                  ]
                }
              }
            }
          ],
          as: 'matchingLearningSkills'
        }
      },
      // Only include users who have matching learning skills
      {
        $match: {
          'matchingLearningSkills.0': { $exists: true }
        }
      }
    ]);

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
