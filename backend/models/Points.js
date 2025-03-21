// Points Schema (MongoDB model)
const mongoose = require('mongoose');

const PointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date,
    default: null
  },
  // Optional: Track check-in history
  checkInHistory: [{
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Add index for leaderboard queries
PointsSchema.index({ points: -1 });

module.exports = mongoose.model('Points', PointsSchema);