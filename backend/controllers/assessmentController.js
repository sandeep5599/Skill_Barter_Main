// controllers/assessmentController.js
// If Assessment is the default export:
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission'); // if this is in a separate file
const User = require('../models/User');
const uploadService = require('../services/uploadService'); // Implement this for file uploads
const { sendNotification } = require('../services/notificationService');

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {

    const assessmentData = JSON.parse(req.body.assessmentData);
    const { title, description, skillId, dueDate } = assessmentData;
    const questionsPdf = req.file;
    
    // console.log("Parsed assessment data:", assessmentData); // Debug
    // console.log("Request file:", req.file);  
    if (!questionsPdf) {
      return res.status(400).json({ success: false, message: 'Questions PDF file is required' });
    }
    
    // Upload PDF to storage service
    const questionsPdfUrl = await uploadService.uploadFile(questionsPdf, 'assessments');
    
    // Create new assessment
    const assessment = new Assessment({
      title,
      description,
      createdBy: req.user.id,
      skillId,
      questionsPdfUrl,
      dueDate: dueDate ? new Date(dueDate) : null
    });
    
    await assessment.save();
    
    // Emit socket event for notifications
    // Get all users learning this skill to notify them
    const learners = await User.find({
      // Assuming you have a reference to which users are learning which skills
      learningSkills: { $in: [skillId] }
    }).select('_id');
    
    const targetUsers = learners.map(learner => learner._id.toString());
    
    // If socket.io instance is available in req
    if (req.app.get('io')) {
      const io = req.app.get('io');
      const socket = io.sockets.sockets.get(req.socketId);
      
      if (socket) {
        socket.emit('assessment:created', {
          _id: assessment._id,
          title: assessment.title,
          targetUsers
        });
      }
    }
    
    res.status(201).json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assessment',
      error: error.message
    });
  }
};

// Get all assessments for a skill
exports.getAssessmentsBySkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const assessments = await Assessment.find({ skillId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments',
      error: error.message
    });
  }
};

// Get assessments created by user
exports.getCreatedAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('skillId', 'name');
    
    res.status(200).json({
      success: true,
      assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching created assessments',
      error: error.message
    });
  }
};

// Get pending assessments for a learner
exports.getPendingAssessments = async (req, res) => {
  try {
    // Get skills the user is learning
    // This depends on your existing schema structure
    const userLearningSkills = []; // Replace with actual query
    
    const assessments = await Assessment.find({
      skillId: { $in: userLearningSkills },
      isActive: true
    })
    .sort({ dueDate: 1 })
    .populate('createdBy', 'name')
    .populate('skillId', 'name');
    
    // Filter out already submitted ones
    const submittedAssessmentIds = await Submission.find({
      submittedBy: req.user.id
    }).distinct('assessmentId');
    
    const pendingAssessments = assessments.filter(
      assessment => !submittedAssessmentIds.some(
        id => id.toString() === assessment._id.toString()
      )
    );
    
    res.status(200).json({
      success: true,
      assessments: pendingAssessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending assessments',
      error: error.message
    });
  }
};

exports.getAssessmentStats = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id; // Assuming auth middleware adds user to req
    
    // Get total assessments for this skill
    const totalAssessments = await Assessment.countDocuments({ 
      skillId: skillId,
      isActive: true 
    });
    
    // Get pending submissions for this skill where user is the creator
    const pendingSubmissions = await Submission.countDocuments({
      assessmentId: { $in: await Assessment.find({ skillId, createdBy: userId }).distinct('_id') },
      evaluatedAt: null // Not yet evaluated
    });
    
    // Get completed submissions for this skill where user is the creator
    const completedSubmissions = await Submission.countDocuments({
      assessmentId: { $in: await Assessment.find({ skillId, createdBy: userId }).distinct('_id') },
      evaluatedAt: { $ne: null } // Has been evaluated
    });
    
    // Calculate average score from completed submissions
    let averageScore = 0;
    if (completedSubmissions > 0) {
      const submissions = await Submission.find({
        assessmentId: { $in: await Assessment.find({ skillId, createdBy: userId }).distinct('_id') },
        evaluatedAt: { $ne: null },
        score: { $exists: true }
      });
      
      const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
      averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;
    }
    
    res.status(200).json({
      success: true,
      stats: {
        totalAssessments,
        pendingSubmissions,
        completedSubmissions,
        averageScore
      }
    });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment statistics',
      error: error.message
    });
  }
};
// Evaluate a submission
exports.evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback, score, passed } = req.body;
    
    const submission = await Submission.findById(submissionId)
      .populate({
        path: 'assessmentId',
        populate: { path: 'skillId', select: 'title' }
      })
      .populate('submittedBy', 'name');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Update submission with evaluation
    submission.evaluatedBy = req.user.id;
    submission.evaluatedAt = new Date();
    submission.feedback = feedback;
    submission.score = score;
    submission.passed = passed;
    
    await submission.save();
    
    // Send notification to the student
    if (req.app.get('io')) {
      await sendNotification(req.app.get('io'), {
        userId: submission.submittedBy._id, // The student's user ID
        type: 'assessment_evaluated',
        title: 'Assessment Evaluated',
        message: `Your submission for "${submission.assessmentId.title}" has been evaluated`,
        link: `/skills/${submission.assessmentId.skillId._id}/assessments/${submission.assessmentId._id}/result`,
        additionalData: {
          assessmentId: submission.assessmentId._id,
          skillId: submission.assessmentId.skillId._id,
          passed: submission.passed,
          score: submission.score
        }
      });
    }
    
    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error evaluating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error evaluating submission',
      error: error.message
    });
  }
};

// Get submissions for an assessment
exports.getSubmissionsByAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const submissions = await Submission.find({ assessmentId })
      .populate('submittedBy', 'name')
      .populate('evaluatedBy', 'name')
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// Get submissions made by a learner
exports.getLearnerSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ submittedBy: req.user.id })
      .populate({
        path: 'assessmentId',
        populate: { path: 'skillId', select: 'title' }
      })
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Error fetching learner submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// In assessmentController.js
exports.getAvailableAssessments = async (req, res) => {
  try {
    const availableAssessments = await Assessment.find({ 
      isPublished: true, 
      // Add other conditions as needed
    });
    
    // Change this line to return an object with assessments property
    res.status(200).json({ success: true, assessments: availableAssessments });
  } catch (error) {
    console.error('Error fetching available assessments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

