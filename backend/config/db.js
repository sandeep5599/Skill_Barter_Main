// Importing required dependencies
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    logger.info('MongoDB Connected');
  } catch (err) {
    console.error("MongoDB connection error:", err);
    logger.error('MongoDB Connection Error:', err);
    process.exit(1); // Exit the process with failure if the DB connection fails
  }
};

module.exports = connectDB; // Export the connection function
