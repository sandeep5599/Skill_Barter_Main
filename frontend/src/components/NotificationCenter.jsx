import React, { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Offcanvas, ListGroup, Spinner } from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  // Setup Socket.io connection
  useEffect(() => {
    if (!user?._id) return;
    
    const newSocket = io(BACKEND_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });
    
    newSocket.on('notification', (notification) => {
      // Add new notification to state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [user]);
  
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
    // Mark all as read when opening
    markAllAsRead();
  };
  
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to mark notifications as read');
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  const handleNotificationClick = (notification) => {
    handleClose();
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'new_match_request':
      case 'match_accepted':
      case 'match_rejected':
      case 'match_rescheduled':
        navigate('/match/teaching');
        break;
      case 'session_created':
      case 'session_reminder':
      case 'session_canceled':
      case 'session_completed':
        navigate('/sessions');
        break;
      default:
        navigate('/dashboard');
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <>
      <Button 
        variant="primary" 
        className="position-relative" 
        onClick={handleShow}
      >
        <Bell />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle rounded-circle"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Notifications</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" />
            </div>
          ) : notifications.length > 0 ? (
            <ListGroup>
              {notifications.map((notification, index) => (
                <ListGroup.Item 
                  key={index}
                  action
                  onClick={() => handleNotificationClick(notification)}
                  className={notification.read ? 'bg-light' : 'fw-bold'}
                >
                  <div>{notification.message}</div>
                  <small className="text-muted">{formatTime(notification.createdAt)}</small>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p className="text-center text-muted my-5">No notifications</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NotificationCenter;