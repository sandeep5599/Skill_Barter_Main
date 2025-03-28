const mongoose = require('mongoose');

const TeacherFeedbackSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TeacherFeedback', TeacherFeedbackSchema);

module.exports = mongoose.model('TeacherFeedback', TeacherFeedbackSchema);