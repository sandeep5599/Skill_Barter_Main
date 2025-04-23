import React from 'react';
import { Button } from 'react-bootstrap';

const EmptyState = ({ 
  message = 'No data found.', 
  buttonText, 
  buttonAction,
  className = 'my-5'
}) => {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-muted">{message}</p>
      {buttonText && buttonAction && (
        <Button variant="primary" className="mt-2" onClick={buttonAction}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;