const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session ID is required']
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required']
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
    required: [true, 'Skill ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewText: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review text cannot exceed 1000 characters']
  },
  teacherName: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient querying
ReviewSchema.index({ sessionId: 1 });
ReviewSchema.index({ teacherId: 1 });
ReviewSchema.index({ studentId: 1 });
ReviewSchema.index({ skillId: 1 });

// Static method to get average rating for a teacher
ReviewSchema.statics.getAverageRating = async function(teacherId) {
  try {
    console.log('Calculating average rating for teacherId:', teacherId);

    // Validate teacherId
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      console.error('Invalid teacherId format:', teacherId);
      return { averageRating: 0, reviewCount: 0 };
    }

    const obj = await this.aggregate([
      {
        $match: { 
          // Use mongoose.Types.ObjectId constructor correctly
          teacherId: new mongoose.Types.ObjectId(teacherId) 
        }
      },
      {
        $group: {
          _id: '$teacherId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    console.log('Average rating calculation result:', obj);

    // Return result or default values
    const result = obj[0] || { averageRating: 0, reviewCount: 0 };
    
    // Round average rating to 2 decimal places
    result.averageRating = result.averageRating 
      ? Number(result.averageRating.toFixed(2)) 
      : 0;

    return result;
  } catch (error) {
    console.error('Error in getAverageRating:', error);
    return { averageRating: 0, reviewCount: 0 };
  }
};

module.exports = mongoose.model('Review', ReviewSchema);