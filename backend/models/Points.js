const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PointHistorySchema = new Schema({
  points: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['Check-in', 'Session Completion', 'Assessment Score', 'Achievement', 'Other']
  },
  assessmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assessment',
    required: false
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const CheckInHistorySchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  }
});

const PointsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
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
    type: Date
  },
  checkInHistory: [CheckInHistorySchema],
  pointHistory: [PointHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model('Points', PointsSchema);