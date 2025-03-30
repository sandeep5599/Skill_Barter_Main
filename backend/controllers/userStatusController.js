


// controllers/userStatusController.js
const UserStatus = require('../models/UserStatus');

// Get user's online status
exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userStatus = await UserStatus.findOne({ userId });
    
    if (!userStatus) {
      return res.status(200).json({
        success: true,
        status: {
          userId,
          isOnline: false,
          lastActive: null
        }
      });
    }
    
    res.status(200).json({
      success: true,
      status: userStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user status',
      error: error.message
    });
  }
};

// Get status for multiple users
exports.getBulkUserStatus = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required'
      });
    }
    
    const statuses = await UserStatus.find({
      userId: { $in: userIds }
    });
    
    const result = userIds.map(id => {
      const foundStatus = statuses.find(status => status.userId.toString() === id);
      
      return foundStatus || {
        userId: id,
        isOnline: false,
        lastActive: null
      };
    });
    
    res.status(200).json({
      success: true,
      statuses: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user statuses',
      error: error.message
    });
  }
};