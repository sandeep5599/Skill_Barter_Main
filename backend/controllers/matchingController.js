const Match = require('../models/Match');
const Skill = require('../models/Skill');
const User = require('../models/User');
const Session = require('../models/Session');
const mongoose = require('mongoose');
const { google } = require('googleapis');
const calendar = google.calendar('v3');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/notificationService');

/**
 * Controller for handling match-related operations in the Skill Barter platform
 */
const matchingController = {
  /**
   * Generate potential matches between teachers and students based on skills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with match generation results
   */
 



generateMatches: async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const userId = req.user.id;

    // Find all skills the user is learning
    const learningSkills = await Skill.find({ userId: userId, isLearning: true });

    if (learningSkills.length === 0) {
      return res.status(200).json({
        message: "No learning skills found. Add skills to get matches.",
        matchesFound: []
      });
    }

    const matchesFound = [];
    const matchPromises = [];

    for (const learningSkill of learningSkills) {
      if (!learningSkill || !learningSkill.skillName || !learningSkill.proficiencyLevel) {
        console.error("Skipping invalid learning skill:", learningSkill);
        continue;
      }

      // Normalize the skill name: trim whitespace and convert to lowercase for comparison
      const normalizedSkillName = learningSkill.skillName.trim().toLowerCase();
      
      // Directly query for potential teachers with matching skills and higher proficiency
      // This is more efficient as it filters by skill name first
      const potentialTeachers = await Skill.find({
        userId: { $ne: userId }, // Exclude the learner themselves
        isTeaching: true,
        // Case-insensitive skill name matching using regex
        skillName: { $regex: new RegExp(`^${normalizedSkillName}$`, 'i') },
        proficiencyLevel: { $gt: learningSkill.proficiencyLevel } // Ensure proficiency is higher
      }).populate("userId", "name email");

      for (const teacherSkill of potentialTeachers) {
        if (!teacherSkill.userId || !teacherSkill._id) {
          console.error("Skipping invalid teacher skill:", teacherSkill);
          continue;
        }

        const teacherId = teacherSkill.userId._id;

        // Ensure the teacher is not learning the same skill
        const isTeacherAlsoLearning = await Skill.exists({
          userId: teacherId,
          isLearning: true,
          skillName: { $regex: new RegExp(`^${normalizedSkillName}$`, 'i') }
        });

        if (isTeacherAlsoLearning) continue;

        // Create a match processing promise
        matchPromises.push(
          (async () => {
            try {
              // Prevent duplicate matches
              const existingMatch = await Match.findOne({
                requesterId: userId,
                teacherId: teacherId,
                skillName: { $regex: new RegExp(`^${normalizedSkillName}$`, 'i') }
              });

              if (!existingMatch) {
                const match = new Match({
                  requesterId: userId,
                  teacherId: teacherId,
                  skillId: teacherSkill._id,
                  skillName: teacherSkill.skillName, // Use teacher's exact skill name for consistency
                  proposedTimeSlots: []
                });

                await match.save();

                matchesFound.push({
                  teacherName: teacherSkill.userId.name,
                  skillName: teacherSkill.skillName,
                  proficiencyLevel: teacherSkill.proficiencyLevel
                });
              }
            } catch (error) {
              console.error(`Error processing match for skill ${learningSkill.skillName}:`, error);
            }
          })()
        );
      }
    }

    await Promise.all(matchPromises);

    return res.status(200).json({
      message: "Match generation completed successfully",
      matchesFound: matchesFound
    });

  } catch (error) {
    console.error("Error generating matches:", error);
    return res.status(500).json({
      error: "Failed to generate matches",
      message: error.message
    });
  }
},

  /**
   * Create a new match request with proposed time slots
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created match
   */
  createMatch: async (req, res) => {
    try {
      // Input validation
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
      
      const { teacherId, skillId, skillName, proposedTimeSlots } = req.body;
      const requesterId = req.user.id;
      
      // Validate required fields
      if (!teacherId || !skillId || !skillName) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['teacherId', 'skillId', 'skillName'] 
        });
      }
      
      // Check if match already exists
      const existingMatch = await Match.findOne({
        requesterId,
        teacherId,
        skillName
      });
      
      if (existingMatch) {
        return res.status(409).json({ 
          error: 'Match already exists',
          match: existingMatch
        });
      }
      
      // Create and save new match
      const formattedTimeSlots = Array.isArray(proposedTimeSlots) 
        ? proposedTimeSlots.map(slot => ({
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime)
          }))
        : [];
      
      const match = new Match({
        requesterId,
        teacherId,
        skillId,
        skillName,
        proposedTimeSlots: formattedTimeSlots
      });
      
      await match.save();
      
      return res.status(201).json(match);
    } catch (error) {
      console.error('Error creating match:', error);
      return res.status(500).json({ 
        error: 'Failed to create match request',
        message: error.message
      });
    }
  },    

  

  /**
   * Get all matches for a user (both as teacher and student)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with matches
   */

// getMatches: async (req, res) => {
//   try {
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: 'Unauthorized access' });
//     }

//     const userId = req.user.id;

//     // Find matches where the user is the requester
//     const matches = await Match.find({ requesterId: userId })
//       .populate('requesterId', 'name email')
//       .populate('teacherId', 'name email')
//       .populate('skillId') // Populate the skillId to access proficiency
//       .populate('skillName') 
//       .select('skillName status proposedTimeSlots createdAt skillId');

//     if (!matches || matches.length === 0) {
//       return res.status(200).json([]);
//     }

//     const formattedMatches = await Promise.all(matches.map(async (match) => {
//       if (!match.requesterId || !match.teacherId) {
//         return null;
//       }

//       const isRequester = match.requesterId._id.toString() === userId;
//       const otherParty = isRequester ? match.teacherId : match.requesterId;

//       // Get proficiency level from the teacher's skill
//       let proficiency = 'Not specified';
      
//       if (match.skillId) {
//         proficiency = match.skillId.proficiencyLevel;
//       } else if (match.teacherId) {
//         // Fallback: Try to find the skill directly if skillId is not populated
//         const teacherSkill = await Skill.findOne({
//           userId: match.teacherId._id,
//           skillName: match.skillName,
//           isTeaching: true
//         });
        
//         if (teacherSkill) {
//           proficiency = teacherSkill.proficiencyLevel;
//         }
//       }

//       return {
//         id: match._id,
//         name: otherParty.name || 'Unknown User',
//         email: otherParty.email || 'No Email',
//         expertise: match.skillId?.skillName || match.skillName || 'Unknown',
//         proficiency: proficiency,
//         status: match.status || 'Pending',
//         role: isRequester ? 'student' : 'teacher',
//         timeSlots: match.proposedTimeSlots || [],
//         createdAt: match.createdAt,
//         teacherId: match.teacherId._id
//       };
//     }));

//     // Filter out null values
//     const validMatches = formattedMatches.filter(Boolean);
    
//     return res.status(200).json(validMatches);
//   } catch (error) {
//     console.error("Error fetching matches:", error);
//     return res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
//   }
// },
  
getMatches: async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }

    const userId = req.user.id;

    // Find matches where the user is the requester (student)
    const asRequesterMatches = await Match.find({ requesterId: userId })
      .populate('requesterId', 'name email')
      .populate('teacherId', 'name email')
      .populate('skillId', 'skillName proficiencyLevel')
      .select('skillName status proposedTimeSlots createdAt');

    // Find matches where the user is the teacher
    const asTeacherMatches = await Match.find({ teacherId: userId })
      .populate('requesterId', 'name email')
      .populate('teacherId', 'name email')
      .populate('skillId', 'skillName proficiencyLevel')
      .select('skillName status proposedTimeSlots createdAt');

    // Combine all matches
    const allMatches = [...asRequesterMatches, ...asTeacherMatches];

    if (!allMatches || allMatches.length === 0) {
      return res.status(200).json([]);
    }

    const formattedMatches = await Promise.all(allMatches.map(async (match) => {
      if (!match.requesterId || !match.teacherId) {
        return null;
      }

      const isRequester = match.requesterId._id.toString() === userId;
      const otherParty = isRequester ? match.teacherId : match.requesterId;

      // Get proficiency level from the teacher's skill
      let proficiency = 'Not specified';
      let skillNameToUse = match.skillName;
      
      // First try to get skill info from populated skillId
      if (match.skillId && match.skillId.proficiencyLevel) {
        proficiency = match.skillId.proficiencyLevel;
        // Use skillName from skillId if available (it's more reliable)
        if (match.skillId.skillName) {
          skillNameToUse = match.skillId.skillName;
        }
      } else if (!isRequester) {
        // If user is teacher, try to find their skill directly
        const teacherSkill = await Skill.findOne({
          userId: userId,
          skillName: { $regex: new RegExp(`^${match.skillName.trim().toLowerCase()}$`, 'i') },
          isTeaching: true
        });
        
        if (teacherSkill) {
          proficiency = teacherSkill.proficiencyLevel;
        }
      } else {
        // If user is student, try to find teacher's skill directly
        const teacherSkill = await Skill.findOne({
          userId: match.teacherId._id,
          skillName: { $regex: new RegExp(`^${match.skillName.trim().toLowerCase()}$`, 'i') },
          isTeaching: true
        });
        
        if (teacherSkill) {
          proficiency = teacherSkill.proficiencyLevel;
        }
      }

      return {
        id: match._id,
        name: otherParty.name || 'Unknown User',
        email: otherParty.email || 'No Email',
        expertise: skillNameToUse || 'Unknown Skill',
        proficiency: proficiency,
        status: match.status || 'Pending',
        role: isRequester ? 'student' : 'teacher',
        timeSlots: match.proposedTimeSlots || [],
        createdAt: match.createdAt,
        teacherId: match.teacherId._id,
        requesterId: match.requesterId._id
      };
    }));

    // Filter out null values
    const validMatches = formattedMatches.filter(Boolean);
    
    return res.status(200).json(validMatches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ error: 'Failed to fetch matches', message: error.message });
  }
},

/**
   * Accept or reject a match request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated match
   */
  // updateMatchStatus: async (req, res) => {
  //   try {
  //     // Input validation
  //     if (!req.user || !req.user.id) {
  //       return res.status(401).json({ error: 'Unauthorized access' });
  //     }
      
  //     const { matchId } = req.params;
  //     const { status, selectedTimeSlot } = req.body;
      
  //     if (!matchId || !mongoose.Types.ObjectId.isValid(matchId)) {
  //       return res.status(400).json({ error: 'Invalid match ID' });
  //     }
      
  //     if (!status || !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
  //       return res.status(400).json({ error: 'Invalid status value' });
  //     }
      
  //     // Find and update match
  //     const match = await Match.findById(matchId);
  //     if (!match) {
  //       return res.status(404).json({ error: 'Match not found' });
  //     }
      
  //     // Verify user is authorized to update this match
  //     const userId = req.user.id;
  //     if (match.requesterId.toString() !== userId && match.teacherId.toString() !== userId) {
  //       return res.status(403).json({ error: 'Not authorized to update this match' });
  //     }

  //     match.status = status;
  //     await match.save();

  //     // Create session if match is accepted
  //     if (status === 'accepted' && selectedTimeSlot) {
  //       try {
  //         // Create Google Meet link
  //         const meetEvent = await calendar.events.insert({
  //           calendarId: 'primary',
  //           resource: {
  //             summary: `Skill Barter: ${match.skillName} Session`,
  //             description: `Skill exchange session for ${match.skillName}`,
  //             start: {
  //               dateTime: selectedTimeSlot.startTime,
  //               timeZone: 'UTC'
  //             },
  //             end: {
  //               dateTime: selectedTimeSlot.endTime,
  //               timeZone: 'UTC'
  //             },
  //             conferenceData: {
  //               createRequest: {
  //                 requestId: matchId,
  //                 conferenceSolutionKey: { type: 'hangoutsMeet' }
  //               }
  //             }
  //           },
  //           conferenceDataVersion: 1
  //         });

  //         // Create session record
  //         const session = new Session({
  //           matchId: match._id,
  //           startTime: selectedTimeSlot.startTime,
  //           endTime: selectedTimeSlot.endTime,
  //           meetLink: meetEvent.data.hangoutLink || null
  //         });

  //         await session.save();
  //         return res.status(200).json({ match, session });
  //       } catch (calendarError) {
  //         console.error("Error creating calendar event:", calendarError);
  //         // Continue with match update even if calendar fails
  //         return res.status(200).json({ 
  //           match, 
  //           warning: "Match accepted but could not create calendar event" 
  //         });
  //       }
  //     } else {
  //       return res.status(200).json({ match });
  //     }
  //   } catch (error) {
  //     console.error("Error updating match status:", error);
  //     return res.status(500).json({ 
  //       error: 'Failed to update match status',
  //       message: error.message
  //     });
  //   }
  // },
/**
 * Update match status and handle time slots
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated match
 */
// updateMatchStatus: async (req, res) => {
//   try {
//     // Input validation
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: 'Unauthorized access' });
//     }
    
//     const { matchId } = req.params;
//     const { status, proposedTimeSlots, selectedTimeSlot } = req.body;
    
//     if (!matchId || !mongoose.Types.ObjectId.isValid(matchId)) {
//       return res.status(400).json({ error: 'Invalid match ID' });
//     }
    
//     if (!status || !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status value' });
//     }
    
//     // Find match
//     const match = await Match.findById(matchId);
//     if (!match) {
//       return res.status(404).json({ error: 'Match not found' });
//     }
    
//     // Verify user is authorized to update this match
//     const userId = req.user.id;
//     if (match.requesterId.toString() !== userId && match.teacherId.toString() !== userId) {
//       return res.status(403).json({ error: 'Not authorized to update this match' });
//     }

//     // Update match status
//     match.status = status;
    
//     // Update proposed time slots if provided
//     if (proposedTimeSlots && Array.isArray(proposedTimeSlots)) {
//       console.log("Updating proposed time slots:", proposedTimeSlots);
//       match.proposedTimeSlots = proposedTimeSlots.map(slot => ({
//         startTime: new Date(slot.startTime),
//         endTime: new Date(slot.endTime)
//       }));
//     }
    
//     await match.save();

//     // Create session if match is accepted
//     if (status === 'accepted' && selectedTimeSlot) {
//       try {
//         // Create session record
//         const session = new Session({
//           matchId: match._id,
//           startTime: selectedTimeSlot.startTime,
//           endTime: selectedTimeSlot.endTime,
//           meetLink: null // You can integrate with Google Calendar API here
//         });

//         await session.save();
//         return res.status(200).json({ match, session });
//       } catch (sessionError) {
//         console.error("Error creating session:", sessionError);
//         // Continue with match update even if session creation fails
//         return res.status(200).json({ 
//           match, 
//           warning: "Match updated but could not create session" 
//         });
//       }
//     } else {
//       return res.status(200).json({ match });
//     }
//   } catch (error) {
//     console.error("Error updating match status:", error);
//     return res.status(500).json({ 
//       error: 'Failed to update match status',
//       message: error.message
//     });
//   }
// },


/**
 * Update match status and handle time slots
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated match
 */
updateMatchStatus: async (req, res) => {
  try {
    // Input validation
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const { matchId } = req.params;
    const { status, proposedTimeSlots, selectedTimeSlot } = req.body;
    
    if (!matchId || !mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    if (!status || !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Find match
    const match = await Match.findById(matchId)
      .populate('requesterId', 'name email')
      .populate('teacherId', 'name email');
      
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Verify user is authorized to update this match
    const userId = req.user.id;
    if (match.requesterId._id.toString() !== userId && match.teacherId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this match' });
    }
    
    // Determine if the current user is the requester or teacher
    const isRequester = match.requesterId._id.toString() === userId;
    
    // The user who should receive the notification (other party)
    const recipientId = isRequester ? match.teacherId._id : match.requesterId._id;
    const recipientName = isRequester ? match.teacherId.name : match.requesterId.name;
    const senderName = isRequester ? match.requesterId.name : match.teacherId.name;
    
    // Store previous status to check for state changes
    const previousStatus = match.status;
    
    // Update match status
    match.status = status;
    
    // Update proposed time slots if provided
    if (proposedTimeSlots && Array.isArray(proposedTimeSlots)) {
      console.log("Updating proposed time slots:", proposedTimeSlots);
      match.proposedTimeSlots = proposedTimeSlots.map(slot => ({
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime)
      }));
    }
    
    await match.save();
    
    // Create notification based on status change
    let notificationType, notificationTitle, notificationMessage;
    
    if (previousStatus !== status) {
      switch (status) {
        case 'pending':
          if (proposedTimeSlots && proposedTimeSlots.length > 0) {
            notificationType = 'session_proposed';
            notificationTitle = 'New Session Time Proposed';
            notificationMessage = `${senderName} has proposed new time slots for your session.`;
          }
          break;
        case 'accepted':
          notificationType = 'session_accepted';
          notificationTitle = 'Session Accepted';
          notificationMessage = `${senderName} has accepted your session request.`;
          break;
        case 'rejected':
          notificationType = 'session_rejected';
          notificationTitle = 'Session Rejected';
          notificationMessage = `${senderName} has declined your session request.`;
          break;
        case 'completed':
          notificationType = 'session_completed';
          notificationTitle = 'Session Marked as Completed';
          notificationMessage = `${senderName} has marked your session as completed.`;
          break;
      }
    } else if (proposedTimeSlots && proposedTimeSlots.length > 0) {
      // If only time slots were updated
      notificationType = 'session_proposed';
      notificationTitle = 'New Session Time Proposed';
      notificationMessage = `${senderName} has proposed new time slots for your session.`;
    }
    
    // Create and save notification if needed
    if (notificationType) {
      const notification = new Notification({
        userId: recipientId,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedId: match._id,
        relatedModel: 'Match',
        read: false
      });
      
      await notification.save();
      
      // Emit the notification through socket.io if available
      const io = req.app.get('io');
      if (io) {
        io.to(recipientId.toString()).emit('notification', notification);
      }
    }
    
    // Create session if match is accepted
    if (status === 'accepted' && selectedTimeSlot) {
      try {
        // Create session record
        const session = new Session({
          matchId: match._id,
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          meetLink: null // You can integrate with Google Calendar API here
        });
        await session.save();
        
        // Create specific notification for session creation
        if (notificationType !== 'session_accepted') { // Avoid duplicate notifications
          const sessionNotification = new Notification({
            userId: recipientId,
            type: 'session_scheduled',
            title: 'Session Scheduled',
            message: `Your session with ${senderName} has been scheduled.`,
            relatedId: session._id,
            relatedModel: 'Session',
            read: false
          });
          
          await sessionNotification.save();
          
          // Emit the notification through socket.io if available
          const io = req.app.get('io');
          if (io) {
            io.to(recipientId.toString()).emit('notification', sessionNotification);
          }
        }
        
        return res.status(200).json({ match, session });
      } catch (sessionError) {
        console.error("Error creating session:", sessionError);
        // Continue with match update even if session creation fails
        return res.status(200).json({ 
          match, 
          warning: "Match updated but could not create session" 
        });
      }
    } else {
      return res.status(200).json({ match });
    }
  } catch (error) {
    console.error("Error updating match status:", error);
    return res.status(500).json({ 
      error: 'Failed to update match status',
      message: error.message
    });
  }
},



  /**
   * 
   * 
   * Get all sessions for a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with sessions
   */
  getSessions: async (req, res) => {
    try {
      // Input validation
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
      
      const userId = req.user.id;
      
      // Find sessions where user is part of the match
      const sessions = await Session.find()
        .populate({
          path: 'matchId',
          match: {
            $or: [
              { requesterId: userId },
              { teacherId: userId }
            ]
          },
          populate: [
            { path: 'requesterId', select: 'name email' },
            { path: 'teacherId', select: 'name email' }
          ]
        })
        .exec();
      
      // Filter out sessions with null matchId (user not part of match)
      const validSessions = sessions.filter(session => session.matchId);
      
      return res.status(200).json(validSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return res.status(500).json({ 
        error: 'Failed to fetch sessions',
        message: error.message
      });
    }
  },

  /**
   * Update session status and feedback
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with updated session
   */
  updateSessionStatus: async (req, res) => {
    try {
      // Input validation
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
      
      const { sessionId } = req.params;
      const { status, feedback } = req.body;
      
      if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({ error: 'Invalid session ID' });
      }
      
      // Find session
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      // Verify user is part of the session's match
      const match = await Match.findById(session.matchId);
      if (!match) {
        return res.status(404).json({ error: 'Associated match not found' });
      }
      
      const userId = req.user.id;
      if (match.requesterId.toString() !== userId && match.teacherId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this session' });
      }
      
      // Update session
      if (status) {
        session.status = status;
      }
      
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
      return res.status(200).json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      return res.status(500).json({ 
        error: 'Failed to update session',
        message: error.message
      });
    }
  }
};

module.exports = matchingController;