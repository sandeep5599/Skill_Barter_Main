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



// updateMatchStatus: async (req, res) => {
//   try {
//     // Input validation
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: 'Unauthorized access' });
//     }
    
//     const { matchId } = req.params;
//     const { status, proposedTimeSlots, selectedTimeSlot, message } = req.body;
    
//     if (!matchId || !mongoose.Types.ObjectId.isValid(matchId)) {
//       return res.status(400).json({ error: 'Invalid match ID' });
//     }
    
//     if (!status || !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status value' });
//     }
    
//     // Find match with rich information
//     const match = await Match.findById(matchId)
//       .populate('requesterId', 'name email profilePicture preferredLanguage timezone')
//       .populate('teacherId', 'name email profilePicture preferredLanguage timezone')
//       // .populate('subject', 'name description');
      
//     if (!match) {
//       return res.status(404).json({ error: 'Match not found' });
//     }
    
//     // Verify user is authorized to update this match
//     const userId = req.user.id;
//     if (match.requesterId._id.toString() !== userId && match.teacherId._id.toString() !== userId) {
//       return res.status(403).json({ error: 'Not authorized to update this match' });
//     }
    
//     // Determine if the current user is the requester or teacher
//     const isRequester = match.requesterId._id.toString() === userId;
    
//     // The user who should receive the notification (other party)
//     const recipientId = isRequester ? match.teacherId._id : match.requesterId._id;
//     const recipientName = isRequester ? match.teacherId.name : match.requesterId.name;
//     const recipientEmail = isRequester ? match.teacherId.email : match.requesterId.email;
//     const recipientLanguage = isRequester ? match.teacherId.preferredLanguage : match.requesterId.preferredLanguage;
//     const recipientTimezone = isRequester ? match.teacherId.timezone : match.requesterId.timezone;
    
//     const senderId = isRequester ? match.requesterId._id : match.teacherId._id;
//     const senderName = isRequester ? match.requesterId.name : match.teacherId.name;
//     const senderEmail = isRequester ? match.requesterId.email : match.teacherId.email;
//     const senderRole = isRequester ? 'student' : 'teacher';
    
//     // Store previous status to check for state changes
//     const previousStatus = match.status;
    
//     // Update match status
//     match.status = status;
    
//     // Add custom message if provided
//     if (message) {
//       match.statusMessages = match.statusMessages || [];
//       match.statusMessages.push({
//         userId: senderId,
//         message: message,
//         timestamp: new Date()
//       });
//     }
    
//     // Update proposed time slots if provided
//     if (proposedTimeSlots && Array.isArray(proposedTimeSlots) && proposedTimeSlots.length > 0) {
//       console.log("Updating proposed time slots:", proposedTimeSlots);
//       match.proposedTimeSlots = proposedTimeSlots.map(slot => ({
//         startTime: new Date(slot.startTime),
//         endTime: new Date(slot.endTime),
//         proposedBy: senderId
//       }));
      
//       // Track time slot proposal history
//       match.timeSlotHistory = match.timeSlotHistory || [];
//       match.timeSlotHistory.push({
//         proposedBy: senderId,
//         proposedAt: new Date(),
//         slots: proposedTimeSlots.map(slot => ({
//           startTime: new Date(slot.startTime),
//           endTime: new Date(slot.endTime)
//         }))
//       });
//     }
    
//     // If selecting a time slot
//     if (selectedTimeSlot) {
//       match.selectedTimeSlot = {
//         startTime: new Date(selectedTimeSlot.startTime),
//         endTime: new Date(selectedTimeSlot.endTime),
//         selectedBy: senderId,
//         selectedAt: new Date()
//       };
//     }
    
//     await match.save();
    
//     // Format time slots for notification
//     const formatTimeSlot = (slot, timezone) => {
//       const options = { 
//         weekday: 'long', 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric',
//         hour: '2-digit', 
//         minute: '2-digit',
//         timeZoneName: 'short'
//       };
      
//       // Format based on recipient's timezone if available
//       const startFormatted = new Date(slot.startTime).toLocaleString(recipientLanguage || 'en-US', options);
//       const endFormatted = new Date(slot.endTime).toLocaleString(recipientLanguage || 'en-US', {
//         hour: '2-digit', 
//         minute: '2-digit',
//         timeZoneName: 'short'
//       });
      
//       return `${startFormatted} to ${endFormatted}`;
//     };
    
//     // Create notification based on status change
//     let notificationType, notificationTitle, notificationMessage, notificationDetails, emailSubject, emailBody;
    
//     // Subject information for notifications
//     const subjectInfo = match.subject ? match.subject.name : "your session";
    
//     if (previousStatus !== status || (proposedTimeSlots && proposedTimeSlots.length > 0) || selectedTimeSlot) {
//       switch (status) {
//         case 'pending':
//           if (proposedTimeSlots && proposedTimeSlots.length > 0) {
//             notificationType = 'session_proposed';
//             notificationTitle = 'New Session & Time Proposed';
            
//             // Create detailed message with all time slots
//             const timeSlotsList = proposedTimeSlots
//               .map((slot, index) => `Option ${index + 1}: ${formatTimeSlot(slot, recipientTimezone)}`)
//               .join('\n');
            
//             notificationMessage = `${senderName} has proposed new time slots for your ${subjectInfo} session.`;
//             notificationDetails = {
//               senderRole,
//               senderName,
//               senderEmail,
//               subject: subjectInfo,
//               timeSlots: proposedTimeSlots.map(slot => ({
//                 startTime: slot.startTime,
//                 endTime: slot.endTime,
//                 formatted: formatTimeSlot(slot, recipientTimezone)
//               })),
//               customMessage: message || null
//             };
            
//             emailSubject = `New Session Times Proposed by ${senderName}`;
//             emailBody = `
//               <h2>New Session Times Proposed</h2>
//               <p>${senderName} has proposed the following time slots for your ${subjectInfo} session:</p>
//               <ul>
//                 ${proposedTimeSlots.map((slot, index) => 
//                   `<li><strong>Option ${index + 1}:</strong> ${formatTimeSlot(slot, recipientTimezone)}</li>`
//                 ).join('')}
//               </ul>
//               ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
//               <p>Please log in to respond to this proposal.</p>
//             `;
//           }
//           break;
          
//         case 'accepted':
//           notificationType = 'session_accepted';
//           notificationTitle = 'Session Accepted';
          
//           let timeInfo = '';
//           if (selectedTimeSlot) {
//             timeInfo = `scheduled for ${formatTimeSlot(selectedTimeSlot, recipientTimezone)}`;
//           }
          
//           notificationMessage = `${senderName} has accepted your ${subjectInfo} session ${timeInfo}.`;
//           notificationDetails = {
//             senderRole,
//             senderName,
//             senderEmail,
//             subject: subjectInfo,
//             selectedTimeSlot: selectedTimeSlot ? {
//               startTime: selectedTimeSlot.startTime,
//               endTime: selectedTimeSlot.endTime,
//               formatted: formatTimeSlot(selectedTimeSlot, recipientTimezone)
//             } : null,
//             customMessage: message || null
//           };
          
//           emailSubject = `Session Accepted by ${senderName}`;
//           emailBody = `
//             <h2>Session Accepted</h2>
//             <p>${senderName} has accepted your ${subjectInfo} session.</p>
//             ${selectedTimeSlot ? 
//               `<p><strong>Scheduled Time:</strong> ${formatTimeSlot(selectedTimeSlot, recipientTimezone)}</p>` : 
//               ''}
//             ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
//             <p>Please log in to view the details.</p>
//           `;
//           break;
          
//         case 'rejected':
//           notificationType = 'session_rejected';
//           notificationTitle = 'Session Request Declined';
//           notificationMessage = `${senderName} has declined your ${subjectInfo} session request.`;
//           notificationDetails = {
//             senderRole,
//             senderName,
//             senderEmail,
//             subject: subjectInfo,
//             reason: message || 'No reason provided',
//             customMessage: message || null
//           };
          
//           emailSubject = `Session Request Declined by ${senderName}`;
//           emailBody = `
//             <h2>Session Request Declined</h2>
//             <p>${senderName} has declined your ${subjectInfo} session request.</p>
//             ${message ? `<p><strong>Reason:</strong> "${message}"</p>` : ''}
//             <p>Please log in to view alternative options.</p>
//           `;
//           break;
          
//         case 'completed':
//           notificationType = 'session_completed';
//           notificationTitle = 'Session Marked as Completed';
//           notificationMessage = `${senderName} has marked your ${subjectInfo} session as completed.`;
//           notificationDetails = {
//             senderRole,
//             senderName,
//             senderEmail,
//             subject: subjectInfo,
//             feedback: message || null,
//             customMessage: message || null
//           };
          
//           emailSubject = `Session Completed with ${senderName}`;
//           emailBody = `
//             <h2>Session Completed</h2>
//             <p>${senderName} has marked your ${subjectInfo} session as completed.</p>
//             ${message ? `<p><strong>Feedback:</strong> "${message}"</p>` : ''}
//             <p>Please log in to provide your feedback and view session details.</p>
//           `;
//           break;
//       }
//     } else if (message) {
//       // If only a message was added
//       notificationType = 'session_message';
//       notificationTitle = 'New Message About Your Session';
//       notificationMessage = `${senderName} sent you a message about your ${subjectInfo} session.`;
//       notificationDetails = {
//         senderRole,
//         senderName,
//         senderEmail,
//         subject: subjectInfo,
//         message: message
//       };
      
//       emailSubject = `New Message from ${senderName} About Your Session`;
//       emailBody = `
//         <h2>New Session Message</h2>
//         <p>${senderName} has sent you a message about your ${subjectInfo} session:</p>
//         <p><em>"${message}"</em></p>
//         <p>Please log in to respond.</p>
//       `;
//     }
    
//     // Create and save notification if needed
//     if (notificationType) {
//       const notification = new Notification({
//         userId: recipientId,
//         type: notificationType,
//         title: notificationTitle,
//         message: notificationMessage,
//         details: notificationDetails,
//         relatedId: match._id,
//         relatedModel: 'Match',
//         read: false,
//         createdAt: new Date()
//       });
      
//       await notification.save();
      
//       // Emit the notification through socket.io if available
//       const io = req.app.get('io');
//       if (io) {
//         io.to(recipientId.toString()).emit('notification', notification);
//       }
      
//       // Send email notification if service is available
//       try {
//         if (emailService && recipientEmail) {
//           await emailService.sendEmail({
//             to: recipientEmail,
//             subject: emailSubject,
//             html: emailBody
//           });
//         }
//       } catch (emailError) {
//         console.error("Error sending email notification:", emailError);
//         // Continue even if email fails
//       }
      
//       // Send push notification if service is available
//       try {
//         if (pushNotificationService) {
//           await pushNotificationService.sendPushNotification({
//             userId: recipientId,
//             title: notificationTitle,
//             body: notificationMessage,
//             data: {
//               type: notificationType,
//               matchId: match._id.toString()
//             }
//           });
//         }
//       } catch (pushError) {
//         console.error("Error sending push notification:", pushError);
//         // Continue even if push notification fails
//       }
//     }
    
//     // Create session if match is accepted
//     if (status === 'accepted' && selectedTimeSlot) {
//       try {
//         // Create session record
//         const session = new Session({
//           matchId: match._id,
//           requesterId: match.requesterId._id,
//           teacherId: match.teacherId._id,
//           subject: match.subject,
//           startTime: new Date(selectedTimeSlot.startTime),
//           endTime: new Date(selectedTimeSlot.endTime),
//           status: 'scheduled',
//           meetLink: null, // You can integrate with Google Calendar API here
//           createdBy: senderId,
//           createdAt: new Date()
//         });
//         await session.save();
        
//         // Create specific notification for session creation
//         const sessionNotification = new Notification({
//           userId: recipientId,
//           type: 'session_scheduled',
//           title: 'Session Scheduled',
//           message: `Your ${subjectInfo} session with ${senderName} has been scheduled for ${formatTimeSlot(selectedTimeSlot, recipientTimezone)}.`,
//           details: {
//             senderRole,
//             senderName,
//             senderEmail,
//             subject: subjectInfo,
//             sessionId: session._id,
//             startTime: selectedTimeSlot.startTime,
//             endTime: selectedTimeSlot.endTime,
//             formattedTime: formatTimeSlot(selectedTimeSlot, recipientTimezone),
//             meetLink: session.meetLink,
//             customMessage: message || null
//           },
//           relatedId: session._id,
//           relatedModel: 'Session',
//           read: false,
//           createdAt: new Date()
//         });
        
//         await sessionNotification.save();
        
//         // Emit the notification through socket.io if available
//         const io = req.app.get('io');
//         if (io) {
//           io.to(recipientId.toString()).emit('notification', sessionNotification);
//         }
        
//         // Send calendar invite if service is available
//         try {
//           if (calendarService) {
//             await calendarService.createCalendarEvent({
//               title: `${subjectInfo} Session: ${match.requesterId.name} and ${match.teacherId.name}`,
//               description: `Session for ${subjectInfo}${message ? '. Note: ' + message : ''}`,
//               startTime: new Date(selectedTimeSlot.startTime),
//               endTime: new Date(selectedTimeSlot.endTime),
//               attendees: [
//                 { email: match.requesterId.email, name: match.requesterId.name },
//                 { email: match.teacherId.email, name: match.teacherId.name }
//               ],
//               session: session._id
//             });
//           }
//         } catch (calendarError) {
//           console.error("Error creating calendar event:", calendarError);
//           // Continue even if calendar invite fails
//         }
        
//         return res.status(200).json({ 
//           match, 
//           session,
//           notification: sessionNotification 
//         });
//       } catch (sessionError) {
//         console.error("Error creating session:", sessionError);
//         // Continue with match update even if session creation fails
//         return res.status(200).json({ 
//           match, 
//           warning: "Match updated but could not create session",
//           error: sessionError.message
//         });
//       }
//     } else {
//       return res.status(200).json({ 
//         match,
//         notification: notificationType ? { type: notificationType, title: notificationTitle } : null
//       });
//     }
//   } catch (error) {
//     console.error("Error updating match status:", error);
//     return res.status(500).json({ 
//       error: 'Failed to update match status',
//       message: error.message,
//       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
//     });
//   }
// },

updateMatchStatus: async (req, res) => {
  try {
    // Input validation
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const { matchId } = req.params;
    const { status, proposedTimeSlots, selectedTimeSlot, message } = req.body;
    
    if (!matchId || !mongoose.Types.ObjectId.isValid(matchId)) {
      return res.status(400).json({ error: 'Invalid match ID' });
    }
    
    if (!status || !['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
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
    
    // The user who should receive the notification (other party)
    const recipientId = isRequester ? match.teacherId._id : match.requesterId._id;
    const recipientName = isRequester ? match.teacherId.name : match.requesterId.name;
    const recipientEmail = isRequester ? match.teacherId.email : match.requesterId.email;
    const recipientTimezone = isRequester ? match.teacherId.timezone : match.requesterId.timezone;
    
    const senderId = isRequester ? match.requesterId._id : match.teacherId._id;
    const senderName = isRequester ? match.requesterId.name : match.teacherId.name;
    const senderEmail = isRequester ? match.requesterId.email : match.teacherId.email;
    const senderRole = isRequester ? 'Student' : 'Teacher';
    
    // Store previous status to check for state changes
    const previousStatus = match.status;
    
    // Update match status
    match.status = status;
    
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
      console.log("Updating proposed time slots:", proposedTimeSlots);
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
      
      // Format based on recipient's timezone if available
      const startDate = new Date(slot.startTime);
      const endDate = new Date(slot.endTime);
      
      const startFormatted = startDate.toLocaleString(recipientTimezone ? 'en-US' : 'en-US', options);
      const endTimeOptions = {
        hour: 'numeric', 
        minute: '2-digit',
        timeZoneName: 'short'
      };
      const endFormatted = endDate.toLocaleString(recipientTimezone ? 'en-US' : 'en-US', endTimeOptions);
      
      // Calculate duration
      const durationMs = endDate - startDate;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const durationText = durationHours > 0 
        ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
        : `${durationMins}m`;
      
      return `${startFormatted} to ${endFormatted} (${durationText})`;
    };
    
    // Get class/course name (fallback to "session" if not available)
    const courseName = match.subject?.name || match.courseName || match.className || "session";
    
    // Generate unique identifier for notification to prevent duplicates
    const generateNotificationKey = (type, matchId, timestamp) => {
      return `${type}_${matchId}_${timestamp}`;
    };
    
    // Create notification based on status change
    let notificationType, notificationTitle, notificationMessage, notificationDetails, emailSubject, emailBody;
    let notificationKey = null;
    
    const now = new Date();
    const timestampForKey = now.toISOString().split('T')[0]; // Use date part only for duplicate prevention
    
    if (previousStatus !== status || (proposedTimeSlots && proposedTimeSlots.length > 0) || selectedTimeSlot) {
      switch (status) {
        case 'pending':
          if (proposedTimeSlots && proposedTimeSlots.length > 0) {
            notificationType = 'session_proposed';
            notificationTitle = `${senderRole} ${senderName}: New Times for ${courseName}`;
            
            // More concise message with course name and time options count
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
            
            emailSubject = `New Times for ${courseName} from ${senderName}`;
            emailBody = `
              <h2>${senderRole} ${senderName} proposed new times for ${courseName}</h2>
              <ul>
                ${proposedTimeSlots.map((slot, index) => 
                  `<li><strong>Option ${index + 1}:</strong> ${formatTimeSlot(slot, recipientTimezone)}</li>`
                ).join('')}
              </ul>
              ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
            `;
            
            notificationKey = generateNotificationKey('proposed', matchId, timestampForKey);
          }
          break;
          
        case 'accepted':
          notificationType = 'session_accepted';
          
          let timeInfo = selectedTimeSlot 
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
          
          emailSubject = `${courseName} Accepted by ${senderName}`;
          emailBody = `
            <h2>${senderRole} ${senderName} has accepted your ${courseName}</h2>
            ${selectedTimeSlot ? 
              `<p><strong>Time:</strong> ${formatTimeSlot(selectedTimeSlot, recipientTimezone)}</p>` : 
              ''}
            ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
          `;
          
          notificationKey = generateNotificationKey('accepted', matchId, timestampForKey);
          break;
          
        case 'rejected':
          notificationType = 'session_rejected';
          notificationTitle = `${senderRole} ${senderName}: Declined ${courseName}`;
          notificationMessage = `${senderName} declined your ${courseName}${message ? `: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"` : ''}.`;
          
          notificationDetails = {
            senderRole,
            senderName,
            course: courseName,
            reason: message || null
          };
          
          emailSubject = `${courseName} Declined by ${senderName}`;
          emailBody = `
            <h2>${senderRole} ${senderName} has declined your ${courseName}</h2>
            ${message ? `<p><strong>Reason:</strong> "${message}"</p>` : ''}
          `;
          
          notificationKey = generateNotificationKey('rejected', matchId, timestampForKey);
          break;
          
        case 'completed':
          notificationType = 'session_completed';
          notificationTitle = `${senderRole} ${senderName}: Completed ${courseName}`;
          notificationMessage = `${senderName} marked your ${courseName} as completed${message ? ` with feedback` : ''}.`;
          
          notificationDetails = {
            senderRole,
            senderName,
            course: courseName,
            feedback: message || null
          };
          
          emailSubject = `${courseName} Completed with ${senderName}`;
          emailBody = `
            <h2>${senderRole} ${senderName} has marked ${courseName} as completed</h2>
            ${message ? `<p><strong>Feedback:</strong> "${message}"</p>` : ''}
          `;
          
          notificationKey = generateNotificationKey('completed', matchId, timestampForKey);
          break;
      }
    } else if (message) {
      // If only a message was added
      notificationType = 'session_message';
      notificationTitle = `${senderRole} ${senderName}: Message about ${courseName}`;
      notificationMessage = `${senderName}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`;
      
      notificationDetails = {
        senderRole,
        senderName,
        course: courseName,
        message: message
      };
      
      emailSubject = `Message from ${senderName} about ${courseName}`;
      emailBody = `
        <h2>Message from ${senderRole} ${senderName} about ${courseName}</h2>
        <p>"${message}"</p>
      `;
      
      notificationKey = generateNotificationKey('message', matchId, timestampForKey);
    }
    
    // Check if a similar notification already exists for today
    let notification = null;
    if (notificationType && notificationKey) {
      // Try to find existing notification with the same key that was created today
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
        // Update existing notification instead of creating a new one
        existingNotification.title = notificationTitle;
        existingNotification.message = notificationMessage;
        existingNotification.details = notificationDetails;
        existingNotification.read = false; // Mark as unread again
        existingNotification.updatedAt = now;
        existingNotification.count = (existingNotification.count || 1) + 1;
        
        await existingNotification.save();
        notification = existingNotification;
        
        console.log(`Updated existing notification: ${notificationKey}`);
      } else {
        // Create new notification
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
        console.log(`Created new notification: ${notificationKey}`);
      }
      
      // Emit the notification through socket.io if available
      const io = req.app.get('io');
      if (io) {
        io.to(recipientId.toString()).emit('notification', notification);
      }
      
      // Send email notification if service is available
      try {
        if (emailService && recipientEmail) {
          await emailService.sendEmail({
            to: recipientEmail,
            subject: emailSubject,
            html: emailBody
          });
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
      }
      
      // Send push notification if service is available
      try {
        if (pushNotificationService) {
          await pushNotificationService.sendPushNotification({
            userId: recipientId,
            title: notificationTitle,
            body: notificationMessage,
            data: {
              type: notificationType,
              matchId: match._id.toString()
            }
          });
        }
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    }
    
    // Create session if match is accepted
    if (status === 'accepted' && selectedTimeSlot) {
      try {
        // Check if session already exists for this match to prevent duplicates
        let session = await Session.findOne({ matchId: match._id });
        
        if (!session) {
          // Create new session record
          session = new Session({
            matchId: match._id,
            requesterId: match.requesterId._id,
            teacherId: match.teacherId._id,
            subject: match.subject,
            courseName: courseName,
            startTime: new Date(selectedTimeSlot.startTime),
            endTime: new Date(selectedTimeSlot.endTime),
            status: 'scheduled',
            meetLink: null,
            createdBy: senderId,
            createdAt: now
          });
          await session.save();
        } else {
          // Update existing session
          session.startTime = new Date(selectedTimeSlot.startTime);
          session.endTime = new Date(selectedTimeSlot.endTime);
          session.status = 'scheduled';
          session.updatedBy = senderId;
          session.updatedAt = now;
          await session.save();
        }
        
        // Unique key for session notification
        const sessionNotificationKey = generateNotificationKey('scheduled', session._id, timestampForKey);
        
        // Check if session notification already exists
        let sessionNotification = await Notification.findOne({
          userId: recipientId,
          type: 'session_scheduled',
          relatedId: session._id,
          key: sessionNotificationKey
        });
        
        const sessionTitle = `${courseName} with ${senderName}`;
        const sessionMessage = `${courseName} scheduled with ${senderName} for ${formatTimeSlot(selectedTimeSlot, recipientTimezone)}.`;
        
        if (sessionNotification) {
          // Update existing notification
          sessionNotification.title = sessionTitle;
          sessionNotification.message = sessionMessage;
          sessionNotification.details = {
            senderRole,
            senderName,
            course: courseName,
            sessionId: session._id,
            time: formatTimeSlot(selectedTimeSlot, recipientTimezone),
            meetLink: session.meetLink,
            message: message || null
          };
          sessionNotification.read = false;
          sessionNotification.updatedAt = now;
          
          await sessionNotification.save();
        } else {
          // Create new session notification
          sessionNotification = new Notification({
            userId: recipientId,
            type: 'session_scheduled',
            title: sessionTitle,
            message: sessionMessage,
            details: {
              senderRole,
              senderName,
              course: courseName,
              sessionId: session._id,
              time: formatTimeSlot(selectedTimeSlot, recipientTimezone),
              meetLink: session.meetLink,
              message: message || null
            },
            relatedId: session._id,
            relatedModel: 'Session',
            key: sessionNotificationKey,
            read: false,
            count: 1,
            createdAt: now,
            updatedAt: now
          });
          
          await sessionNotification.save();
        }
        
        // Emit the notification through socket.io if available
        const io = req.app.get('io');
        if (io) {
          io.to(recipientId.toString()).emit('notification', sessionNotification);
        }
        
        // Send calendar invite if service is available
        try {
          if (calendarService) {
            await calendarService.createCalendarEvent({
              title: `${courseName}: ${match.requesterId.name} and ${match.teacherId.name}`,
              description: `${courseName} session${message ? '\n\nNote: ' + message : ''}`,
              startTime: new Date(selectedTimeSlot.startTime),
              endTime: new Date(selectedTimeSlot.endTime),
              attendees: [
                { email: match.requesterId.email, name: match.requesterId.name },
                { email: match.teacherId.email, name: match.teacherId.name }
              ],
              sessionId: session._id
            });
          }
        } catch (calendarError) {
          console.error("Error creating calendar event:", calendarError);
        }
        
        return res.status(200).json({ 
          match, 
          session,
          notification: sessionNotification 
        });
      } catch (sessionError) {
        console.error("Error with session:", sessionError);
        return res.status(200).json({ 
          match, 
          warning: "Match updated but could not create or update session",
          error: sessionError.message
        });
      }
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