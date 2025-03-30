const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const {google} = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const matchingRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pointsRoutes = require('./routes/pointRoutes'); // Added notification routes
const reviewRoutes = require('./routes/reviewRoutes');
const searchRoutes = require('./routes/searchRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes'); // New assessment routes
const userStatusRoutes = require('./routes/userStatusRoutes'); // New user status routes

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

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
const assessmentUploadsDir = path.join(uploadDir, 'assessments');
const submissionUploadsDir = path.join(uploadDir, 'submissions');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(assessmentUploadsDir)) {
  fs.mkdirSync(assessmentUploadsDir);
}
if (!fs.existsSync(submissionUploadsDir)) {
  fs.mkdirSync(submissionUploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine correct destination based on file type
    if (req.baseUrl.includes('assessments') && req.path === '/upload') {
      cb(null, assessmentUploadsDir);
    } else if (req.baseUrl.includes('assessments') && req.path.includes('/submit')) {
      cb(null, submissionUploadsDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for assessments and submissions'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Make uploads available statically (with proper security)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/points', pointsRoutes);
app.use('/api/matches', matchingRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/reviews', reviewRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/assessments', assessmentRoutes); // New assessment routes
app.use('/api/user-status', userStatusRoutes); // New user status routes

// Providing upload middleware to be used in routes
app.set('upload', upload);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const {tokens} = await oauth2Client.getToken(req.query.code);
  console.log("Refresh token:", tokens.refresh_token);
  res.send('Auth successful! Check console for refresh token.');
});

// Debug route to check socket.io status
app.get('/api/socket-test', (req, res) => {
  const io = req.app.get('io');
  const connectedSockets = Array.from(io.sockets.sockets).map(socket => ({
    id: socket[0],
    handshake: {
      address: socket[1].handshake.address,
      time: socket[1].handshake.time,
      auth: socket[1].handshake.auth ? 'Present' : 'None',
      query: socket[1].handshake.query
    }
  }));
  
  res.json({
    status: 'Socket.IO is running',
    connectedClients: io.engine.clientsCount,
    socketDetails: connectedSockets,
    serverConfig: {
      path: io.path(),
      corsOrigin: process.env.CLIENT_URL || 'http://localhost:3000',
      port: process.env.PORT || 4000
    }
  });
});

// Add this to server.js before your existing error handlers
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  next(err);
});

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

const PORT = process.env.PORT || 4000;
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