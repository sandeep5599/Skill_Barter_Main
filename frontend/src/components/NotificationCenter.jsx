import React, { useState, useCallback, memo } from "react";
import { Dropdown, Badge, Button } from "react-bootstrap";
import { Bell } from "react-bootstrap-icons";
import { useNotifications } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [show, setShow] = useState(false);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <Dropdown show={show} onToggle={setShow} align="end">
      <Dropdown.Toggle 
        as={Button} 
        variant="primary" 
        id="notification-dropdown" 
        className="position-relative btn-icon"
        style={{ border: "none", background: "transparent" }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute"
            style={{ top: "-8px", right: "-8px", fontSize: "0.65rem" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="shadow notification-menu" 
        style={{ width: "500px", padding: 0 }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <Button 
              variant="primary" 
              size="sm" 
              className="p-0 text-decoration-none" 
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div style={{ maxHeight: "350px", overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <small>No notifications</small>
            </div>
          ) : (
            notifications.map((notification) => (
              <Dropdown.Item 
                key={notification._id} 
                onClick={() => handleNotificationClick(notification)} 
                className={`px-3 py-2 border-bottom ${notification.read ? "text-muted" : "fw-bold"}`}
              >
                <div>
                  <div>{notification.title}</div>
                  <small>{notification.message}</small>
                  <small className="text-muted d-block mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </small>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default memo(NotificationCenter);