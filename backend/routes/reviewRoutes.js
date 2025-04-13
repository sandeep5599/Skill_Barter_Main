const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Create a new review
router.post(
  '/',
  auth,
  [
    check('sessionId', 'Session ID is required').not().isEmpty(),
    check('teacherId', 'Teacher ID is required').not().isEmpty(),
    check('skillId', 'Skill ID is required').not().isEmpty(),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 })
  ],
  reviewController.createReview
);

router.get('/test', (req, res) => {
  res.json({ message: 'Reviews routes are working' });
});

// Get all reviews for a teacher
router.get(
  '/teacher/:teacherId',
  reviewController.getTeacherReviews
);

// Get reviews for a student (protected)
router.get(
  '/student/:studentId',
  auth,
  reviewController.getStudentReviews
);

// Get reviews for a specific session (protected)
router.get(
  '/session/:sessionId',
  auth,
  reviewController.getSessionReviews
);

// Update a review
router.put(
  '/:id',
  [
    auth,
    [
      check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 })
    ]
  ],
  reviewController.updateReview
);

// Delete a review
router.delete(
  '/:id',
  auth,
  reviewController.deleteReview
);

// Get review statistics for a teacher
router.get(
  '/stats/teacher/:teacherId',
  reviewController.getTeacherReviewStats
);


// Public routes
router.get('/:id', reviewController.getReviewById);
router.get('/user/:userId', reviewController.getReviewsByUserId);

router.post(
  '/:sessionId/teacher-feedback', 
  auth,
  reviewController.submitTeacherFeedback
);

module.exports = router;