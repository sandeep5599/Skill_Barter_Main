const Points = require('../models/Points');
const User = require('../models/User');

exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let userPoints = await Points.findOne({ userId });
    
    if (!userPoints) {
      userPoints = new Points({ userId });
    }

    // Check if already checked in today
    if (!userPoints.lastCheckIn || userPoints.lastCheckIn < today) {
      // Calculate streak logic
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last check-in was before yesterday, reset streak
      if (userPoints.lastCheckIn && userPoints.lastCheckIn < yesterday) {
        userPoints.streak = 1; // Reset and start new streak
      } else {
        userPoints.streak += 1; // Continue streak
      }
      
      // Add points and update last check-in
      userPoints.points += 1;
      userPoints.lastCheckIn = new Date();
      
      // Optional: Record in history
      userPoints.checkInHistory.push({ date: new Date() });
      
      await userPoints.save();
      
      return res.json({
        success: true,
        points: userPoints.points,
        streak: userPoints.streak,
        message: `Check-in successful! You now have ${userPoints.points} points.`
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Already checked in today',
      points: userPoints.points,
      streak: userPoints.streak
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, error: error.message });
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