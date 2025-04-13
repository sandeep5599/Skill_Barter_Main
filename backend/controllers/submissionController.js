// controllers/submissionController.js
const Assessment = require('../models/Assessment'); 
const Submission = require('../models/Submission');
const User = require('../models/User');
const uploadService = require('../services/uploadService');
const { sendNotification } = require('../services/notificationService');
const Points = require('../models/Points');

exports.submitAssessment = async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const answersPdf = req.file;
      
      if (!answersPdf) {
        return res.status(400).json({ success: false, message: 'Answers PDF file is required' });
      }
      
      // Check if assessment exists
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }
      
      // Check for existing submission
      const existingSubmission = await Submission.findOne({
        assessmentId,
        submittedBy: req.user.id
      });
      
      if (existingSubmission) {
        return res.status(400).json({ success: false, message: 'You have already submitted this assessment' });
      }
      
      // Upload PDF to storage service
      const answersPdfUrl = await uploadService.uploadFile(answersPdf, 'submissions');
      
      // Determine if submission is late
      const isLate = assessment.dueDate && new Date() > new Date(assessment.dueDate);
      
      // Create submission
      const submission = new Submission({
        assessmentId,
        submittedBy: req.user.id,
        answersPdfUrl,
        status: isLate ? 'late' : 'submitted'
      });
      
      await submission.save();
      
      // Notify assessment creator
      if (req.app.get('io')) {
        const io = req.app.get('io');
        const socket = io.sockets.sockets.get(req.socketId);
        
        const user = await User.findById(req.user.id);
        
        if (socket) {
          socket.emit('assessment:submitted', {
            _id: submission._id,
            assessmentId,
            creatorId: assessment.createdBy.toString(),
            submitterName: user.name
          });
        }
      }
      
      res.status(201).json({
        success: true,
        submission
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting assessment',
        error: error.message
      });
    }
  };
  
  // Evaluate a submission
exports.evaluateSubmission = async (req, res) => {
  console.log("==== EVALUATION PROCESS STARTED ====");
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);
  try {
    const { submissionId } = req.params;
    const { scores, feedback, overallFeedback, totalScore, averageScore } = req.body;
    const evaluatorId = req.user.id;
    
    console.log(`Processing submission ID: ${submissionId}`);
    console.log(`Evaluator ID: ${evaluatorId}`);
    
    // Validate input
    if (totalScore === undefined || totalScore < 0) {
      console.log("ERROR: Invalid total score provided:", totalScore);
      return res.status(400).json({ success: false, message: 'Valid total score is required' });
    }

    if (!scores || !Array.isArray(scores) || scores.length !== 5) {
      console.log("ERROR: Invalid scores format:", scores);
      return res.status(400).json({
        success: false,
        message: 'Invalid scores format. Expected array of 5 scores.'
      });
    }
    
    console.log("Input validation passed successfully");
    
    // Find submission with populated assessment
    console.log("Fetching submission from database...");
    const submission = await Submission.findById(submissionId)
      .populate({
        path: 'assessmentId',
        select: 'title createdBy'
      });
    
    if (!submission) {
      console.log(`ERROR: Submission with ID ${submissionId} not found`);
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    console.log("Submission found:", {
      id: submission._id,
      assessmentId: submission.assessmentId._id,
      assessmentTitle: submission.assessmentId.title,
      status: submission.status
    });
    
    // Verify the evaluator is the assessment creator
    console.log(`Checking authorization: createdBy=${submission.assessmentId.createdBy}, evaluatorId=${evaluatorId}`);
    if (submission.assessmentId.createdBy && submission.assessmentId.createdBy.toString() !== evaluatorId) {
      console.log("ERROR: Authorization failed - evaluator is not the assessment creator");
      return res.status(403).json({ success: false, message: 'Not authorized to evaluate this submission' });
    }
    
    console.log("Authorization check passed");
    
    // Update submission - using new structure
    console.log("Updating submission with evaluation data...");
    submission.marks = totalScore;
    submission.detailedScores = scores;
    submission.detailedFeedback = feedback;
    submission.feedback = overallFeedback;
    submission.status = 'evaluated';
    submission.evaluatedAt = new Date();
    
    console.log("Saving updated submission...");
    await submission.save();
    console.log("Submission successfully updated with status 'evaluated'");

    // Add points to the user based on the average score
    const userId = submission.submittedBy || submission.userId;
    console.log(`Processing points for user ID: ${userId}`);
    
    let userPoints = await Points.findOne({ userId });
    console.log('Current User Points:', userPoints ? userPoints.points : 'No points record found');
    
    if (!userPoints) {
      console.log(`Creating new points record for user ${userId}`);
      userPoints = new Points({ userId });
    }
    
    // Add the average score to the user's points
    const previousPoints = userPoints.points || 0;
    userPoints.points += averageScore;
    console.log(`Points updated: ${previousPoints} + ${averageScore} = ${userPoints.points}`);
    
    // Add to point history
    const pointHistoryEntry = {
      points: averageScore,
      reason: 'Assessment Score',
      assessmentId: submission.assessmentId._id,
      date: new Date()
    };
    console.log('Adding to point history:', pointHistoryEntry);
    userPoints.pointHistory.push(pointHistoryEntry);
    
    console.log('Saving updated user points...');
    await userPoints.save();
    console.log('User points successfully updated');
    
    // Update assessment statistics
    console.log(`Updating statistics for assessment ID: ${submission.assessmentId._id}`);
    const assessment = await Assessment.findById(submission.assessmentId._id);
    if (assessment) {
      console.log('Fetching all evaluated submissions for this assessment...');
      const allSubmissions = await Submission.find({
        assessmentId: assessment._id,
        status: 'evaluated'
      });
      
      const totalSubmissions = allSubmissions.length;
      console.log(`Found ${totalSubmissions} evaluated submissions`);
      
      const totalScores = allSubmissions.reduce((sum, s) => {
        return sum + (s.marks || 0);
      }, 0);
      
      const newAverageScore = totalSubmissions > 0 ? totalScores / totalSubmissions / 5 : 0;
      console.log(`Calculated statistics: totalSubmissions=${totalSubmissions}, totalScores=${totalScores}, averageScore=${newAverageScore}`);
      
      assessment.stats = {
        totalSubmissions,
        averageScore: newAverageScore
      };
      
      console.log('Saving updated assessment statistics...');
      await assessment.save();
      console.log('Assessment statistics successfully updated');
    } else {
      console.log(`WARNING: Assessment with ID ${submission.assessmentId._id} not found for statistics update`);
    }
    
    // Notify the learner
    console.log('Checking for socket connection to send notification...');
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const socket = io.sockets.sockets.get(req.socketId);
      
      if (socket) {
        const notificationData = {
          assessmentId: submission.assessmentId._id,
          submissionId: submission._id,
          learnerId: submission.submittedBy ? submission.submittedBy.toString() : submission.userId.toString(),
          title: submission.assessmentId.title,
          marks: totalScore
        };
        
        console.log('Sending socket notification:', notificationData);
        socket.emit('assessment:evaluated', notificationData);
        console.log('Notification sent successfully');
      } else {
        console.log(`Socket with ID ${req.socketId} not found, notification not sent`);
      }
    } else {
      console.log('Socket.io not initialized, notification not sent');
    }
    
    console.log("==== EVALUATION PROCESS COMPLETED SUCCESSFULLY ====");
    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('==== EVALUATION ERROR ====');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error evaluating submission',
      error: error.message
    });
  }
};
  
  // Get all submissions for an assessment
exports.getSubmissionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    // Check if assessment exists and user is the creator
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    
    if (assessment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these submissions' });
    }
    
    // Get submissions
    const submissions = await Submission.find({ assessmentId })
      .populate('submittedBy', 'name email')
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

  // Get learner's submissions
exports.getLearnerSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user.id })
      .populate({
        path: 'assessmentId',
        select: 'title createdBy skillId',
        populate: [
          { path: 'createdBy', select: 'name' },
          { path: 'skillId', select: 'name' }
        ]
      })
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching learner submissions',
      error: error.message
    });
  }
};


exports.submitAssessment = async (req, res) => {
  console.log("Submitting assessment..."); // Debug
  console.log("Request body:", req.body); // Debug
  try {
    const assessmentId = req.params.assessmentId || req.body.assessmentId;
    console.log("Assessment ID:", assessmentId); // Debug
    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }
    
    const answersPdf = req.file;
    
    if (!answersPdf) {
      return res.status(400).json({ 
        success: false, 
        message: 'Answers PDF file is required' 
      });
    }
    
    // Check if assessment exists
    const assessment = await Assessment.findById(assessmentId)
      .populate('skillId', 'title category owner');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    // Check if user has already submitted this assessment
    const existingSubmission = await Submission.findOne({
      assessmentId,
      submittedBy: req.user.id
    });
    
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assessment'
      });
    }
    
    // Upload PDF to storage service
    const answersPdfUrl = await uploadService.uploadFile(answersPdf, 'submissions');
    
    // Create new submission
    const submission = new Submission({
      assessmentId,
      submittedBy: req.user.id,
      answersPdfUrl,
      submittedAt: new Date()
    });
    
    await submission.save();
    
    // Get student info for notification
    const student = await User.findById(req.user.id).select('name');
    
    // Send notification to the skill sharer (owner of the skill)
    if (req.app.get('io')) {
      // In the second submitAssessment export function, update the sendNotification call:

    // Inside your submitAssessment function, modify your sendNotification call:

// Check if assessment.skillId.owner exists and is a valid ObjectId
if (!assessment.skillId || !assessment.skillId.owner) {
console.log("Missing owner ID. Assessment data:", assessment);
// Handle this case - maybe use a default ID or skip notification
} else {
await sendNotification(req.app.get('io'), {
  userId: assessment.skillId.owner, // Make sure this value is valid
  relatedId: submission._id,
  relatedModel: 'Assessment', // Use 'Assessment' instead of 'Submission' to match your existing enum values
  type: 'assessment_submitted',
  title: 'Assessment Submitted',
  message: `${student.name} has submitted an assessment for "${assessment.title}"`,
  link: `/skills/${assessment.skillId._id}/assessments/${assessment._id}/evaluate`,
  additionalData: {
    assessmentId: assessment._id,
    skillId: assessment.skillId._id,
    studentId: req.user.id,
    studentName: student.name,
    submittedAt: new Date()
  }
});
}


    }
    
    res.status(201).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assessment',
      error: error.message
    });
  }
};