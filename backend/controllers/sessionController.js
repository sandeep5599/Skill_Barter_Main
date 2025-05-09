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
        notes,
        isRescheduling  // Add a flag to indicate if this is a reschedule operation
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
  
      // Check if there's already a current session
      let existingSession = null;
      if (match.currentSessionId) {
        existingSession = await Session.findById(match.currentSessionId);
        
        // For rescheduling, we'll update the existing session instead of creating a new one
        if (isRescheduling && existingSession) {
          // Update the existing session with new time slots
          existingSession.startTime = new Date(selectedTimeSlot.startTime);
          existingSession.meetingLink = meetingLink || existingSession.meetingLink;
          existingSession.endTime = new Date(selectedTimeSlot.endTime);
          existingSession.description = description || existingSession.description;
          existingSession.prerequisites = prerequisites || existingSession.prerequisites;
          existingSession.notes = notes || existingSession.notes;
          existingSession.status = 'scheduled'; // Reset status if it was cancelled
          existingSession.updatedAt = new Date();
          
          await existingSession.save();
          
          // Update match status to indicate rescheduling
          match.status = 'rescheduled';
          
          // Add the new time slot to the match's timeSlotHistory
          if (!match.timeSlotHistory) {
            match.timeSlotHistory = [];
          }
          
          match.timeSlotHistory.push({
            proposedBy: match.teacherId,
            proposedAt: new Date(),
            slots: [{
              startTime: new Date(selectedTimeSlot.startTime),
              endTime: new Date(selectedTimeSlot.endTime)
            }]
          });
          
          // Save the updated match
          await match.save();
          
          // Create notification for student about rescheduling
          const teacher = await User.findById(match.teacherId);
          const student = await User.findById(match.requesterId);
          
          // Format date and time for notification
          const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          };
          
          const startFormatted = new Date(selectedTimeSlot.startTime).toLocaleString('en-US', options);
          const endTimeOptions = {
            hour: 'numeric', 
            minute: '2-digit',
            timeZoneName: 'short'
          };
          const endFormatted = new Date(selectedTimeSlot.endTime).toLocaleString('en-US', endTimeOptions);
          
          // Calculate duration
          const durationMs = new Date(selectedTimeSlot.endTime) - new Date(selectedTimeSlot.startTime);
          const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
          const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
          const durationText = durationHours > 0 
            ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
            : `${durationMins}m`;
            
          const timeInfo = `${startFormatted} to ${endFormatted} (${durationText})`;
          
          const notification = await Notification.create({
            userId: student._id,
            title: `Session Rescheduled by ${teacher.name}`,
            message: `Your ${match.skillId.name} session has been rescheduled to ${timeInfo}`,
            type: 'session_rescheduled',
            relatedId: existingSession._id,
            isRead: false
          });
          
          return res.status(200).json({ 
            session: existingSession,
            match,
            message: 'Session rescheduled successfully'
          });
        } else if (!isRescheduling && existingSession && existingSession.status !== 'completed') {
          // If not rescheduling and current session exists and is not completed, don't create a new one
          return res.status(409).json({ 
            error: 'There is already an active session for this match',
            currentSession: existingSession
          });
        } else if (existingSession && existingSession.status === 'completed') {
          // Move current session to previous sessions if completed
          if (!match.previousSessionIds) {
            match.previousSessionIds = [];
          }
          
          // Add to previousSessionIds if not already there
          if (!match.previousSessionIds.includes(match.currentSessionId)) {
            match.previousSessionIds.push(match.currentSessionId);
          }
          
          // Set previouslyMatched flag
          match.previouslyMatched = true;
          
          // Clear currentSessionId to prepare for the new session
          match.currentSessionId = null;
        }
      }
  
      // Update match status for a new session
      match.status = 'accepted';
      
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
      
      // Update match with the new session ID
      match.currentSessionId = session._id;
      
      // Add the selected time slot to match data
      if (!match.selectedTimeSlot) {
        match.selectedTimeSlot = {
          startTime: new Date(selectedTimeSlot.startTime),
          endTime: new Date(selectedTimeSlot.endTime),
          selectedBy: match.teacherId,
          selectedAt: new Date()
        };
      }
      
      // Save the updated match
      await match.save();
      
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
  confirmSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
  
      const { sessionId } = req.params;
      const { status, message, startTime, endTime } = req.body;
      const userId = req.user.id;
  
      // Find session
      const session = await Session.findById(sessionId);
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
  
      // Update time slots in match if new times are provided
      if (startTime && endTime) {
        // Find if there's a matching time slot to update
        const timeSlotIndex = match.timeSlots.findIndex(slot => 
          new Date(slot.startTime).getTime() === new Date(session.startTime).getTime() &&
          new Date(slot.endTime).getTime() === new Date(session.endTime).getTime()
        );
        
        const newTimeSlot = {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: 'accepted'
        };
        
        if (timeSlotIndex !== -1) {
          // Update existing time slot
          match.timeSlots[timeSlotIndex] = newTimeSlot;
        } else {
          // Add new time slot
          match.timeSlots.push(newTimeSlot);
        }
        
        match.markModified('timeSlots');
        
        // Most importantly, update the session start and end times
        session.startTime = new Date(startTime);
        session.endTime = new Date(endTime);
      }
      
      await match.save();
      await session.save();
  
      // Determine recipient for notification (the other party)
      const recipientId = isTeacher ? session.studentId : session.teacherId;
      
      // Create a notification for the other party
      const notificationType = status === 'accepted' ? 'session_confirmed' : 'session_updated';
      
      // Create a more descriptive message if times were changed
      let notificationMessage = message || 'Your session has been updated';
      if (startTime && endTime) {
        const formattedStart = new Date(startTime).toLocaleString();
        notificationMessage = `Session time updated to ${formattedStart}. ${message || ''}`;
      }
      
      await Notification.create({
        userId: recipientId,
        senderId: userId,
        title: status === 'accepted' ? 'Session Confirmed' : 'Session Update',
        message: notificationMessage,
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

  getSessions: async (req, res) => {
  try {
    // Input validation
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const userId = req.user.id;
    
    // Get query parameters for filtering
    const status = req.query.status ? 
      (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) : 
      ['scheduled', 'completed', 'canceled'];
    
    const limit = req.query.limit ? parseInt(req.query.limit) : 0;
    const skip = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
    
    // Find sessions where user is either teacher or student
    const sessions = await Session.find({
      $or: [
        { teacherId: userId },
        { studentId: userId }
      ],
      status: { $in: status }
    })
    .populate('skillId', 'name description category')
    .populate('teacherId', 'name avatar email')
    .populate('studentId', 'name avatar email')
    .populate({
      path: 'matchId',
      populate: [
        { path: 'skillId', select: 'name description category' }
      ]
    })
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Count total sessions for pagination
    const totalSessions = await Session.countDocuments({
      $or: [
        { teacherId: userId },
        { studentId: userId }
      ],
      status: { $in: status }
    });
    
    // Transform the data to ensure all IDs are properly stringified
    const transformedSessions = sessions.map(session => ({
      ...session,
      _id: session._id.toString(),
      matchId: session.matchId ? 
        (typeof session.matchId === 'object' ? 
          session.matchId._id ? session.matchId._id.toString() : session.matchId.toString() 
          : session.matchId) 
        : null,
      teacherId: session.teacherId ? 
        (typeof session.teacherId === 'object' ? 
          session.teacherId._id ? session.teacherId._id.toString() : session.teacherId.toString() 
          : session.teacherId) 
        : null,
      studentId: session.studentId ? 
        (typeof session.studentId === 'object' ? 
          session.studentId._id ? session.studentId._id.toString() : session.studentId.toString() 
          : session.studentId)
        : null,
      skillId: session.skillId ? 
        (typeof session.skillId === 'object' ? 
          session.skillId._id ? session.skillId._id.toString() : session.skillId.toString()
          : session.skillId)
        : null
    }));
    
    // Add role information for easier frontend handling
    const sessionsWithRole = transformedSessions.map(session => ({
      ...session,
      role: session.teacherId === userId ? 'teacher' : 'student'
    }));
    
    return res.status(200).json({
      success: true,
      count: sessionsWithRole.length,
      total: totalSessions,
      sessions: sessionsWithRole,
      pagination: {
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit,
        totalPages: limit > 0 ? Math.ceil(totalSessions / limit) : 1
      }
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return res.status(500).json({ 
      error: 'Failed to fetch sessions',
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
    //  const session = await Session.findOne({matchId : sessionId});
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
     
      console.log("User ID from request:", req.user ? req.user.id : "No user found");
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;

      console.log("Complete Session called with sessionId" , sessionId);
      const userId = req.user.id;

      // Find session
      // const session = await Session.findOne({matchId : sessionId});
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

  // Add this to your sessionController.js file
  confirmSession: async (req, res) => {
    try {
      // Check authentication
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const { sessionId } = req.params;
      const { status, message, startTime, endTime } = req.body;
      const userId = req.user.id;

      // Find session
      const session = await Session.findById(sessionId);
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

      // Update time slots in match if new times are provided
      if (startTime && endTime) {
        // Find the appropriate time slot in the match and update it
        const timeSlotIndex = match.timeSlots.findIndex(slot => 
          new Date(slot.startTime).getTime() === new Date(session.startTime).getTime() &&
          new Date(slot.endTime).getTime() === new Date(session.endTime).getTime()
        );
        
        if (timeSlotIndex !== -1) {
          // Update the existing time slot
          match.timeSlots[timeSlotIndex].startTime = new Date(startTime);
          match.timeSlots[timeSlotIndex].endTime = new Date(endTime);
        } else {
          // If the original time slot can't be found, add a new one
          match.timeSlots.push({
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status: 'accepted'
          });
        }
        
        // Mark match as modified to ensure mongoose saves the changes
        match.markModified('timeSlots');
      }
      
      await match.save();

      // Update session fields
      if (req.body.meetingLink) {
        session.meetingLink = req.body.meetingLink;
      }

      // Update session time if new times are provided
      if (startTime && endTime) {
        session.startTime = new Date(startTime);
        session.endTime = new Date(endTime);
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
      
      // Create a more descriptive message if times were changed
      let notificationMessage = message || 'Your session has been updated';
      if (startTime && endTime) {
        const formattedStart = new Date(startTime).toLocaleString();
        notificationMessage = `Session time updated to ${formattedStart}. ${message || ''}`;
      }
      
      await Notification.create({
        userId: recipientId,
        senderId: userId,
        title: status === 'accepted' ? 'Session Confirmed' : 'Session Update',
        message: notificationMessage,
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
      // const session = await Session.findOne({matchId : sessionId});
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
  },

  cancelSession: async (req, res) => {
    console.log('=== CANCEL SESSION REQUEST STARTED ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    
    try {
      // Check authentication
      console.log('Checking authentication...');
      console.log('req.user:', req.user);
      if (!req.user || !req.user.id) {
        console.log('Authentication failed: No user or user ID');
        return res.status(401).json({ error: 'Unauthorized access' });
      }
      console.log('Authentication successful for user ID:', req.user.id);
  
      const { sessionId } = req.params;
      const { reason, message, notificationType, recipientId } = req.body;
      const userId = req.user.id;
      
      console.log('Session ID from params:', sessionId);
      console.log('Request payload:', { reason, message, notificationType, recipientId });
      console.log('User ID from auth:', userId);
      
      if (!reason) {
        console.log('Validation failed: No cancellation reason provided');
        return res.status(400).json({ error: 'Cancellation reason is required' });
      }
      console.log('Validation passed: Cancellation reason provided');
      
      // Find session
      console.log('Finding session by ID:', sessionId);
      // const session = await Session.findOne({matchId: sessionId});
      const session = await Session.findById(sessionId);
      console.log('Session found:', session ? 'Yes' : 'No');
      if (!session) {
        console.log('Session not found in database');
        return res.status(404).json({ error: 'Session not found' });
      }
      console.log('Session details:', {
        id: session._id,
        teacherId: session.teacherId,
        studentId: session.studentId,
        matchId: session.matchId,
        status: session.status
      });
      
      // Verify that the user is part of this session
      console.log('Verifying user authorization...');
      console.log('Teacher ID (from session):', session.teacherId.toString());
      console.log('Student ID (from session):', session.studentId.toString());
      console.log('User ID (from request):', userId);
      
      if (session.teacherId.toString() !== userId && session.studentId.toString() !== userId) {
        console.log('Authorization failed: User is not part of this session');
        return res.status(403).json({ error: 'Not authorized to cancel this session' });
      }
      console.log('Authorization passed: User is part of the session');
      
      // Update session status
      console.log('Updating session status to "canceled"');
      session.status = 'canceled';
      session.cancellationReason = reason;
      session.updatedAt = Date.now();
      
      console.log('Saving updated session...');
      await session.save();
      console.log('Session successfully updated');
      
      // Also update the match status to "canceled"
      console.log('Finding match with ID:', session.matchId);
      const match = await Match.findById(session.matchId);
      console.log('Match found:', match ? 'Yes' : 'No');
      if (match) {
        console.log('Updating match status to "canceled"');
        match.status = 'canceled';
        await match.save();
        console.log('Match successfully updated');
      } else {
        console.log('No associated match found');
      }
      
      // Create notification for the other party
      console.log('Creating notification...');
      const notificationRecipientId = recipientId || (
        session.teacherId.toString() === userId ? session.studentId : session.teacherId
      );
      console.log('Notification recipient ID:', notificationRecipientId);
      
      const notificationData = {
        userId: notificationRecipientId,
        senderId: userId,
        title: 'Session Canceled',
        message: message || `Session has been canceled. Reason: ${reason}`,
        type: notificationType || 'session_canceled',
        relatedId: session._id,
        isRead: false
      };
      console.log('Creating notification with data:', notificationData);
      
      await Notification.create(notificationData);
      console.log('Notification created successfully');
      
      console.log('Sending success response...');
      return res.status(200).json({
        success: true,
        message: 'Session canceled successfully',
        session,
        match
      });
      
    } catch (error) {
      console.error("Error canceling session:", error);
      console.log("Error name:", error.name);
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
      return res.status(500).json({ 
        error: 'Failed to cancel session',
        message: error.message
      });
    } finally {
      console.log('=== CANCEL SESSION REQUEST COMPLETED ===');
    }
  },

    // Add this to your sessionController.js
  updateSession: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      // Find the session
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Verify that the user is either the student or teacher for this session
      const isTeacher = session.teacherId.toString() === userId;
      const isStudent = session.studentId.toString() === userId;
      
      if (!isTeacher && !isStudent) {
        return res.status(403).json({ error: 'You are not authorized to update this session' });
      }

      // Update session fields
      if (updates.startTime) {
        session.startTime = new Date(updates.startTime);
      }
      
      if (updates.endTime) {
        session.endTime = new Date(updates.endTime);
      }
      
      if (updates.meetingLink) {
        session.meetingLink = updates.meetingLink;
      }
      
      if (updates.status) {
        session.status = updates.status;
      }

      await session.save();

      // Also update the associated match if this is a reschedule
      if (updates.startTime && updates.endTime) {
        const match = await Match.findById(session.matchId);
        if (match) {
          // Find the existing time slot or create a new one
          const timeSlotIndex = match.timeSlots.findIndex(slot => 
            new Date(slot.startTime).getTime() === new Date(session.startTime).getTime() &&
            new Date(slot.endTime).getTime() === new Date(session.endTime).getTime()
          );
          
          if (timeSlotIndex !== -1) {
            match.timeSlots[timeSlotIndex] = {
              startTime: new Date(updates.startTime),
              endTime: new Date(updates.endTime),
              status: 'accepted'
            };
          } else {
            match.timeSlots.push({
              startTime: new Date(updates.startTime),
              endTime: new Date(updates.endTime),
              status: 'accepted'
            });
          }
          
          match.markModified('timeSlots');
          await match.save();
        }
      }

      // Return the updated session
      return res.status(200).json({
        session,
        message: 'Session updated successfully'
      });
    } catch (error) {
      console.error("Error updating session:", error);
      return res.status(500).json({ 
        error: 'Failed to update session',
        message: error.message
      });
    }
  }

};



module.exports = sessionController;