import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ActionButtons = ({ 
  request, 
  processing, 
  toggleModal, 
}) => {
  const navigate = useNavigate();
  
  // Determine button state for rescheduled sessions
  const renderRescheduledButtons = () => {
    // If the student has already responded to the reschedule request
    if (request.rescheduleStatus) {
      switch(request.rescheduleStatus) {
        case 'accepted':
          return (
            <Button 
              variant="primary" 
              onClick={() => toggleModal('sessionCreation', true, request)}
              disabled={processing}
              className="mb-2"
            >
              {processing ? <Spinner size="sm" animation="border" /> : 'Create Session'}
            </Button>
          );
        case 'declined':
          return (
            <Button 
              variant="warning" 
              disabled={true}
              className="mb-2"
            >
              Request Declined
            </Button>
          );
        default:
          return (
            <Button 
              variant="secondary" 
              disabled={true}
              className="mb-2"
            >
              Waiting for Confirmation
            </Button>
          );
      }
    } else {
      // Default case - waiting for student response
      return (
        <Button 
          variant="secondary" 
          disabled={true}
          className="mb-2"
        >
          Waiting for Confirmation
        </Button>
      );
    }
  };

  switch(request.status) {
    case 'pending':
      return (
        <>
          <Button 
            variant="primary" 
            onClick={() => toggleModal('sessionCreation', true, request)}
            disabled={processing}
            className="mb-2"
          >
            {processing ? <Spinner size="sm" animation="border" /> : 'Accept & Create Session'}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => toggleModal('reschedule', true, request)}
            disabled={processing}
            className="mb-2"
          >
            Propose New Time
          </Button>
          <Button 
            variant="primary" 
            onClick={() => toggleModal('reject', true, request)}
            disabled={processing}
          >
            Reject Request
          </Button>
        </>
      );
    case 'accepted':
      return (
        <>
          <Button 
            variant="primary" 
            onClick={() => navigate(`/sessions/${request.sessionId}`)}
            className="mb-2"
          >
            View Session
          </Button>
          <Button
            variant="success"
            onClick={() => toggleModal('completeSession', true, request)}
            disabled={processing}
          >
            Mark Completed
          </Button>
        </>
      );
    case 'completed':
      return (
        <>
          <Button 
            variant="primary"
            onClick={() => navigate(`/sessions/${request.sessionId}`)} 
            className="mb-2"
          >
            View Session
          </Button>
          {!request.teacherFeedbackSubmitted && (
            <Button
              variant="primary"
              onClick={() => toggleModal('feedback', true, request)}
            >
              Provide Feedback
            </Button>
          )}
        </>
      );
    case 'rescheduled':
      return renderRescheduledButtons();
    case 'rejected':
      return (
        <Button 
          variant="primary" 
          onClick={() => navigate('/profile')}
          disabled={processing}
        >
          View Profile
        </Button>
      );
    default:
      return null;
  }
};

export default ActionButtons;