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
  ChatLeftDotsFill,
  Calendar3,
  Clock,
  Bell,
  BellFill
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

  // Enhanced notification icon with dynamic styling (using Bell icon to match dashboard)
  const renderNotificationIcon = () => {
    // Base icon selection - using Bell icons to match the dashboard theme
    const baseIcon = unreadCount > 0 ? (
      <BellFill 
        size={isMobile ? 16 : 18} 
        className={`text-white position-relative z-1 ${isAnimating ? 'animate__animated animate__headShake' : ''}`} 
      />
    ) : (
      <Bell 
        size={isMobile ? 16 : 18} 
        className="text-white position-relative z-1" 
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
                background: '#FF2D55',
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

  // Function to render the time category headers with visual enhancements
  const renderTimeFrameHeader = (timeFrame) => {
    const getTimeFrameIcon = () => {
      switch(timeFrame) {
        case 'today': return <Clock size={14} className="me-2" />;
        case 'yesterday': return <Calendar3 size={14} className="me-2" />;
        case 'thisWeek': return <Calendar3 size={14} className="me-2" />;
        case 'older': return <Calendar3 size={14} className="me-2" />;
        default: return null;
      }
    };

    const getTimeFrameLabel = () => {
      switch(timeFrame) {
        case 'today': return 'Today';
        case 'yesterday': return 'Yesterday';
        case 'thisWeek': return 'This Week';
        case 'older': return 'Older';
        default: return timeFrame;
      }
    };

    return (
      <div 
        className="notification-timeframe d-flex align-items-center"
        style={{
          background: 'linear-gradient(to right, #f1f5f9, #f8fafc)',
          borderTop: '1px solid rgba(203, 213, 225, 0.5)',
          borderBottom: '1px solid rgba(203, 213, 225, 0.5)',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: '#64748b',
          padding: '0.5rem 1rem',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {getTimeFrameIcon()}
        {getTimeFrameLabel()}
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
            ? 'linear-gradient(145deg, #4361EE, #3A0CA3)' 
            : 'linear-gradient(145deg, #3B82F6, #1E40AF)',
          boxShadow: unreadCount > 0 
            ? "0 0 0 4px rgba(67, 97, 238, 0.2), 0 4px 12px rgba(67, 97, 238, 0.3)" 
            : "0 2px 8px rgba(0, 0, 0, 0.15)",
          border: "none"
        }}
      >
        {renderNotificationIcon()}
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite notification-badge"
            style={{ 
              top: "-5px", 
              right: "-5px", 
              fontSize: "0.65rem",
              minWidth: isMobile ? "16px" : "18px",
              height: isMobile ? "16px" : "18px",
              transform: "translate(25%, -25%)",
              boxShadow: "0 0 0 2px white",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #FF3B30, #FF2D55)",
              zIndex: 1000
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow notification-menu p-0 border-0"
        style={{ 
          width: isMobile ? "calc(100vw - 20px)" : "400px", 
          maxWidth: "100vw",
          borderRadius: "1rem",
          marginTop: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(0,0,0,0.08)",
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <Card className="border-0 notification-card">
          <Card.Header 
            className="d-flex justify-content-between align-items-center py-3 border-bottom"
            style={{
              background: "linear-gradient(to right, #f1f5f9, #f8fafc)",
              borderBottom: "1px solid rgba(0,0,0,0.05)"
            }}
          >
            <h6 className="m-0 fw-bold d-flex align-items-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <BellFill size={16} className="me-2 text-primary" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge 
                  pill 
                  bg="primary" 
                  className="ms-2 d-flex align-items-center justify-content-center"
                  style={{
                    fontSize: "0.7rem",
                    height: "20px",
                    minWidth: "20px",
                    background: "linear-gradient(to right, #4361EE, #3A0CA3)"
                  }}
                >
                  {unreadCount}
                </Badge>
              )}
            </h6>
            <div className="d-flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="d-flex align-items-center gap-1 py-1 px-2 action-button"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                  style={{
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    border: "1px solid rgba(67, 97, 238, 0.5)",
                    color: "#4361EE"
                  }}
                >
                  <Check2All size={14} />
                  <span className={isMobile ? "d-none" : "d-inline"}>Mark all</span>
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="d-flex align-items-center gap-1 py-1 px-2 action-button"
                  onClick={handleDeleteAllNotifications}
                  title="Delete all notifications"
                  style={{
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    border: "1px solid rgba(220, 53, 69, 0.5)"
                  }}
                >
                  <TrashFill size={14} />
                  <span className={isMobile ? "d-none" : "d-inline"}>Clear all</span>
                </Button>
              )}
            </div>
          </Card.Header>

          <div 
            style={{ 
              maxHeight: isMobile ? "70vh" : "450px", 
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#cbd5e1 #f8fafc"
            }} 
            className="notification-scrollbar"
          >
            {notifications.length === 0 ? (
              <div 
                className="text-center py-5 empty-state"
                style={{
                  background: "linear-gradient(to bottom, rgba(241,245,249,0.5), rgba(248,250,252,0.8))"
                }}
              >
                <div 
                  className="empty-icon-container mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f1f5f9, #f8fafc)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                  }}
                >
                  <BellSlashFill size={32} className="text-secondary opacity-60" />
                </div>
                <p className="mb-1 fw-bold text-secondary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>No notifications</p>
                <small className="text-muted d-block">You're all caught up!</small>
              </div>
            ) : (
              <ListGroup variant="flush" className="notification-list">
                {Object.entries(groupedNotifications).map(([timeFrame, items]) => {
                  if (items.length === 0) return null;
                  
                  return (
                    <React.Fragment key={timeFrame}>
                      {renderTimeFrameHeader(timeFrame)}
                      {items.map((notification) => (
                        <ListGroup.Item 
                          key={notification._id} 
                          className={`position-relative border-bottom notification-item ${!notification.read ? 'unread-notification' : ''}`}
                          style={{ 
                            transition: 'all 0.2s ease',
                            borderLeft: !notification.read ? `4px solid var(--bs-${getNotificationTypeColor(notification.type)})` : 'none',
                            paddingLeft: !notification.read ? '0' : '4px',
                            background: !notification.read ? 'rgba(248, 250, 252, 0.7)' : 'transparent'
                          }}
                        >
                          <div 
                            onClick={() => handleNotificationClick(notification)} 
                            className="d-flex p-3 position-relative notification-content-wrapper"
                            style={{ 
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div className="me-3 mt-1">
                              <div 
                                className={`rounded-circle notification-icon-bg d-flex align-items-center justify-content-center`}
                                style={{ 
                                  width: isMobile ? "36px" : "40px", 
                                  height: isMobile ? "36px" : "40px",
                                  background: notification.type === 'alert' 
                                    ? 'linear-gradient(145deg, #FF3B30, #FF2D55)' 
                                    : notification.type === 'warning'
                                      ? 'linear-gradient(145deg, #FF9500, #FF3B30)'
                                      : notification.type === 'success'
                                        ? 'linear-gradient(145deg, #34C759, #30D158)'
                                        : 'linear-gradient(145deg, #4361EE, #3A0CA3)',
                                  boxShadow: `0 4px 8px rgba(var(--bs-${getNotificationTypeColor(notification.type)}-rgb), 0.25)`,
                                  transition: 'transform 0.2s ease'
                                }}
                              >
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-grow-1 pe-5">
                              <div className={`notification-title mb-1 ${!notification.read ? 'fw-bold' : ''}`}
                                style={{
                                  fontSize: '0.95rem',
                                  lineHeight: '1.3',
                                  transition: 'color 0.15s ease',
                                  fontFamily: "'Space Grotesk', sans-serif"
                                }}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <CircleFill size={8} className={`ms-2 text-${getNotificationTypeColor(notification.type)}`} />
                                )}
                              </div>
                              <div 
                                className="notification-message text-secondary mb-2"
                                style={{
                                  fontSize: '0.85rem',
                                  lineHeight: '1.4',
                                  opacity: notification.read ? 0.9 : 1
                                }}
                              >
                                {notification.message}
                              </div>
                              <small 
                                className="notification-time text-muted d-flex align-items-center"
                                style={{
                                  fontSize: '0.75rem'
                                }}
                              >
                                <Clock size={11} className="me-1 text-muted" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </small>
                            </div>
                            <Button 
                              variant="light"
                              className="position-absolute delete-button d-flex align-items-center justify-content-center p-0"
                              style={{ 
                                top: "12px", 
                                right: "12px", 
                                background: "rgba(248,250,252,0.8)",
                                borderRadius: "8px",
                                border: "1px solid rgba(0,0,0,0.08)",
                                width: "28px",
                                height: "28px",
                                transition: "all 0.2s ease",
                                opacity: 0.7
                              }}
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              title="Delete notification"
                            >
                              <TrashFill size={14} className="text-danger" />
                            </Button>
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
            box-shadow: 0 0 0 0 rgba(67, 97, 238, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(67, 97, 238, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(67, 97, 238, 0);
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
        
        .notification-toggle:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(67, 97, 238, 0.3);
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
        
        /* Enhanced scrollbar styling */
        .notification-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .notification-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        
        .notification-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
          border: 2px solid #f8fafc;
        }
        
        /* Enhanced notification item interactions */
        .notification-item:hover {
          background-color: rgba(241, 245, 249, 0.8) !important;
        }
        
        .notification-item:hover .notification-icon-bg {
          transform: scale(1.05);
        }
        
        .notification-item:hover .notification-title {
          color: #4361EE;
        }
        
        .notification-item:hover .delete-button {
          opacity: 1;
          transform: scale(1.05);
        }
        
        .notification-content-wrapper:active {
          background-color: rgba(226, 232, 240, 0.8);
        }
        
        .delete-button:hover {
          background: white !important;
          border-color: rgba(220, 53, 69, 0.3) !important;
          transform: scale(1.1) !important;
        }
        
        /* Action button enhancements */
        .action-button {
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .action-button:active {
          transform: translateY(0px);
        }
        
        /* Empty state animation */
        .empty-state .empty-icon-container {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .notification-card {
            border-radius: 1rem;
            overflow: hidden;
          }
          
          .notification-item {
            padding: 0;
          }
          
          .notification-content-wrapper {
            padding: 0.75rem !important;
          }
          
          .notification-icon-bg {
            width: 32px !important;
            height: 32px !important;
          }
          
          .notification-toggle:after {
            opacity: 0.5;
          }
          
          .delete-button {
            width: 24px !important;
            height: 24px !important;
            top: 8px !important;
            right: 8px !important;
          }
        }
        
        /* Fix to ensure the badge is fully visible */
        .notification-badge {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          position: absolute !important;
          top: -5px !important;
          right: -5px !important;
          transform: translate(25%, -25%) !important;
          z-index: 1000 !important;
          visibility: visible !important;
          overflow: visible !important;
        }
        
        /* Add Space Grotesk font styling */
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
      `}</style>
    </Dropdown>
  );
};

export default memo(NotificationCenter);