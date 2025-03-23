import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import NotificationCenter from './NotificationCenter';
import { TeacherFeedbackModal } from './FeedbackModals';
import { 
  fetchTeachingRequests, 
  updateMatchStatus, 
  createSession,
  completeSession,
  updateSession,
  confirmSession
} from '../services/api.services';

// Helper functions for date formatting
const formatHelpers = {
  formatDateTime: (dateString) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  },
  
  formatDateTimeForInput: (date) => {
    return date.toISOString().slice(0, 16);
  }
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const variants = {
    pending: 'warning',
    accepted: 'success',
    completed: 'info',
    rejected: 'danger',
    rescheduled: 'primary',
    'awaiting_response': 'secondary',
    'reschedule_rejected': 'danger',
    'reschedule_accepted': 'success',
    default: 'secondary'
  };
  
  const displayText = {
    pending: 'Pending',
    accepted: 'Accepted',
    completed: 'Completed',
    rejected: 'Rejected',
    rescheduled: 'Rescheduled',
    'awaiting_response': 'Awaiting Response',
    'reschedule_rejected': 'Reschedule Rejected',
    'reschedule_accepted': 'Reschedule Accepted',
  };

  const variant = variants[status] || variants.default;
  const text = displayText[status] || status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <Badge bg={variant}>
      {text}
    </Badge>
  );
};

// Action Buttons Component
const ActionButtons = ({ 
  request, 
  processing, 
  toggleModal, 
  navigate, 
  getEffectiveStatus 
}) => {
  const effectiveStatus = getEffectiveStatus(request);

  const handleViewSession = (session) => {
    if (!request.id) {
      console.error('No session ID for request:', request);

      toast.error('Session ID not available. Please refresh and try again.');
      return;
    }
    navigate(`/sessions/${request.id}`);
  };


  switch(effectiveStatus) {
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
            onClick={handleViewSession}
            className="mb-2"
          >
            View Session
          </Button>
        </>
      );
    case 'completed':
      return (
        <>
          <Button 
            variant="primary"
            onClick={handleViewSession}
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
    case 'awaiting_response':
      return (
        <Button 
          variant="secondary"
          disabled={true}
          className="mb-2"
        >
          Waiting for Response
        </Button>
      );
    case 'reschedule_accepted':
      return (
        <Button 
          variant="primary"
          onClick={() => toggleModal('sessionCreation', true, request)}
          disabled={processing}
          className="mb-2"
        >
          Create Session
        </Button>
      );
    case 'reschedule_rejected':
      return (
        <Alert variant="warning" className="mb-0 text-center">
          New Time Rejected - Session Closed
        </Alert>
      );
    case 'rescheduled':
      return (
        <>
          <Button 
            variant="success"
            onClick={() => toggleModal('sessionCreation', true, request)}
            disabled={processing}
            className="mb-2"
          >
            Accept New Time
          </Button>
          <Button 
            variant="danger"
            onClick={() => toggleModal('reject', true, request)}
            disabled={processing}
          >
            Reject Request
          </Button>
        </>
      );
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



const TeachingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState({
    reschedule: false,
    sessionCreation: false,
    reject: false,
    feedback: false,
    completeSession: false
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposedDateTime, setProposedDateTime] = useState('');
  const [proposedEndTime, setProposedEndTime] = useState('');
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');


  const [sessionDetails, setSessionDetails] = useState({
    title: '',
    description: '',
    meetingLink: '',
    prerequisites: '',
    notes: '',
    selectedTimeSlot: null
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Function to determine the effective status for UI display
// Function to determine the effective status for UI display
const getEffectiveStatus = useCallback((request) => {
  // Check if request is null or undefined
  if (!request) {
    return 'pending'; // or any default status you prefer
  }
  
  // If the request has a special flag for reschedule response
  if (request.rescheduleResponse) {
    return request.rescheduleResponse === 'accepted' 
      ? 'reschedule_accepted' 
      : 'reschedule_rejected';
  }
  
  // If the request is rescheduled and was initiated by the teacher
  if (request.status === 'rescheduled' && request.rescheduleInitiator === 'teacher') {
    return 'awaiting_response';
  }
  
  // Default to the request's status
  return request.status || 'pending';
}, []);

  // API fetch function
  const loadTeachingRequests = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError('');
    try {
      const teachingRequests = await fetchTeachingRequests(user._id);
      setRequests(teachingRequests);
    } catch (err) {
      const errorMessage = 'Failed to fetch teaching requests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Modal control functions
  const toggleModal = useCallback((modalName, show, request = null) => {
    setModalState(prev => ({ ...prev, [modalName]: show }));
    
    if (request) {
      setSelectedRequest(request);
      
      if (modalName === 'reschedule') {
        // Set default proposed times
        if (request.proposedTimeSlots && request.proposedTimeSlots.length > 0) {
          const startTime = new Date(request.proposedTimeSlots[0].startTime);
          const endTime = new Date(request.proposedTimeSlots[0].endTime);
          
          setProposedDateTime(formatHelpers.formatDateTimeForInput(startTime));
          setProposedEndTime(formatHelpers.formatDateTimeForInput(endTime));
        } else {
          // Default to current time + 1 day
          const startTime = new Date();
          startTime.setDate(startTime.getDate() + 1);
          startTime.setHours(startTime.getHours(), 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setHours(endTime.getHours() + 1);
          
          setProposedDateTime(formatHelpers.formatDateTimeForInput(startTime));
          setProposedEndTime(formatHelpers.formatDateTimeForInput(endTime));
        }
      } else if (modalName === 'sessionCreation') {
        // Set default values for session creation
        setSessionDetails({
          title: `${request.skillName || request.expertise || 'Tutoring'} Session`,
          description: '',
          meetingLink: '',
          prerequisites: '',
          notes: '',
          selectedTimeSlot: request.timeSlots && request.timeSlots.length > 0 
            ? request.timeSlots[0] 
            : null
        });
      } else if (modalName === 'reject') {
        setRejectionReason('');
      }
    }
  }, []);

  // Handle API actions
  const handleCreateSession = async () => {
    if (!sessionDetails.selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Determine the type of session action
      const effectiveStatus = getEffectiveStatus(selectedRequest);
      const isRescheduledSessionAccepted = effectiveStatus === 'reschedule_accepted';
      const isRegularReschedule = selectedRequest.status === 'rescheduled' && !isRescheduledSessionAccepted;
              
      // First, update the match status
      await updateMatchStatus(selectedRequest._id || selectedRequest.id, {
        status: 'accepted',
        selectedTimeSlot: sessionDetails.selectedTimeSlot,
        message: isRescheduledSessionAccepted || isRegularReschedule ? 
          "The rescheduled time has been accepted" : 
          (sessionDetails.notes || sessionDetails.description),
        notificationType: isRescheduledSessionAccepted || isRegularReschedule ? 
          'rescheduled_session_accepted' : 
          'session_created'
      });
      
      let updatedSessionId;
      
      // Then, create a new session or update existing session
      if ((isRescheduledSessionAccepted || isRegularReschedule) && selectedRequest.sessionId) {
        // Update existing session with new time
        const updateResponse = await updateSession(selectedRequest.sessionId, {
          selectedTimeSlot: sessionDetails.selectedTimeSlot,
          title: sessionDetails.title,
          description: sessionDetails.description,
          meetingLink: sessionDetails.meetingLink,
          prerequisites: sessionDetails.prerequisites,
          notes: sessionDetails.notes,
          notificationType: 'reschedule_accepted'
        });
        
        console.log('Session updated:', updateResponse);
        updatedSessionId = selectedRequest.sessionId;
        toast.success('Rescheduled session accepted!');
      } else {
        // Create a new session
        const sessionResponse = await createSession({
          matchId: selectedRequest._id || selectedRequest.id,
          selectedTimeSlot: sessionDetails.selectedTimeSlot,
          title: sessionDetails.title,
          description: sessionDetails.description,
          meetingLink: sessionDetails.meetingLink,
          prerequisites: sessionDetails.prerequisites,
          notes: sessionDetails.notes,
          notificationType: 'session_created'
        });
        
        console.log('New session created:', sessionResponse);
        
        // Extract the session ID from the response
        updatedSessionId = sessionResponse.session && (sessionResponse.session._id || sessionResponse.session.id);
        
        if (!updatedSessionId) {
          console.error('No session ID returned from API:', sessionResponse);
          toast.warning('Session created but ID not returned. Refreshing data...');
        } else {
          console.log('New session ID:', updatedSessionId);
          toast.success('Session created successfully!');
        }
      }
      
      // Update the requests array with the new session ID if we have one
      if (updatedSessionId) {
        setRequests(prevRequests => {
          const newRequests = prevRequests.map(req => 
            (req._id === selectedRequest._id || req.id === selectedRequest.id) 
              ? { ...req, sessionId: updatedSessionId } 
              : req
          );
          console.log('Updated requests with session ID:', newRequests);
          return newRequests;
        });
      }
      
      toggleModal('sessionCreation', false);
      // Reload all teaching requests to ensure we have the latest data
      await loadTeachingRequests();
    } catch (error) {
      setError('Failed to create session: ' + (error.message || 'Unknown error'));
      toast.error('Failed to create session');
      console.error('Session creation error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      await updateMatchStatus(selectedRequest._id || selectedRequest.id, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        message: rejectionReason, // Also send as message for notifications
        notificationType: 'match_rejected', // Add this to trigger a notification
        recipientId: selectedRequest.studentId // Add this to specify who gets the notification
      });

      toast.info('Request rejected');
      toggleModal('reject', false);
      loadTeachingRequests();
    } catch (error) {
      setError('Failed to reject request');
      toast.error('Failed to reject request');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReschedule = async () => {
    if (!proposedDateTime || !proposedEndTime) {
      toast.error('Please select both start and end times');
      return;
    }

    try {
      setProcessing(true);
      const startTime = new Date(proposedDateTime);
      const endTime = new Date(proposedEndTime);

      if (startTime >= endTime) {
        toast.error('End time must be after start time');
        return;
      }

      await updateMatchStatus(selectedRequest._id || selectedRequest.id, {
        status: 'rescheduled',
        selectedTimeSlot: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        },
        message: "I've proposed a new time for our session.",
        notificationType: 'match_rescheduled', // Add this to trigger a notification
        recipientId: selectedRequest.studentId, // Add this to specify who gets the notification
        rescheduleInitiator: 'teacher' // Mark that teacher initiated this reschedule
      });

      toast.success('Request rescheduled successfully!');
      toggleModal('reschedule', false);
      loadTeachingRequests();
    } catch (error) {
      setError('Failed to reschedule request');
      toast.error('Failed to reschedule request');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  // New function to handle session completion
  const handleCompleteSession = async () => {
    try {
      setProcessing(true);
      
      await completeSession(selectedRequest.sessionId);
      
      toast.success('Session marked as completed.');
      toggleModal('completeSession', false);
      toggleModal('feedback', true, selectedRequest);
      loadTeachingRequests();
    } catch (error) {
      setError('Failed to complete session: ' + error.message);
      toast.error('Failed to mark session as completed');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };
  
  // Form handlers
  const handleSessionDetailsChange = useCallback((e) => {
    const { name, value } = e.target;
    setSessionDetails(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleTimeSlotSelect = useCallback((timeSlot) => {
    setSessionDetails(prev => ({
      ...prev,
      selectedTimeSlot: timeSlot
    }));
  }, []);

  const handleConfirmRescheduled = async () => {
    try {
      setProcessing(true);
      
      await confirmSession(selectedRequest.sessionId, {
        status: 'accepted',
        message: "I've accepted the rescheduled time",
        selectedTimeSlot: sessionDetails.selectedTimeSlot,
      });
      
      toast.success('Rescheduled session confirmed!');
      toggleModal('sessionCreation', false);
      loadTeachingRequests();
    } catch (error) {
      setError('Failed to confirm session: ' + error.message);
      toast.error('Failed to confirm session');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };



  // Load data on component mount
  useEffect(() => {
    if (user && user._id) {
      loadTeachingRequests();
    }
    
    // Set up polling to check for new requests periodically
    const intervalId = setInterval(loadTeachingRequests, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [loadTeachingRequests, user]);

  // Handle error dismissal
  const dismissError = useCallback(() => {
    setError('');
  }, []);

  // Handle feedback submission
  const handleFeedbackSubmitted = useCallback(() => {
    loadTeachingRequests();
  }, [loadTeachingRequests]);

  return (
    <Container className="py-4">
      <Card className="mb-4 bg-light shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center flex-wrap">
          <h1 className="mb-0">Teaching Requests</h1>
          <div className="d-flex align-items-center mt-2 mt-md-0">
            <NotificationCenter />
            <div className="ms-3">
              <Button variant="primary" className="me-2" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="primary" className="me-2" onClick={() => navigate('/profile')}>
                Profile
              </Button>
              <Button variant="danger" onClick={() => logout() && navigate('/')}>
                Logout
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" onClose={dismissError} dismissible>{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Loading teaching requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Session Requests</h2>
            <Button variant="primary" onClick={loadTeachingRequests}>
              Refresh Requests
            </Button>
          </div>
          
          {requests.map(request => (
            <Card key={request._id || request.id} className="mb-3 shadow-sm border-0">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={8}>
                    <div className="d-flex align-items-center mb-2">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                        style={{ width: 40, height: 40, fontSize: 16, fontWeight: 'bold' }}>
                        {request.studentName?.charAt(0).toUpperCase() || 
                         request.name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <div>
                        <h5 className="mb-0">{request.studentName || request.name || "Unknown Student"}</h5>
                        <small className="text-muted">
                          Skill: <strong>{request.skillName || request.expertise || "Not specified"}</strong>
                        </small>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>Request Status:</strong>{' '}
                        <StatusBadge status={getEffectiveStatus(request)} />
                      </p>
                      
                      <p className="mb-1">
                        <strong>Requested Time Slots:</strong>
                      </p>
                      <div className="bg-light p-2 rounded">
                      {request.timeSlots && request.timeSlots.length > 0 ? (
                          request.timeSlots.map((slot, index) => (
                            <div key={index} className="mb-1">
                              <small className={index === 0 ? 'fw-bold' : ''}>
                                Option {index + 1}: {formatHelpers.formatDateTime(slot.startTime)} - {formatHelpers.formatDateTime(slot.endTime)}
                              </small>
                            </div>
                          ))
                        ) : (
                          <p className="mb-0">No time slots proposed</p>
                        )}  
                      </div>
                      
                      {request.rejectionReason && (
                        <div className="mt-2">
                          <small className="text-danger">
                            <strong>Rejection reason:</strong> {request.rejectionReason}
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <p className="mb-0">
                      <small className="text-muted">
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </small>
                    </p>
                  </Col>
                  <Col xs={12} md={4} className="d-flex flex-column gap-2 mt-3 mt-md-0">
                    <ActionButtons 
                      request={request}
                      processing={processing}
                      toggleModal={toggleModal}
                      navigate={navigate}
                      getEffectiveStatus={getEffectiveStatus}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </>
      ) : (
        <div className="text-center my-5">
          <p className="text-muted">No teaching requests found.</p>
          <Button variant="primary" className="mt-2" onClick={() => navigate('/profile')}>
            Add Teaching Skills
          </Button>
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal 
        show={modalState.reschedule} 
        onHide={() => toggleModal('reschedule', false)} 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Propose New Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Proposed Start Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={proposedDateTime}
                onChange={(e) => setProposedDateTime(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Proposed End Time</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={proposedEndTime}
                onChange={(e) => setProposedEndTime(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('reschedule', false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleReschedule}
            disabled={processing}
          >
            {processing ? <Spinner size="sm" animation="border" /> : 'Submit Proposal'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rejection Modal */}
      <Modal 
        show={modalState.reject} 
        onHide={() => toggleModal('reject', false)} 
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Rejection (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this request"
              />
              <Form.Text className="text-muted">
                This will be shared with the student to help them understand why their request was rejected.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('reject', false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={processing}
          >
            {processing ? <Spinner size="sm" animation="border" /> : 'Confirm Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Session Creation Modal */}
      <Modal 
        show={modalState.sessionCreation} 
        onHide={() => toggleModal('sessionCreation', false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Teaching Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Session Title</Form.Label>
              <Form.Control 
                type="text" 
                name="title"
                value={sessionDetails.title}
                onChange={handleSessionDetailsChange}
                placeholder="Enter a title for this session"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={sessionDetails.description}
                onChange={handleSessionDetailsChange}
                placeholder="Describe what will be covered in this session"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Meeting Link</Form.Label>
              <Form.Control 
                type="text" 
                name="meetingLink"
                value={sessionDetails.meetingLink}
                onChange={handleSessionDetailsChange}
                placeholder="Zoom, Google Meet, or other video conferencing link"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Prerequisites</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="prerequisites"
                value={sessionDetails.prerequisites}
                onChange={handleSessionDetailsChange}
                placeholder="Any prerequisites the student should prepare before the session"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                name="notes"
                value={sessionDetails.notes}
                onChange={handleSessionDetailsChange}
                placeholder="Any additional notes or information for the student"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Select Time Slot</Form.Label>
              {selectedRequest?.timeSlots && selectedRequest.timeSlots.length > 0 ? (
                selectedRequest.timeSlots.map((slot, index) => (
                  <div key={index} className="mb-2">
                    <Form.Check
                      type="radio"
                      id={`timeslot-${index}`}
                      label={`${formatHelpers.formatDateTime(slot.startTime)} - ${formatHelpers.formatDateTime(slot.endTime)}`}
                      name="timeSlot"
                      checked={sessionDetails.selectedTimeSlot && 
                              sessionDetails.selectedTimeSlot.startTime === slot.startTime}
                      onChange={() => handleTimeSlotSelect(slot)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-muted">No time slots available</p>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('sessionCreation', false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={getEffectiveStatus(selectedRequest) === 'reschedule_accepted' 
              ? handleConfirmRescheduled 
              : handleCreateSession}
            disabled={processing || !sessionDetails.selectedTimeSlot}
          >
            {processing ? <Spinner size="sm" animation="border" /> : 'Create Session'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Complete Session Modal */}
      <Modal
        show={modalState.completeSession}
        onHide={() => toggleModal('completeSession', false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Complete Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark this session as completed?</p>
          <p>After completion, both you and the student will be prompted to provide feedback.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('completeSession', false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleCompleteSession}
            disabled={processing}
          >
            {processing ? <Spinner size="sm" animation="border" /> : 'Confirm Completion'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Feedback Modal */}
      {selectedRequest && (
        <TeacherFeedbackModal
          show={modalState.feedback}
          onHide={() => toggleModal('feedback', false)}
          sessionId={selectedRequest.sessionId}
          studentId={selectedRequest.studentId}
          studentName={selectedRequest.studentName || selectedRequest.name || "Student"}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </Container>
  );
};

export default TeachingRequests;