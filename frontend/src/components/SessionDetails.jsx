import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Modal, Form, Spinner, Alert
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  CalendarCheck, PersonFill, ClockFill, 
  CheckCircleFill, PencilFill, StarFill,
  Link, FileEarmarkTextFill
} from 'react-bootstrap-icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Session data state
  const [sessionData, setSessionData] = useState({
    session: null,
    loading: true,
    error: null,
    isTeacher: false,
    isLearner: false,
    isUpcoming: false,
    isJoinable: false,
    timeRemaining: '',
  });
  
  // Modal states - grouped for better organization
  const [modals, setModals] = useState({
    showMeetingLinkModal: false,
    showFeedbackModal: false,
    showCompletionModal: false,
  });
  
  // Form states - grouped for better organization
  const [formData, setFormData] = useState({
    meetingLink: '',
    rating: 5,
    reviewText: '',
    teacherNotes: '',
  });
  
  // Update specific form field
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Toggle modal visibility
  const toggleModal = useCallback((modalName, isVisible) => {
    setModals(prev => ({ ...prev, [modalName]: isVisible }));
  }, []);
  
  // Fetch session details
  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId || !user) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session details');
      }
      
      const data = await response.json();
      
      // Update session data and related state
      setSessionData(prev => ({
        ...prev,
        session: data,
        loading: false,
        isTeacher: user._id === data.teacherId,
        isLearner: user._id === data.studentId,
      }));
      
      // Update meeting link in form data
      setFormData(prev => ({
        ...prev,
        meetingLink: data.meetingLink || '',
      }));
      
    } catch (err) {
      console.error('Error fetching session details:', err);
      setSessionData(prev => ({
        ...prev,
        error: 'Failed to load session details. Please try again.',
        loading: false,
      }));
      toast.error('Error loading session details');
    }
  }, [sessionId, user]);
  
  // Initial fetch
  useEffect(() => {
    fetchSessionDetails();
  }, [fetchSessionDetails]);
  
  // Update session status (timing, joinability)
  useEffect(() => {
    if (!sessionData.session) return;
    
    const updateSessionStatus = () => {
      const now = new Date();
      const sessionStart = new Date(sessionData.session.startTime);
      const sessionEnd = new Date(sessionData.session.endTime);
      
      // Calculate if session is upcoming
      const isUpcoming = sessionStart > now;
      
      // Calculate if session is joinable (5 min before to end time)
      const joinWindow = new Date(sessionStart);
      joinWindow.setMinutes(joinWindow.getMinutes() - 5);
      const isJoinable = now >= joinWindow && now <= sessionEnd;
      
      // Calculate time remaining
      let timeRemaining = '';
      if (sessionStart > now) {
        const timeDiff = sessionStart - now;
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          timeRemaining = `${days}d ${hours}h remaining`;
        } else if (hours > 0) {
          timeRemaining = `${hours}h ${minutes}m remaining`;
        } else {
          timeRemaining = `${minutes}m remaining`;
        }
      } else if (now <= sessionEnd) {
        timeRemaining = 'In progress';
      } else {
        timeRemaining = 'Completed';
      }
      
      setSessionData(prev => ({
        ...prev,
        isUpcoming,
        isJoinable,
        timeRemaining,
      }));
    };
    
    // Update initially and set interval
    updateSessionStatus();
    const interval = setInterval(updateSessionStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [sessionData.session]);
  
  // API actions
  const apiActions = useMemo(() => ({
    // Update meeting link
    updateMeetingLink: async () => {
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/sessions/${sessionId}/meeting-link`,
          { meetingLink: formData.meetingLink },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 200) {
          setSessionData(prev => ({
            ...prev,
            session: { ...prev.session, meetingLink: formData.meetingLink }
          }));
          toast.success('Meeting link updated successfully');
          toggleModal('showMeetingLinkModal', false);
        }
      } catch (err) {
        console.error('Error updating meeting link:', err);
        toast.error('Failed to update meeting link');
      }
    },
    
    // Complete session
    completeSession: async () => {
      try {
        const response = await axios.put(
          `${BACKEND_URL}/api/sessions/${sessionId}/complete`,
          { notes: formData.teacherNotes },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 200) {
          setSessionData(prev => ({
            ...prev,
            session: { 
              ...prev.session, 
              status: 'completed', 
              notes: formData.teacherNotes 
            }
          }));
toast.success('Session marked as completed');
          toggleModal('showCompletionModal', false);
          
          // If user is learner, show feedback modal
          if (sessionData.isLearner) {
            toggleModal('showFeedbackModal', true);
          }
        }
      } catch (err) {
        console.error('Error completing session:', err);
        toast.error('Failed to mark session as completed');
      }
    },
    
    // Submit feedback
    submitFeedback: async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/reviews`,
          {
            sessionId,
            teacherId: sessionData.session.teacherId,
            teacherName: sessionData.session.teacherName,
            skillId: sessionData.session.skillId,
            rating: formData.rating,
            reviewText: formData.reviewText
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.status === 201) {
          toast.success('Thank you for your feedback!');
          toggleModal('showFeedbackModal', false);
        }
      } catch (err) {
        console.error('Error submitting feedback:', err);
        toast.error('Failed to submit feedback');
      }
    }
  }), [sessionId, formData, toggleModal, sessionData.isLearner, sessionData.session]);
  
  // Helper functions
  const helpers = useMemo(() => ({
    // Calculate session duration in minutes
    getSessionDuration: () => {
      if (!sessionData.session) return '0';
      
      const startTime = new Date(sessionData.session.startTime);
      const endTime = new Date(sessionData.session.endTime);
      const durationMs = endTime - startTime;
      return Math.round(durationMs / (1000 * 60));
    },
    
    // Format date and time
    formatDateTime: (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    // Navigate back to dashboard
    returnToDashboard: () => {
      navigate('/dashboard');
    }
  }), [navigate, sessionData.session]);
  
  // Render loading state
  if (sessionData.loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  
  // Render error state
  if (sessionData.error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{sessionData.error}</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={helpers.returnToDashboard}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  // Render when session not found
  if (!sessionData.session) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Session not found</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={helpers.returnToDashboard}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  // Determine status badge color
  const statusBadgeColor = sessionData.session.status === 'completed' 
    ? 'success' 
    : (sessionData.isJoinable ? 'primary' : 'warning');
  
  // Determine status text
  const statusText = sessionData.session.status === 'completed' 
    ? 'Completed' 
    : (sessionData.isJoinable ? 'Active' : 'Scheduled');
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-primary" onClick={helpers.returnToDashboard}>
            &larr; Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {/* Session Header */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h2 className="mb-3">
                {sessionData.session.title || `${sessionData.session.skillName || 'Skill'} Session`}
              </h2>
              
              <div className="d-flex align-items-center mb-3">
                <Badge 
                  bg={statusBadgeColor}
                  className="me-2 py-2 px-3"
                >
                  {statusText}
                </Badge>
                <span className="text-muted">{sessionData.timeRemaining}</span>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded-circle p-1 me-2" style={{ width: '35px', height: '35px', textAlign: 'center' }}>
                  <PersonFill className="text-primary" size={20} />
                </div>
                <div>
                  <small className="text-muted">Teacher</small>
                  <h6 className="mb-0">{sessionData.session.teacherName}</h6>
                </div>
              </div>
              
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div className="d-flex align-items-center">
                  <CalendarCheck className="text-primary me-2" />
                  <div>
                    <small className="text-muted d-block">Date & Time</small>
                    <span>{helpers.formatDateTime(sessionData.session.startTime)}</span>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <ClockFill className="text-primary me-2" />
                  <div>
                    <small className="text-muted d-block">Duration</small>
                    <span>{helpers.getSessionDuration()} minutes</span>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={4} className="text-md-end d-flex flex-column justify-content-center">
              {sessionData.session.status !== 'completed' && (
                <>
                  {sessionData.isJoinable && sessionData.session.meetingLink ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="mb-3"
                      href={sessionData.session.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Join Now <Link className="ms-1" />
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="mb-3"
                      disabled={!sessionData.isJoinable || !sessionData.session.meetingLink}
                    >
                      {!sessionData.session.meetingLink ? 'No Meeting Link Yet' : 'Join Now'} <Link className="ms-1" />
                    </Button>
                  )}
                  
                  {sessionData.isTeacher && (
                    <div className="d-flex gap-2 justify-content-md-end">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => toggleModal('showMeetingLinkModal', true)}
                      >
                        <PencilFill className="me-1" /> 
                        {sessionData.session.meetingLink ? 'Update Link' : 'Add Meeting Link'}
                      </Button>
                      
                      {sessionData.isJoinable && (
                        <Button 
                          variant="success" 
                          onClick={() => toggleModal('showCompletionModal', true)}
                        >
                          <CheckCircleFill className="me-1" /> Complete Session
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {sessionData.session.status === 'completed' && (
                <div className="bg-success-subtle p-3 rounded text-center">
                  <CheckCircleFill className="text-success mb-2" size={24} />
                  <h5 className="mb-1">Session Completed</h5>
                  <p className="mb-0 text-muted">
                    {helpers.formatDateTime(sessionData.session.updatedAt)}
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Session Details */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Session Details</h5>
            </Card.Header>
            <Card.Body>
              <h6 className="mb-2">Description</h6>
              <p>{sessionData.session.description || 'No description provided.'}</p>
              
              <h6 className="mb-2 mt-4">Prerequisites</h6>
              <p>{sessionData.session.prerequisites || 'No prerequisites specified.'}</p>
              
              {sessionData.session.status === 'completed' && sessionData.session.notes && (
                <>
                  <h6 className="mb-2 mt-4">Session Notes</h6>
                  <p>{sessionData.session.notes}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-info text-white">
            <h5 className="mb-0">Quick Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 pb-3 border-bottom">
                <small className="text-muted d-block mb-1">Skill Name</small>
                <h6>{sessionData.session.skillName || 'Not specified'}</h6>
              </div>
              
              {sessionData.isLearner && (
                <div className="mb-3 pb-3 border-bottom">
                  <small className="text-muted d-block mb-1">Your Teacher</small>
                  <h6>{sessionData.session.teacherName}</h6>
                </div>
              )}
              
              {sessionData.isTeacher && (
                <div className="mb-3 pb-3 border-bottom">
                  <small className="text-muted d-block mb-1">Your Student</small>
                  <h6>{sessionData.session.studentName}</h6>
                </div>
              )}
              
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Meeting Link</small>
                {sessionData.session.meetingLink ? (
                  <a 
                    href={sessionData.session.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="d-block text-truncate"
                  >
                    {sessionData.session.meetingLink}
                  </a>
                ) : (
                  <p className="text-muted mb-0">No meeting link provided yet</p>
                )}
              </div>
            </Card.Body>
          </Card>
          
          {sessionData.session.status === 'completed' && sessionData.isLearner && (
            <Card className="mb-4 shadow-sm border-0">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Session Feedback</h5>
              </Card.Header>
              <Card.Body className="text-center">
                <p>Did you enjoy your session with {sessionData.session.teacherName}?</p>
                <Button 
                  variant="success" 
                  onClick={() => toggleModal('showFeedbackModal', true)}
                >
                  <StarFill className="me-1" /> Leave Feedback
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      {/* Meeting Link Modal */}
      <Modal show={modals.showMeetingLinkModal} onHide={() => toggleModal('showMeetingLinkModal', false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add/Update Meeting Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Video Meeting Link</Form.Label>
              <Form.Control 
                type="url" 
                placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                value={formData.meetingLink}
                onChange={(e) => updateFormField('meetingLink', e.target.value)}
              />
              <Form.Text className="text-muted">
                Please provide a Google Meet link or any other video conferencing platform link.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('showMeetingLinkModal', false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={apiActions.updateMeetingLink}
            disabled={!formData.meetingLink}
          >
            Save Link
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Completion Modal */}
      <Modal show={modals.showCompletionModal} onHide={() => toggleModal('showCompletionModal', false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to mark this session as completed?</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Session Notes (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                placeholder="Add any notes about what was covered in the session..."
                value={formData.teacherNotes}
                onChange={(e) => updateFormField('teacherNotes', e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('showCompletionModal', false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={apiActions.completeSession}>
            Mark as Completed
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Feedback Modal */}
      <Modal show={modals.showFeedbackModal} onHide={() => toggleModal('showFeedbackModal', false)}>
        <Modal.Header closeButton>
          <Modal.Title>Session Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please rate your session with {sessionData.session.teacherName}:</p>
          <Form>
            <Form.Group className="mb-4">
              <div className="d-flex justify-content-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarFill 
                    key={star}
                    size={32}
                    className={`mx-1 ${star <= formData.rating ? 'text-warning' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => updateFormField('rating', star)}
                  />
                ))}
              </div>
              <div className="text-center mb-3">
                <Badge bg="secondary">{formData.rating}/5 stars</Badge>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Share your experience (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                placeholder="What did you learn? Was the teacher helpful?"
                value={formData.reviewText}
                onChange={(e) => updateFormField('reviewText', e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => toggleModal('showFeedbackModal', false)}>
            Skip
          </Button>
          <Button variant="success" onClick={apiActions.submitFeedback}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SessionDetails;