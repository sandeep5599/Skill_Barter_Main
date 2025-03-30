/ socketController.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const UserStatus = require('./models/UserStatus');

const setupSocketIO = (server) => {
  // Create Socket.IO server with proper CORS config matching your Express setup
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io', // Ensure the path matches the default expected by client
    serveClient: false, // Don't serve client files
    pingTimeout: 30000, // Increase timeouts for better stability
    pingInterval: 25000
  });
  
  // Track connected users
  const connectedUsers = new Map();
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Add user info to socket
      socket.userId = user._id.toString();
      socket.user = {
        _id: user._id.toString(),
        username: user.username || user.name
      };
      
      console.log(`Socket auth successful for user: ${socket.userId}`);
      next();
    } catch (error) {
      console.error(`Socket auth error: ${error.message}`);
      next(new Error(`Authentication error: ${error.message}`));
    }
  });
  
  // Handle main connection event
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId}`);
    
    // Update user's online status
    try {
      await UserStatus.findOneAndUpdate(
        { userId },
        { 
          userId,
          isOnline: true,
          lastActive: new Date()
        },
        { upsert: true, new: true }
      );
      
      // Add to connected users map
      connectedUsers.set(userId, socket.id);
      
      // Broadcast user's online status to relevant users
      // This could be optimized to only notify friends or contacts
      socket.broadcast.emit('user:status_change', {
        userId,
        isOnline: true,
        lastActive: new Date()
      });
    } catch (error) {
      console.error(`Error updating online status: ${error.message}`);
    }
    
    // Join a room with the user's ID for targeted notifications
    socket.join(userId);
    
    // Handle assessment notifications
    socket.on('assessment:created', (assessmentData) => {
      // Notify relevant users about new assessment
      if (assessmentData.targetUsers && Array.isArray(assessmentData.targetUsers)) {
        assessmentData.targetUsers.forEach(targetUserId => {
          if (connectedUsers.has(targetUserId)) {
            io.to(targetUserId).emit('notification', {
              _id: Date.now().toString(),
              type: 'assessment',
              title: 'New Assessment',
              message: `New assessment: ${assessmentData.title}`,
              data: { assessmentId: assessmentData._id },
              read: false,
              createdAt: new Date()
            });
          }
        });
      }
    });
    
    socket.on('assessment:submitted', (submissionData) => {
      // Notify the assessment creator about new submission
      const creatorId = submissionData.creatorId;
      if (connectedUsers.has(creatorId)) {
        io.to(creatorId).emit('notification', {
          _id: Date.now().toString(),
          type: 'submission',
          title: 'Assessment Submitted',
          message: `${submissionData.submitterName} submitted an assessment`,
          data: { 
            assessmentId: submissionData.assessmentId,
            submissionId: submissionData._id
          },
          read: false,
          createdAt: new Date()
        });
      }
    });
    
    socket.on('assessment:evaluated', (evaluationData) => {
      // Notify the learner about their evaluation
      const learnerId = evaluationData.learnerId;
      if (connectedUsers.has(learnerId)) {
        io.to(learnerId).emit('notification', {
          _id: Date.now().toString(),
          type: 'evaluation',
          title: 'Assessment Evaluated',
          message: `Your assessment "${evaluationData.title}" has been evaluated`,
          data: { 
            assessmentId: evaluationData.assessmentId,
            submissionId: evaluationData.submissionId,
            marks: evaluationData.marks
          },
          read: false,
          createdAt: new Date()
        });
      }
    });
    
    // User requested status of other users
    socket.on('get:users_status', async (userIds) => {
      try {
        if (!Array.isArray(userIds)) return;
        
        const statuses = await UserStatus.find({
          userId: { $in: userIds }
        });
        
        socket.emit('users:status', statuses);
      } catch (error) {
        console.error(`Error fetching user statuses: ${error.message}`);
      }
    });
    
    // Handle heartbeat to update last active timestamp
    socket.on('user:heartbeat', async () => {
      try {
        await UserStatus.findOneAndUpdate(
          { userId },
          { lastActive: new Date() }
        );
      } catch (error) {
        console.error(`Error updating heartbeat: ${error.message}`);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      
      // Remove from connected users map
      connectedUsers.delete(userId);
      
      // Update user's online status with a small delay
      // This prevents flashing online/offline for brief disconnections
      setTimeout(async () => {
        // Check if user has reconnected
        if (!connectedUsers.has(userId)) {
          try {
            await UserStatus.findOneAndUpdate(
              { userId },
              { 
                isOnline: false,
                lastActive: new Date()
              }
            );
            
            // Broadcast user's offline status
            socket.broadcast.emit('user:status_change', {
              userId,
              isOnline: false,
              lastActive: new Date()
            });
          } catch (error) {
            console.error(`Error updating offline status: ${error.message}`);
          }
        }
      }, 5000);
    });
    
    // Welcome message
    socket.emit('notification', {
      _id: Date.now().toString(),
      title: 'Connected',
      message: 'You are now connected to real-time notifications',
      read: false,
      createdAt: new Date()
    });
  });
  
  // Add a diagnostic endpoint for the io object
  io.on('connection:diagnostic', (socket) => {
    console.log('Diagnostic connection received');
    socket.emit('diagnostic:result', {
      success: true,
      socketId: socket.id,
      namespaces: Object.keys(io._nsps).map(nsp => ({
        name: nsp,
        clients: io.of(nsp).sockets.size
      }))
    });
  });
  
  return io;
};

module.exports = setupSocketIO;