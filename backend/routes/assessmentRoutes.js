// routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const assessmentController = require('../controllers/assessmentController');
const submissionController = require('../controllers/submissionController');
const Assessment = require('../models/Assessment'); 
const Submission = require('../models/Submission');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Socket middleware to pass socket ID to controllers
const socketMiddleware = (req, res, next) => {
  req.socketId = req.headers['x-socket-id'];
  console.log('Socket ID:', req.socketId);
  next();
};

// Assessment routes
router.post(
  '/create',
  auth,
  socketMiddleware,
  upload.single('questionsPdf'),
  assessmentController.createAssessment
);

// 
router.get(
  '/skill/:skillId',
  auth,
  assessmentController.getAssessmentsBySkill
);
// routes/assessmentRoutes.js

// Add this route to your existing assessment routes
router.get(
  '/general-stats',
  auth,
  assessmentController.getGeneralStats
);


router.get(
  '/:skillId/assessment-stats',
  auth,
  assessmentController.getAssessmentStats
);

router.get('/pending-submissions', auth, async (req, res) => {
  try {
    // Find all submissions with status "submitted" that haven't been evaluated yet
    const pendingSubmissions = await Submission.find({
      status: "submitted"
    })
    .populate('assessmentId', 'title description')
    .populate('submittedBy', 'name email')
    .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      submissions: pendingSubmissions
    });
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending submissions',
      error: error.message
    });
  }
});

// If you need it filtered by skill ID
router.get('/:skillId/pending-submissions', auth, async (req, res) => {
  try {
    const { skillId } = req.params;
    
    // Find assessments for this skill
    const assessments = await Assessment.find({ skillId });
    const assessmentIds = assessments.map(assessment => assessment._id);
    
    // Find submissions for these assessments
    const pendingSubmissions = await Submission.find({
      assessmentId: { $in: assessmentIds },
      status: "submitted"
    })
    .populate('assessmentId', 'title description')
    .populate('submittedBy', 'name email')
    .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      submissions: pendingSubmissions
    });
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending submissions',
      error: error.message
    });
  }
});



// Add this route to get a single assessment by ID
router.get('/:assessmentId', auth, async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findById(assessmentId)
      .populate('skillId', 'title category');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessment',
      error: error.message
    });
  }
});

router.get('/pending-evaluation', auth, async (req, res) => {
  try {
    // Find skills owned by this user
    const userSkills = await Skill.find({ owner: req.user.userId }).select('_id name');
    
    if (!userSkills.length) {
      return res.json({ success: true, assessments: [] });
    }
    
    const skillIds = userSkills.map(skill => skill._id);
    
    // Find assessments for these skills that have been submitted but not evaluated
    const pendingAssessments = await Assessment.find({
      skillId: { $in: skillIds },
      submitted: true,
      evaluated: false
    }).populate('submittedBy', 'name')
     .populate('skillId', 'name');
    
    // Format the response
    const formattedAssessments = pendingAssessments.map(assessment => ({
      _id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      studentId: assessment.submittedBy._id,
      studentName: assessment.submittedBy.name,
      skillId: assessment.skillId._id,
      skillName: assessment.skillId.name,
      submittedAt: assessment.submittedAt
    }));
    
    res.json({ success: true, assessments: formattedAssessments });
  } catch (error) {
    console.error('Error fetching pending assessments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this route BEFORE the '/:assessmentId' route


router.get(
  '/created',
  auth,
  assessmentController.getCreatedAssessments
);

router.get(
  '/pending',
  auth,
  assessmentController.getPendingAssessments
);

// Submission routes
// router.post(
//   '/:assessmentId/submit',
//   auth,
//   socketMiddleware,
//   upload.single('answersPdf'),
//   submissionController.submitAssessment
// );

router.post(
  '/submit',
  socketMiddleware,
  auth,
  upload.single('answersPdf'),
  submissionController.submitAssessment
);

router.patch(
  '/submission/:submissionId/evaluate',
  auth,
  submissionController.evaluateSubmission
);

router.get(
  '/:assessmentId/submissions',
  auth,
  submissionController.getSubmissionsByAssessment
);

router.get(
  '/submissions/learner',
  auth,
  submissionController.getLearnerSubmissions
);

router.get(
  '/available',
  auth,
  assessmentController.getAvailableAssessments
);

// Add this endpoint to your routes or update the existing one to ensure 
// it's properly fetching assessments for a specific skill

// In your assessmentRoutes.js file:
router.get('/skills/:skillId/assessments', auth, async (req, res) => {
  try {
    const { skillId } = req.params;
    
    // Find all assessments for this skill that are active
    const assessments = await Assessment.find({
      skillId: skillId,
      isActive: true // Only get active assessments
    }).populate('skillId', 'title category'); // Populate skill details
    
    console.log(`Found ${assessments.length} assessments for skill ${skillId}`);
    
    res.status(200).json({
      success: true,
      assessments
    });
  } catch (error) {
    console.error('Error fetching skill assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments',
      error: error.message
    });
  }
});

router.get('/skills/:skillId/assessment-stats', auth, assessmentController.getAssessmentStats);

// Also make sure your general assessments endpoint is working:
router.get('/', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({
      isActive: true
    }).populate('skillId', 'title category');
    
    res.status(200).json({
      success: true,
      assessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assessments',
      error: error.message
    });
  }
});

// Add this route for getting a single submission
router.get('/submission/:submissionId', auth, async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await Submission.findById(submissionId)
      .populate('assessmentId', 'title description')
      .populate('submittedBy', 'name email');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
});

module.exports = router;



// // routes/assessmentRoutes.js
// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const assessmentController = require('../controllers/assessmentController');
// const multer = require('multer');

// // Configure multer for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     // Accept only PDF files
//     if (file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF files are allowed'));
//     }
//   }
// });

// // Socket middleware to pass socket ID to controllers
// const socketMiddleware = (req, res, next) => {
//   req.socketId = req.headers['x-socket-id'];
//   console.log('Socket ID:', req.socketId);
//   next();
// };

// // Assessment management routes
// router.post('/create', auth, socketMiddleware, upload.single('questionsPdf'), assessmentController.createAssessment);
// router.get('/skill/:skillId', auth, assessmentController.getAssessmentsBySkill);

// // Define the getAssessmentById route directly since it might be missing in the controller
// router.get('/:assessmentId', auth, async (req, res) => {
//   try {
//     const { assessmentId } = req.params;
    
//     const assessment = await Assessment.findById(assessmentId)
//       .populate('skillId', 'title category');
    
//     if (!assessment) {
//       return res.status(404).json({
//         success: false,
//         message: 'Assessment not found'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       assessment
//     });
//   } catch (error) {
//     console.error('Error fetching assessment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching assessment',
//       error: error.message
//     });
//   }
// });

// // Add these when the controller methods are implemented
// // router.put('/:assessmentId', auth, assessmentController.updateAssessment);
// // router.delete('/:assessmentId', auth, assessmentController.deleteAssessment);

// // Assessment stats and retrieval routes
// router.get('/:skillId/assessment-stats', auth, assessmentController.getAssessmentStats);
// router.get('/created', auth, assessmentController.getCreatedAssessments);
// router.get('/pending', auth, assessmentController.getPendingAssessments);
// router.get('/available', auth, assessmentController.getAvailableAssessments);

// // Submission routes
// router.post('/submit', auth, socketMiddleware, upload.single('answersPdf'), assessmentController.submitAssessment);

// // These should only be uncommented when the methods are implemented
// // router.get('/user/:userId/submissions', auth, assessmentController.getUserSubmissions);
// // router.get('/submission/:submissionId', auth, assessmentController.getSubmission);
// router.get('/submissions/learner', auth, assessmentController.getLearnerSubmissions);

// // Evaluation routes
// router.post('/evaluate/:submissionId', auth, socketMiddleware, assessmentController.evaluateSubmission);
// // router.get('/skill/:skillId/submissions', auth, assessmentController.getSubmissionsBySkill);
// // router.get('/submissions', auth, assessmentController.getAllSubmissions);
// router.get('/:assessmentId/submissions', auth, assessmentController.getSubmissionsByAssessment);

// // Import the model at the top
// const Assessment = require('../models/Assessment');

// module.exports = router;