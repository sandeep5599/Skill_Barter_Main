import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const MatchDetails = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1))
  });
  const [processing, setProcessing] = useState(false);
  
  // Fetch match details
  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch match details');
        }
        
        const data = await response.json();
        setMatch(data);
      } catch (err) {
        setError('Error loading match details: ' + err.message);
        toast.error('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);
  
  // Check if user is the teacher
  const isTeacher = match && user?._id === match.teacherId;
  
  // Handle time slot change
  const handleStartTimeChange = (date) => {
    setSelectedTimeSlot({
      ...selectedTimeSlot,
      startTime: date,
      // Automatically set end time to 1 hour after start time
      endTime: new Date(new Date(date).setHours(date.getHours() + 1))
    });
  };
  
  const handleEndTimeChange = (date) => {
    if (date <= selectedTimeSlot.startTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    setSelectedTimeSlot({
      ...selectedTimeSlot,
      endTime: date
    });
  };
  
  // Accept match and create session
  const handleAcceptMatch = async () => {
    try {
      setProcessing(true);
      
      // First update match status to accepted
      const updateResponse = await fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'accepted'
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to accept match');
      }
      
      // Then create a session
      const sessionResponse = await fetch(`${BACKEND_URL}/api/matches/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          matchId,
          selectedTimeSlot
        })
      });
      
      if (!sessionResponse.ok) {
        throw new Error('Failed to create session');
      }
      
      const sessionData = await sessionResponse.json();
      toast.success('Match accepted and session created!');
      
      // Navigate to sessions page
      navigate('/sessions');
    } catch (err) {
      setError('Error: ' + err.message);
      toast.error('Failed to process match acceptance');
    } finally {
      setProcessing(false);
    }
  };
  
  // Reject match
  const handleRejectMatch = async () => {
    try {
      setProcessing(true);
      
      const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: 'rejected'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject match');
      }
      
      toast.info('Match rejected');
      navigate('/matches');
    } catch (err) {
      setError('Error: ' + err.message);
      toast.error('Failed to reject match');
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p>Loading match details...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </Container>
    );
  }
  
  if (!match) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Match not found</Alert>
        <Button variant="primary" onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Card className="mb-4">
        <Card.Header as="h4">Match Details</Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5>Skill: {match.expertise}</h5>
              <p>Proficiency Level: {match.proficiency}</p>
              <p>Status: <span className={`badge bg-${match.status === 'pending' ? 'warning' : match.status === 'accepted' ? 'success' : 'danger'}`}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span></p>
              <p>Role: {isTeacher ? 'Teacher' : 'Student'}</p>
              <p>{isTeacher ? 'Student' : 'Teacher'}: {match.name}</p>
              <p>Created: {new Date(match.createdAt).toLocaleDateString()}</p>
            </Col>
            
            {isTeacher && match.status === 'pending' && (
              <Col md={6}>
                <h5>Schedule Session</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <DatePicker
                    selected={selectedTimeSlot.startTime}
                    onChange={handleStartTimeChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    className="form-control"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <DatePicker
                    selected={selectedTimeSlot.endTime}
                    onChange={handleEndTimeChange}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={selectedTimeSlot.startTime}
                    className="form-control"
                  />
                </Form.Group>
                
                <div className="d-flex gap-2 mt-4">
                  <Button 
                    variant="success" 
                    onClick={handleAcceptMatch}
                    disabled={processing}
                  >
                    {processing ? <Spinner animation="border" size="sm" /> : 'Accept and Schedule'}
                  </Button>
                  
                  <Button 
                    variant="danger" 
                    onClick={handleRejectMatch}
                    disabled={processing}
                  >
                    Reject Match
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
      
      {!isTeacher && match.status === 'pending' && (
        <Alert variant="info">
          Waiting for teacher to accept your match request.
        </Alert>
      )}
      
      {match.status === 'accepted' && (
        <Alert variant="success">
          Match accepted! Check your sessions to see when it's scheduled.
        </Alert>
      )}
      
      {match.status === 'rejected' && (
        <Alert variant="danger">
          This match has been rejected.
        </Alert>
      )}
      
      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </div>
    </Container>
  );
};

export default MatchDetails;