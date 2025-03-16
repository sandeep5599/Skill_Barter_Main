import React, { useState, useEffect } from 'react';
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
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showMeetingLinkModal, setShowMeetingLinkModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Form states
  const [meetingLink, setMeetingLink] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  
  // Session info states
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLearner, setIsLearner] = useState(false);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [isJoinable, setIsJoinable] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  // Fetch the session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }
        
        const data = await response.json();
        setSession(data);
        
        // Check if current user is teacher or learner
        if (user && data) {
          setIsTeacher(user._id === data.teacherId);
          setIsLearner(user._id === data.studentId);
          setMeetingLink(data.meetingLink || '');
        }
        
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('Failed to load session details. Please try again.');
        toast.error('Error loading session details');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId && user) {
      fetchSessionDetails();
    }
  }, [sessionId, user]);
  
  // Check if session is upcoming and joinable
  useEffect(() => {
    if (session) {
      const updateSessionStatus = () => {
        const now = new Date();
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        
        // Check if session is in the future
        setIsUpcoming(sessionStart > now);
        
        // Check if session is joinable (5 min before to end time)
        const joinWindow = new Date(sessionStart);
        joinWindow.setMinutes(joinWindow.getMinutes() - 5); // 5 min before start
        
        setIsJoinable(now >= joinWindow && now <= sessionEnd);
        
        // Calculate time until session
        if (sessionStart > now) {
          const timeDiff = sessionStart - now;
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h remaining`);
          } else if (hours > 0) {
            setTimeRemaining(`${hours}h ${minutes}m remaining`);
          } else {
            setTimeRemaining(`${minutes}m remaining`);
          }
        } else if (now <= sessionEnd) {
          setTimeRemaining('In progress');
        } else {
          setTimeRemaining('Completed');
        }
      };
      
      updateSessionStatus();
      const interval = setInterval(updateSessionStatus, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [session]);
  
  // Handle meeting link update
  const handleUpdateMeetingLink = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/sessions/${sessionId}/meeting-link`,
        { meetingLink },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        setSession({ ...session, meetingLink });
        toast.success('Meeting link updated successfully');
        setShowMeetingLinkModal(false);
      }
    } catch (err) {
      console.error('Error updating meeting link:', err);
      toast.error('Failed to update meeting link');
    }
  };
  
  // Handle session completion
  const handleCompleteSession = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/sessions/${sessionId}/complete`,
        { notes: teacherNotes },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        setSession({ ...session, status: 'completed', notes: teacherNotes });
        toast.success('Session marked as completed');
        setShowCompletionModal(false);
        
        // If user is learner, show feedback modal
        if (isLearner) {
          setShowFeedbackModal(true);
        }
      }
    } catch (err) {
      console.error('Error completing session:', err);
      toast.error('Failed to mark session as completed');
    }
  };
  
  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/reviews`,
        {
          sessionId,
          teacherId: session.teacherId,
          teacherName: session.teacherName,
          skillId: session.skillId,
          rating,
          reviewText
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
        setShowFeedbackModal(false);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error('Failed to submit feedback');
    }
  };
  
  // Calculate session duration in minutes
  const getSessionDuration = () => {
    if (!session) return '0';
    
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const durationMs = endTime - startTime;
    return Math.round(durationMs / (1000 * 60));
  };
  
  // Format date and time
  const formatDateTime = (dateString) => {
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
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  if (!session) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Session not found</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate('/dashboard')}>
            &larr; Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {/* Session Header */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row>
            <Col md={8}>
              <h2 className="mb-3">{session.title || `${session.skillName || 'Skill'} Session`}</h2>
              
              <div className="d-flex align-items-center mb-3">
                <Badge 
                  bg={session.status === 'completed' ? 'success' : (isJoinable ? 'primary' : 'warning')}
                  className="me-2 py-2 px-3"
                >
                  {session.status === 'completed' ? 'Completed' : (isJoinable ? 'Active' : 'Scheduled')}
                </Badge>
                <span className="text-muted">{timeRemaining}</span>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded-circle p-1 me-2" style={{ width: '35px', height: '35px', textAlign: 'center' }}>
                  <PersonFill className="text-primary" size={20} />
                </div>
                <div>
                  <small className="text-muted">Teacher</small>
                  <h6 className="mb-0">{session.teacherName}</h6>
                </div>
              </div>
              
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div className="d-flex align-items-center">
                  <CalendarCheck className="text-primary me-2" />
                  <div>
                    <small className="text-muted d-block">Date & Time</small>
                    <span>{formatDateTime(session.startTime)}</span>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <ClockFill className="text-primary me-2" />
                  <div>
                    <small className="text-muted d-block">Duration</small>
                    <span>{getSessionDuration()} minutes</span>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={4} className="text-md-end d-flex flex-column justify-content-center">
              {session.status !== 'completed' && (
                <>
                  {isJoinable && session.meetingLink ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="mb-3"
                      href={session.meetingLink} 
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
                      disabled={!isJoinable || !session.meetingLink}
                    >
                      {!session.meetingLink ? 'No Meeting Link Yet' : 'Join Now'} <Link className="ms-1" />
                    </Button>
                  )}
                  
                  {isTeacher && (
                    <div className="d-flex gap-2 justify-content-md-end">
                      <Button 
                        variant="outline-primary" 
                        onClick={() => setShowMeetingLinkModal(true)}
                      >
                        <PencilFill className="me-1" /> {session.meetingLink ? 'Update Link' : 'Add Meeting Link'}
                      </Button>
                      
                      {isJoinable && (
                        <Button 
                          variant="success" 
                          onClick={() => setShowCompletionModal(true)}
                        >
                          <CheckCircleFill className="me-1" /> Complete Session
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {session.status === 'completed' && (
                <div className="bg-success-subtle p-3 rounded text-center">
                  <CheckCircleFill className="text-success mb-2" size={24} />
                  <h5 className="mb-1">Session Completed</h5>
                  <p className="mb-0 text-muted">
                    {formatDateTime(session.updatedAt)}
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
              <p>{session.description || 'No description provided.'}</p>
              
              <h6 className="mb-2 mt-4">Prerequisites</h6>
              <p>{session.prerequisites || 'No prerequisites specified.'}</p>
              
              {session.status === 'completed' && session.notes && (
                <>
                  <h6 className="mb-2 mt-4">Session Notes</h6>
                  <p>{session.notes}</p>
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
                <h6>{session.skillName || 'Not specified'}</h6>
              </div>
              
              {isLearner && (
                <div className="mb-3 pb-3 border-bottom">
                  <small className="text-muted d-block mb-1">Your Teacher</small>
                  <h6>{session.teacherName}</h6>
                </div>
              )}
              
              {isTeacher && (
                <div className="mb-3 pb-3 border-bottom">
                  <small className="text-muted d-block mb-1">Your Student</small>
                  <h6>{session.studentName}</h6>
                </div>
              )}
              
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Meeting Link</small>
                {session.meetingLink ? (
                  <a 
                    href={session.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="d-block text-truncate"
                  >
                    {session.meetingLink}
                  </a>
                ) : (
                  <p className="text-muted mb-0">No meeting link provided yet</p>
                )}
              </div>
            </Card.Body>
          </Card>
          
          {session.status === 'completed' && isLearner && (
            <Card className="mb-4 shadow-sm border-0">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Session Feedback</h5>
              </Card.Header>
              <Card.Body className="text-center">
                <p>Did you enjoy your session with {session.teacherName}?</p>
                <Button 
                  variant="success" 
                  onClick={() => setShowFeedbackModal(true)}
                >
                  <StarFill className="me-1" /> Leave Feedback
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      {/* Meeting Link Modal */}
      <Modal show={showMeetingLinkModal} onHide={() => setShowMeetingLinkModal(false)}>
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
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <Form.Text className="text-muted">
                Please provide a Google Meet link or any other video conferencing platform link.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMeetingLinkModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateMeetingLink}
            disabled={!meetingLink}
          >
            Save Link
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Completion Modal */}
      <Modal show={showCompletionModal} onHide={() => setShowCompletionModal(false)}>
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
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleCompleteSession}>
            Mark as Completed
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Feedback Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Session Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please rate your session with {session.teacherName}:</p>
          <Form>
            <Form.Group className="mb-4">
              <div className="d-flex justify-content-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarFill 
                    key={star}
                    size={32}
                    className={`mx-1 ${star <= rating ? 'text-warning' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <div className="text-center mb-3">
                <Badge bg="secondary">{rating}/5 stars</Badge>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Share your experience (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                placeholder="What did you learn? Was the teacher helpful?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Skip
          </Button>
          <Button variant="success" onClick={handleSubmitFeedback}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SessionDetails;