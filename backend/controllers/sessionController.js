const Session = require('../models/Session');
const User = require('../models/User');
const Match = require('../models/Match');

// Integrate existing session functions with matching controller
const sessionController = {
  createSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
  
      const { matchId, selectedTimeSlot } = req.body;
      const userId = req.user.id;
  
      // Validate required fields
      if (!matchId || !selectedTimeSlot || !selectedTimeSlot.startTime || !selectedTimeSlot.endTime) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['matchId', 'selectedTimeSlot (with startTime and endTime)'] 
        });
      }
  
      // Verify match exists and user is part of it
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
  
      // Check authorization
      if (match.requesterId.toString() !== userId && match.teacherId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to create a session for this match' });
      }
  
      // Only teacher should be able to create sessions
      if (match.teacherId.toString() !== userId) {
        return res.status(403).json({ error: 'Only the teacher can create sessions' });
      }
  
      // Update match status
      match.status = 'accepted';
      await match.save();
  
      // Create Google Meet link
      let meetLink = null;
      try {
        // This is placeholder code for the Google Calendar integration
        const meetEvent = {
          data: {
            hangoutLink: `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`
          }
        };
        meetLink = meetEvent.data.hangoutLink;
      } catch (calendarError) {
        console.error("Error creating calendar event:", calendarError);
      }
  
      // Create session record using match data
      const session = new Session({
        matchId: match._id,
        skillId: match.skillId,
        teacherId: match.teacherId,
        studentId: match.requesterId,
        startTime: new Date(selectedTimeSlot.startTime),
        endTime: new Date(selectedTimeSlot.endTime),
        meetLink: meetLink,
        status: 'scheduled'
      });
  
      await session.save();
  
      return res.status(201).json({ 
        session,
        match,
        message: meetLink ? 'Session created successfully with Meet link' : 'Session created without Meet link'
      });
    } catch (error) {
      console.error("Error creating session:", error);
      return res.status(500).json({ 
        error: 'Failed to create session',
        message: error.message
      });
    }
  },

  getUserSessions: async (req, res) => {
    try {
      const userId = req.params.userId;
      const status = req.query.status || 'scheduled';
      
      // Find sessions where the user is either a teacher or student
      const sessions = await Session.find({
        $or: [
          { teacherId: userId },
          { studentId: userId }
        ],
        status: status
      })
      .populate('skillId', 'name')
      .populate('teacherId', 'name avatar')
      .populate('studentId', 'name avatar')
      .sort({ startTime: 1 }) // Sort by start time, upcoming first
      .limit(5); // Limit to 5 upcoming sessions
      
      return res.status(200).json({ sessions });
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      return res.status(500).json({ 
        error: 'Failed to fetch sessions',
        message: error.message
      });
    }
  },

  completeSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;
      const userId = req.user.id;
      const { feedback } = req.body;

      // Find session
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Find associated match to verify user authorization
      const match = await Match.findById(session.matchId);
      if (!match) {
        return res.status(404).json({ error: 'Associated match not found' });
      }

      // Check authorization
      if (match.requesterId.toString() !== userId && match.teacherId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to complete this session' });
      }

      // Update session status
      session.status = 'completed';
      
      // Add feedback if provided
      if (feedback) {
        const isTeacher = match.teacherId.toString() === userId;
        
        if (isTeacher) {
          session.feedback = {
            ...session.feedback,
            fromTeacher: feedback
          };
        } else {
          session.feedback = {
            ...session.feedback,
            fromStudent: feedback
          };
        }
      }
      
      await session.save();

      // Award points to teacher (only if completed by student)
      if (match.requesterId.toString() === userId) {
        const POINTS_PER_SESSION = 100;
        await User.findByIdAndUpdate(
          match.teacherId,
          { $inc: { points: POINTS_PER_SESSION } }
        );
        
        session.pointsAwarded = POINTS_PER_SESSION;
        await session.save();
      }

      // Update match status
      match.status = 'completed';
      await match.save();

      return res.status(200).json({
        session,
        message: 'Session completed successfully'
      });
    } catch (error) {
      console.error("Error completing session:", error);
      return res.status(500).json({ 
        error: 'Failed to complete session',
        message: error.message
      });
    }
  }
};

module.exports = sessionController;


// exports.createSession = async (req, res) => {
//   try {
//     const { teacherId, skillId, scheduledTime, duration } = req.body;
//     const studentId = req.user.id;

//     const session = new Session({
//       teacherId,
//       studentId,
//       skillId,
//       scheduledTime,
//       duration
//     });

//     await session.save();
//     res.status(201).json(session);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.completeSession = async (req, res) => {
//   try {
//     const { sessionId } = req.params;
//     const session = await Session.findById(sessionId);

//     if (!session) {
//       return res.status(404).json({ message: 'Session not found' });
//     }

//     // Award points to teacher
//     const POINTS_PER_SESSION = 100;
//     await User.findByIdAndUpdate(
//       session.teacherId,
//       { $inc: { points: POINTS_PER_SESSION } }
//     );

//     session.status = 'completed';
//     session.pointsAwarded = POINTS_PER_SESSION;
//     await session.save();

//     res.json(session);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };
