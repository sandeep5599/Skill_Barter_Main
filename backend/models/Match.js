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
