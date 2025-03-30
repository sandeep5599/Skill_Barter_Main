import React, { createContext, useState, useEffect, useContext } from 'react';
import { socket } from '../services/socketService';
import { getUsersStatus } from '../services/socketService';

const UserStatusContext = createContext();

export const useUserStatus = () => useContext(UserStatusContext);

export const UserStatusProvider = ({ children }) => {
  const [userStatuses, setUserStatuses] = useState({});
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for status changes from server
    const handleStatusChange = (data) => {
      setUserStatuses(prev => ({
        ...prev,
        [data.userId]: {
          isOnline: data.isOnline,
          lastActive: data.lastActive
        }
      }));
    };
    
    socket.on('user:status_change', handleStatusChange);
    
    // Bulk receive statuses
    socket.on('users:status', (statuses) => {
      const statusMap = {};
      statuses.forEach(status => {
        statusMap[status.userId] = {
          isOnline: status.isOnline,
          lastActive: status.lastActive
        };
      });
      
      setUserStatuses(prev => ({
        ...prev,
        ...statusMap
      }));
    });
    
    return () => {
      socket.off('user:status_change', handleStatusChange);
      socket.off('users:status');
    };
  }, []);
  
  // Function to fetch status for specific users
  const fetchUserStatuses = async (userIds) => {
    try {
      const statuses = await getUsersStatus(userIds);
      
      // Update state with fetched statuses
      const statusMap = {};
      statuses.forEach(status => {
        statusMap[status.userId] = {
          isOnline: status.isOnline,
          lastActive: status.lastActive
        };
      });
      
      setUserStatuses(prev => ({
        ...prev,
        ...statusMap
      }));
      
      return statuses;
    } catch (error) {
      console.error('Error fetching user statuses:', error);
      return [];
    }
  };
  
  const value = {
    userStatuses,
    fetchUserStatuses
  };
  
  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
};
