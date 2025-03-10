import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { initializeSocket } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  
  // Load user & token from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser) setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          localStorage.removeItem("user"); // Remove corrupted data
        }
      }
      
      if (storedToken && !socketInitialized) {
        setToken(storedToken);
        // Initialize socket connection with the token - only once
        initializeSocket(storedToken);
        setSocketInitialized(true);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, [socketInitialized]);
  
  // Login function with error handling
  const login = useCallback((userData, authToken) => {
    if (!userData || !authToken) {
      console.error("Invalid login data provided:", userData, authToken);
      return;
    }
    
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      setUser(userData);
      setToken(authToken);
      
      // Initialize socket connection with the token - only if not already initialized
      if (!socketInitialized) {
        initializeSocket(authToken);
        setSocketInitialized(true);
      }
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  }, [socketInitialized]);
  
  // Logout function to clear user session
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      
      // Disconnect socket and reset initialized state
      const socketService = require('../services/socketService');
      if (socketService.socket) {
        socketService.socket.disconnect();
      }
      setSocketInitialized(false);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, []);
  
  // Memoized value to prevent unnecessary re-renders
  const authContextValue = useMemo(() => ({ 
    user, 
    token, 
    login, 
    logout, 
    socketInitialized 
  }), [user, token, login, logout, socketInitialized]);
  
  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};