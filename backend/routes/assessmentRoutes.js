// routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const assessmentController = require('../controllers/assessmentController');
const submissionController = require('../controllers/submissionController');

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

router.get(
  '/skill/:skillId',
  auth,
  assessmentController.getAssessmentsBySkill
);

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
router.post(
  '/:assessmentId/submit',
  auth,
  socketMiddleware,
  upload.single('answersPdf'),
  submissionController.submitAssessment
);

router.patch(
  '/submission/:submissionId/evaluate',
  auth,
  socketMiddleware,
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


module.exports = router;