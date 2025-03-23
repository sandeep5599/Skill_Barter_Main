const Review = require('../models/Review');
const Session = require('../models/Session');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Students only)
exports.createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { sessionId, teacherId, skillId, rating, reviewText } = req.body;
    const studentId = req.user.id;

    // Check if sessionId is valid
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify session status is completed
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed sessions'
      });
    }

    // Verify the requesting user is the student of this session
    if (session.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this session'
      });
    }

    // Check if student has already reviewed this session
    const existingReview = await Review.findOne({ sessionId, studentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this session'
      });
    }

    // Verify the teacherId matches session's teacherId
    if (session.teacherId.toString() !== teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID does not match session teacher'
      });
    }

    // Create review
    const review = new Review({
      sessionId,
      teacherId,
      studentId,
      skillId,
      rating,
      reviewText: reviewText || '',
      teacherName: session.teacherName || req.body.teacherName
    });

    await review.save();

    // Update the session to indicate student feedback submitted
    session.studentFeedback = true;
    await session.updateOne({ studentFeedback: true });

    // Update teacher's average rating
    const teacherRatingData = await Review.getAverageRating(teacherId);
    await User.findByIdAndUpdate(teacherId, {
      averageRating: teacherRatingData.averageRating,
      reviewCount: teacherRatingData.reviewCount
    });

    return res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error('Error creating review:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get all reviews for a teacher
// @route   GET /api/reviews/teacher/:teacherId
// @access  Public
exports.getTeacherReviews = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Validate teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get reviews with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalReviews = await Review.countDocuments({ teacherId });
    
    const reviews = await Review.find({ teacherId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('studentId', 'name profileImage')
      .populate('skillId', 'name');

    // Get teacher's average rating
    const ratingData = await Review.getAverageRating(teacherId);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        page,
        limit
      },
      ratingData,
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching teacher reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get all reviews for a student
// @route   GET /api/reviews/student/:studentId
// @access  Private (Admin and the student themselves)
exports.getStudentReviews = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Authorization check - only admin or the student themselves
    if (req.user.role !== 'admin' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these reviews'
      });
    }

    // Get reviews with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const totalReviews = await Review.countDocuments({ studentId });
    
    const reviews = await Review.find({ studentId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('teacherId', 'name profileImage')
      .populate('skillId', 'name')
      .populate('sessionId', 'title startTime endTime');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
        page,
        limit
      },
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching student reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get reviews for a specific session
// @route   GET /api/reviews/session/:sessionId
// @access  Private (Participants of the session only)
exports.getSessionReviews = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format'
      });
    }

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Authorization check - only participants of the session
    const userId = req.user.id;
    if (session.teacherId.toString() !== userId && session.studentId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these reviews'
      });
    }

    // Get reviews for the session
    const reviews = await Review.find({ sessionId })
      .populate('studentId', 'name profileImage')
      .populate('teacherId', 'name profileImage');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    console.error('Error fetching session reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Student who created the review)
exports.updateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const reviewId = req.params.id;
    
    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is authorized to update the review
    if (review.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Check for time restriction - can only update within 7 days
    const reviewDate = new Date(review.createdAt);
    const currentDate = new Date();
    const diffDays = Math.ceil((currentDate - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be updated within 7 days of submission'
      });
    }

    // Update fields
    const { rating, reviewText } = req.body;
    
    if (rating) {
      review.rating = rating;
    }
    
    if (reviewText !== undefined) {
      review.reviewText = reviewText;
    }
    
    review.updatedAt = Date.now();
    
    await review.save();

    // Update teacher's average rating
    const teacherRatingData = await Review.getAverageRating(review.teacherId);
    await User.findByIdAndUpdate(review.teacherId, {
      averageRating: teacherRatingData.averageRating,
      reviewCount: teacherRatingData.reviewCount
    });

    return res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    console.error('Error updating review:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Student who created the review or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    // Validate review ID
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID format'
      });
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is authorized to delete the review
    if (review.studentId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Delete the review
    await review.remove();

    // Update session to reflect that feedback is removed
    await Session.findByIdAndUpdate(review.sessionId, {
      studentFeedback: false
    });

    // Update teacher's average rating
    const teacherRatingData = await Review.getAverageRating(review.teacherId);
    await User.findByIdAndUpdate(review.teacherId, {
      averageRating: teacherRatingData.averageRating || 0,
      reviewCount: teacherRatingData.reviewCount || 0
    });

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get reviews statistics for a teacher
// @route   GET /api/reviews/stats/teacher/:teacherId
// @access  Public
exports.getTeacherReviewStats = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Validate teacher ID
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { teacherId: mongoose.Types.ObjectId(teacherId) } },
      { $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Format rating distribution for all 5 stars (even if zero)
    const formattedDistribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const found = ratingDistribution.find(r => r._id === rating);
      return {
        rating,
        count: found ? found.count : 0
      };
    });

    // Get overall stats
    const overallStats = await Review.aggregate([
      { $match: { teacherId: mongoose.Types.ObjectId(teacherId) } },
      { $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          reviewsWithText: { $sum: { $cond: [{ $gt: [{ $strLenCP: '$reviewText' }, 0] }, 1, 0] } }
        }
      }
    ]);

    // Get recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentStats = await Review.aggregate([
      { 
        $match: { 
          teacherId: mongoose.Types.ObjectId(teacherId),
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      { 
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ratingDistribution: formattedDistribution,
        overall: overallStats.length > 0 ? {
          averageRating: overallStats[0].averageRating,
          totalReviews: overallStats[0].totalReviews,
          reviewsWithText: overallStats[0].reviewsWithText,
          textReviewPercentage: overallStats[0].totalReviews > 0 
            ? (overallStats[0].reviewsWithText / overallStats[0].totalReviews) * 100 
            : 0
        } : {
          averageRating: 0,
          totalReviews: 0,
          reviewsWithText: 0,
          textReviewPercentage: 0
        },
        recent30Days: recentStats.length > 0 ? {
          averageRating: recentStats[0].averageRating,
          totalReviews: recentStats[0].totalReviews
        } : {
          averageRating: 0,
          totalReviews: 0
        }
      }
    });
  } catch (err) {
    console.error('Error fetching teacher review stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};


// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
exports.getReviewById = async (req, res) => {
    try {
      const reviewId = req.params.id;
      
      // Validate review ID
      if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID format'
        });
      }
      
      // Find the review
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: review
      });
    } catch (err) {
      console.error('Error fetching review:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
  };
  
  // @desc    Get reviews by user ID
  // @route   GET /api/reviews/user/:userId
  // @access  Public
  exports.getReviewsByUserId = async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      
      // Find all reviews for this user
      const reviews = await Review.find({
        $or: [
          { teacherId: userId },
          { studentId: userId }
        ]
      }).sort({ createdAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
      });
    } catch (err) {
      console.error('Error fetching reviews by user ID:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
  };
  