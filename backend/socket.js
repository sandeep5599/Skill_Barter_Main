const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

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
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Join a room with the user's ID for targeted notifications
    socket.join(socket.userId);
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
    
    // Example: Send a welcome message to confirm connection is working
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