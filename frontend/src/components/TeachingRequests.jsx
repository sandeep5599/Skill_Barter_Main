import React, { useState, useEffect, useCallback } from 'react';
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
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposedDateTime, setProposedDateTime] = useState('');
  const [proposedEndTime, setProposedEndTime] = useState('');
  const [processing, setProcessing] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches/teaching-requests`, {
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
      setRequests(data);
    } catch (err) {
      setError('Failed to fetch teaching requests. Please try again.');
      toast.error('Failed to fetch teaching requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (requestId) => {
    try {
      setProcessing(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/${requestId}/accept`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) throw new Error('Failed to accept request');
      
      // The backend should handle session creation as part of the accept process
      toast.success('Request accepted! Session created.');
      fetchRequests();
    } catch (error) {
      setError('Failed to accept request');
      toast.error('Failed to accept request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessing(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/${requestId}/reject`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) throw new Error('Failed to reject request');

      toast.info('Request rejected');
      fetchRequests();
    } catch (error) {
      setError('Failed to reject request');
      toast.error('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const openRescheduleModal = (request) => {
    setSelectedRequest(request);
    
    // Set default proposed times based on the first time slot
    if (request.proposedTimeSlots && request.proposedTimeSlots.length > 0) {
      const startTime = new Date(request.proposedTimeSlots[0].startTime);
      const endTime = new Date(request.proposedTimeSlots[0].endTime);
      
      // Format for datetime-local input
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
    
    setShowRescheduleModal(true);
  };

  const formatDateTimeForInput = (date) => {
    return date.toISOString().slice(0, 16);
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
      setShowRescheduleModal(false);
      fetchRequests();
    } catch (error) {
      setError('Failed to reschedule request');
      toast.error('Failed to reschedule request');
    } finally {
      setProcessing(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getStatusBadge = (status) => {
    let variant = 'secondary';
    
    switch(status) {
      case 'pending': 
        variant = 'warning'; 
        break;
      case 'accepted': 
        variant = 'success'; 
        break;
      case 'rejected': 
        variant = 'danger'; 
        break;
      case 'rescheduled': 
        variant = 'info'; 
        break;
      default: 
        variant = 'secondary';
    }
    
    return (
      <Badge bg={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
              <Button variant="danger" onClick={handleLogout}>
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
            <Button variant="outline-primary" onClick={fetchRequests}>
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
                        {request.studentName ? request.studentName.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div>
                        <h5 className="mb-0">{request.studentName || "Unknown Student"}</h5>
                        <small className="text-muted">
                          Skill: <strong>{request.skillName || "Not specified"}</strong>
                        </small>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>Requested Times:</strong> {getStatusBadge(request.status)}
                      </p>
                      <div className="bg-light p-2 rounded">
                        {request.proposedTimeSlots && request.proposedTimeSlots.map((slot, index) => (
                          <div key={index} className="mb-1">
                            <small className={index === 0 ? 'fw-bold' : ''}>
                              Option {index + 1}: {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="mb-0">
                      <small className="text-muted">
                        Requested on: {new Date(request.createdAt).toLocaleDateString()}
                      </small>
                    </p>
                  </Col>
                  <Col xs={12} md={4} className="d-flex flex-column gap-2 mt-3 mt-md-0">
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          onClick={() => handleAccept(request._id || request.id)}
                          disabled={processing}
                        >
                          {processing ? <Spinner size="sm" animation="border" /> : 'Accept Request'}
                        </Button>
                        <Button 
                          variant="warning" 
                          onClick={() => openRescheduleModal(request)}
                          disabled={processing}
                        >
                          Propose New Time
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleReject(request._id || request.id)}
                          disabled={processing}
                        >
                          Reject Request
                        </Button>
                      </>
                    )}
                    {request.status === 'accepted' && (
                      <Button variant="primary" onClick={() => navigate('/sessions')}>
                        View Session
                      </Button>
                    )}
                    {request.status === 'rescheduled' && (
                      <>
                        <Button 
                          variant="success" 
                          onClick={() => handleAccept(request._id || request.id)}
                          disabled={processing}
                        >
                          Accept New Time
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleReject(request._id || request.id)}
                          disabled={processing}
                        >
                          Reject Request
                        </Button>
                      </>
                    )}
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
        show={showRescheduleModal} 
        onHide={() => setShowRescheduleModal(false)} 
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
          <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>
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
    </Container>
  );
};

export default TeachingRequests;