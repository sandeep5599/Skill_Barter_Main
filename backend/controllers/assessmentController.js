// controllers/assessmentController.js
// If Assessment is the default export:
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission'); // if this is in a separate file
const User = require('../models/User');
const uploadService = require('../services/uploadService'); // Implement this for file uploads

// Create a new assessment
exports.createAssessment = async (req, res) => {
  try {
    const { title, description, skillId, dueDate } = req.body;
    const questionsPdf = req.file;
    
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