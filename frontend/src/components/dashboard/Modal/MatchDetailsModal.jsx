import React from 'react';
import { Modal, Button, Badge, Row, Col, ListGroup } from 'react-bootstrap';
import { 
  PersonFill, 
  ClockFill, 
  CheckCircleFill,
  XCircleFill,
  CalendarCheck,
  CalendarXFill,
  GeoAltFill,
  ChatDotsFill,
  StarFill,
  ArrowClockwise,
  ExclamationTriangleFill,
  PeopleFill,
  ClockHistory
} from 'react-bootstrap-icons';

const MatchDetailsModal = ({ show, handleClose, match }) => {
  // Return early if no match data is provided
  if (!match) return null;
  
  // Function to format date and time in a readable format
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate duration between start and end time in minutes
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    return Math.round(durationMs / (1000 * 60));
  };

  // Get match status with styling info
  const getMatchStatus = (status) => {
    switch(status) {
      case 'completed':
        return { 
          status: 'Completed', 
          variant: 'success',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.2)',
          icon: <CheckCircleFill />
        };
      case 'pending':
        return { 
          status: 'Pending Approval', 
          variant: 'warning',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.2)',
          icon: <ClockFill />
        };
      case 'accepted':
        return { 
          status: 'Accepted', 
          variant: 'primary',
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          icon: <CheckCircleFill />
        };
      case 'rejected':
        return { 
          status: 'Rejected', 
          variant: 'danger',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.2)',
          icon: <XCircleFill />
        };
      case 'rescheduled':
        return { 
          status: 'Rescheduled', 
          variant: 'info',
          color: '#06b6d4',
          bgColor: 'rgba(6, 182, 212, 0.1)',
          borderColor: 'rgba(6, 182, 212, 0.2)',
          icon: <ArrowClockwise />
        };
      case 'canceled':
        return { 
          status: 'Canceled', 
          variant: 'secondary',
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
          icon: <CalendarXFill />
        };
      case 'not_requested':
        return { 
          status: 'Not Requested', 
          variant: 'light',
          color: '#64748b',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
          icon: <ExclamationTriangleFill />
        };
      default:
        return { 
          status: 'Active', 
          variant: 'primary',
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
          icon: <PersonFill />
        };
    }
  };

  const statusInfo = getMatchStatus(match.status);

  // Get the latest proposed time slots
  const getLatestTimeSlots = () => {
    if (match.timeSlotHistory && match.timeSlotHistory.length > 0) {
      // Return the most recent time slot history
      const latestHistory = [...match.timeSlotHistory].sort((a, b) => 
        new Date(b.proposedAt) - new Date(a.proposedAt)
      )[0];
      
      return latestHistory.slots;
    }
    
    return match.proposedTimeSlots || [];
  };

  // Get formatted status messages
  const getStatusMessages = () => {
    if (!match.statusMessages || match.statusMessages.length === 0) {
      return [];
    }
    
    return [...match.statusMessages].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };
  
  // Determine if there's an active session
  const hasActiveSession = match.currentSessionId != null;
  
  // Determine if there are previous sessions
  const hasPreviousSessions = match.previousSessionIds && match.previousSessionIds.length > 0;

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered
      size="lg"
      className="match-details-modal"
    >
      <Modal.Header 
        closeButton
        style={{ 
          background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
          color: 'white',
          border: 'none'
        }}
      >
        <Modal.Title className="fs-5 fw-bold">Match Details</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          {/* Status Badge */}
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <div 
              className="me-2 d-flex align-items-center justify-content-center"
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%",
                background: statusInfo.bgColor,
                color: statusInfo.color
              }}
            >
              {statusInfo.icon}
            </div>
            <Badge 
              className="rounded-pill px-3 py-2"
              style={{ 
                background: statusInfo.bgColor,
                color: statusInfo.color,
                border: `1px solid ${statusInfo.borderColor}`,
                fontSize: '0.9rem'
              }}
            >
              {statusInfo.status}
            </Badge>
          </div>
          
          {/* Created/Updated date info */}
          <div className="d-flex align-items-center">
            <ClockHistory size={14} className="text-muted me-1" />
            <small className="text-muted">
              Created: {new Date(match.createdAt).toLocaleDateString()} 
              {match.updatedAt && match.updatedAt !== match.createdAt && 
                ` • Updated: ${new Date(match.updatedAt).toLocaleDateString()}`
              }
            </small>
          </div>
        </div>

        {/* Skill Name */}
        <h3 className="fw-bold mb-4" style={{ color: '#0f172a' }}>
          {match.skillName}
        </h3>

        <Row className="g-4">
          {/* Left Column */}
          <Col lg={6}>
            {/* Requester Info */}
            <div className="mb-4">
              <h5 className="text-muted mb-3 fw-bold">Requester</h5>
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10 me-3" 
                  style={{ width: '48px', height: '48px' }}>
                  <PersonFill size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{match.requesterName}</h6>
                  <p className="mb-0 text-muted small">ID: {String(match.requesterId).substring(0, 8)}...</p>
                </div>
              </div>
            </div>

            {/* Teacher Info */}
            <div className="mb-4">
              <h5 className="text-muted mb-3 fw-bold">Skill Sharer</h5>
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 me-3" 
                  style={{ width: '48px', height: '48px' }}>
                  <PersonFill size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{match.teacherName}</h6>
                  <p className="mb-0 text-muted small">ID: {String(match.teacherId).substring(0, 8)}...</p>
                </div>
              </div>
            </div>
            
            {/* Previous Match Status */}
            {match.previouslyMatched && (
              <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
                <div className="d-flex align-items-center">
                  <PeopleFill className="text-primary me-2" />
                  <div>
                    <p className="mb-0 fw-bold">Previously Matched</p>
                    {hasPreviousSessions && (
                      <p className="mb-0 small text-muted">
                        {match.previousSessionIds.length} previous session{match.previousSessionIds.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Reason (if applicable) */}
            {match.status === 'rejected' && match.rejectionReason && (
              <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                <h5 className="text-danger mb-2 d-flex align-items-center">
                  <XCircleFill className="me-2" />
                  Rejection Reason
                </h5>
                <p className="mb-0">{match.rejectionReason}</p>
              </div>
            )}
          </Col>

          {/* Right Column */}
          <Col lg={6}>
            {/* Selected Time Slot (if any) */}
            {match.selectedTimeSlot && (
              <div className="mb-4">
                <h5 className="text-muted mb-3 fw-bold">
                  Scheduled Time
                </h5>
                <div className="p-3 rounded-3" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
                  <div className="d-flex align-items-center mb-2">
                    <CalendarCheck className="me-2 text-success" />
                    <span className="fw-bold">Selected Time Slot</span>
                  </div>

                  <div className="ps-4 mb-2">
                    <div>
                      <strong>Start:</strong> {formatDateTime(match.selectedTimeSlot.startTime)}
                    </div>
                    <div>
                      <strong>End:</strong> {formatDateTime(match.selectedTimeSlot.endTime)}
                    </div>
                    <div>
                      <strong>Duration:</strong> {calculateDuration(match.selectedTimeSlot.startTime, match.selectedTimeSlot.endTime)} minutes
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center mt-2 ps-4">
                    <small className="text-muted">
                      Selected by: {match.selectedTimeSlot.selectedBy === match.requesterId ? match.requesterName : match.teacherName}
                      {match.selectedTimeSlot.selectedAt && 
                        ` on ${new Date(match.selectedTimeSlot.selectedAt).toLocaleDateString()}`}
                    </small>
                  </div>
                </div>
              </div>
            )}

            {/* Proposed Time Slots */}
            {!match.selectedTimeSlot && match.proposedTimeSlots && match.proposedTimeSlots.length > 0 && (
              <div className="mb-4">
                <h5 className="text-muted mb-3 fw-bold">
                  Proposed Time Slots
                </h5>
                
                {match.proposedTimeSlots.map((slot, index) => (
                  <div key={index} className="d-flex align-items-start mb-2 p-3 rounded-3" 
                    style={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                    <CalendarCheck className="me-2 text-primary mt-1" />
                    <div>
                      <div className="fw-bold mb-1">Option {index + 1}</div>
                      <div className="mb-1">
                        <strong>Start:</strong> {formatDateTime(slot.startTime)}
                      </div>
                      <div className="mb-1">
                        <strong>End:</strong> {formatDateTime(slot.endTime)}
                      </div>
                      <div className="mb-1">
                        <strong>Duration:</strong> {calculateDuration(slot.startTime, slot.endTime)} minutes
                      </div>
                      <small className="text-muted">
                        Proposed by: {slot.proposedBy === match.requesterId ? match.requesterName : match.teacherName}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Col>
        </Row>

        {/* Status Messages (if available) */}
        {match.statusMessages && match.statusMessages.length > 0 && (
          <div className="mt-4">
            <h5 className="text-muted mb-3 fw-bold">Status Updates</h5>
            <ListGroup variant="flush" className="border rounded-3">
              {getStatusMessages().map((statusMsg, index) => (
                <ListGroup.Item key={index} className="py-3 px-3 border-bottom">
                  <div className="d-flex align-items-center mb-1">
                    <ChatDotsFill className="text-primary me-2" size={14} />
                    <strong className="me-2">
                      {statusMsg.userId === match.requesterId ? match.requesterName : 
                       statusMsg.userId === match.teacherId ? match.teacherName : 'System'}
                    </strong>
                    <small className="text-muted ms-auto">
                      {new Date(statusMsg.timestamp).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0 ps-4">{statusMsg.message}</p>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* Current Session Info (if any) */}
        {hasActiveSession && (
          <div className="mt-4 p-3 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25">
            <div className="d-flex align-items-center mb-2">
              <CheckCircleFill className="text-success me-2" />
              <h5 className="mb-0 fw-bold">Active Session</h5>
            </div>
            <p className="mb-0 ps-4">
              Session ID: {String(match.currentSessionId).substring(0, 8)}...
            </p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex flex-column flex-sm-row w-100 gap-2">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            className="rounded-pill px-4 order-2 order-sm-1"
          >
            Close
          </Button>
          
          <div className="d-flex flex-column flex-sm-row gap-2 ms-auto order-1 order-sm-2">
            {match.status === 'pending' && (
              <>
                <Button 
                  variant="danger" 
                  className="rounded-pill px-4"
                >
                  Reject
                </Button>
                <Button 
                  variant="primary" 
                  className="rounded-pill px-4"
                  style={{ 
                    background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  Accept Match
                </Button>
              </>
            )}
            
            {match.status === 'accepted' && !hasActiveSession && (
              <Button 
                variant="success" 
                className="rounded-pill px-4"
                style={{ 
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                }}
              >
                Start Session
              </Button>
            )}
            
            {(match.status === 'accepted' || match.status === 'rescheduled') && (
              <Button 
                variant="warning" 
                className="rounded-pill px-4"
                style={{ 
                  background: 'linear-gradient(to right, #f59e0b, #d97706)',
                  border: 'none',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                }}
              >
                Reschedule
              </Button>
            )}
            
            {match.status !== 'completed' && match.status !== 'canceled' && match.status !== 'rejected' && (
              <Button 
                variant="outline-danger" 
                className="rounded-pill px-4"
              >
                Cancel Match
              </Button>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MatchDetailsModal;