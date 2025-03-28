const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      trim: true,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    teacherName: {
      type: String,
      trim: true,
      required: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time.',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'canceled' , 'updated'],
      default: 'scheduled',
      index: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return !value || /^https?:\/\/.+$/.test(value); // Ensures it's a valid URL if provided
        },
        message: 'Invalid meeting link URL.',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    prerequisites: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000, // Increased length for detailed notes
    },
    studentRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    teacherRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    studentFeedback: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    teacherFeedback: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    teacherFeedbackDate: {
      type: Date
    }
  },
  {
    timestamps: true, // Auto `createdAt` & `updatedAt`
  }
);

module.exports = mongoose.model('Session', SessionSchema);