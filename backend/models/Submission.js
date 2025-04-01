// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answersPdfUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['submitted', 'evaluated', 'late'],
      default: 'submitted'
    },
    marks: {
      type: Number,
      min: 0
    },
    feedback: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    evaluatedAt: {
      type: Date
    }
  });
  
  // Create index for faster queries
  submissionSchema.index({ assessmentId: 1 });
  submissionSchema.index({ submittedBy: 1 });
  submissionSchema.index({ status: 1 });
  
  const Submission = mongoose.model('Submission', submissionSchema);
  
  module.exports = Submission;