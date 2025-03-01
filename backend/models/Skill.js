const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillName: {
    type: String,
    required: true
  },
  proficiencyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    required: true
  },
  isTeaching: {
    type: Boolean,
    required: true
  },
  isLearning: {
    type: Boolean,
    required: true
  },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);