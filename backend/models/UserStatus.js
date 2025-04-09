// models/UserStatus.js
const mongoose = require('mongoose');

const userStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create index for faster queries
// userStatusSchema.index({ userId: 1 });
userStatusSchema.index({ isOnline: 1 });

const UserStatus = mongoose.model('UserStatus', userStatusSchema);

module.exports = UserStatus;