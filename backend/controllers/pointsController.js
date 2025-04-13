const Points = require('../models/Points');
const User = require('../models/User');

exports.checkIn = async (req, res) => {
  console.log("Check-in request received");
  console.log("User ID from request:", req.user?.id); // Debug log to see if user ID exists
  
  try {
    // Check if user ID exists
    if (!req.user || !req.user.id) {
      console.log("Missing user ID in request");
      return res.status(400).json({
        success: false,
        message: 'Authentication error: User ID missing',
        details: 'The authentication middleware did not provide a user ID'
      });
    }
    
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if Points model is defined
    if (!Points) {
      console.log("Points model is not defined");
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        details: 'Points model is not properly defined'
      });
    }
    
    // Add more detailed error handling for database operation
    let userPoints;
    try {
      userPoints = await Points.findOne({ userId });
      console.log("Found user points:", userPoints ? "yes" : "no");
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: dbError.message
      });
    }
    
    if (!userPoints) {
      console.log("Creating new user points record");
      userPoints = new Points({ 
        userId,
        points: 0,
        streak: 0,
        lastCheckIn: null,
        checkInHistory: []
      });
    }

    // Check if already checked in today
    if (!userPoints.lastCheckIn || new Date(userPoints.lastCheckIn) < today) {
      // Calculate streak logic
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      console.log("Last check-in:", userPoints.lastCheckIn);
      console.log("Today:", today);
      console.log("Yesterday:", yesterday);
      
      // If last check-in was before yesterday, reset streak
      if (userPoints.lastCheckIn && new Date(userPoints.lastCheckIn) < yesterday) {
        console.log("Resetting streak (last check-in was before yesterday)");
        userPoints.streak = 1; // Reset and start new streak
      } else {
        console.log("Continuing streak");
        userPoints.streak = (userPoints.streak || 0) + 1; // Continue streak with fallback
      }
      
      // Add points and update last check-in
      userPoints.points = (userPoints.points || 0) + 1;
      userPoints.lastCheckIn = new Date();
      
      // Ensure checkInHistory exists
      if (!userPoints.checkInHistory) {
        userPoints.checkInHistory = [];
      }
      
      // Optional: Record in history
      userPoints.checkInHistory.push({ date: new Date() });
      
      try {
        await userPoints.save();
        console.log("Saved user points successfully");
      } catch (saveError) {
        console.error("Error saving user points:", saveError);
        return res.status(500).json({
          success: false,
          message: 'Error saving check-in data',
          details: saveError.message
        });
      }
      
      return res.json({
        success: true,
        pointsEarned: 1,
        points: userPoints.points,
        streak: userPoints.streak,
        message: `Check-in successful! You now have ${userPoints.points} points.`
      });
    }

    console.log("User already checked in today");
    return res.status(400).json({
      success: false,
      message: 'Already checked in today',
      points: userPoints.points,
      streak: userPoints.streak
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during check-in process',
      details: error.message 
    });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Points.find()
      .sort('-points')
      .limit(10)
      .populate('userId', 'name avatar email country') // Add country to the populated fields
      .lean();
    
    // Format the response for frontend consumption
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId._id,
      name: entry.userId.name,
      avatar: entry.userId.avatar,
      country: entry.userId.country || 'Not specified', // Include country in the response
      points: entry.points,
      streak: entry.streak
    }));
    
    // console.log('Formatted Leaderboard:', formattedLeaderboard); // Debugging line
    res.json({
      success: true,
      leaderboard: formattedLeaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
// exports.getLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await Points.find()
//       .sort('-points')
//       .limit(10)
//       .populate('userId', 'name avatar email')
//       .lean();
    
//     // Format the response for frontend consumption
//     const formattedLeaderboard = leaderboard.map((entry, index) => ({
//       rank: index + 1,
//       userId: entry.userId._id,
//       name: entry.userId.name,
//       avatar: entry.userId.avatar,
//       points: entry.points,
//       streak: entry.streak
//     }));
    
//     res.json({
//       success: true,
//       leaderboard: formattedLeaderboard
//     });
//   } catch (error) {
//     console.error('Leaderboard error:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// Get user's current points and streak
exports.getUserPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const userPoints = await Points.findOne({ userId });
    
    if (!userPoints) {
      return res.json({
        success: true,
        points: 0,
        streak: 0,
        lastCheckIn: null
      });
    }
    
    res.json({
      success: true,
      points: userPoints.points,
      streak: userPoints.streak,
      lastCheckIn: userPoints.lastCheckIn
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user's rank in the leaderboard
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get the user's points entry
    const userPoints = await Points.findOne({ userId });
    
    if (!userPoints) {
      return res.json({
        success: true,
        rank: null,
        totalUsers: await Points.countDocuments(),
        message: "User has not earned any points yet"
      });
    }
    
    // Count how many users have more points than this user
    const higherRankedUsers = await Points.countDocuments({
      points: { $gt: userPoints.points }
    });
    
    // User's rank is the number of users with more points + 1
    const rank = higherRankedUsers + 1;
    
    // Get total number of users with points for percentile calculation
    const totalUsers = await Points.countDocuments();
    
    // Calculate percentile (lower is better)
    const percentile = totalUsers > 0 ? Math.round((rank / totalUsers) * 100) : null;
    
    res.json({
      success: true,
      rank,
      totalUsers,
      percentile,
      points: userPoints.points,
      streak: userPoints.streak
    });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};