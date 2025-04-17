import React, { useState, useCallback, memo, useMemo, useEffect } from "react";
import { Dropdown, Badge, Button, Card, ListGroup } from "react-bootstrap";
import { 
  Trash, 
  TrashFill,
  Check2All, 
  CircleFill,
  ThreeDots,
  ExclamationTriangle,
  InfoCircle,
  CheckCircle,
  BellSlashFill,
  EnvelopeFill,
  ChatDotsFill,
  ChatLeftTextFill,
  ChatSquareTextFill,
  ChatLeftDotsFill
} from "react-bootstrap-icons";
import { useNotifications } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();

  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pulseRipple, setPulseRipple] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced animation effects when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      setPulseRipple(true);
      const animationTimer = setTimeout(() => setIsAnimating(false), 2000);
      const pulseTimer = setTimeout(() => setPulseRipple(false), 3000);
      return () => {
        clearTimeout(animationTimer);
        clearTimeout(pulseTimer);
      };
    }
  }, [unreadCount]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback((e) => {
    e?.stopPropagation();
    markAllAsRead();
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback((e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  }, [deleteNotification]);
  
  const handleDeleteAllNotifications = useCallback((e) => {
    e.stopPropagation();
    deleteAllNotifications();
  }, [deleteAllNotifications]);

  const getNotificationIcon = useMemo(() => (type) => {
    switch(type) {
      case 'alert': return <ExclamationTriangle className="text-white" />;
      case 'warning': return <ExclamationTriangle className="text-white" />;
      case 'success': return <CheckCircle className="text-white" />;
      default: return <InfoCircle className="text-white" />;
    }
  }, []);

  const getNotificationTypeColor = useMemo(() => (type) => {
    switch(type) {
      case 'alert': return 'danger';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'primary';
    }
  }, []);

  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    return {
      today: notifications.filter(n => new Date(n.createdAt) >= today),
      yesterday: notifications.filter(n => {
        const date = new Date(n.createdAt);
        return date >= yesterday && date < today;
      }),
      thisWeek: notifications.filter(n => {
        const date = new Date(n.createdAt);
        return date >= thisWeek && date < yesterday;
      }),
      older: notifications.filter(n => new Date(n.createdAt) < thisWeek)
    };
  }, [notifications]);

  // Advanced notification icon with dynamic styling (using Chat icon instead of Bell)
  const renderNotificationIcon = () => {
    // Base icon selection
    const baseIcon = isMobile ? (
      unreadCount > 0 ? (
        <ChatLeftDotsFill size={isMobile ? 16 : 18} className="text-white position-relative z-1" />
      ) : (
        <ChatSquareTextFill size={isMobile ? 16 : 18} className="text-white position-relative z-1" />
      )
    ) : (
      <ChatDotsFill 
        size={isMobile ? 18 : 20} 
        className={`text-white position-relative z-1 ${isAnimating ? 'animate__animated animate__headShake' : ''}`} 
      />
    );
    
    return (
      <div className="notification-icon-container position-relative d-flex align-items-center justify-content-center">
        {baseIcon}
        
        {/* Notification icon glow effect */}
        {unreadCount > 0 && (
          <>
            <span 
              className="position-absolute notification-dot"
              style={{
                top: '-2px',
                right: '-2px',
                width: isMobile ? '8px' : '10px',
                height: isMobile ? '8px' : '10px',
                borderRadius: '50%',
                background: 'rgb(255, 45, 85)',
                boxShadow: '0 0 5px 2px rgba(255, 45, 85, 0.6)',
                zIndex: 2,
                animation: isAnimating ? 'pulse-dot 1.5s infinite' : 'none'
              }}
            />
            
            {/* Ripple effect for unread notifications */}
            {pulseRipple && (
              <>
                <span className="ripple-effect ripple-1"></span>
                <span className="ripple-effect ripple-2"></span>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <Dropdown show={show} onToggle={setShow} align="end">
      <Dropdown.Toggle 
        as={Button} 
        variant="primary" 
        id="notification-dropdown" 
        className={`position-relative d-flex align-items-center justify-content-center p-2 rounded-circle notification-toggle ${isAnimating ? 'pulse' : ''}`}
        style={{ 
          width: isMobile ? "38px" : "42px",
          height: isMobile ? "38px" : "42px",
          transition: "all 0.3s ease",
          background: unreadCount > 0 
            ? 'linear-gradient(145deg, #4267B2, #1877F2)' 
            : 'linear-gradient(145deg, #3b5998, #4267B2)',
          boxShadow: unreadCount > 0 
            ? "0 0 0 4px rgba(19, 119, 242, 0.2), 0 4px 12px rgba(19, 119, 242, 0.3)" 
            : "0 2px 8px rgba(0, 0, 0, 0.15)"
        }}
      >
        {renderNotificationIcon()}
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite notification-badge"
            style={{ 
              top: "0", 
              right: "0", 
              fontSize: "0.65rem",
              minWidth: isMobile ? "16px" : "18px",
              height: isMobile ? "16px" : "18px",
              transform: "translate(25%, -25%)",
              boxShadow: "0 0 0 2px white",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #FF3B30, #FF2D55)"
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow notification-menu p-0 border-0"
        style={{ 
          width: isMobile ? "100vw" : "380px", 
          maxWidth: "100vw",
          borderRadius: "0.75rem",
          marginTop: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
        }}
      >
        <Card className="border-0">
          <Card.Header className="d-flex justify-content-between align-items-center py-3 bg-white border-bottom">
            <h6 className="m-0 fw-bold d-flex align-items-center">
              <ChatLeftTextFill size={16} className="me-2 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <Badge pill bg="primary" className="ms-2">{unreadCount}</Badge>
              )}
            </h6>
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="d-flex align-items-center gap-1 py-1 px-2"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <Check2All size={14} />
                  <span className="small d-none d-sm-inline">Mark all read</span>
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="d-flex align-items-center gap-1 py-1 px-2"
                  onClick={handleDeleteAllNotifications}
                  title="Delete all notifications"
                >
                  <TrashFill size={14} />
                  <span className="small d-none d-sm-inline">Clear all</span>
                </Button>
              )}
            </div>
          </Card.Header>

          <div 
            style={{ 
              maxHeight: isMobile ? "70vh" : "450px", 
              overflowY: "auto" 
            }} 
            className="notification-scrollbar"
          >
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-5">
                <ChatSquareTextFill size={36} className="mb-3 text-secondary opacity-50" />
                <p className="mb-1">No notifications</p>
                <small className="text-muted">You're all caught up!</small>
              </div>
            ) : (
              <ListGroup variant="flush">
                {Object.entries(groupedNotifications).map(([timeFrame, items]) => {
                  if (items.length === 0) return null;
                  
                  return (
                    <React.Fragment key={timeFrame}>
                      <div className="bg-light text-muted px-3 py-2 small fw-bold text-uppercase">
                        {timeFrame}
                      </div>
                      {items.map((notification) => (
                        <ListGroup.Item 
                          key={notification._id} 
                          className={`position-relative border-bottom px-0 py-0 ${!notification.read ? 'bg-light' : ''} notification-item`}
                          style={{ 
                            transition: 'background-color 0.3s ease',
                            borderLeft: !notification.read ? `3px solid var(--bs-${getNotificationTypeColor(notification.type)})` : 'none',
                            paddingLeft: !notification.read ? '0' : '3px'
                          }}
                        >
                          <div 
                            onClick={() => handleNotificationClick(notification)} 
                            className="d-flex p-3 position-relative"
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="me-3 mt-1">
                              <div 
                                className={`rounded-circle bg-${getNotificationTypeColor(notification.type)} d-flex align-items-center justify-content-center`}
                                style={{ 
                                  width: isMobile ? "32px" : "36px", 
                                  height: isMobile ? "32px" : "36px",
                                  boxShadow: `0 2px 6px rgba(var(--bs-${getNotificationTypeColor(notification.type)}-rgb), 0.3)`
                                }}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-grow-1 pe-4">
                              <div className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                                {notification.title}
                                {!notification.read && (
                                  <CircleFill size={8} className={`ms-2 text-${getNotificationTypeColor(notification.type)}`} />
                                )}
                              </div>
                              <small className="text-secondary d-block mb-1">
                                {notification.message}
                              </small>
                              <small className="text-muted d-flex align-items-center">
                                <CircleFill size={5} className="me-1 text-muted" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </small>
                            </div>
                            <div 
                              className="position-absolute d-flex align-items-center justify-content-center notification-action"
                              style={{ 
                                top: "12px", 
                                right: "12px", 
                                background: "rgba(255,255,255,0.9)",
                                borderRadius: "50%",
                                width: isMobile ? "24px" : "28px",
                                height: isMobile ? "24px" : "28px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                opacity: 0.9,
                                transition: "all 0.2s ease"
                              }}
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              title="Delete notification"
                            >
                              <TrashFill size={isMobile ? 12 : 14} className="text-danger" />
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </React.Fragment>
                  );
                })}
              </ListGroup>
            )}
          </div>
        </Card>
      </Dropdown.Menu>

      <style jsx>{`
        @keyframes pulse-dot {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
        
        .pulse {
          animation: pulse-effect 1.5s ease infinite;
        }
        
        @keyframes pulse-effect {
          0% {
            box-shadow: 0 0 0 0 rgba(19, 119, 242, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(19, 119, 242, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(19, 119, 242, 0);
          }
        }
        
        .notification-toggle {
          position: relative;
          overflow: hidden;
        }
        
        .notification-toggle:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          opacity: 0.8;
          z-index: 0;
        }
        
        .notification-icon-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 45, 85, 0.4);
          width: 100%;
          height: 100%;
          opacity: 0;
          z-index: 0;
        }
        
        .ripple-1 {
          animation: ripple 2s ease-out infinite;
        }
        
        .ripple-2 {
          animation: ripple 2s ease-out 0.5s infinite;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0.1);
            opacity: 0.4;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        
        .notification-badge {
          z-index: 3;
        }
        
        .notification-action {
          z-index: 2;
        }
        
        .notification-action:hover {
          background: rgba(255,255,255,1) !important;
          transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
          .notification-item {
            padding: 0.5rem 0;
          }
          
          .notification-toggle:after {
            opacity: 0.5;
          }
        }
      `}</style>
    </Dropdown>
  );
};

export default memo(NotificationCenter);