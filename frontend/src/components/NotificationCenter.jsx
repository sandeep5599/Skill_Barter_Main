import React, { useState, useCallback, memo, useMemo } from "react";
import { Dropdown, Badge, Button, Card, ListGroup } from "react-bootstrap";
import { 
  BellFill, 
  Trash, 
  TrashFill,
  Check2All, 
  CircleFill,
  ThreeDots,
  ExclamationTriangle,
  InfoCircle,
  CheckCircle
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

  return (
    <Dropdown show={show} onToggle={setShow} align="end">
      <Dropdown.Toggle 
        as={Button} 
        variant="primary" 
        id="notification-dropdown" 
        className="position-relative d-flex align-items-center justify-content-center p-2 rounded-circle"
        style={{ 
          width: "42px",
          height: "42px",
          transition: "all 0.2s ease",
          boxShadow: unreadCount > 0 ? "0 0 0 4px rgba(13, 110, 253, 0.15)" : "none"
        }}
      >
        <BellFill size={20} className="text-white" />
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite"
            style={{ 
              top: "0", 
              right: "0", 
              fontSize: "0.65rem",
              minWidth: "18px",
              height: "18px",
              transform: "translate(25%, -25%)",
              boxShadow: "0 0 0 2px white"
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow notification-menu p-0 border-0"
        style={{ 
          width: "380px", 
          maxWidth: "100vw",
          borderRadius: "0.75rem",
          marginTop: "0.75rem",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}
      >
        <Card className="border-0">
          <Card.Header className="d-flex justify-content-between align-items-center py-3 bg-white border-bottom">
            <h6 className="m-0 fw-bold d-flex align-items-center">
              <BellFill size={16} className="me-2 text-primary" />
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

          <div style={{ maxHeight: "450px", overflowY: "auto" }} className="notification-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-5">
                <BellFill size={36} className="mb-3 text-secondary opacity-50" />
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
                                  width: "36px", 
                                  height: "36px",
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
                                width: "28px",
                                height: "28px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                opacity: 0.9,
                                transition: "all 0.2s ease"
                              }}
                              onClick={(e) => handleDeleteNotification(e, notification._id)}
                              title="Delete notification"
                            >
                              <TrashFill size={14} className="text-danger" />
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </React.Fragment>
                  );
                })}
                
                {notifications.length > 7 && (
                  <div className="text-center py-3 border-top bg-light">
                    <Button variant="link" className="text-decoration-none">
                      View all notifications
                      <ThreeDots size={16} className="ms-1" />
                    </Button>
                  </div>
                )}
              </ListGroup>
            )}
          </div>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Add this to your CSS for better scrollbar styling
// .notification-scrollbar::-webkit-scrollbar { width: 8px; }
// .notification-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
// .notification-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
// .notification-scrollbar::-webkit-scrollbar-thumb:hover { background: #999; }
// .notification-item:hover .notification-action { opacity: 1 !important; }

export default memo(NotificationCenter);