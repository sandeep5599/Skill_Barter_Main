import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const MatchRequests = () => {
  const { user } = useAuth();
  const [matchRequests, setMatchRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchRequests();
  }, []);

  const fetchMatchRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches/pending`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch match requests');
      
      const data = await response.json();
      setMatchRequests(data);
    } catch (error) {
      console.error('Error fetching match requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (matchId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to accept match');

      toast.success('Match accepted!');
      setMatchRequests(prev => prev.filter(match => match._id !== matchId));
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Could not accept match');
    }
  };

  const handleReject = async (matchId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to reject match');

      toast.info('Match rejected');
      setMatchRequests(prev => prev.filter(match => match._id !== matchId));
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error('Could not reject match');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Match Requests</h2>
      
      {loading ? (
        <Spinner animation="border" />
      ) : matchRequests.length === 0 ? (
        <p>No pending match requests</p>
      ) : (
        matchRequests.map(match => (
          <Card key={match._id} className="mb-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5>{match.senderName}</h5>
                <p>Requested to match with you</p>
              </div>
              <div>
                <Button variant="success" className="me-2" onClick={() => handleAccept(match._id)}>Accept</Button>
                <Button variant="danger" onClick={() => handleReject(match._id)}>Reject</Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default MatchRequests;
