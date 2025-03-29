// controllers/searchController.js
const User = require('../models/User');
const Skill = require('../models/Skill');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Search skills controller
exports.searchSkills = async (req, res) => {
  try {
    const { query, skillLevel, sortBy = 'rating' } = req.query;
    
    // Build base query
    const searchQuery = {};
    
    // Add skill level filter if provided
    if (skillLevel && ['Beginner', 'Intermediate', 'Expert'].includes(skillLevel)) {
      searchQuery.proficiencyLevel = skillLevel;
    }
    
    // Only include skills that are being taught
    searchQuery.isTeaching = true;
    
    // Search by skill name or teacher name
    if (query) {
      // First, try to find users whose names match the query
      const users = await User.find({
        name: { $regex: query, $options: 'i' }
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      // Then create a query that matches either skill name or teacher ID
      searchQuery.$or = [
        { skillName: { $regex: query, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }
    
    // Find skills matching the criteria
    const skills = await Skill.find(searchQuery)
      .populate('userId', 'name email')
      .lean();
    
    // Get ratings for each teacher
    const results = await Promise.all(skills.map(async (skill) => {
      const { averageRating, reviewCount } = await Review.getAverageRating(skill.userId._id);
      
      return {
        ...skill,
        teacherName: skill.userId.name,
        teacherEmail: skill.userId.email,
        teacherId: skill.userId._id,
        averageRating: averageRating || 0,
        reviewCount: reviewCount || 0
      };
    }));
    
    // Sort results based on rating (descending)
    const sortedResults = results.sort((a, b) => b.averageRating - a.averageRating);
    
    res.json({
      success: true,
      count: sortedResults.length,
      data: sortedResults
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred during search',
      error: error.message
    });
  }
};

// Get teacher profile with skills and ratings
exports.getTeacherProfile = async (req, res) => {
  try {
    const { teacherId } = req.params;
    
    // Validate teacherId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher ID format'
      });
    }
    
    // Get teacher information
    const teacher = await User.findById(teacherId).select('-password');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }
    
    // Get teacher's teaching skills
    const skills = await Skill.find({
      userId: teacherId,
      isTeaching: true
    });
    
    // Get teacher's average rating
    const { averageRating, reviewCount } = await Review.getAverageRating(teacherId);
    
    // Get recent reviews
    const reviews = await Review.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('studentId', 'name')
      .populate('skillId', 'skillName');
    
    res.json({
      success: true,
      data: {
        teacher,
        skills,
        stats: {
          averageRating,
          reviewCount
        },
        recentReviews: reviews
      }
    });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching teacher profile',
      error: error.message
    });
  }
};