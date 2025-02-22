import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MatchingInterface = () => {
  const [filters, setFilters] = useState({ skill: '', timeSlot: '' });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { logout, user, stats } = useAuth();
  const navigate = useNavigate();

  // Navigate Function to prevent redundant inline functions
  const navigateTo = (path) => navigate(path);

  // Fetch Matches Function (Simulated API Call)
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Simulating an API request with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Example data (Replace with real API response)
      const fakeMatches = [
        { id: 1, name: 'John Doe', expertise: 'JavaScript', rating: 4.5 },
        { id: 2, name: 'Jane Smith', expertise: 'Python', rating: 4.8 },
      ];

      setMatches(fakeMatches);
    } catch (err) {
      setError('Failed to fetch matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(); // Auto-fetch matches on component mount
  }, [fetchMatches]);

  // Match Card Component
  const MatchCard = ({ match }) => (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Row>
          <Col xs={2} className="text-center">
            <div className="rounded-circle bg-secondary" style={{ width: 60, height: 60 }} />
          </Col>
          <Col xs={7}>
            <h5 className="mb-1">{match.name}</h5>
            <p className="mb-1 text-muted">Expert in {match.expertise}</p>
            <small>Rating: {match.rating}/5</small>
          </Col>
          <Col xs={3} className="d-flex align-items-center">
            <Button variant="success" className="w-100">Request Match</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Search Handler with Validation
  const handleSearch = () => {
    if (!filters.skill.trim()) {
      setError('Please enter a skill to search.');
      return;
    }

    setError('');
    fetchMatches();
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <Card className="mb-4 bg-light shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0">Skill Barter Platform</h1>
          <div>
            <Button variant="primary" onClick={() => navigateTo('/dashboard')} className="me-2">Dashboard</Button>
            <Button variant="primary" onClick={() => navigateTo('/profile')} className="me-2">Profile</Button>
            <Button variant="danger" onClick={logout}>Logout</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Error Handling */}
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {/* Search Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Skill to Learn</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., JavaScript"
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Preferred Time Slot</Form.Label>
                <Form.Control
                  type="time"
                  value={filters.timeSlot}
                  onChange={(e) => setFilters({ ...filters, timeSlot: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" className="w-100" onClick={handleSearch}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Matching Results */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
          <p>Loading matches...</p>
        </div>
      ) : matches.length > 0 ? (
        matches.map((match) => <MatchCard key={match.id} match={match} />)
      ) : (
        <p className="text-muted">No matches found</p>
      )}
    </Container>
  );
};

export default MatchingInterface;
