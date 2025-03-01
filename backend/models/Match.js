const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {  // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  
  skillName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_requested', 'pending', 'accepted', 'rejected', 'completed'],
    default: 'not_requested'
  },
  proposedTimeSlots: [{
    startTime: Date,
    endTime: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
