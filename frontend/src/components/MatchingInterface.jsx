import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const MatchingInterface = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const fetchProficiency = async (skillId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/skills/${skillId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch proficiency');
      const data = await response.json();
      return data.proficiency || 'Not specified';
    } catch {
      return 'Not specified';
    }
  };

  const requestMatch = async (teacherId, skillId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          teacherId, 
          skillId,
          proposedTimeSlots: [{
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString()
          }]
        })
      });

      if (!response.ok) throw new Error('Failed to request match');

      const data = await response.json();
      alert('Match request sent successfully!');
      setMatches([...matches, data]);
    } catch (error) {
      setError('Failed to request match');
    }
  };

  return (
    <Container className="py-4">
      <Card className="mb-4 bg-light shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Find Learning Matches</h1>
          <div>
            <Button variant="primary" className="me-2" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="primary" className="me-2" onClick={() => navigate('/profile')}>
              Profile
            </Button>
            <Button variant="danger" onClick={handleLogout }>
              Logout
            </Button>
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
          <h2 className="mb-3">Available Teachers</h2>
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
                      <Button variant="primary" className="w-100" onClick={() => requestMatch(match.teacherId, match.skillId)}>
                        Request Match
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
    </Container>
  );
};

export default MatchingInterface;
