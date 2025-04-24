import React from 'react';
import { Button, Alert, Spinner, Stack } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  CalendarCheck, 
  ArrowClockwise, 
  XCircle, 
  Eye, 
  ChatLeftText, 
  PersonLinesFill,
  CheckCircleFill,
  Clock
} from 'react-bootstrap-icons';

const ActionButtons = ({ 
  request, 
  processing, 
  toggleModal, 
  navigate, 
  getEffectiveStatus,
  handleStatusUpdate // Added this prop to handle status updates directly
}) => {
  if (!request) return null;
  
  const effectiveStatus = getEffectiveStatus ? getEffectiveStatus(request) : request.status;
  const requestId = request._id || request.id;

  const handleViewSession = () => {
    if (!requestId) {
      console.error('No session ID for request:', request);
      return;
    }
    navigate(`/sessions`);
  };

  // Added: Handler for accepting reschedule proposals
  const handleAcceptReschedule = async () => {
    try {
      // This will update the status but not create a session
      await handleStatusUpdate(requestId, 'reschedule_accepted', null);
      // Show success notification
      toast.success('You have accepted the new time. The teacher will be notified.');
    } catch (error) {
      console.error('Error accepting reschedule:', error);
      toast.error('Failed to accept the new time. Please try again.');
    }
  };

  // Added: Handler for declining reschedule proposals
  const handleDeclineReschedule = () => {
    toggleModal('reject', true, request);
  };

  const renderButton = (
    variant, 
    onClick, 
    text, 
    icon, 
    disabled = processing, 
    className = ""
  ) => (
    <Button 
      variant={variant} 
      onClick={onClick}
      disabled={disabled}
      className={`rounded-pill d-flex align-items-center justify-content-center px-3 py-2 ${className}`}
      style={{ 
        fontSize: '0.9rem', 
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        minWidth: '120px',
        transition: 'all 0.2s ease'
      }}
    >
      {processing && onClick !== handleViewSession ? 
        <Spinner size="sm" animation="border" className="me-2" /> : 
        icon && <span className="me-2">{icon}</span>
      }
      <span>{text}</span>
    </Button>
  );

  // Define button styles for different variants
  const buttonStyles = {
    primary: {
      variant: "primary",
      style: { 
        background: 'linear-gradient(to right, #3b82f6, #1e40af)',
        border: 'none'
      }
    },
    success: {
      variant: "success",
      style: { 
        background: 'linear-gradient(to right, #10b981, #047857)',
        border: 'none'
      }
    },
    danger: {
      variant: "danger",
      style: { 
        background: 'linear-gradient(to right, #ef4444, #b91c1c)',
        border: 'none'
      }
    },
    outline: {
      variant: "outline-primary",
      style: {}
    }
  };

  const renderResponsiveButtons = (buttons) => (
    <Stack 
      direction="horizontal" 
      gap={2} 
      className="flex-wrap justify-content-center"
    >
      {buttons.map((btn, idx) => (
        <div key={idx} className="mb-2" style={{ flex: '0 0 auto' }}>
          {btn}
        </div>
      ))}
    </Stack>
  );

  // Updated switch case to handle rescheduled status differently for learners
  switch(effectiveStatus) {
    case 'pending':
      return renderResponsiveButtons([
        renderButton(
          buttonStyles.primary.variant, 
          () => toggleModal('sessionCreation', true, request), 
          'Accept & Create', 
          <CheckCircleFill />
        ),
        renderButton(
          buttonStyles.primary.variant, 
          () => toggleModal('reschedule', true, request), 
          'New Time', 
          <ArrowClockwise />
        ),
        renderButton(
          "outline-danger", 
          () => toggleModal('reject', true, request), 
          'Reject', 
          <XCircle />
        )
      ]);
    case 'accepted':
      return renderButton(
        buttonStyles.primary.variant, 
        handleViewSession, 
        'View Session', 
        <Eye />, 
        false
      );
    case 'completed':
      return renderResponsiveButtons([
        renderButton(
          buttonStyles.primary.variant, 
          handleViewSession, 
          'View Session', 
          <Eye />, 
          false
        ),
        !request.teacherFeedbackSubmitted && 
          renderButton(
            buttonStyles.outline.variant, 
            () => toggleModal('feedback', true, request), 
            'Feedback', 
            <ChatLeftText />
          )
      ]);
    case 'awaiting_response':
      return (
        <Button 
          variant="secondary" 
          disabled 
          className="rounded-pill d-flex align-items-center justify-content-center px-3 py-2"
          style={{ 
            fontSize: '0.9rem', 
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(to right, #9ca3af, #6b7280)',
            border: 'none',
            minWidth: '120px'
          }}
        >
          <Spinner size="sm" animation="border" className="me-2" />
          <span>Waiting for Response</span>
        </Button>
      );
    case 'reschedule_accepted':
      return (
        <Alert 
          variant="info" 
          className="mb-0 text-center rounded-pill py-2"
          style={{ 
            background: 'linear-gradient(to right, #38bdf8, #0284c7)', 
            border: 'none',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Clock className="me-2" />
          Waiting for Teacher to Create Session
        </Alert>
      );
    case 'reschedule_rejected':
      return (
        <Alert 
          variant="warning" 
          className="mb-0 text-center rounded-pill py-2"
          style={{ 
            background: 'linear-gradient(to right, #fbbf24, #d97706)', 
            border: 'none',
            color: 'white',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
          }}
        >
          <XCircle className="me-2" />
          New Time Rejected - Session Closed
        </Alert>
      );
    case 'rescheduled':
      // Updated: For learners, accepting a rescheduled request only updates status
      if (request.requestType === 'learning' || request.role === 'learner') {
        return renderResponsiveButtons([
          renderButton(
            buttonStyles.success.variant, 
            handleAcceptReschedule, 
            'Accept New Time', 
            <CheckCircleFill />
          ),
          renderButton(
            buttonStyles.danger.variant, 
            handleDeclineReschedule, 
            'Decline', 
            <XCircle />
          )
        ]);
      } else {
        // For teachers, this will create a session (existing functionality)
        return renderResponsiveButtons([
          renderButton(
            buttonStyles.success.variant, 
            () => toggleModal('sessionCreation', true, request), 
            'Accept New Time', 
            <CheckCircleFill />
          ),
          renderButton(
            buttonStyles.danger.variant, 
            () => toggleModal('reject', true, request), 
            'Reject', 
            <XCircle />
          )
        ]);
      }
    case 'rejected':
      return renderButton(
        buttonStyles.outline.variant, 
        () => navigate('/profile'), 
        'View Profile', 
        <PersonLinesFill />, 
        false
      );
    default:
      return null;
  }
};

export default ActionButtons;