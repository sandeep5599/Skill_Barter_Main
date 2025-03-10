import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import NotificationCenter from './NotificationCenter';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const LearnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Format helper
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

  // API fetch function
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches?role=student`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch requests: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter matches to include only relevant ones
      // This ensures we're showing the correct requests for the learner
      // NOTE: We're using a more generous filter here to make sure requests show up
      const learnerRequests = data.filter(match => 
        ['pending', 'rescheduled', 'accepted', 'rejected'].includes(match.status)
      );
      
      console.log('Fetched requests:', data);
      console.log('Filtered learner requests:', learnerRequests);
      
      setRequests(learnerRequests);
    } catch (err) {
      const errorMessage = 'Failed to fetch learning requests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    fetchRequests();
    
    // Set up polling to check for new requests periodically
    const intervalId = setInterval(fetchRequests, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [fetchRequests]);

  // Action button renderers
  const renderActionButtons = useMemo(() => {
    return (request) => {
      switch(request.status) {
        case 'pending':
          return (
            <Button variant="secondary" disabled>
              Awaiting Teacher Response
            </Button>
          );
        case 'rescheduled':
          return (
            <div className="d-flex flex-column gap-2">
              <Button 
                variant="success" 
                onClick={() => navigate(`/sessions/confirm/${request._id || request.id}`)}
              >
                Accept New Time
              </Button>
              <Button 
                variant="danger" 
                onClick={() => navigate(`/sessions/decline/${request._id || request.id}`)}
              >
                Decline
              </Button>
            </div>
          );
        case 'accepted':
          return (
            <Button variant="primary" onClick={() => navigate('/sessions')}>
              View Session
            </Button>
          );
        case 'rejected':
          return (
            <Button variant="primary" onClick={() => navigate('/match/learning')}>
              Find New Matches
            </Button>
          );
        default:
          return null;
      }
    };
  }, [navigate]);

  // Handle error dismissal
  const dismissError = useCallback(() => {
    setError('');
  }, []);

  return (
    <Container className="py-4">
      <Card className="mb-4 bg-light shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Learner Requests</h1>
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

      {error && (
        <Alert variant="danger" onClose={dismissError} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Loading learning requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Your Learning Requests</h2>
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
                      <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3" 
                        style={{ width: 40, height: 40, fontSize: 16, fontWeight: 'bold' }}>
                        {request.teacherName?.charAt(0).toUpperCase() || 
                         request.name?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <div>
                        <h5 className="mb-0">{request.teacherName || request.name || "Unknown Teacher"}</h5>
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
          <p className="text-muted">No learning requests found. Start by finding a teacher to learn from.</p>
          <Button variant="primary" className="mt-2" onClick={() => navigate('/match/learning')}>
            Find Learning Matches
          </Button>
        </div>
      )}
    </Container>
  );
};

export default LearnerRequests;