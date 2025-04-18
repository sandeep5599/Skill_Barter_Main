import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Spinner, Alert, Table
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  CalendarCheck, 
  PersonFill, 
  ArrowLeft, 
  ClockFill, 
  CheckCircleFill,
  BoxArrowRight,
  MortarboardFill,
  BookFill,
  ChevronRight
} from 'react-bootstrap-icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const SessionsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Memoized fetch function to prevent unnecessary re-creation
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions);
      
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
      toast.error('Error loading sessions');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Fetch sessions when component mounts or user changes
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  // Format date and time - memoized to prevent recalculation
  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  // Calculate session status
  const getSessionStatus = useCallback((session) => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    
    if (session.status === 'completed') {
      return { 
        status: 'Completed', 
        variant: 'success',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
        icon: <CheckCircleFill />
      };
    } else if (now > endTime) {
      return { 
        status: 'Ended', 
        variant: 'secondary',
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.1)',
        borderColor: 'rgba(100, 116, 139, 0.2)',
        icon: <ClockFill />
      };
    } else if (now >= startTime && now <= endTime) {
      return { 
        status: 'Active', 
        variant: 'primary',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        icon: <CalendarCheck />
      };
    } else {
      return { 
        status: 'Scheduled', 
        variant: 'warning',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.2)',
        icon: <CalendarCheck />
      };
    }
  }, []);
  
  // Check if user is teacher or learner for this session
  const getUserRole = useCallback((session) => {
    if (!user) return '';
    
    if (user._id === session.teacherId) {
      return { 
        role: 'Teacher',
        icon: <MortarboardFill />,
        color: '#3b82f6'
      };
    } else if (user._id === session.studentId) {
      return { 
        role: 'Learner',
        icon: <BookFill />,
        color: '#06b6d4'
      };
    } else {
      return { 
        role: '',
        icon: null,
        color: '#64748b'
      };
    }
  }, [user]);
  
  // Navigate to session details
  const handleViewSession = useCallback((sessionId) => {
    navigate(`/sessions/${sessionId}`);
  }, [navigate]);
  
  // Navigate back to dashboard
  const handleReturnToDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  // Memoize the processed sessions data to prevent recalculation on re-renders
  const processedSessions = useMemo(() => {
    return sessions.map(session => {
      const statusInfo = getSessionStatus(session);
      const roleInfo = getUserRole(session);
      const otherPerson = roleInfo.role === 'Teacher' ? session.studentName : session.teacherName;
      return {
        ...session,
        statusInfo,
        roleInfo,
        otherPerson
      };
    });
  }, [sessions, getSessionStatus, getUserRole]);

  // Group sessions by status
  const groupedSessions = useMemo(() => {
    const active = processedSessions.filter(s => 
      s.statusInfo.status === 'Active' || s.statusInfo.status === 'Scheduled'
    );
    const past = processedSessions.filter(s => 
      s.statusInfo.status === 'Completed' || s.statusInfo.status === 'Ended'
    );
    return { active, past };
  }, [processedSessions]);
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{
            width: '3rem',
            height: '3rem',
            borderWidth: '0.25rem'
          }}>
            <span className="visually-hidden">Loading sessions...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your sessions...</p>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-5">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <Card.Body className="p-4 text-center">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10" 
              style={{ width: '64px', height: '64px' }}>
              <span className="text-danger fs-4">!</span>
            </div>
            <h4 className="fw-bold mb-2">Error Loading Sessions</h4>
            <p className="text-muted mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={handleReturnToDashboard}
              className="rounded-pill px-4 py-2"
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
              }}
            >
              <ArrowLeft className="me-2" />
              Return to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  if (processedSessions.length === 0) {
    return (
      <Container className="mt-5">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <Card.Body className="p-4 text-center">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10" 
              style={{ width: '64px', height: '64px' }}>
              <CalendarCheck className="text-info" size={28} />
            </div>
            <h4 className="fw-bold mb-2">No Sessions Found</h4>
            <p className="text-muted mb-4">You don't have any sessions scheduled yet.</p>
            <Button 
              variant="primary" 
              onClick={handleReturnToDashboard}
              className="rounded-pill px-4 py-2"
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
              }}
            >
              <ArrowLeft className="me-2" />
              Return to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container className="py-4 py-md-5">
      {/* Header Section */}
      <Card className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
        <div style={{ 
          background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
          padding: '1.5rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Elements */}
          <div className="position-absolute" style={{ 
            top: '-20px', 
            right: '-20px', 
            width: '150px', 
            height: '150px', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div className="position-absolute" style={{ 
            bottom: '-40px', 
            left: '10%', 
            width: '150px', 
            height: '150px',  
            background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
            borderRadius: '50%'
          }}></div>
          
          <Row className="align-items-center position-relative">
            <Col xs={12} md="auto" className="mb-3 mb-md-0">
              <Button 
                variant="light" 
                onClick={handleReturnToDashboard}
                className="rounded-pill d-flex align-items-center justify-content-center"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <ArrowLeft className="me-2" />
                Back
              </Button>
            </Col>
            <Col>
              <h2 className="mb-0" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
                Your Learning Sessions
              </h2>
              <p className="text-white-50 mb-0">
                {processedSessions.length} {processedSessions.length === 1 ? 'session' : 'sessions'} found
              </p>
            </Col>
          </Row>
        </div>
      </Card>
      
      {/* Active and Upcoming Sessions */}
      {groupedSessions.active.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                }}>
                <CalendarCheck size={22} className="text-white" />
              </div>
            </div>
            <h4 className="fw-bold mb-0" style={{ color: '#0891b2' }}>Active & Upcoming Sessions</h4>
          </div>
          
          {/* Sessions Cards - Responsive with Flex */}
          <div className="d-flex flex-column gap-3">
            {groupedSessions.active.map((session) => (
              <SessionCard 
                key={session._id} 
                session={session} 
                formatDateTime={formatDateTime}
                onViewDetails={() => handleViewSession(session._id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Past Sessions */}
      {groupedSessions.past.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                }}>
                <ClockFill size={22} className="text-white" />
              </div>
            </div>
            <h4 className="fw-bold mb-0" style={{ color: '#1e40af' }}>Past Sessions</h4>
          </div>
          
          {/* Sessions Cards - Responsive with Flex */}
          <div className="d-flex flex-column gap-3">
            {groupedSessions.past.map((session) => (
              <SessionCard 
                key={session._id} 
                session={session} 
                formatDateTime={formatDateTime}
                onViewDetails={() => handleViewSession(session._id)}
              />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

// Session Card Component - Reusable for both active and past sessions
const SessionCard = ({ session, formatDateTime, onViewDetails }) => {
  return (
    <Card 
      className="border-0 shadow-sm rounded-4 overflow-hidden"
      style={{ 
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        cursor: 'pointer',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
      onClick={onViewDetails}
    >
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Status Indicator */}
          <Col xs="auto">
            <div 
              className="d-flex align-items-center justify-content-center h-100"
              style={{ 
                width: '10px', 
                background: session.statusInfo.color,
              }}
            ></div>
          </Col>
          
          {/* Session Details */}
          <Col>
            <div className="p-3">
              <Row className="align-items-center">
                {/* Left section: Status and Title */}
                <Col xs={12} md={4} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center mb-2">
                    <div 
                      className="me-2 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%',
                        background: session.statusInfo.bgColor,
                        color: session.statusInfo.color
                      }}
                    >
                      {session.statusInfo.icon}
                    </div>
                    <Badge 
                      className="rounded-pill px-3 py-2"
                      style={{ 
                        background: session.statusInfo.bgColor,
                        color: session.statusInfo.color,
                        border: `1px solid ${session.statusInfo.borderColor}`,
                      }}
                    >
                      {session.statusInfo.status}
                    </Badge>
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                    {session.title || `${session.skillName || 'Skill'} Session`}
                  </h5>
                </Col>
                
                {/* Middle section: Date/Time and Person */}
                <Col xs={12} md={5} className="mb-3 mb-md-0">
                  <div className="d-flex flex-column flex-md-row">
                    <div className="me-md-4 mb-2 mb-md-0">
                      <div className="text-muted small mb-1">Date & Time</div>
                      <div className="d-flex align-items-center">
                        <CalendarCheck className="me-2" style={{ color: '#3b82f6' }} />
                        <div>{formatDateTime(session.startTime)}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small mb-1">With</div>
                      <div className="d-flex align-items-center">
                        <PersonFill className="me-2" style={{ color: '#3b82f6' }} />
                        <div>{session.otherPerson}</div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                {/* Right section: Role and Action */}
                <Col xs={12} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end">
                  <div className="d-flex align-items-center">
                    <div 
                      className="me-2 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%',
                        background: `rgba(${session.roleInfo.role === 'Teacher' ? '59, 130, 246' : '6, 182, 212'}, 0.1)`,
                        color: session.roleInfo.color
                      }}
                    >
                      {session.roleInfo.icon}
                    </div>
                    <span style={{ color: session.roleInfo.color, fontWeight: '500' }}>
                      {session.roleInfo.role}
                    </span>
                  </div>
                  <Button 
                    variant="light" 
                    className="rounded-circle d-flex align-items-center justify-content-center ms-2"
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      border: 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails();
                    }}
                  >
                    <ChevronRight />
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SessionsList;