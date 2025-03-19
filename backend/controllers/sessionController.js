const Session = require('../models/Session');
const User = require('../models/User');
const Match = require('../models/Match');
const Notification = require('../models/Notification');


const sessionController = {
  createSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
  
      const { 
        matchId, 
        selectedTimeSlot, 
        title,
        description,
        meetingLink,
        prerequisites,
        notes
      } = req.body;
      
      const userId = req.user.id;
  
      // Validate required fields
      if (!matchId || !selectedTimeSlot || !selectedTimeSlot.startTime || !selectedTimeSlot.endTime) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['matchId', 'selectedTimeSlot (with startTime and endTime)'] 
        });
      }
  
      // Verify match exists and user is part of it
      const match = await Match.findById(matchId).populate('skillId', 'name');
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
  
      // Fetch teacher and student names
      const teacher = await User.findById(match.teacherId);
      const student = await User.findById(match.requesterId);
  
      if (!teacher || !student) {
        return res.status(404).json({ error: 'Teacher or student not found' });
      }
  
      // Create session record using match data
      const session = new Session({
        title: title || `${match.skillId.name} Session`,
        matchId: match._id,
        skillId: match.skillId._id,
        teacherId: match.teacherId,
        teacherName: teacher.name,
        studentId: match.requesterId,
        studentName: student.name,
        startTime: new Date(selectedTimeSlot.startTime),
        endTime: new Date(selectedTimeSlot.endTime),
        meetingLink: meetingLink || null,
        description: description || '',
        prerequisites: prerequisites || '',
        notes: notes || '',
        status: 'scheduled'
      });
  
      await session.save();
      
      // Create notification for student
      const notification = await Notification.create({
        userId: student._id,
        title: 'New Session Scheduled',
        message: `${teacher.name} has scheduled a session for ${match.skillId.name}`,
        type: 'session_created',
        relatedId: session._id,
        isRead: false
      });

      

      return res.status(201).json({ 
        session,
        match,
        message: meetingLink ? 'Session created successfully with meeting link' : 'Session created without meeting link'
      });
    } catch (error) {
      console.error("Error creating session:", error);
      return res.status(500).json({ 
        error: 'Failed to create session',
        message: error.message
      });
    }
  },
  
  getSessionById: async (req, res) => {
    try {
      const { sessionId } = req.params;
      console.log(sessionId)
      // Find session by ID
      const session = await Session.findById(sessionId)
        .populate('skillId', 'name')
        .populate('teacherId', 'name avatar')
        .populate('studentId', 'name avatar');
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      return res.status(200).json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      return res.status(500).json({ 
        error: 'Failed to fetch session',
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
      .limit(5); // Limit to 5 upcoming sessions by default
      
      return res.status(200).json({ sessions });
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      return res.status(500).json({ 
        error: 'Failed to fetch sessions',
        message: error.message
      });
    }
  },

  updateSessionLink: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;
      const { meetingLink } = req.body;
      const userId = req.user.id;

      // Find session
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Verify that the user is the teacher of this session
      if (session.teacherId.toString() !== userId) {
        return res.status(403).json({ error: 'Only the teacher can update the meeting link' });
      }

      // Validate meeting link (basic validation, can be enhanced)
      if (!meetingLink || !meetingLink.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid meeting link. Must be a valid HTTPS URL.' });
      }

      // Update meeting link
      session.meetingLink = meetingLink;
      await session.save();
      
      // Create notification for student
      await Notification.create({
        userId: session.studentId,
        title: 'Session Link Updated',
        message: `${session.teacherName} has added/updated the meeting link for your upcoming session`,
        type: 'session_updated',
        relatedId: session._id,
        isRead: false
      });

      

      return res.status(200).json({ 
        session,
        message: 'Meeting link updated successfully' 
      });
    } catch (error) {
      console.error("Error updating meeting link:", error);
      return res.status(500).json({ 
        error: 'Failed to update meeting link',
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

      // Find session
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Verify that the user is the teacher of this session
      if (session.teacherId.toString() !== userId) {
        return res.status(403).json({ error: 'Only the teacher can mark a session as completed' });
      }

      // Check if session is in a valid state for completion
      if (session.status === 'completed' || session.status === 'canceled') {
        return res.status(400).json({ error: `Session is already ${session.status}` });
      }

      // Update session status
      session.status = 'completed';
      await session.save();
      
      // Create notification for student
      await Notification.create({
        userId: session.studentId,
        title: 'Session Completed',
        message: `Your session with ${session.teacherName} has been marked as completed. Please provide your feedback.`,
        type: 'session_completed',
        relatedId: session._id,
        isRead: false
      });

      
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
  },

  submitFeedback: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;
      const { rating, feedback, isTeacher } = req.body;
      const userId = req.user.id;

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Find session
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Verify that the user is part of this session
      if (session.teacherId.toString() !== userId && session.studentId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to provide feedback for this session' });
      }

      // Verify session is completed
      if (session.status !== 'completed') {
        return res.status(400).json({ error: 'Feedback can only be provided for completed sessions' });
      }

      // Update the appropriate fields based on who is submitting feedback
      if (isTeacher && session.teacherId.toString() === userId) {
        session.teacherRating = rating;
        session.teacherFeedback = feedback || '';
        
        // Notify student about teacher feedback
       await Notification.create({
          userId: session.studentId,
          title: 'Teacher Feedback Received',
          message: `${session.teacherName} has provided feedback for your session`,
          type: 'feedback',
          relatedId: session._id,
          isRead: false
        });

     
      } else if (!isTeacher && session.studentId.toString() === userId) {
        session.studentRating = rating;
        session.studentFeedback = feedback || '';
        
        // Award points to teacher when student provides feedback
        const POINTS_PER_SESSION = 100;
        await User.findByIdAndUpdate(
          session.teacherId,
          { $inc: { points: POINTS_PER_SESSION } }
        );
        
        // Notify teacher about student feedback and points awarded
       await Notification.create({
          userId: session.teacherId,
          title: 'Student Feedback Received',
          message: `${session.studentName} has rated your session and you've earned ${POINTS_PER_SESSION} points!`,
          type: 'feedback',
          relatedId: session._id,
          isRead: false
        });

       
      } else {
        return res.status(400).json({ error: 'Invalid feedback submission' });
      }

      await session.save();

      return res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return res.status(500).json({ 
        error: 'Failed to submit feedback',
        message: error.message
      });
    }
  }
};

module.exports = sessionController;