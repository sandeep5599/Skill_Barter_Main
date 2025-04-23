import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorAlert = ({ 
  message, 
  onDismiss, 
  variant = 'danger', 
  dismissible = true 
}) => {
  if (!message) return null;
  
  return (
    <Alert 
      variant={variant} 
      onClose={onDismiss} 
      dismissible={dismissible}
    >
      {message}
    </Alert>
  );
};

export default ErrorAlert;