import React from 'react';
import { Badge } from 'react-bootstrap';
import { getStatusVariant, getStatusDisplayText } from '../../utils/statusHelpers';

const StatusBadge = ({ status }) => {
  const variant = getStatusVariant(status);
  const text = getStatusDisplayText(status);
  
  return (
    <Badge bg={variant}>
      {text}
    </Badge>
  );
};

export default StatusBadge;