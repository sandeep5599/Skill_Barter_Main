// 1. Updated AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { initializeSocket } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [isValidating, setIsValidating] = useState(true); // Added to match your PrivateRoute component
  
  // Load user & token from localStorage
  useEffect(() => {
    const loadUserSession = async () => {
      setIsValidating(true);
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");
        
        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser) {
              setUser(parsedUser);
              setToken(storedToken);
              
              // Initialize socket connection with the token
              if (!socketInitialized) {
                initializeSocket(storedToken);
                setSocketInitialized(true);
              }
            }
          } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      } finally {
        setIsValidating(false);
      }
    };
    
    loadUserSession();
  }, []); // No dependencies to prevent re-runs
  
  // Login function with error handling
  const login = useCallback((userData, authToken) => {
    if (!userData || !authToken) {
      console.error("Invalid login data provided");
      return;
    }
    
    try {
      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", authToken);
      
      // Update state
      setUser(userData);
      setToken(authToken);
      
      // Initialize socket connection
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
      
      // Disconnect socket
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
    socketInitialized,
    isValidating // Include isValidating to match your PrivateRoute
  }), [user, token, login, logout, socketInitialized, isValidating]);
  
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