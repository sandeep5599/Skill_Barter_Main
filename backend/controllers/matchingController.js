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

      const userId = req.user.id || req.user._id;

      // Find all skills the user is learning
      const learningSkills = await Skill.find({ userId: userId, isLearning: true });

      if (learningSkills.length === 0) {
        return res.status(200).json({
          message: "No learning skills found. Add skills to get matches.",
          matchesFound: []
        });
      }

      const learningMatchesFound = []; // Matches where current user is learning
      const teachingMatchesCreated = []; // Matches where current user is teaching
      const matchPromises = [];

      // Helper function to convert proficiency level to numerical value
      const getProficiencyValue = (level) => {
        switch(level) {
          case 'Beginner': return 1;
          case 'Intermediate': return 2;
          case 'Expert': return 3;
          default: return 0;
        }
      };

      // Get current user's information for populating match fields
      const currentUser = await User.findById(userId).select('name');
      const currentUserName = currentUser ? currentUser.name : '';

      // For each skill the user is learning
      for (const learningSkill of learningSkills) {
        if (!learningSkill || !learningSkill.skillName || !learningSkill.proficiencyLevel) {
          console.error("Skipping invalid learning skill:", learningSkill);
          continue;
        }

        // Normalize the skill name: trim whitespace and convert to lowercase for comparison
        const normalizedLearningSkillName = learningSkill.skillName.trim().toLowerCase();
        
        // Find potential teachers with matching skills
        const potentialTeachersAll = await Skill.find({
          userId: { $ne: userId }, // Exclude the learner themselves
          isTeaching: true,
          // Case-insensitive skill name matching using regex
          skillName: { $regex: new RegExp(`^${normalizedLearningSkillName}$`, 'i') }
        }).populate("userId", "name email");
        
        // Filter teachers based on proficiency level
        const potentialTeachers = potentialTeachersAll.filter(teacherSkill => {
          const teacherLevel = getProficiencyValue(teacherSkill.proficiencyLevel);
          const learnerLevel = getProficiencyValue(learningSkill.proficiencyLevel);
          return teacherLevel > learnerLevel;
        });

        // Find skills that the current user can teach
        const userTeachingSkills = await Skill.find({
          userId: userId,
          isTeaching: true
        });

        for (const teacherSkill of potentialTeachers) {
          if (!teacherSkill.userId || !teacherSkill._id) {
            console.error("Skipping invalid teacher skill:", teacherSkill);
            continue;
          }

          const teacherId = teacherSkill.userId._id;
          const teacherName = teacherSkill.userId.name;

          // Process match for the current user as learner
          matchPromises.push(
            (async () => {
              try {
                // Only prevent duplicate matches for the exact same skill
                const existingMatch = await Match.findOne({
                  requesterId: userId,
                  teacherId: teacherId,
                  skillName: { $regex: new RegExp(`^${normalizedLearningSkillName}$`, 'i') }
                });

                if (!existingMatch) {
                  const match = new Match({
                    requesterId: userId,
                    teacherId: teacherId,
                    requesterName: currentUserName, // Add requester name
                    teacherName: teacherName, // Add teacher name
                    skillId: teacherSkill._id,
                    skillName: teacherSkill.skillName, // Use teacher's exact skill name for consistency
                    status: 'not_requested', // Set initial status
                    proposedTimeSlots: []
                  });

                  await match.save();

                  learningMatchesFound.push({
                    teacherName: teacherName,
                    teacherId: teacherId,
                    skillName: teacherSkill.skillName,
                    proficiencyLevel: teacherSkill.proficiencyLevel,
                    matchType: "Learning Match"
                  });
                }
              } catch (error) {
                console.error(`Error processing match for skill ${learningSkill.skillName}:`, error);
              }
            })()
          );

          // Now check for potential reciprocal matches for different skills
          matchPromises.push(
            (async () => {
              try {
                // Find the skills that the potential teacher is learning
                const teacherLearningSkills = await Skill.find({
                  userId: teacherId,
                  isLearning: true
                });

                // For each skill the potential teacher is learning
                for (const teacherLearningSkill of teacherLearningSkills) {
                  const normalizedTeacherLearningSkillName = teacherLearningSkill.skillName.trim().toLowerCase();
                  const teacherLearnerLevel = getProficiencyValue(teacherLearningSkill.proficiencyLevel);
                  
                  // Check if the current user can teach any skill the teacher wants to learn
                  for (const userTeachingSkill of userTeachingSkills) {
                    const normalizedUserTeachingSkillName = userTeachingSkill.skillName.trim().toLowerCase();
                    const userTeacherLevel = getProficiencyValue(userTeachingSkill.proficiencyLevel);
                    
                    // If the user can teach what the potential teacher wants to learn
                    if (normalizedUserTeachingSkillName === normalizedTeacherLearningSkillName && 
                        userTeacherLevel > teacherLearnerLevel) {
                      
                      // Only check for duplicate of the exact same skill match
                      const teacherExistingMatch = await Match.findOne({
                        requesterId: teacherId,
                        teacherId: userId,
                        skillName: { $regex: new RegExp(`^${normalizedUserTeachingSkillName}$`, 'i') }
                      });

                      if (!teacherExistingMatch) {
                        // Create a match for the teacher as requester/learner
                        const reciprocalMatch = new Match({
                          requesterId: teacherId,
                          teacherId: userId,
                          requesterName: teacherName, // Add requester name
                          teacherName: currentUserName, // Add teacher name
                          skillId: userTeachingSkill._id,
                          skillName: userTeachingSkill.skillName, // Use user's teaching skill name for consistency
                          status: 'not_requested', // Set initial status
                          proposedTimeSlots: []
                        });

                        await reciprocalMatch.save();

                        // Track these created teaching matches for the response
                        teachingMatchesCreated.push({
                          learnerName: teacherName,
                          learnerId: teacherId,
                          skillName: userTeachingSkill.skillName,
                          proficiencyLevel: userTeachingSkill.proficiencyLevel,
                          matchType: "Teaching Match"
                        });
                      }
                    }
                  }
                }
              } catch (error) {
                console.error(`Error processing reciprocal matches:`, error);
              }
            })()
          );
        }
      }

      await Promise.all(matchPromises);

      // Get all matches where the user is a teacher to ensure we have the complete list
      const userAsTeacherMatches = await Match.find({
        teacherId: userId
      }).populate("requesterId", "name");

      // Calculate stats for the complete response
      const totalMatchesCreated = learningMatchesFound.length + teachingMatchesCreated.length;
      const totalAsTeacher = userAsTeacherMatches.length;

      return res.status(200).json({
        message: "Match generation completed successfully",
        matchesFound: learningMatchesFound,
        teachingMatchesCreated: teachingMatchesCreated,
        totalMatchesCreated: totalMatchesCreated,
        stats: {
          asLearner: learningMatchesFound.length,
          asTeacher: teachingMatchesCreated.length,
          totalTeachingMatches: totalAsTeacher
        }
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
        proposedTimeSlots: formattedTimeSlots,
        previouslyMatched: false,
        previousSessionIds: [],
        currentSessionId: null
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
  getMatches: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const userId = req.user.id;
      const statusFilter = req.query.status ? req.query.status.split(',') : null;

      // Build query based on optional status filter
      const matchQuery = { 
        $or: [{ requesterId: userId }, { teacherId: userId }]
      };
      
      if (statusFilter) {
        matchQuery.status = { $in: statusFilter };
      }

      // Find matches where the user is involved
      const matches = await Match.find(matchQuery)
        .populate('requesterId', 'name email')
        .populate('teacherId', 'name email')
        .populate('skillId', 'skillName proficiencyLevel')
        .select('skillName status proposedTimeSlots createdAt rejectionReason selectedTimeSlot requesterName teacherName statusMessages timeSlotHistory');

      if (!matches || matches.length === 0) {
        return res.status(200).json([]);
      }

      const formattedMatches = await Promise.all(matches.map(async (match) => {
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

        // Format the latest status message if exists
        let latestMessage = null;
        if (match.statusMessages && match.statusMessages.length > 0) {
          const lastMessage = match.statusMessages[match.statusMessages.length - 1];
          latestMessage = {
            message: lastMessage.message,
            timestamp: lastMessage.timestamp,
            isFromOtherParty: lastMessage.userId.toString() !== userId
          };
        }

        // Check if there's a rescheduling proposal
        const hasReschedulingProposal = match.status === 'pending' && 
                                        match.proposedTimeSlots && 
                                        match.proposedTimeSlots.length > 0 &&
                                        match.proposedTimeSlots[0].proposedBy && 
                                        match.proposedTimeSlots[0].proposedBy.toString() !== userId;

        return {
          id: match._id,
          name: otherParty.name || (isRequester ? match.teacherName : match.requesterName) || 'Unknown User',
          email: otherParty.email || 'No Email',
          expertise: skillNameToUse || 'Unknown Skill',
          proficiency: proficiency,
          status: match.status || 'Pending',
          rejectionReason: match.rejectionReason || null,
          role: isRequester ? 'student' : 'teacher',
          timeSlots: match.proposedTimeSlots || [],
          selectedTimeSlot: match.selectedTimeSlot || null,
          createdAt: match.createdAt,
          teacherId: match.teacherId._id,
          requesterId: match.requesterId._id,
          teacherName: match.teacherName || match.teacherId.name || 'Unknown Teacher',
          requesterName: match.requesterName || match.requesterId.name || 'Unknown Student',
          latestMessage: latestMessage,
          hasReschedulingProposal: hasReschedulingProposal
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

  updateMatchStatus: async (req, res) => {
    try {
      // Input validation
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }
      
      const { matchId } = req.params;
      const { status, proposedTimeSlots, selectedTimeSlot, message, sessionId } = req.body;
      
      if (!matchId || !mongoose.Types.ObjectId.isValid(matchId)) {
        return res.status(400).json({ error: 'Invalid match ID' });
      }
      
      if (!status || !['pending', 'accepted', 'rejected', 'completed', 'rescheduled', 'canceled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      // Find match with rich information
      const match = await Match.findById(matchId)
        .populate('requesterId', 'name email profilePicture preferredLanguage timezone')
        .populate('teacherId', 'name email profilePicture preferredLanguage timezone');
        
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
      const recipientId = isRequester ? match.teacherId._id : match.requesterId._id;
      const recipientName = isRequester ? match.teacherId.name : match.requesterId.name;
      const recipientEmail = isRequester ? match.teacherId.email : match.requesterId.email;
      const recipientTimezone = isRequester ? match.teacherId.timezone : match.requesterId.timezone;
      const senderId = isRequester ? match.requesterId._id : match.teacherId._id;
      const senderName = isRequester ? match.requesterId.name : match.teacherId.name;
      const senderRole = isRequester ? 'Student' : 'Teacher';

      // Store previous status to check for state changes
      const previousStatus = match.status;
      
      // Update match status
      match.status = status;
      
      // Add rejection reason if status is rejected
      if (status === 'rejected' && message) {
        match.rejectionReason = message;
      }
      
      // Add cancellation reason if status is canceled
      if (status === 'canceled' && message) {
        match.cancellationReason = message;
      }
      
      // Add custom message if provided
      if (message) {
        match.statusMessages = match.statusMessages || [];
        match.statusMessages.push({
          userId: senderId,
          message: message,
          timestamp: new Date()
        });
      }
      
      // Update proposed time slots if provided
      if (proposedTimeSlots && Array.isArray(proposedTimeSlots) && proposedTimeSlots.length > 0) {
        match.proposedTimeSlots = proposedTimeSlots.map(slot => ({
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          proposedBy: senderId
        }));
        
        // Track time slot proposal history
        match.timeSlotHistory = match.timeSlotHistory || [];
        match.timeSlotHistory.push({
          proposedBy: senderId,
          proposedAt: new Date(),
          slots: proposedTimeSlots.map(slot => ({
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime)
          }))
        });
      }
      
      // If selecting a time slot
      if (selectedTimeSlot) {
        match.selectedTimeSlot = {
          startTime: new Date(selectedTimeSlot.startTime),
          endTime: new Date(selectedTimeSlot.endTime),
          selectedBy: senderId,
          selectedAt: new Date()
        };
      }
      
      // Handle session relationship for completed or canceled status
      if (status === 'completed' || status === 'canceled') {
        const sessionToProcess = sessionId || match.currentSessionId;
        if (sessionToProcess) {
          if (!match.previousSessionIds) {
            match.previousSessionIds = [];
          }
          if (!match.previousSessionIds.includes(sessionToProcess)) {
            match.previousSessionIds.push(sessionToProcess);
          }
          match.currentSessionId = null;
          match.previouslyMatched = true;
        }
      }
      
      // Update requesterName and teacherName if they don't exist (will be handled by pre-save middleware)
      if (!match.requesterName && match.requesterId.name) {
        match.requesterName = match.requesterId.name;
      }
      if (!match.teacherName && match.teacherId.name) {
        match.teacherName = match.teacherId.name;
      }
      
      await match.save();
      
      // Format time slots for notification - more compact format
      const formatTimeSlot = (slot, timezone) => {
        const options = { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: 'numeric', 
          minute: '2-digit',
          timeZoneName: 'short'
        };
        const startDate = new Date(slot.startTime);
        const endDate = new Date(slot.endTime);
        const startFormatted = startDate.toLocaleString('en-US', options);
        const endTimeOptions = {
          hour: 'numeric', 
          minute: '2-digit',
          timeZoneName: 'short'
        };
        const endFormatted = endDate.toLocaleString('en-US', endTimeOptions);
        const durationMs = endDate - startDate;
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
        const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const durationText = durationHours > 0 
          ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
          : `${durationMins}m`;
        return `${startFormatted} to ${endFormatted} (${durationText})`;
      };
      
      // Get class/course name (fallback to "session" if not available)
      const courseName = match.subject?.name || match.courseName || match.className || match.skillName || "session";
      
      // Generate unique identifier for notification to prevent duplicates
      const generateNotificationKey = (type, matchId, timestamp) => {
        return `${type}_${matchId}_${timestamp}`;
      };
      
      // Define valid notification types
      const VALID_NOTIFICATION_TYPES = {
        PROPOSED: 'session_proposed',
        ACCEPTED: 'match_accepted',
        REJECTED: 'match_rejected',
        COMPLETED: 'session_completed',
        CANCELED: 'session_cancelled',
        MESSAGE: 'session_message',
        SCHEDULED: 'session_scheduled',
        RESCHEDULED: 'session_rescheduled'
      };
      
      // Create notification based on status change
      let notificationType, notificationTitle, notificationMessage, notificationDetails;
      let notificationKey = null;
      
      const now = new Date();
      const timestampForKey = now.toISOString().split('T')[0]; // Use date part only for duplicate prevention
      
      // Handle rescheduling scenario explicitly with the new status value
      const isRescheduling = (status === 'rescheduled' || (selectedTimeSlot && previousStatus === 'accepted' && status === 'accepted'));
      
      if (previousStatus !== status || (proposedTimeSlots && proposedTimeSlots.length > 0) || selectedTimeSlot) {
        switch (status) {
          case 'pending':
            if (proposedTimeSlots && proposedTimeSlots.length > 0) {
              notificationType = VALID_NOTIFICATION_TYPES.PROPOSED;
              notificationTitle = `${senderRole} ${senderName}: New Times for ${courseName}`;
              notificationMessage = `${senderName} proposed ${proposedTimeSlots.length} time${proposedTimeSlots.length > 1 ? 's' : ''} for ${courseName}. ${message ? `Note: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"` : ''}`;
              notificationDetails = {
                senderRole,
                senderName,
                course: courseName,
                timeSlots: proposedTimeSlots.map(slot => ({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  formatted: formatTimeSlot(slot, recipientTimezone)
                })),
                message: message || null
              };
              notificationKey = generateNotificationKey('proposed', matchId, timestampForKey);
            }
            break;
          case 'accepted':
            if (isRescheduling) {
              notificationType = VALID_NOTIFICATION_TYPES.RESCHEDULED;
              const timeInfo = selectedTimeSlot 
                ? formatTimeSlot(selectedTimeSlot, recipientTimezone)
                : '';
              notificationTitle = `${senderRole} ${senderName}: Rescheduled ${courseName}`;
              notificationMessage = `${senderName} rescheduled your ${courseName} to ${timeInfo}.`;
              notificationDetails = {
                senderRole,
                senderName,
                course: courseName,
                selectedTime: formatTimeSlot(selectedTimeSlot, recipientTimezone),
                message: message || null
              };
              notificationKey = generateNotificationKey('rescheduled', matchId, timestampForKey);
            } else {
              notificationType = VALID_NOTIFICATION_TYPES.ACCEPTED;
              const timeInfo = selectedTimeSlot 
                ? formatTimeSlot(selectedTimeSlot, recipientTimezone)
                : '';
              notificationTitle = `${senderRole} ${senderName}: Accepted ${courseName}`;
              notificationMessage = `${senderName} accepted your ${courseName}${timeInfo ? ` for ${timeInfo}` : ''}.`;
              notificationDetails = {
                senderRole,
                senderName,
                course: courseName,
                selectedTime: selectedTimeSlot ? formatTimeSlot(selectedTimeSlot, recipientTimezone) : null,
                message: message || null
              };
              notificationKey = generateNotificationKey('accepted', matchId, timestampForKey);
            }
            break;
          case 'rescheduled':
            // Use correct senderId for reschedule
            const rescheduleSenderId = isRequester ? match.requesterId._id : match.teacherId._id;
            notificationType = VALID_NOTIFICATION_TYPES.RESCHEDULED;
            if (proposedTimeSlots && Array.isArray(proposedTimeSlots) && proposedTimeSlots.length > 0) {
              match.proposedTimeSlots = proposedTimeSlots.map(slot => ({
                startTime: new Date(slot.startTime),
                endTime: new Date(slot.endTime),
                proposedBy: rescheduleSenderId
              }));
              match.timeSlotHistory = match.timeSlotHistory || [];
              match.timeSlotHistory.push({
                proposedBy: rescheduleSenderId,
                proposedAt: new Date(),
                slots: proposedTimeSlots.map(slot => ({
                  startTime: new Date(slot.startTime),
                  endTime: new Date(slot.endTime)
                }))
              });
            }
            const rescheduledTimeInfo = selectedTimeSlot 
              ? formatTimeSlot(selectedTimeSlot, recipientTimezone)
              : '';
            notificationTitle = `${senderRole} ${senderName}: Rescheduled ${courseName}`;
            notificationMessage = `${senderName} rescheduled your ${courseName} to ${rescheduledTimeInfo}.`;
            notificationDetails = {
              senderRole,
              senderName,
              course: courseName,
              selectedTime: selectedTimeSlot ? formatTimeSlot(selectedTimeSlot, recipientTimezone) : null,
              proposedTimeSlots: proposedTimeSlots ? proposedTimeSlots.map(slot => formatTimeSlot(slot, recipientTimezone)) : null,
              message: message || null
            };
            notificationKey = generateNotificationKey('rescheduled', matchId, timestampForKey);
            break;
          case 'completed':
            notificationType = VALID_NOTIFICATION_TYPES.COMPLETED;
            notificationTitle = `${senderRole} ${senderName}: Completed ${courseName}`;
            notificationMessage = `${senderName} marked your ${courseName} as completed${message ? ` with feedback` : ''}.`;
            notificationDetails = {
              senderRole,
              senderName,
              course: courseName,
              feedback: message || null,
              sessionId: sessionId || null
            };
            notificationKey = generateNotificationKey('completed', matchId, timestampForKey);
            break;
          case 'rejected':
            notificationType = VALID_NOTIFICATION_TYPES.REJECTED;
            notificationTitle = `${senderRole} ${senderName}: Declined ${courseName}`;
            notificationMessage = `${senderName} declined your ${courseName}${message ? `: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"` : ''}.`;
            notificationDetails = {
              senderRole,
              senderName,
              course: courseName,
              reason: message || null
            };
            notificationKey = generateNotificationKey('rejected', matchId, timestampForKey);
            break;
          case 'canceled':
            notificationType = VALID_NOTIFICATION_TYPES.CANCELED;
            notificationTitle = `${senderRole} ${senderName}: Canceled ${courseName}`;
            notificationMessage = `${senderName} canceled your ${courseName}${message ? `: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"` : ''}.`;
            notificationDetails = {
              senderRole,
              senderName,
              course: courseName,
              reason: message || null,
              sessionId: sessionId || null
            };
            notificationKey = generateNotificationKey('canceled', matchId, timestampForKey);
            break;
        }
      } else if (message) {
        notificationType = VALID_NOTIFICATION_TYPES.MESSAGE;
        notificationTitle = `${senderRole} ${senderName}: Message about ${courseName}`;
        notificationMessage = `${senderName}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`;
        notificationDetails = {
          senderRole,
          senderName,
          course: courseName,
          message: message
        };
        notificationKey = generateNotificationKey('message', matchId, timestampForKey);
      }
      
      // Check if a similar notification already exists for today
      let notification = null;
      if (notificationType && notificationKey) {
        try {
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const existingNotification = await Notification.findOne({
            userId: recipientId,
            type: notificationType,
            relatedId: match._id,
            key: notificationKey,
            createdAt: { $gte: startOfDay }
          });
          if (existingNotification) {
            existingNotification.title = notificationTitle;
            existingNotification.message = notificationMessage;
            existingNotification.details = notificationDetails;
            existingNotification.read = false;
            existingNotification.updatedAt = now;
            existingNotification.count = (existingNotification.count || 1) + 1;
            await existingNotification.save();
            notification = existingNotification;
          } else {
            notification = new Notification({
              userId: recipientId,
              type: notificationType,
              title: notificationTitle,
              message: notificationMessage,
              details: notificationDetails,
              relatedId: match._id,
              relatedModel: 'Match',
              key: notificationKey,
              read: false,
              count: 1,
              createdAt: now,
              updatedAt: now
            });
            await notification.save();
          }
        } catch (notificationError) {
          console.error("Error creating/updating notification:", notificationError);
        }
        // Emit the notification through socket.io if available
        try {
          const io = req.app.get('io');
          if (io && notification) {
            io.to(recipientId.toString()).emit('notification', notification);
          }
        } catch (socketError) {
          console.error("Error emitting socket notification:", socketError);
        }
        // Send notification using the notification service if available
        try {
          await sendNotification({
            userId: recipientId,
            title: notificationTitle,
            body: notificationMessage,
            data: {
              type: notificationType,
              matchId: match._id.toString()
            }
          });
        } catch (notificationError) {
          console.error("Error sending notification:", notificationError);
        }
      }
      
      // Create or update session if match is accepted or rescheduled
      if ((status === 'accepted' && selectedTimeSlot) || status === 'rescheduled' || isRescheduling) {
        try {
          const sessionSenderId = isRequester ? match.requesterId._id : match.teacherId._id;
          const timeSlotToUse = selectedTimeSlot || 
            (proposedTimeSlots && proposedTimeSlots.length > 0 ? proposedTimeSlots[0] : null);
          if (!timeSlotToUse) {
            return res.status(400).json({ 
              error: 'No time slot provided for rescheduling',
              message: 'A selected time slot or proposed time slots are required when rescheduling'
            });
          }
          let session = await Session.findOne({ matchId: match._id });
          if (!session) {
            session = new Session({
              matchId: match._id,
              requesterId: match.requesterId._id,
              teacherId: match.teacherId._id,
              subject: match.subject,
              courseName: courseName,
              startTime: new Date(timeSlotToUse.startTime),
              endTime: new Date(timeSlotToUse.endTime),
              status: 'scheduled',
              meetLink: null,
              createdBy: sessionSenderId,
              createdAt: now
            });
            await session.save();
            match.currentSessionId = session._id;
            await match.save();
          } else {
            session.startTime = new Date(timeSlotToUse.startTime);
            session.endTime = new Date(timeSlotToUse.endTime);
            session.status = 'scheduled';
            session.updatedBy = sessionSenderId;
            session.updatedAt = now;
            await session.save();
            if (!match.currentSessionId || !match.currentSessionId.equals(session._id)) {
              match.currentSessionId = session._id;
              await match.save();
            }
          }
          // Notification for session (optional, similar to above)
          return res.status(200).json({ 
            match, 
            session,
            notification: notification ? {
              id: notification._id,
              type: notification.type,
              title: notification.title
            } : null
          });
        } catch (sessionError) {
          console.error("Error with session:", sessionError);
          return res.status(200).json({ 
            match, 
            warning: "Match updated but could not create or update session",
            error: sessionError.message
          });
        }
      } else if (status === 'completed' || status === 'canceled') {
        // For completed or canceled status, return the updated match
        if (sessionId) {
          try {
            const session = await Session.findById(sessionId);
            if (session) {
              session.status = status === 'completed' ? 'completed' : 'cancelled';
              if (message) {
                if (status === 'completed') {
                  session.notes = message;
                } else if (status === 'canceled') {
                  session.cancellationReason = message;
                }
              }
              session.updatedBy = senderId;
              session.updatedAt = now;
              await session.save();
            }
          } catch (sessionUpdateError) {
            console.error("Error updating session status:", sessionUpdateError);
          }
        }
        return res.status(200).json({ 
          match,
          notification: notification ? {
            id: notification._id,
            type: notification.type,
            title: notification.title
          } : null
        });
      } else {
        return res.status(200).json({ 
          match,
          notification: notification ? {
            id: notification._id,
            type: notification.type,
            title: notification.title
          } : null
        });
      }
    } catch (error) {
      console.error("Error updating match status:", error);
      return res.status(500).json({ 
        error: 'Failed to update match status',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  /**
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
  },

  deleteMatchesBySkill: async (req, res) => {
    try {
      const { skillId } = req.params;
      const userId = req.user.id;
      
      // Get the skill details first (if it still exists)
      const skill = await Skill.findById(skillId).catch(() => null);
      
      let deleteQuery = {};
      
      if (skill) {
        if (skill.isTeaching) {
          // If it's a teaching skill being deleted:
          // 1. Delete matches where this skill ID is referenced
          // 2. AND the user is the teacher
          deleteQuery = { 
            skillId: skillId,
            teacherId: userId 
          };
        } else if (skill.isLearning) {
          // If it's a learning skill being deleted:
          // Delete matches where user is the requester and skill name matches
          deleteQuery = {
            requesterId: userId,
            skillName: { $regex: new RegExp(`^${skill.skillName.trim().toLowerCase()}$`, 'i') }
          };
        }
      } else {
        // If the skill was already deleted, we need to check both possibilities
        // This happens if this function is called after the skill is already removed
        
        // Try to delete matches where:
        // 1. This user is the teacher AND this skillId was referenced
        // OR
        // 2. This user is the requester (for learning skills)
        deleteQuery = {
          $or: [
            { teacherId: userId, skillId: skillId },
            { requesterId: userId }
          ]
        };
      }
      
      console.log('Delete query:', deleteQuery);
      const result = await Match.deleteMany(deleteQuery);
      
      return res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} matches associated with skill`,
        data: result
      });
    } catch (error) {
      console.error('Error deleting matches by skill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete matches by skill',
        error: error.message
      });
    }
  },

  getUserMatches: async (req, res) => {
    try {
      const userId = req.params.userId;
      const statusList = (req.query.status || '').split(',').filter(Boolean);
      
      const query = {
        $or: [
          { teacherId: userId },
          { requesterId: userId }
        ]
      };
      
      // Add status filter if provided
      if (statusList.length > 0) {
        query.status = { $in: statusList };
      }
      
      // Find matches where the user is either a teacher or requester
      const matches = await Match.find(query)
        .populate('skillId', 'name')
        .populate('teacherId', 'name avatar')
        .populate('requesterId', 'name avatar')
        .sort({ updatedAt: -1 }) // Sort by most recently updated
        .limit(5); // Limit to 5 recent matches
      
      return res.status(200).json({ matches });
    } catch (error) {
      console.error("Error fetching user matches:", error);
      return res.status(500).json({ 
        error: 'Failed to fetch matches',
        message: error.message
      });
    }
  }

};

module.exports = matchingController;