const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'welcome',
      'new_match_request',
      'match_accepted',
      'match_rejected',
      'match_rescheduled',
      'session_proposed',
      'session_rescheduled',
      'session_updated',
      'session_created',
      'session_reminder',
      'session_canceled',
      'session_completed',
      'session_status'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  relatedModel: {
    type: String,
    enum: ['User', 'Match', 'Session']
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);