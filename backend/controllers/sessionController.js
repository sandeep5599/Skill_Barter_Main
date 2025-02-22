const Session = require('../models/Session');
const User = require('../models/User');

exports.createSession = async (req, res) => {
  try {
    const { teacherId, skillId, scheduledTime, duration } = req.body;
    const studentId = req.user.id;

    const session = new Session({
      teacherId,
      studentId,
      skillId,
      scheduledTime,
      duration
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Award points to teacher
    const POINTS_PER_SESSION = 100;
    await User.findByIdAndUpdate(
      session.teacherId,
      { $inc: { points: POINTS_PER_SESSION } }
    );

    session.status = 'completed';
    session.pointsAwarded = POINTS_PER_SESSION;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
