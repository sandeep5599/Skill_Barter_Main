// src/services/socketService.js
import { io } from 'socket.io-client';

// Extract the base URL without the /api path
const getBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  // Remove '/api' from the end if it exists
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};

// Create socket instance with proper base URL - BUT DON'T CONNECT YET
let socket = null;

// Heartbeat interval handler
let heartbeatInterval = null;

// Initialize socket connection - we'll only create the socket once
export const initializeSocket = (token) => {
  if (!token) {
    console.warn('No token provided for socket initialization');
    return null;
  }

  // If we already have a socket instance, disconnect it
  if (socket) {
    console.log('Cleaning up existing socket connection');
    clearInterval(heartbeatInterval);
    socket.off();
    socket.disconnect();
  }
  
  // Create a new socket instance
  console.log('Initializing socket with token and URL:', getBaseUrl());
  socket = io(getBaseUrl(), {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    withCredentials: true,
    path: '/socket.io',
    transports: ['polling', 'websocket']
  });
  
  // Set auth token
  socket.auth = { token };
  
  // Add debug listeners
  socket.on('connect', () => {
    console.log('Socket connected successfully!', {
      id: socket.id,
      transport: socket.io.engine.transport.name
    });
    
    // Setup heartbeat to keep user's "last active" status updated
    heartbeatInterval = setInterval(() => {
      if (socket && socket.connected) {
        socket.emit('user:heartbeat');
      }
    }, 60000); // Send heartbeat every minute
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    clearInterval(heartbeatInterval);
  });
  
  // Connect to socket server
  try {
    console.log('Attempting to connect to socket server...');
    socket.connect();
  } catch (error) {
    console.error('Error during socket.connect():', error);
  }
  
  return socket;
};

// Get user online status for multiple users
export const getUsersStatus = (userIds) => {
  if (!socket || !socket.connected) {
    console.warn('Socket not connected, cannot get user statuses');
    return Promise.reject('Socket not connected');
  }
  
  return new Promise((resolve) => {
    // Listen for the response once
    socket.once('users:status', (statuses) => {
      resolve(statuses);
    });
    
    // Emit request for user statuses
    socket.emit('get:users_status', userIds);
    
    // Set timeout in case the server doesn't respond
    setTimeout(() => {
      resolve([]);
    }, 5000);
  });
};

// Function to test different connection approaches
export const troubleshootConnection = (token) => {
  console.log('Running socket connection troubleshooting');
  
  // Try connecting directly without namespace
  const directSocket = io(getBaseUrl(), {
    auth: { token },
    withCredentials: true
  });
  
  directSocket.on('connect', () => {
    console.log('DIRECT CONNECTION SUCCESSFUL!', {
      id: directSocket.id,
      transport: directSocket.io.engine.transport.name
    });
  });
  
  directSocket.on('connect_error', (error) => {
    console.error('Direct connection error:', error.message);
  });
  
  return directSocket;
};

export { socket };

export default { initializeSocket, getUsersStatus, troubleshootConnection };