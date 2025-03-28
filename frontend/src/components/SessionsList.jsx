import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Spinner, Alert, Table
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CalendarCheck, PersonFill } from 'react-bootstrap-icons';

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
      setSessions(data);
      
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
      return { status: 'Completed', variant: 'success' };
    } else if (now > endTime) {
      return { status: 'Ended', variant: 'secondary' };
    } else if (now >= startTime && now <= endTime) {
      return { status: 'Active', variant: 'primary' };
    } else {
      return { status: 'Scheduled', variant: 'warning' };
    }
  }, []);
  
  // Check if user is teacher or learner for this session
  const getUserRole = useCallback((session) => {
    if (!user) return '';
    
    if (user._id === session.teacherId) {
      return 'Teacher';
    } else if (user._id === session.studentId) {
      return 'Learner';
    } else {
      return '';
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
      const { status, variant } = getSessionStatus(session);
      const role = getUserRole(session);
      const otherPerson = role === 'Teacher' ? session.studentName : session.teacherName;
      
      return {
        ...session,
        statusInfo: { status, variant },
        role,
        otherPerson
      };
    });
  }, [sessions, getSessionStatus, getUserRole]);
  
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
          <Button variant="primary" onClick={handleReturnToDashboard}>
            Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  if (processedSessions.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">No sessions found.</Alert>
        <div className="text-center mt-3">
          <Button variant="primary" onClick={handleReturnToDashboard}>
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
          <Button variant="outline-primary" onClick={handleReturnToDashboard}>
            &larr; Back to Dashboard
          </Button>
        </Col>
        <Col className="text-end">
          <h2>Your Sessions</h2>
        </Col>
      </Row>
      
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table responsive hover className="align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date & Time</th>
                <th>With</th>
                <th>Status</th>
                <th>Your Role</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {processedSessions.map((session) => (
                <tr key={session._id}>
                  <td>
                    <div className="fw-bold">{session.title || `${session.skillName || 'Skill'} Session`}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <CalendarCheck className="text-primary me-2" />
                      <div>{formatDateTime(session.startTime)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <PersonFill className="text-primary me-2" />
                      <div>{session.otherPerson}</div>
                    </div>
                  </td>
                  <td>
                    <Badge bg={session.statusInfo.variant}>{session.statusInfo.status}</Badge>
                  </td>
                  <td>{session.role}</td>
                  <td className="text-end">
                    <Button 
                      variant="success" 
                      className="py-1 px-3" 
                      onClick={() => navigate(`/sessions/${session._id}`)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SessionsList;