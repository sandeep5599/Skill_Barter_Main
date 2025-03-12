import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { socket, initializeSocket } from "../services/socketService";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();
  
  // Use ref to track if we're already listening for notifications
  const isListening = useRef(false);
  
  // Use ref to store processed notification IDs
  const processedNotifications = useRef(new Set());

  useEffect(() => {
    // Only proceed if we have a user and token and aren't already listening
    if (user && token && !isListening.current) {
      console.log("Setting up notification listeners");
      
      // Set flag to prevent duplicate listeners
      isListening.current = true;
      
      // Fetch initial notifications
      fetchNotifications();
      
      // Set up socket listeners only once
      const setupSocketListeners = () => {
        if (!socket) {
          console.error("Socket not initialized");
          return;
        }
        
        // Remove any existing notification listeners
        socket.off("notification");
        
        // Set up notification listener with duplicate prevention
        socket.on("notification", (newNotification) => {
          console.log("New notification received:", newNotification);
          
          // Check if we've already processed this notification
          if (newNotification._id && !processedNotifications.current.has(newNotification._id)) {
            // Add to processed set
            processedNotifications.current.add(newNotification._id);
            
            // Update state
            setNotifications(prev => [newNotification, ...prev]);
            
            if (!newNotification.read) {
              setUnreadCount(prev => prev + 1);
              showNotificationToast(newNotification);
            }
          } else {
            console.log("Duplicate notification prevented:", newNotification._id);
          }
        });
      };
      
      // Set up listeners
      setupSocketListeners();
    }

    // Clean up when component unmounts
    return () => {
      // We intentionally don't remove listeners here to avoid multiple setup/teardown cycles
      // which could lead to duplicate connections
    };
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Add fetched notification IDs to processed set to prevent duplicates
      response.data.forEach(notification => {
        if (notification._id) {
          processedNotifications.current.add(notification._id);
        }
      });
      
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Add these two functions to your existing NotificationProvider component

const deleteNotification = async (notificationId) => {
  try {
    await axios.delete(
      `/api/notifications/${notificationId}/delete`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setNotifications((prev) => 
      prev.filter((n) => n._id !== notificationId)
    );
    
    // Update unread count if needed
    const notificationToDelete = notifications.find(n => n._id === notificationId);
    if (notificationToDelete && !notificationToDelete.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

const deleteAllNotifications = async () => {
  try {
    await axios.delete(
      "/api/notifications/delete-all",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setNotifications([]);
    setUnreadCount(0);
  } catch (error) {
    console.error("Error deleting all notifications:", error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    await axios.put(
      `/api/notifications/${notificationId}/mark-read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

const markAllAsRead = async () => {
  try {
    await axios.put(
      "/api/notifications/mark-all-read",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

const showNotificationToast = (notification) => {
  toast.info(
    <div onClick={() => markAsRead(notification._id)} style={{ cursor: "pointer" }}>
      <strong>{notification.title}</strong>
      <br />
      <small>{notification.message}</small>
    </div>,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    }
  );
};

// Then modify your return statement to include the new functions:
return (
  <NotificationContext.Provider
    value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      deleteNotification,
      deleteAllNotifications
    }}
  >
    {children}
  </NotificationContext.Provider>
);

};