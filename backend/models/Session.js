const mongoose = require('mongoose');
const Match = require('./Match');

const sessionSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  meetLink: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: String,
  feedback: {
    fromStudent: {
      rating: Number,
      comment: String
    },
    fromTeacher: {
      rating: Number,
      comment: String
    }
  }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;