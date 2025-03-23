// LearnerRequests.js - Main component
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import NotificationCenter from './NotificationCenter';
import RequestsList from './learner.requests/RequestsList';
import Header from './learner.requests/Header';
import EmptyState from './learner.requests/EmptyState';
import { fetchLearnerRequests, updateRequestStatus } from '../services/requestService';

const LearnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // API fetch function
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const learnerRequests = await fetchLearnerRequests(user._id);
      setRequests(learnerRequests);
    } catch (err) {
      const errorMessage = 'Failed to fetch learning requests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle status update without navigation
  const handleStatusUpdate = useCallback(async (requestId, newStatus, reason = null) => {
    setProcessingIds(prev => [...prev, requestId]);
    try {
      const response = await updateRequestStatus(requestId, newStatus, reason);
      
      if (response.success) {
        toast.success(`Request ${newStatus} successfully!`);
        
        // Update the request in the local state
        setRequests(prev => prev.map(req => 
          req._id === requestId || req.id === requestId
            ? { ...req, status: newStatus, ...(reason && { rejectionReason: reason }) }
            : req
        ));
      } else {
        toast.error(response.message || 'Failed to update request status');
      }
    } catch (err) {
      toast.error('Error updating request status. Please try again.');
      console.error(err);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    if (user && user._id) {
      fetchRequests();
    }
    
    // Set up polling to check for new requests periodically
    const intervalId = setInterval(fetchRequests, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [fetchRequests, user]);

  // Handle error dismissal
  const dismissError = useCallback(() => {
    setError('');
  }, []);

  return (
    <Container className="py-4">
      <Header 
        title="Learner Requests" 
        logout={logout} 
        navigate={navigate} 
      />

      {error && (
        <Alert variant="danger" onClose={dismissError} dismissible>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Your Learning Requests</h2>
        <Button 
          variant="primary" 
          onClick={fetchRequests} 
          disabled={loading} 
          className="d-flex align-items-center gap-2"
        >
          <i className="bi bi-arrow-repeat"></i> Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingState />
      ) : requests.length > 0 ? (
        <RequestsList 
          requests={requests} 
          navigate={navigate} 
          handleStatusUpdate={handleStatusUpdate}
          processingIds={processingIds}
        />
      ) : (
        <EmptyState 
          navigate={navigate} 
          actionPath="/match/learning" 
          actionText="Find Learning Matches"
        />
      )}
    </Container>
  ); 
};

// Simple loading component
const LoadingState = () => (
  <Card className="text-center my-5 py-5 border-0 shadow-sm">
    <Card.Body>
      <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }} />
      <h4 className="mt-4 text-primary">Loading your learning requests...</h4>
      <p className="text-muted">Please wait while we fetch your learning requests</p>
    </Card.Body>
  </Card>
);

export default LearnerRequests;