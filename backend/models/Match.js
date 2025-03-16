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
  // Adding requester and teacher names for easier access
  requesterName: {
    type: String
  },
  teacherName: {
    type: String
  },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  skillName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_requested', 'pending', 'accepted', 'rejected', 'completed', 'rescheduled'],
    default: 'not_requested'
  },
  // Add rejection reason field
  rejectionReason: {
    type: String
  },
  proposedTimeSlots: [{
    startTime: Date,
    endTime: Date,
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Add selected time slot for scheduling/rescheduling
  selectedTimeSlot: {
    startTime: Date,
    endTime: Date,
    selectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    selectedAt: Date
  },
  // Keep track of time slot history
  timeSlotHistory: [{
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposedAt: Date,
    slots: [{
      startTime: Date,
      endTime: Date
    }]
  }],
  // Store status update messages
  statusMessages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
matchSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-populate middleware to get user names when creating/updating a match
matchSchema.pre('save', async function(next) {
  try {
    if (!this.requesterName || !this.teacherName) {
      const User = mongoose.model('User');
      
      // Get requester name if not already set
      if (!this.requesterName && this.requesterId) {
        const requester = await User.findById(this.requesterId).select('name');
        if (requester) {
          this.requesterName = requester.name;
        }
      }
      
      // Get teacher name if not already set
      if (!this.teacherName && this.teacherId) {
        const teacher = await User.findById(this.teacherId).select('name');
        if (teacher) {
          this.teacherName = teacher.name;
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

matchSchema.pre('deleteOne', { document: true, query: false }, async function() {
  console.log('Match being deleted:', this._id);
});

// Add this as a static method
matchSchema.statics.deleteBySkillId = async function(skillId) {
  console.log('Deleting matches for skill ID:', skillId);
  const result = await this.deleteMany({ skillId });
  console.log('Delete result:', result);
  return result;
};

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;