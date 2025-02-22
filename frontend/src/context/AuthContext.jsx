import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user & token from localStorage safely
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

      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

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
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  }, []);

  // Logout function to clear user session
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }, []);

  // Memoized value to prevent unnecessary re-renders
  const authContextValue = useMemo(() => ({ user, token, login, logout }), [user, token, login, logout]);

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
