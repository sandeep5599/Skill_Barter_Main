import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SessionScheduler from './SessionScheduler';
import NotificationCenter from './NotificationCenter';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const MatchingInterface = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
      }

      const data = await response.json();
      setMatches(data);
    } catch (err) {
      setError('Failed to fetch matches. Please try again.');
      toast.error('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const openScheduleModal = (match) => {
    setSelectedTeacher({
      ...match,
      matchId: match.id,
      teacherId: match.teacherId || match.id,
      skillId: match.skillId
    });
    setShowScheduleModal(true);
  };

  const requestMatch = async (matchId, proposedTimeSlots) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          matchId,
          proposedTimeSlots
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error(errorData.message || 'Please check your input data');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('You are not authorized to perform this action');
        } else {
          throw new Error(errorData.message || 'Failed to create session');
        }
      }
  
      const sessionData = await response.json();
      
      toast.success('Session created successfully!');
      navigate('/sessions');
  
      return sessionData;
    } catch (error) {
      console.error('Session request error:', error);
      toast.error(error.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleScheduleSubmit = (timeSlots) => {
    if (selectedTeacher && selectedTeacher.matchId) {
      console.log("Selected Teacher:", selectedTeacher);
      console.log("Scheduled Time Slots:", timeSlots);
      requestMatch(selectedTeacher.matchId, timeSlots);
      setShowScheduleModal(false);

    } else {
      toast.error('No match selected to create a session');
    }
  };

  return (
    <Container className="py-4">
      <Card className="mb-4 bg-light shadow-sm">
  <Card.Body className="d-flex justify-content-between align-items-center">
    <h1 className="mb-0">Find Learning Matches</h1>
    <div className="d-flex align-items-center gap-3">
      <NotificationCenter />
      <div className="d-flex gap-2">
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
        <Button variant="primary" onClick={() => navigate('/profile')}>
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
          <p>Loading matches...</p>
        </div>
      ) : matches.length > 0 ? (
        <>
           <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">Available Teachers</h2>
            {/* <Button variant="primary" onClick={fetchMatches}>Refresh Matches</Button> */}
          </div>
          {matches.map(match => (
            <Card key={match.id} className="mb-3 shadow-sm border-0">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={2} className="text-center">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow" 
                      style={{ width: 60, height: 60, fontSize: 20, fontWeight: 'bold' }}>
                      {match.name ? match.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  </Col>
                  <Col xs={7}>
                    <h5 className="mb-1">{match.name || "Unknown"}</h5>
                    <p className="mb-1 text-muted">
                       Skill: <strong>{match.expertise || "Not specified"}</strong>
                    </p>

                    <p className="mb-1 text-muted">
                      Proficiency: <strong>{match.proficiency || "Fetching..."}</strong>
                    </p>
                    <p className="mb-0">
                      <small>⭐ Rating: {match.rating ? `${match.rating}/5` : "No ratings yet"}</small>
                      <span className="ms-2 badge bg-secondary">{match.status}</span>
                    </p>
                  </Col>
                  <Col xs={3} className="d-flex justify-content-end">
                    {match.status === 'pending' ? (
                      <Button variant="success" className="w-100" disabled>
                        Request Sent
                      </Button>
                    ) : match.status === 'accepted' ? (
                      <Button variant="success" className="w-100" onClick={() => navigate('/sessions')}>
                        View Session
                      </Button>
                    ) : (
                      <Button variant="primary" className="w-100" onClick={() => openScheduleModal(match)}>
                        Request Session
                      </Button>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </>
      ) : (
        <div className="text-center my-5">
          <p className="text-muted">No matches found. Try searching for more skills!</p>
          <Button variant="primary" className="mt-2" onClick={() => navigate('/profile')}>
            Add Learning Skills
          </Button>
        </div>
      )}

      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Schedule with {selectedTeacher?.name || "Teacher"} 
            {selectedTeacher?.expertise ? ` - ${selectedTeacher.expertise}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SessionScheduler onSchedule={handleScheduleSubmit} submitting={submitting}/>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MatchingInterface;