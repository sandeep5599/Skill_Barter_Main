// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Search for skills - public route
router.get('/skills', searchController.searchSkills);

// Get teacher profile - public route
router.get('/teacher/:teacherId', searchController.getTeacherProfile);

module.exports = router;