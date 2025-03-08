import { io } from 'socket.io-client';

// Create socket instance with autoConnect set to false
// We'll manually connect after authentication
export const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Optional: Track socket connection state
export const initializeSocket = (token) => {
  if (!token) return;
  
  // Set auth token
  socket.auth = { token };
  
  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }
  
  // Setup event handlers
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  return () => {
    socket.off('connect');
    socket.off('connect_error');
    socket.off('disconnect');
    socket.disconnect();
  };
};

export default { socket, initializeSocket };