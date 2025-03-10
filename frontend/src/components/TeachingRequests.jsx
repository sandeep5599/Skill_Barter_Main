import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import NotificationCenter from './NotificationCenter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const TeachingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalState, setModalState] = useState({
    reschedule: false,
    sessionCreation: false,
    reject: false
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

  // Format helpers
  const formatDateTime = useCallback((dateString) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  }, []);

  const formatDateTimeForInput = useCallback((date) => {
    return date.toISOString().slice(0, 16);
  }, []);

  // API fetch function
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches?role=teacher`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter matches to include only relevant ones where the user is ACTUALLY the teacher
      // This ensures that requests made BY the user as a student aren't shown here
      const teachingRequests = data.filter(match => 
        ['pending', 'rescheduled', 'accepted', 'rejected'].includes(match.status) &&
        match.teacherId === user._id // Ensure user is the teacher, not the student
      );
      
      setRequests(teachingRequests);
    } catch (err) {
      setError('Failed to fetch teaching requests. Please try again.');
      toast.error('Failed to fetch teaching requests');
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
          
          setProposedDateTime(formatDateTimeForInput(startTime));
          setProposedEndTime(formatDateTimeForInput(endTime));
        } else {
          // Default to current time + 1 day
          const startTime = new Date();
          startTime.setDate(startTime.getDate() + 1);
          startTime.setHours(startTime.getHours(), 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setHours(endTime.getHours() + 1);
          
          setProposedDateTime(formatDateTimeForInput(startTime));
          setProposedEndTime(formatDateTimeForInput(endTime));
        }
      } else if (modalName === 'sessionCreation') {
        // Set default values for session creation
        setSessionDetails({
          title: `${request.skillName || request.expertise || 'Tutoring'} Session`,
          description: '',
          meetingLink: '',
          prerequisites: '',
          notes: '',
          selectedTimeSlot: request.proposedTimeSlots && request.proposedTimeSlots.length > 0 
            ? request.proposedTimeSlots[0] 
            : null
        });
      } else if (modalName === 'reject') {
        setRejectionReason('');
      }
    }
  }, [formatDateTimeForInput]);

  // API action handlers
  const handleCreateSession = async () => {
    if (!sessionDetails.selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    try {
      setProcessing(true);
      
      // First accept the match
      const acceptResponse = await fetch(`${BACKEND_URL}/api/matches/${selectedRequest._id || selectedRequest.id}/accept`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          selectedTimeSlot: sessionDetails.selectedTimeSlot
        })
      });

      if (!acceptResponse.ok) throw new Error('Failed to accept request');
      
      // Then create the session with details
      const sessionResponse = await fetch(`${BACKEND_URL}/api/sessions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          matchId: selectedRequest._id || selectedRequest.id,
          title: sessionDetails.title,
          description: sessionDetails.description,
          meetingLink: sessionDetails.meetingLink,
          prerequisites: sessionDetails.prerequisites,
          notes: sessionDetails.notes,
          startTime: sessionDetails.selectedTimeSlot.startTime,
          endTime: sessionDetails.selectedTimeSlot.endTime
        })
      });

      if (!sessionResponse.ok) throw new Error('Failed to create session');

      toast.success('Session created successfully!');
      toggleModal('sessionCreation', false);
      fetchRequests();
    } catch (error) {
      setError('Failed to create session: ' + error.message);
      toast.error('Failed to create session');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/${selectedRequest._id || selectedRequest.id}/reject`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason
        })
      });

      if (!response.ok) throw new Error('Failed to reject request');

      toast.info('Request rejected');
      toggleModal('reject', false);
      fetchRequests();
    } catch (error) {
      setError('Failed to reject request');
      toast.error('Failed to reject request');
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

      const response = await fetch(`${BACKEND_URL}/api/matches/${selectedRequest._id || selectedRequest.id}/reschedule`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          proposedTimeSlot: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('Failed to reschedule request');

      toast.success('Request rescheduled successfully!');
      toggleModal('reschedule', false);
      fetchRequests();
    } catch (error) {
      setError('Failed to reschedule request');
      toast.error('Failed to reschedule request');
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

  // Status badge renderer
  const getStatusBadge = useCallback((status) => {
    const variants = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      rescheduled: 'info',
      default: 'secondary'
    };
    
    const variant = variants[status] || variants.default;
    
    return (
      <Badge bg={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (user && user._id) {
      fetchRequests();
    }
    
    // Set up polling to check for new requests periodically
    const intervalId = setInterval(fetchRequests, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [fetchRequests, user]);

  // Action button renderers
  const renderActionButtons = useMemo(() => {
    return (request) => {
      switch(request.status) {
        case 'pending':
          return (
            <>
              <Button 
                variant="success" 
                onClick={() => toggleModal('sessionCreation', true, request)}
                disabled={processing}
              >
                {processing ? <Spinner size="sm" animation="border" /> : 'Accept & Create Session'}
              </Button>
              <Button 
                variant="warning" 
                onClick={() => toggleModal('reschedule', true, request)}
                disabled={processing}
              >
                Propose New Time
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
        case 'accepted':
          return (
            <Button variant="primary" onClick={() => navigate('/sessions')}>
              View Session
            </Button>
          );
        case 'rescheduled':
          return (
            <>
              <Button 
                variant="success" 
                onClick={() => toggleModal('sessionCreation', true, request)}
                disabled={processing}
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
              variant="outline-secondary" 
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
  }, [navigate, processing, toggleModal]);

  return (
    <Container className="py-4">
      <Card className="mb-4 bg-light shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Teaching Requests</h1>
          <div className="d-flex align-items-center">
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

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Loading teaching requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Session Requests</h2>
            <Button variant="primary" onClick={fetchRequests}>
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
                        <strong>Request Status:</strong> {getStatusBadge(request.status)}
                      </p>
                      
                      <p className="mb-1">
                        <strong>Requested Time Slots:</strong>
                      </p>
                      <div className="bg-light p-2 rounded">
                        {request.proposedTimeSlots && request.proposedTimeSlots.length > 0 ? (
                          request.proposedTimeSlots.map((slot, index) => (
                            <div key={index} className="mb-1">
                              <small className={index === 0 ? 'fw-bold' : ''}>
                                Option {index + 1}: {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
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
                    {renderActionButtons(request)}
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
            {processing ? <Spinner size="sm" animation="border" /> : 'Reject Request'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Session Creation Modal */}
      <Modal
        show={modalState.sessionCreation}
        onHide={() => toggleModal('sessionCreation', false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Teaching Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Session Title</Form.Label>
              <Form.Control
                name="title"
                value={sessionDetails.title}
                onChange={handleSessionDetailsChange}
                required
                placeholder="E.g. Introduction to Python, Guitar Basics, etc."
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
                placeholder="What will be covered in this session?"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Meeting Link (optional)</Form.Label>
              <Form.Control
                name="meetingLink"
                value={sessionDetails.meetingLink}
                onChange={handleSessionDetailsChange}
                placeholder="Zoom/Google Meet link"
              />
              <Form.Text className="text-muted">
                You can add this now or later from the sessions page
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Prerequisites</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="prerequisites"
                value={sessionDetails.prerequisites}
                onChange={handleSessionDetailsChange}
                placeholder="What should the student prepare or know beforehand?"
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
                placeholder="Any other information the student should know"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Select Time Slot</Form.Label>
              {selectedRequest?.proposedTimeSlots?.map((slot, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  id={`slot-${index}`}
                  label={`${formatDateTime(slot.startTime)} - ${formatDateTime(slot.endTime)}`}
                  checked={sessionDetails.selectedTimeSlot === slot}
                  onChange={() => handleTimeSlotSelect(slot)}
                  className="mb-2"
                />
              ))}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('sessionCreation', false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateSession}
            disabled={processing}
          >
            {processing ? <Spinner size="sm" animation="border" /> : 'Create Session'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeachingRequests;