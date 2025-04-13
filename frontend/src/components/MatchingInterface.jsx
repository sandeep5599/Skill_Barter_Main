import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Modal, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SessionScheduler from './SessionScheduler';
import NotificationCenter from './NotificationCenter';
import { fetchTeacherRatings } from '../services/reviewService';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const MatchingInterface = () => {
  const [learningMatches, setLearningMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [teacherStats, setTeacherStats] = useState({});

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  const fetchTeacherStats = useCallback(async () => {
    if (!learningMatches.length) return;
    
    const statsPromises = learningMatches.map(async (match) => {
      const teacherId = match.teacherId;
      if (!teacherId) return null;
      
      try {
        // Get ratings
        const ratings = await fetchTeacherRatings(teacherId);
        
        // Get completed sessions count
        const sessionsResponse = await fetch(`${BACKEND_URL}/api/sessions?teacherId=${teacherId}&status=completed&userId=${user._id}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        
        if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions');
        const sessionsData = await sessionsResponse.json();
        
        return {
          teacherId,
          ratings: ratings?.overall || { averageRating: 0, totalReviews: 0 },
          completedSessions: sessionsData.length || 0
        };
      } catch (error) {
        console.error(`Error fetching stats for teacher ${teacherId}:`, error);
        return {
          teacherId,
          ratings: { averageRating: 0, totalReviews: 0 },
          completedSessions: 0,
          error: true
        };
      }
    });
    
    const results = await Promise.all(statsPromises);

    // Convert array to object with teacherId as keys
    const statsObj = results.reduce((acc, stat) => {
      if (stat && stat.teacherId) {
        acc[stat.teacherId] = stat;
      }
      return acc;
    }, {});
    
    setTeacherStats(statsObj);
  }, [learningMatches, user]);

  // Call this in useEffect after fetchLearningMatches
  useEffect(() => {
    if (user?._id && learningMatches.length > 0) {
      fetchTeacherStats();
    }
  }, [fetchTeacherStats, learningMatches, user]);

  const fetchLearningMatches = useCallback(async () => {
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
      
      // Filter only learning matches (where user is the requester/learner)
      // AND only show matches that have no status or status is null/undefined
      // (meaning they haven't been requested yet)
      const onlyUnrequestedMatches = data.filter(match => 
        (match.requesterId === user?._id || match.requestorId === user?._id) && 
        (!match.status || match.status === 'initial' || match.status === 'not_requested' ||  match.status === 'completed' || match.status === '')
      );
      
      setLearningMatches(onlyUnrequestedMatches);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError('Failed to fetch learning matches. Please try again.');
      toast.error('Failed to fetch learning matches');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchLearningMatches();
    }
  }, [fetchLearningMatches, user]);

  const openScheduleModal = (match) => {
    setSelectedTeacher({
      ...match,
      matchId: match.id || match._id,
      teacherId: match.teacherId,
      skillId: match.skillId
    });
    setShowScheduleModal(true);
  };

  const requestMatch = async (matchId, proposedTimeSlots) => {
    try {
      setSubmitting(true);
      
      const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ 
          status: 'pending',
          proposedTimeSlots
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create session');
      }
  
      const matchData = await response.json();
      
      toast.success('Session requested successfully!');
      fetchLearningMatches();
      setShowScheduleModal(false);
  
      return matchData;
    } catch (error) {
      console.error('Session request error:', error);
      toast.error(error.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleScheduleSubmit = (timeSlots) => {
    if (selectedTeacher && selectedTeacher.matchId) {
      requestMatch(selectedTeacher.matchId, timeSlots);
    } else {
      toast.error('No match selected to create a session');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'rescheduled': return 'info';
      default: return 'secondary';
    }
  };

  // Function to get profile background color
  const getProfileColor = (name) => {
    if (!name) return '#6610f2'; // Default purple
    
    const colors = [
      '#0d6efd', // blue
      '#6f42c1', // indigo
      '#d63384', // pink
      '#dc3545', // red
      '#fd7e14', // orange
      '#198754', // green
      '#20c997', // teal
      '#0dcaf0'  // cyan
    ];
    
    // Get a consistent color based on the first letter
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Function to render action button based on status
  const renderActionButton = (match) => {
    return (
      <Button 
        variant="primary" 
        className="w-100 py-2 shadow-sm" 
        onClick={() => openScheduleModal(match)}
      >
        <i className="bi bi-calendar-plus-fill me-2"></i> Request Session
      </Button>
    );
  };

  return (
    <Container fluid className="py-4 px-md-4">
      {/* Header */}
      <Card className="mb-4 shadow-sm border-0 bg-gradient">
        <Card.Body style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }} className="py-4">
          <Row className="align-items-center">
            <Col xs={12} md={6}>
              <h1 className="mb-0 fw-bold text-primary">
                <i className="bi bi-person-lines-fill me-2"></i>
                Available Skill Sharers
              </h1>
              <p className="text-muted mt-2 mb-0">Find and connect with teachers for your learning journey</p>
            </Col>
            <Col xs={12} md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <div className="d-flex align-items-center gap-3">
                <NotificationCenter />
                
                {/* Navigation buttons for Desktop */}
                <div className="d-none d-md-flex gap-2">
                  <Button variant="primary" onClick={() => navigate('/dashboard')} className="d-flex align-items-center">
                    <i className="bi bi-speedometer2 me-md-2"></i>
                    <span>Dashboard</span>
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/profile')} className="d-flex align-items-center">
                    <i className="bi bi-person-circle me-md-2"></i>
                    <span>Profile</span>
                  </Button>
                  <Button variant="primary" onClick={handleLogout} className="d-flex align-items-center">
                    <i className="bi bi-box-arrow-right me-md-2"></i>
                    <span>Logout</span>
                  </Button>
                </div>
                
                {/* Dropdown menu for Mobile */}
                <div className="d-md-none">
                  <Dropdown>
                    <Dropdown.Toggle variant="primary" id="nav-dropdown">
                      <i className="bi bi-three-dots"></i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item onClick={() => navigate('/dashboard')}>
                        <i className="bi bi-speedometer2 me-2"></i> Dashboard
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => navigate('/profile')}>
                        <i className="bi bi-person-circle me-2"></i> Profile
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Error message */}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          <div>{error}</div>
        </Alert>
      )}

      {/* Refresh button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-dark mb-0">New Matches</h2>
        <Button 
          variant="primary" 
          onClick={fetchLearningMatches} 
          disabled={loading}
          className="d-flex align-items-center gap-2 rounded-pill px-3"
        >
          <i className="bi bi-arrow-repeat"></i> Refresh Matches
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <Card className="text-center my-5 py-5 border-0 shadow-sm">
          <Card.Body>
            <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }} />
            <h4 className="mt-4 text-primary">Loading available teachers...</h4>
            <p className="text-muted">Please wait while we find your perfect teachers</p>
          </Card.Body>
        </Card>
      ) : learningMatches.length > 0 ? (
        <>
          <Row className="g-3">
            {learningMatches.map(match => (
              <Col key={match.id || match._id} xs={12}>
                <Card className="h-100 shadow-sm hover-shadow border-0 mb-3" 
                      style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Card.Body className="p-4">
                    <Row className="align-items-center">
                      <Col xs={12} md={2} className="text-center mb-3 mb-md-0">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow" 
                          style={{ 
                            width: 90, 
                            height: 90, 
                            fontSize: 36, 
                            fontWeight: 'bold',
                            color: 'white',
                            background: getProfileColor(match.name || match.teacherName),
                            border: '3px solid white'
                          }}
                        >
                          {match.name ? match.name.charAt(0).toUpperCase() : 
                           match.teacherName ? match.teacherName.charAt(0).toUpperCase() : "?"}
                        </div>
                      </Col>
                      <Col xs={12} md={7}>
                        <h3 className="mb-2 fw-bold text-primary">{match.name || match.teacherName || "Unknown"}</h3>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <Badge bg="light" text="dark" className="px-3 py-2 border">
                            <i className="bi bi-book-half text-primary me-2"></i>
                            <strong>Skill:</strong> {match.expertise || match.skillName || "Not specified"}
                          </Badge>
                          <Badge bg="light" text="dark" className="px-3 py-2 border">
                            <i className="bi bi-bar-chart-fill text-success me-2"></i>
                            <strong>Level:</strong> {match.proficiency || match.proficiencyLevel || "Fetching..."}
                          </Badge>
                          {/* Rating Badge */}
                          <Badge bg="light" text="dark" className="px-3 py-2 border">
                            <i className="bi bi-star-fill text-warning me-2"></i>
                            <strong>Rating:</strong> {
                              !teacherStats[match.teacherId] ? 
                                <Spinner animation="border" size="sm" className="ms-1" /> :
                              teacherStats[match.teacherId]?.ratings?.totalReviews > 0 ?
                                `${teacherStats[match.teacherId].ratings.averageRating.toFixed(1)}/5 (${teacherStats[match.teacherId].ratings.totalReviews} review${teacherStats[match.teacherId].ratings.totalReviews !== 1 ? 's' : ''})` :
                                "No ratings yet"
                            }
                          </Badge>

                          {/* Only show Completed Sessions badge if this specific match has completed sessions */}
                          {match.status === 'completed' && teacherStats[match.teacherId]?.completedSessions > 0 && (
                            <Badge bg="success" className="px-3 py-2">
                              <i className="bi bi-check-circle-fill me-2"></i>
                              <strong>Completed Sessions:</strong> {teacherStats[match.teacherId].completedSessions}
                            </Badge>
                          )}
                        </div>

                        {/* Show completed match status if applicable */}
                        {match.status === 'completed' && (
                          <Alert variant="success" className="mb-0 mt-2 py-2">
                            <i className="bi bi-check-circle-fill me-2"></i>
                            You've completed sessions with this teacher. Consider booking another one!
                          </Alert>
                        )}
                      </Col>
                      <Col xs={12} md={3} className="d-flex justify-content-md-end mt-4 mt-md-0">
                        {renderActionButton(match)}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card className="text-center my-5 border-0 shadow-sm bg-light py-5">
          <Card.Body className="p-5">
            <i className="bi bi-search display-1 mb-4 text-primary opacity-75"></i>
            <h3 className="fw-bold">No new matches found</h3>
            <p className="text-muted mb-4 lead">Try adding more skills you want to learn to find potential teachers!</p>
            <Button variant="primary" size="lg" className="rounded-pill px-4 py-2 shadow" onClick={() => navigate('/profile')}>
              <i className="bi bi-plus-circle-fill me-2"></i> Add Learning Skills
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Scheduling Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-calendar-date me-2"></i>
            Schedule with {selectedTeacher?.name || selectedTeacher?.teacherName || "Teacher"} 
            {selectedTeacher?.expertise || selectedTeacher?.skillName ? 
              ` - ${selectedTeacher.expertise || selectedTeacher.skillName}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <SessionScheduler onSchedule={handleScheduleSubmit} submitting={submitting}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
            <i className="bi bi-x-circle me-2"></i> Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MatchingInterface;