const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessions');
const userRoutes = require('./routes/userRoutes');
const matchingRoutes = require('./routes/matchRoutes'); // ✅ Include Matching Routes

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // Connect Database
// connectDB();

// // Define Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api', userRoutes);
// app.use('/api/skills', require('./routes/skills'));
// app.use('/api/matches', matchingRoutes); // ✅ Add Matching Routes

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Configure environment
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Route imports
const routes = {
  auth: require('./routes/authRoutes'),
  sessions: require('./routes/sessions'),
  users: require('./routes/userRoutes'),
  skills: require('./routes/skills'),
  matches: require('./routes/matchRoutes')
};

// Route registration
app.use('/api/auth', routes.auth);
app.use('/api/sessions', routes.sessions);
app.use('/api', routes.users);
app.use('/api/skills', routes.skills);
app.use('/api/matches', routes.matches);

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
const server = app.listen(PORT, () => {
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