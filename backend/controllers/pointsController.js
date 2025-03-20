const Points = require('../../server/models/Points');

exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userPoints = await Points.findOne({ userId });
    
    if (!userPoints) {
      userPoints = new Points({ userId });
    }

    if (!userPoints.lastCheckIn || userPoints.lastCheckIn < today) {
      userPoints.points += 1;
      userPoints.lastCheckIn = new Date();
      userPoints.streak += 1;
      await userPoints.save();
      
      return res.json({
        success: true,
        points: userPoints.points,
        streak: userPoints.streak
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Already checked in today'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Points.find()
      .sort('-points')
      .limit(10)
      .populate('userId', 'name avatar')
      .lean();
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
