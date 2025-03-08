const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');

// Import routes
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/userRoutes');
const matchingRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // Added notification routes

// Configure environment
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const setupSocketIO = require('./socket');
const io = setupSocketIO(server);

// Make io available to routes (for sending real-time notifications)
app.set('io', io);

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api', userRoutes);
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', matchingRoutes);
app.use('/api/notifications', notificationRoutes); // Added notifications endpoint

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;