import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, Alert, Spinner, Modal, Badge, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SessionScheduler from './SessionScheduler';
import NotificationCenter from './NotificationCenter';
import { fetchTeacherRatings } from '../services/reviewService';
import { PeopleFill, Calendar2PlusFill, ChevronDown, StarFill, 
  BookHalf, BarChartFill, CheckCircleFill, ArrowRepeat, Search, 
  BoxArrowRight, PersonCircle, Speedometer } from 'react-bootstrap-icons';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const MatchingInterface = () => {
  const [learningMatches, setLearningMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [teacherStats, setTeacherStats] = useState({});
  const [allSessions, setAllSessions] = useState([]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  // Fetch all sessions first, then filter by teacher
  const fetchAllSessions = useCallback(async () => {
    if (!user?._id) {
      setAllSessions([]);
      return [];
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions?userId=${user._id}&status=completed`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const responseData = await response.json();
      console.log("Sessions API response:", responseData);
      
      const sessionsData = responseData.sessions || [];
      console.log(`Found ${sessionsData.length} completed sessions`);
      
      setAllSessions(sessionsData);
      return sessionsData;
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      setAllSessions([]);
      return [];
    }
  }, [user]);

  const calculateTeacherStats = useCallback(async () => {
    console.log("Calculating teacher stats with:", { 
      matchesCount: learningMatches?.length || 0, 
      sessionsCount: allSessions?.length || 0 
    });
    
    if (!Array.isArray(learningMatches) || learningMatches.length === 0) {
      console.log("No learning matches found, skipping stats calculation");
      return;
    }
    
    if (!Array.isArray(allSessions)) {
      console.log("Sessions is not an array, initializing as empty");
      setAllSessions([]);
      return;
    }
    
    const statsPromises = learningMatches.map(async (match) => {
      const teacherId = match.teacherId;
      if (!teacherId) {
        console.log("No teacherId found for match:", match);
        return null;
      }
      
      try {
        console.log(`Fetching ratings for teacher ${teacherId}`);
        const ratings = await fetchTeacherRatings(teacherId);
        console.log(`Teacher ${teacherId} ratings:`, ratings);
        
        const teacherSessions = allSessions.filter(session => 
          session && session.teacherId === teacherId && 
          session.status === 'completed'
        );
        
        console.log(`Teacher ${teacherId} has ${teacherSessions.length} completed sessions`);
        
        return {
          teacherId,
          ratings: ratings?.overall || { averageRating: 0, totalReviews: 0 },
          completedSessions: teacherSessions.length
        };
      } catch (error) {
        console.error(`Error calculating stats for teacher ${teacherId}:`, error);
        return {
          teacherId,
          ratings: { averageRating: 0, totalReviews: 0 },
          completedSessions: 0,
          error: true
        };
      }
    });
    
    try {
      console.log("About to resolve stats promises");
      const results = await Promise.all(statsPromises);
      console.log("Stats results:", results);
      
      const validResults = results.filter(result => result !== null);
      
      const statsObj = validResults.reduce((acc, stat) => {
        if (stat && stat.teacherId) {
          acc[stat.teacherId] = stat;
        }
        return acc;
      }, {});
      
      console.log("Final teacher stats:", statsObj);
      setTeacherStats(statsObj);
    } catch (error) {
      console.error("Error calculating teacher stats:", error);
    }
  }, [learningMatches, allSessions]);

  useEffect(() => {
    if (!allSessions) {
      setAllSessions([]);
    }
    
    if (user?._id) {
      fetchAllSessions();
    }
  }, [fetchAllSessions, user]);

  useEffect(() => {
    console.log("Effect running with:", { 
      matchesCount: learningMatches?.length || 0, 
      sessionsCount: allSessions?.length || 0,
      allSessionsIsArray: Array.isArray(allSessions)
    });

    if (
      Array.isArray(learningMatches) && 
      learningMatches.length > 0 && 
      Array.isArray(allSessions)
    ) {
      calculateTeacherStats();
    } else {
      console.log("Skipping stats calculation - prerequisites not met");
    }
  }, [calculateTeacherStats, learningMatches, allSessions]);

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
      
      const onlyUnrequestedMatches = data.filter(match => 
        (match.requesterId === user?._id || match.requestorId === user?._id) && 
        (!match.status || match.status === 'initial' || match.status === 'not_requested' || match.status === 'completed' || match.status === '')
      );
      
      setLearningMatches(onlyUnrequestedMatches);
      
      fetchAllSessions();
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError('Failed to fetch learning matches. Please try again.');
      toast.error('Failed to fetch learning matches');
    } finally {
      setLoading(false);
    }
  }, [user, fetchAllSessions]);

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
    
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Container fluid className="py-4 px-md-4">
      {/* Header - Modern gradient background */}
      <Card className="mb-4 shadow border-0 rounded-4 overflow-hidden">
        <Card.Body style={{ background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)' }} className="p-4 text-white position-relative">
          {/* Decorative Elements */}
          <div className="position-absolute" style={{ 
            top: '-20px', 
            right: '-20px', 
            width: '200px', 
            height: '200px', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div className="position-absolute" style={{ 
            bottom: '-40px', 
            left: '10%', 
            width: '180px', 
            height: '180px',  
            background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
            borderRadius: '50%'
          }}></div>

          <Row className="align-items-center">
            <Col xs={12} md={7}>
              <h1 className="mb-1 fw-bold" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
                <PeopleFill className="me-2" />
                Available Skill Sharers
              </h1>
              <p className="text-white-50 mb-0">Find and connect with teachers for your learning journey</p>
            </Col>
            <Col xs={12} md={5} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <div className="d-flex align-items-center gap-3">
                <NotificationCenter />
                
                {/* Navigation buttons for Desktop */}
                <div className="d-none d-md-flex gap-2">
                  <Button 
                    variant="light" 
                    onClick={() => navigate('/dashboard')} 
                    className="d-flex align-items-center rounded-pill"
                    style={{ 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    <Speedometer className="me-md-2" />
                    <span>Dashboard</span>
                  </Button>
                  <Button 
                    variant="light" 
                    onClick={() => navigate('/profile')} 
                    className="d-flex align-items-center rounded-pill"
                    style={{ 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    <PersonCircle className="me-md-2" />
                    <span>Profile</span>
                  </Button>
                  <Button 
                    variant="light" 
                    onClick={handleLogout} 
                    className="d-flex align-items-center rounded-pill"
                    style={{ 
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                  >
                    <BoxArrowRight className="me-md-2" />
                    <span>Logout</span>
                  </Button>
                </div>
                
                {/* Dropdown menu for Mobile */}
                <div className="d-md-none">
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="light" 
                      id="nav-dropdown"
                      className="rounded-pill"
                      style={{ 
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        background: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <ChevronDown />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end" className="shadow-lg border-0 rounded-3">
                      <Dropdown.Item onClick={() => navigate('/dashboard')} className="d-flex align-items-center py-2">
                        <Speedometer className="me-2" /> Dashboard
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center py-2">
                        <PersonCircle className="me-2" /> Profile
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center py-2">
                        <BoxArrowRight className="me-2" /> Logout
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
        <Alert variant="danger" onClose={() => setError('')} dismissible className="d-flex align-items-center rounded-4 shadow-sm">
          <div className="me-3 rounded-circle bg-danger bg-opacity-10 p-2">
            <i className="bi bi-exclamation-triangle-fill text-danger fs-4"></i>
          </div>
          <div className="flex-grow-1">{error}</div>
        </Alert>
      )}

      {/* Title and Refresh button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#0f172a' }}>New Matches</h2>
        <Button 
          variant="primary" 
          onClick={fetchLearningMatches} 
          disabled={loading}
          className="d-flex align-items-center gap-2 rounded-pill px-3"
          style={{ 
            background: 'linear-gradient(to right, #3b82f6, #1e40af)',
            border: 'none',
            boxShadow: '0 4px 10px -3px rgba(59, 130, 246, 0.5)'
          }}
        >
          <ArrowRepeat />
          <span className="d-none d-sm-inline">Refresh Matches</span>
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <Card className="text-center my-5 py-5 border-0 shadow-sm rounded-4">
          <Card.Body className="p-5">
            <div className="position-relative d-inline-block mb-4">
              <Spinner 
                animation="border" 
                variant="primary" 
                role="status" 
                style={{ 
                  width: '4rem', 
                  height: '4rem',
                  borderWidth: '0.25rem',
                  filter: 'drop-shadow(0 10px 15px rgba(59, 130, 246, 0.3))'
                }} 
              />
              <div className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 70%)',
                  borderRadius: '50%',
                  transform: 'scale(1.5)'
                }}>
              </div>
            </div>
            <h4 className="fw-bold text-primary mb-2">Loading available teachers...</h4>
            <p className="text-muted">Please wait while we find your perfect teachers</p>
          </Card.Body>
        </Card>
      ) : learningMatches.length > 0 ? (
        <>
          <Row className="g-3">
            {learningMatches.map(match => (
              <Col key={match.id || match._id} xs={12}>
                <Card 
                  className="h-100 shadow-sm border-0 rounded-4 mb-3" 
                  style={{ 
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    background: 'white'
                  }}
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
                            background: `${getProfileColor(match.name || match.teacherName)}`,
                            border: '3px solid white',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)'
                          }}
                        >
                          {match.name ? match.name.charAt(0).toUpperCase() : 
                           match.teacherName ? match.teacherName.charAt(0).toUpperCase() : "?"}
                        </div>
                      </Col>
                      <Col xs={12} md={7}>
                        <h3 className="mb-2 fw-bold" style={{ color: '#1e40af' }}>
                          {match.name || match.teacherName || "Unknown"}
                        </h3>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <Badge bg="light" text="dark" className="px-3 py-2 border d-flex align-items-center">
                            <BookHalf className="text-primary me-2" />
                            <span><strong>Skill:</strong> {match.expertise || match.skillName || "Not specified"}</span>
                          </Badge>
                          <Badge bg="light" text="dark" className="px-3 py-2 border d-flex align-items-center">
                            <BarChartFill className="text-success me-2" />
                            <span><strong>Level:</strong> {match.proficiency || match.proficiencyLevel || "Fetching..."}</span>
                          </Badge>
                          {/* Rating Badge */}
                          <Badge bg="light" text="dark" className="px-3 py-2 border d-flex align-items-center">
                            <StarFill className="text-warning me-2" />
                            <span>
                              <strong>Rating:</strong> {
                                !teacherStats[match.teacherId] ? 
                                  <Spinner animation="border" size="sm" className="ms-1" /> :
                                teacherStats[match.teacherId]?.ratings?.totalReviews > 0 ?
                                  `${teacherStats[match.teacherId].ratings.averageRating.toFixed(1)}/5 (${teacherStats[match.teacherId].ratings.totalReviews} review${teacherStats[match.teacherId].ratings.totalReviews !== 1 ? 's' : ''})` :
                                  "No ratings yet"
                              }
                            </span>
                          </Badge>

                          {/* Only show Completed Sessions badge if this specific teacher has completed sessions with the user */}
                          {teacherStats[match.teacherId]?.completedSessions > 0 && (
                            <Badge bg="success" className="px-3 py-2 d-flex align-items-center">
                              <CheckCircleFill className="me-2" />
                              <span><strong>Completed Sessions:</strong> {teacherStats[match.teacherId]?.completedSessions || 0}</span>
                            </Badge>
                          )}
                        </div>

                        {/* Show completed match status if applicable */}
                        {match.status === 'completed' && (
                          <Alert variant="success" className="mb-0 mt-2 py-2 d-flex align-items-center">
                            <CheckCircleFill className="me-2" />
                            <span>You've completed sessions with this teacher. Consider booking another one!</span>
                          </Alert>
                        )}
                      </Col>
                      <Col xs={12} md={3} className="d-flex justify-content-md-end mt-4 mt-md-0">
                        <Button 
                          variant="primary" 
                          className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-pill" 
                          onClick={() => openScheduleModal(match)}
                          style={{ 
                            background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                          }}
                        >
                          <Calendar2PlusFill />
                          <span>Request Session</span>
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card className="text-center my-5 border-0 shadow-sm bg-light py-5 rounded-4">
          <Card.Body className="p-5">
            <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center bg-primary bg-opacity-10" 
              style={{ width: '100px', height: '100px' }}>
              <Search size={40} className="text-primary opacity-75" />
            </div>
            <h3 className="fw-bold mb-3">No new matches found</h3>
            <p className="text-muted mb-4 lead">Try adding more skills you want to learn to find potential teachers!</p>
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-pill px-4 py-2" 
              onClick={() => navigate('/profile')}
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
              }}
            >
              <i className="bi bi-plus-circle-fill me-2"></i> Add Learning Skills
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Scheduling Modal - Modern Design */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg" centered backdrop="static" className="rounded-4">
        <Modal.Header closeButton className="border-0" style={{ 
          background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
          color: 'white'
        }}>
          <Modal.Title className="d-flex align-items-center">
            <Calendar2PlusFill className="me-2" size={22} />
            <span>
              Schedule with {selectedTeacher?.name || selectedTeacher?.teacherName || "Teacher"} 
              {selectedTeacher?.expertise || selectedTeacher?.skillName ? 
                ` - ${selectedTeacher.expertise || selectedTeacher.skillName}` : ""}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <SessionScheduler onSchedule={handleScheduleSubmit} submitting={submitting}/>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="secondary" 
            onClick={() => setShowScheduleModal(false)} 
            className="rounded-pill px-4"
          >
            <i className="bi bi-x-circle me-2"></i> Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom animations */}
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
        .hover-shadow:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        `}
      </style>
    </Container>
  );
};

export default MatchingInterface;