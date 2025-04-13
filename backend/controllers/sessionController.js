const mongoose = require('mongoose');
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
      console.log("ID parameter:", sessionId);
      
      // Add validation to check if ID is valid
      if (!sessionId || sessionId === "undefined") {
        return res.status(400).json({ error: 'Invalid ID provided' });
      }
      
      // Validate that ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      // const session = await Session.findOne({matchId : sessionId});
      
      // Try to find session by ID first
      let session = await Session.findById(sessionId)
        .populate('skillId', 'name')
        .populate('teacherId', 'name avatar')
        .populate('studentId', 'name avatar');
      
      // If not found by ID, try by matchId
      if (!session) {
        session = await Session.findOne({ matchId: sessionId })
          .populate('skillId', 'name')
          .populate('teacherId', 'name avatar')
          .populate('studentId', 'name avatar');
      }
      
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
      // Allow multiple status values
      const statusFilter = req.query.status 
        ? Array.isArray(req.query.status) 
          ? req.query.status 
          : [req.query.status]
        : ['scheduled', 'completed'];
      
      console.log("getUserSessions called with User ID parameter:", userId);
      console.log("Status filter:", statusFilter);
      
      // Find sessions where the user is either a teacher or student
      const sessions = await Session.find({
        $or: [
          { teacherId: userId },
          { studentId: userId }
        ],
        status: { $in: statusFilter }  // Use $in operator for multiple statuses
      })
      .populate('skillId', 'title description category')
      .populate('teacherId', 'name avatar')
      .populate('studentId', 'name avatar')
      .sort({ startTime: 1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 5);
      
      // Transform the sessions to handle ObjectId properly
      const transformedSessions = sessions.map(session => {
        const plainSession = session.toObject();
        return {
          ...plainSession,
          _id: plainSession._id.toString(),
          teacherId: plainSession.teacherId ? 
            (typeof plainSession.teacherId === 'object' ? 
              plainSession.teacherId._id ? plainSession.teacherId._id.toString() : plainSession.teacherId.toString() 
              : plainSession.teacherId) 
            : null,
          studentId: plainSession.studentId ? 
            (typeof plainSession.studentId === 'object' ? 
              plainSession.studentId._id ? plainSession.studentId._id.toString() : plainSession.studentId.toString() 
              : plainSession.studentId)
            : null,
          skillId: plainSession.skillId ? 
            (typeof plainSession.skillId === 'object' ? 
              plainSession.skillId._id ? plainSession.skillId._id.toString() : plainSession.skillId.toString()
              : plainSession.skillId)
            : null
        };
      });
      
      console.log(`Found ${sessions.length} sessions for user ${userId}`);
      return res.status(200).json({ sessions: transformedSessions });
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
     const session = await Session.findOne({matchId : sessionId});
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
      console.log("User ID from request:", req.user ? req.user.id : "No user found");
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;
      const userId = req.user.id;

      // Find session
      const session = await Session.findOne({matchId : sessionId});
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

  // Add this to your sessionController.js file
  confirmSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;
      const { status, message } = req.body;
      const userId = req.user.id;

      // Find session
      const session = await Session.findOne({matchId : sessionId});
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Find the associated match
      const match = await Match.findById(session.matchId);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      // Verify that the user is either the student or teacher for this session
      const isTeacher = session.teacherId.toString() === userId;
      const isStudent = session.studentId.toString() === userId;
      
      if (!isTeacher && !isStudent) {
        return res.status(403).json({ error: 'You are not authorized to confirm this session' });
      }

      // Update match status
      match.status = status || 'accepted';
      if (message) {
        match.message = message;
      }
      await match.save();

      // Update session fields if needed
      if (req.body.meetingLink) {
        session.meetingLink = req.body.meetingLink;
      }

      // If there's a new time slot being confirmed
      if (req.body.selectedTimeSlot) {
        session.selectedTimeSlot = req.body.selectedTimeSlot;
      }

      await session.save();

      // Determine recipient for notification (the other party)
      const recipientId = isTeacher ? session.studentId : session.teacherId;
      
      // Create a notification for the other party
      const notificationType = status === 'accepted' ? 'session_confirmed' : 'session_rejected';
      
      await Notification.create({
        userId: recipientId,
        senderId: userId,
        title: status === 'accepted' ? 'Session Confirmed' : 'Session Update',
        message: message || 'Your session has been updated',
        type: notificationType,
        relatedId: session._id,
        isRead: false
      });

      return res.status(200).json({
        session,
        match,
        message: 'Session updated successfully'
      });
    } catch (error) {
      console.error("Error confirming session:", error);
      return res.status(500).json({ 
        error: 'Failed to confirm session',
        message: error.message
      });
    }
  },

  submitTeacherFeedback: async (req, res) => {
    try {
      const sessionId = req.params.id;
      const { feedback } = req.body;
      
      // Validate session ID
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid session ID format'
        });
      }
      
      // Check if feedback is provided
      if (!feedback || feedback.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Feedback is required'
        });
      }
      
      // Find the session - FIXED: Changed from findBy to findOne
      const session = await Session.findOne({ _id: sessionId });
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
      
      // Check if user is the teacher for this session
      if (session.teacherId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Only the teacher can provide feedback for this session'
        });
      }
      
      // Check if session is completed
      if (session.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Teacher feedback can only be provided for completed sessions'
        });
      }
      
      // Update the session with teacher feedback
      session.teacherFeedback = feedback;
      session.updatedAt = Date.now();
      
      await session.save();
      
      await Notification.create({
        userId: session.studentId,
        title: 'Teacher Feedback Received',
        message: `${session.teacherName} has provided feedback for your session`,
        type: 'feedback',
        relatedId: session._id,
        isRead: false
      });
      
      return res.status(200).json({
        success: true,
        data: session
      });
    } catch (err) {
      console.error('Error submitting teacher feedback:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
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
      const session = await Session.findOne({matchId : sessionId});
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
  },

  cancelSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
  
      const { sessionId } = req.params;
      const { reason, message, notificationType, recipientId } = req.body;
      const userId = req.user.id;
      
      if (!reason) {
        return res.status(400).json({ error: 'Cancellation reason is required' });
      }
      
      // Find session
      const session = await Session.findOne({matchId: sessionId});
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Verify that the user is part of this session
      if (session.teacherId.toString() !== userId && session.studentId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to cancel this session' });
      }
      
      // Update session status
      session.status = 'canceled';
      session.cancellationReason = reason;
      session.updatedAt = Date.now();
      
      await session.save();
      
      // Also update the match status to 'canceled'
      const match = await Match.findById(session.matchId);
      if (match) {
        match.status = 'canceled';
        await match.save();
      }
      
      // Create notification for the other party
      const notificationRecipientId = recipientId || (
        session.teacherId.toString() === userId ? session.studentId : session.teacherId
      );
      
      await Notification.create({
        userId: notificationRecipientId,
        senderId: userId,
        title: 'Session Canceled',
        message: message || `Session has been canceled. Reason: ${reason}`,
        type: notificationType || 'session_canceled',
        relatedId: session._id,
        isRead: false
      });
      
      return res.status(200).json({
        success: true,
        message: 'Session canceled successfully',
        session,
        match
      });
      
    } catch (error) {
      console.error("Error canceling session:", error);
      return res.status(500).json({ 
        error: 'Failed to cancel session',
        message: error.message
      });
    }
  }

};



module.exports = sessionController;