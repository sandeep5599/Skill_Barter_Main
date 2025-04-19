// LearnerRequests.js - Main component
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  ArrowRepeat, 
  ExclamationTriangleFill, 
  CheckCircleFill, 
  BoxArrowLeft, 
  Clock,
  PencilSquare
} from 'react-bootstrap-icons';
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

  // Define explicit logout handler with console logging for debugging
  const handleLogout = useCallback(() => {
    console.log('Logout button clicked!');
    try {
      if (typeof logout === 'function') {
        logout();
        console.log('Logout function called successfully');
        navigate('/', { replace: true });
      } else {
        console.error('Logout is not a function:', logout);
        toast.error('Logout functionality is not available');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout process');
    }
  }, [logout, navigate]);
  
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
    <Container fluid="lg" className="py-4 px-3 px-md-4">
      {/* Modern Hero Section */}
      <div className="position-relative mb-4 rounded-4 overflow-hidden shadow-lg">
        <div style={{ 
          background: 'linear-gradient(135deg, #0b1437 0%, #1e3a8a 100%)',
          padding: '1.5rem 2rem',
          color: 'white',
          overflow: 'visible' // Changed from hidden to visible
        }}>
          {/* Decorative Elements */}
          <div className="position-absolute" style={{ 
            top: '-20px', 
            right: '-20px', 
            width: '200px', 
            height: '200px', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none' // Ensure this doesn't block clicks
          }}></div>
          
          <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 10 }}>
            <div>
              <h2 className="mb-1" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
                Learning Requests
              </h2>
              <p className="text-white-50 mb-0 d-none d-sm-block">Manage your learning journey and track your progress</p>
            </div>
            <div className="d-flex gap-2">
             {/* Dashboard Button */}
<button 
  className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
  onClick={() => navigate('/dashboard')}
  style={{
    background: 'linear-gradient(to right, #8b5cf6, #6d28d9)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 100
  }}
>
  <i className="bi bi-grid-fill me-2" style={{ fontSize: '16px' }}></i>
  <span className="d-none d-md-inline">Dashboard</span>
</button>

{/* Profile Button - Updated */}
<button 
  className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
  onClick={() => navigate('/profile')}
  style={{
    background: 'linear-gradient(to right, #3b82f6, #1e40af)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 100
  }}
>
  <PencilSquare className="me-2" size={16} />
  <span className="d-none d-md-inline">Profile</span>
</button>

{/* Logout Button - Updated */}
<button 
  className="btn d-flex align-items-center gap-2 rounded-pill px-3 py-2"
  onClick={handleLogout}
  style={{
    background: 'linear-gradient(to right, #ef4444, #b91c1c)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 100
  }}
>
  <BoxArrowLeft className="me-2" size={16} />
  <span className="d-none d-md-inline">Logout</span>
</button>
            </div>
          </div>
          
          <div className="d-flex flex-wrap gap-3 mt-3">
            <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
              <Clock className="me-2 text-warning" /> 
              <span className="fw-semibold">In Progress Requests: {requests.filter(r => r.status === 'pending' || r.status === 'approved').length}</span>
            </div>
            <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
              <CheckCircleFill className="me-2 text-success" /> 
              <span className="fw-semibold">Completed: {requests.filter(r => r.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert 
          variant="danger" 
          onClose={dismissError} 
          dismissible
          className="shadow-sm rounded-4 border-0 d-flex align-items-center"
          style={{ 
            background: 'linear-gradient(to right, #fee2e2, #fecaca)', 
            borderLeft: '4px solid #ef4444' 
          }}
        >
          <ExclamationTriangleFill size={20} className="me-3 text-danger" />
          <div>
            <p className="mb-0 fw-semibold text-danger">{error}</p>
          </div>
        </Alert>
      )}

      <Card className="border-0 rounded-4 shadow-lg overflow-hidden mb-4">
        <Card.Body className="p-0">
          <div className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h3 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>Your Learning Requests</h3>
              <p className="text-muted mb-0">View and manage all your learning requests</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                onClick={fetchRequests} 
                disabled={loading} 
                className="d-flex align-items-center gap-2 rounded-pill py-2 px-3"
                style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                }}
              >
                <ArrowRepeat size={18} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <Button 
                variant="success" 
                onClick={() => navigate('/match/learning')} 
                className="d-flex align-items-center gap-2 rounded-pill py-2 px-3"
                style={{ 
                  background: 'linear-gradient(to right, #10b981, #047857)',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                }}
              >
                <i className="bi bi-plus-lg"></i>
                <span>New Request</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : requests.length > 0 ? (
            <div className="px-4 pb-4">
              <RequestsList 
                requests={requests} 
                navigate={navigate} 
                handleStatusUpdate={handleStatusUpdate}
                processingIds={processingIds}
              />
            </div>
          ) : (
            <EmptyState 
              navigate={navigate} 
              actionPath="/match/learning" 
              actionText="Find Learning Matches"
            />
          )}
        </Card.Body>
      </Card>

      {/* Custom CSS for animations */}
      <style>
        {`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Fix for button hover states */
        .btn-light:hover {
          background-color: #f8f9fa !important;
          color: #0d6efd !important;
        }
        
        /* Ensure button clickability */
        button, .btn {
          position: relative;
          z-index: 10;
        }
        `}
      </style>
    </Container>
  ); 
};

// Enhanced loading component with animation
const LoadingState = () => (
  <div className="text-center py-5">
    <div className="position-relative d-inline-block mb-3">
      <div className="position-relative" style={{ 
        width: '80px', 
        height: '80px',
        animation: 'pulse 2s infinite ease-in-out'
      }}>
        <Spinner 
          animation="border" 
          variant="primary" 
          role="status" 
          style={{ 
            width: '100%', 
            height: '100%',
            borderWidth: '8px'
          }} 
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
          <div style={{ 
            width: '40px', 
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.2)',
            filter: 'blur(8px)'
          }}></div>
        </div>
      </div>
    </div>
    <h4 className="mt-2 fw-bold" style={{ color: '#3b82f6' }}>Loading your learning requests...</h4>
    <p className="text-muted mb-0">Please wait while we fetch your data</p>
  </div>
);

export default LearnerRequests;