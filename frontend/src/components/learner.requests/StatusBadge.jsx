// components/common/StatusBadge.js
import React from 'react';
import { Badge } from 'react-bootstrap';

const StatusBadge = ({ status }) => {
  const variants = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    rescheduled: 'info',
    default: 'secondary'
  };
  
  const variant = variants[status] || variants.default;
  
  // Add appropriate icons
  const icons = {
    pending: 'bi-hourglass-split',
    accepted: 'bi-check-circle-fill',
    rejected: 'bi-x-circle-fill',
    rescheduled: 'bi-calendar-week',
    default: 'bi-circle'
  };
  
  const icon = icons[status] || icons.default;
  
  return (
    <Badge bg={variant}>
      <i className={`bi ${icon} me-1`}></i> {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};


export default StatusBadge;