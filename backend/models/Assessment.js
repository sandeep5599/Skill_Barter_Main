// models/Assessment.js
const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill', // Assuming you have a Skill model
    required: true
  },
  questionsPdfUrl: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
assessmentSchema.index({ createdBy: 1 });
assessmentSchema.index({ skillId: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

