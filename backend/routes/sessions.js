// Place this in your API routes folder (e.g., /api/matches.js)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Match = require('../models/Match');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Session = require('../models/Session');
const Notification = require('../models/Notification');

// Create a new match request with time slots
router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, skillId, proposedTimeSlots } = req.body;
    
    if (!teacherId || !skillId || !proposedTimeSlots || proposedTimeSlots.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const match = new Match({
      studentId: req.user.id,
      teacherId,
      skillId,
      proposedTimeSlots,
      status: 'pending'
    });
    
    await match.save();
    
    // Create notification for teacher
    const notification = new Notification({
      userId: teacherId,
      type: 'new_match_request',
      message: `${student.name} has requested a learning session with you.`,
      relatedId: match._id,
      read: false
    });
    
    await notification.save();
    
    // Send real-time notification if socket.io is set up
    if (req.app.get('io')) {
      req.app.get('io').to(teacherId).emit('notification', {
        type: 'new_match_request',
        message: `${student.name} has requested a learning session with you.`,
        matchId: match._id
      });
    }
    
    res.status(201).json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teaching requests for the logged-in user
router.get('/teaching-requests', auth, async (req, res) => {
  try {
    const matches = await Match.find({ 
      teacherId: req.user.id,
      status: { $in: ['pending', 'rescheduled', 'accepted'] }
    }).sort({ createdAt: -1 });
    
    // Populate with additional data
    const requests = [];
    
    for (const match of matches) {
      const student = await User.findById(match.studentId);
      const studentName = student ? student.name : 'Unknown';
      
      const skill = await Skill.findById(match.skillId);
      const skillName = skill ? skill.name : 'Unknown Skill';
      
      requests.push({
        ...match._doc,
        studentName,
        skillName
      });
    }
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a match request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Ensure the teacher is the one accepting the request
    if (match.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    match.status = 'accepted';
    await match.save();
    
    // Create notification for student
    const teacher = await User.findById(req.user.id);
    const notification = new Notification({
      userId: match.studentId,
      type: 'match_accepted',
      message: `${teacher.name} has accepted your session request.`,
      relatedId: match._id,
      read: false
    });
    
    await notification.save();
    
    // Send real-time notification
    if (req.app.get('io')) {
      req.app.get('io').to(match.studentId.toString()).emit('notification', {
        type: 'match_accepted',
        message: `${teacher.name} has accepted your session request.`,
        matchId: match._id
      });
    }
    
    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a match request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Ensure the teacher is the one rejecting the request
    if (match.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    match.status = 'rejected';
    await match.save();
    
    // Create notification for student
    const teacher = await User.findById(req.user.id);
    const notification = new Notification({
      userId: match.studentId,
      type: 'match_rejected',
      message: `${teacher.name} has declined your session request.`,
      relatedId: match._id,
      read: false
    });
    
    await notification.save();
    
    // Send real-time notification
    if (req.app.get('io')) {
      req.app.get('io').to(match.studentId.toString()).emit('notification', {
        type: 'match_rejected',
        message: `${teacher.name} has declined your session request.`,
        matchId: match._id
      });
    }
    
    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reschedule a match request
router.put('/:id/reschedule', auth, async (req, res) => {
  try {
    const { proposedTimeSlot } = req.body;
    
    if (!proposedTimeSlot || !proposedTimeSlot.startTime || !proposedTimeSlot.endTime) {
      return res.status(400).json({ message: 'Missing time slot information' });
    }
    
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }
    
    // Ensure the teacher is the one rescheduling the request
    if (match.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    match.status = 'rescheduled';
    match.teacherProposedTimeSlot = proposedTimeSlot;
    await match.save();
    
    // Create notification for student
    const teacher = await User.findById(req.user.id);
    const notification = new Notification({
      userId: match.studentId,
      type: 'match_rescheduled',
      message: `${teacher.name} has proposed a new time for your session.`,
      relatedId: match._id,
      read: false
    });
    
    await notification.save();
    
    // Send real-time notification
    if (req.app.get('io')) {
      req.app.get('io').to(match.studentId.toString()).emit('notification', {
        type: 'match_rescheduled',
        message: `${teacher.name} has proposed a new time for your session.`,
        matchId: match._id
      });
    }
    
    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a session from an accepted match
router.post('/sessions', auth, async (req, res) => {
  try {
    const { matchId } = req.body;
    
    if (!matchId) {
      return res.status(400).json({ message: 'Match ID is required' });
    }
    
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    if (match.status !== 'accepted') {
      return res.status(400).json({ message: 'Cannot create session: match is not accepted' });
    }
    
    // Determine the session time (use the first proposed time slot or teacher's proposed time)
    const sessionTime = match.teacherProposedTimeSlot || match.proposedTimeSlots[0];
    
    const session = new Session({
      matchId,
      studentId: match.studentId,
      teacherId: match.teacherId,
      skillId: match.skillId,
      startTime: sessionTime.startTime,
      endTime: sessionTime.endTime,
      status: 'scheduled'
    });
    
    await session.save();
    
    // Notify both parties
    const student = await User.findById(match.studentId);
    const teacher = await User.findById(match.teacherId);
    
    // Notify student
    const studentNotification = new Notification({
      userId: match.studentId,
      type: 'session_created',
      message: `Your session with ${teacher.name} has been scheduled.`,
      relatedId: session._id,
      read: false
    });
    
    await studentNotification.save();
    
    // Notify teacher
    const teacherNotification = new Notification({
      userId: match.teacherId,
      type: 'session_created',
      message: `Your session with ${student.name} has been scheduled.`,
      relatedId: session._id,
      read: false
    });
    
    await teacherNotification.save();
    
    // Send real-time notifications
    if (req.app.get('io')) {
      req.app.get('io').to(match.studentId.toString()).emit('notification', {
        type: 'session_created',
        message: `Your session with ${teacher.name} has been scheduled.`,
        sessionId: session._id
      });
      
      req.app.get('io').to(match.teacherId.toString()).emit('notification', {
        type: 'session_created',
        message: `Your session with ${student.name} has been scheduled.`,
        sessionId: session._id
      });
    }
    
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;