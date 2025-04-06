/**
 * Service for creating and sending notifications
 */
const Notification = require('../models/Notification');

const createNotification = async (data) => {
  try {
    const { userId, type, title, message, link = null,relatedId, relatedModel = null, additionalData = {} } = data;
    
    // Check if a notification with the same userId, type, and title already exists
    const existingNotification = await Notification.findOne({
      userId,
      type,
      title
    });
    
    if (existingNotification) {
      // Return the existing notification instead of creating a new one
      return existingNotification;
    }
    
    // Create a new notification if one doesn't exist
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      link,
      relatedId,
      relatedModel,
      data: additionalData
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create a notification and emit it to the user via Socket.IO
 */
const sendNotification = async (io, data) => {
  try {
    const notification = await createNotification(data);
    
    // Emit to specific user's room
    if (io) {
      io.to(data.userId.toString()).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNotification
};