// components/requests/ActionButtons.js
import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

const ActionButtons = ({ request, navigate, onAccept, onDecline, isProcessing }) => {
  const requestId = request._id || request.id;
  const sessionId = request.sessionId || requestId;
  
  if (isProcessing) {
    return (
      <Button variant="secondary" disabled className="w-100 mb-2">
        <Spinner as="span" animation="border" size="sm" className="me-2" />
        Processing...
      </Button>
    );
  }
  
  switch(request.status) {
    case 'pending':
      return (
        <Button variant="secondary" disabled className="w-100 mb-2">
          <i className="bi bi-hourglass-split me-2"></i> Awaiting Response
        </Button>
      );
    case 'rescheduled':
      return (
        <div className="d-flex flex-column gap-2">
          <Button 
            variant="success" 
            onClick={onAccept}
            className="w-100"
          >
            <i className="bi bi-check-circle me-2"></i> Accept New Time
          </Button>
          <Button 
            variant="danger" 
            onClick={onDecline}
            className="w-100"
          >
            <i className="bi bi-x-circle me-2"></i> Decline
          </Button>
        </div>
      );
    case 'accepted':
      return (
        <Button 
          variant="success" 
          onClick={() => navigate(`/sessions/${sessionId}`)}
          className="w-100"
        >
          <i className="bi bi-calendar2-check-fill me-2"></i> View Session
        </Button>
      );
    case 'rejected':
      return (
        <div className="d-flex flex-column gap-2">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/match/request/${requestId}/reschedule`)}
            className="w-100"
          >
            <i className="bi bi-calendar-plus me-2"></i> Request Again
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/match/learning')}
            className="w-100"
          >
            <i className="bi bi-search me-2"></i> Find New Matches
          </Button>
        </div>
      );
    default:
      return (
        <Button 
          variant="primary" 
          onClick={() => navigate('/match/learning')}
          className="w-100"
        >
          <i className="bi bi-search me-2"></i> Find More Matches
        </Button>
      );
  }
};

export default ActionButtons;