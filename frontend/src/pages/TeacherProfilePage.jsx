import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { 
  StarFill, 
  MortarboardFill, 
  CalendarCheck, 
  Chat, 
  ArrowLeft, 
  Award,
  CheckCircleFill, 
  Clock,
  Person
} from 'react-bootstrap-icons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const TeacherProfilePage = () => {
  const { teacherId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in (you might need to adapt this based on your auth system)
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuthStatus();
    
    const fetchTeacherProfile = async () => {
      try {
        const response = await axios.get(`/api/search/teacher/${teacherId}`);
        setProfileData(response.data.data);
      } catch (err) {
        console.error('Error fetching teacher profile:', err);
        setError(err.response?.data?.message || 'Error loading teacher profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, [teacherId]);

  const handleBackNavigation = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleBookSession = () => {
    if (isLoggedIn) {
      navigate('/match/learning');
    } else {
      navigate('/register');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
          <Spinner animation="border" role="status" variant="primary" style={{
            width: '3rem',
            height: '3rem',
            borderWidth: '0.25rem'
          }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading teacher profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <Card.Body className="p-4 text-center">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10" 
              style={{ width: '64px', height: '64px' }}>
              <span className="text-danger fs-4">!</span>
            </div>
            <h4>Error Loading Profile</h4>
            <Alert variant="danger">{error}</Alert>
            <Button 
              variant="primary" 
              onClick={handleBackNavigation}
              className="mt-3 rounded-pill px-4 py-2"
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
              }}
            >
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const { teacher, skills, stats, recentReviews } = profileData;

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'Beginner': return 'linear-gradient(to right, #10b981, #047857)';
      case 'Intermediate': return 'linear-gradient(to right, #f59e0b, #d97706)';
      case 'Expert': return 'linear-gradient(to right, #ef4444, #b91c1c)';
      default: return 'linear-gradient(to right, #6b7280, #4b5563)';
    }
  };
  
  const getLevelTextColor = (level) => {
    switch(level) {
      case 'Beginner': return '#047857';
      case 'Intermediate': return '#d97706';
      case 'Expert': return '#b91c1c';
      default: return '#4b5563';
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Container className="py-5">
      {/* Back navigation */}
      <div className="mb-4">
        <Button 
          variant="primary" 
          onClick={handleBackNavigation}
          className="d-flex align-items-center rounded-pill px-3 py-2 shadow-sm"
          style={{ 
            background: 'linear-gradient(to right, #3b82f6, #1e40af)',
            border: 'none'
          }}
        >
          <ArrowLeft className="me-2" />
          Back to {isLoggedIn ? 'Dashboard' : 'Home'}
        </Button>
      </div>
      
      <Card className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#f8fafc' }}>
        {/* Hero Section */}
        <div className="position-relative" style={{ 
          background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
          padding: '2rem',
          color: 'white',
          overflow: 'hidden'
        }}>
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
            <Col md={8}>
              <div className="d-flex align-items-center mb-3">
                <div className="me-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      background: `hsl(${(teacher?.name?.charCodeAt(0) * 70) % 360 || 210}, 70%, 65%)`,
                      color: 'white',
                      boxShadow: '0 0 0 5px rgba(255, 255, 255, 0.2), 0 8px 16px rgba(0, 0, 0, 0.3)'
                    }}>
                    <span className="display-4 fw-bold">{getInitials(teacher.name)}</span>
                  </div>
                </div>
                <div>
                  <h1 className="mb-1 display-5 fw-bold" style={{ letterSpacing: '-0.5px' }}>{teacher.name}</h1>
                  <p className="text-white-50 mb-2">{teacher.email}</p>
                  <div className="d-flex align-items-center">
                    <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 me-3 d-flex align-items-center" style={{ backdropFilter: 'blur(4px)' }}>
                      <StarFill className="text-warning me-2" />
                      <span className="fw-bold">{stats.averageRating.toFixed(1)} Rating</span>
                    </div>
                    <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 d-flex align-items-center" style={{ backdropFilter: 'blur(4px)' }}>
                      <MortarboardFill className="text-info me-2" />
                      <span>{stats.reviewCount} Reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-4 mt-md-0">
              <Button 
                variant="primary" 
                onClick={handleBookSession}
                className="rounded-pill py-3 px-4 d-inline-flex align-items-center justify-content-center"
                style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                  fontSize: '1.1rem'
                }}
              >
                <CalendarCheck className="me-2" />
                Book a Session
              </Button>
            </Col>
          </Row>
        </div>
        
        <Card.Body className="p-0">
          <Row className="g-0">
            <Col lg={12}>
              {/* Skills Section */}
              <div className="p-4 border-bottom">
                <h3 className="mb-4 d-flex align-items-center">
                  <Award className="text-primary me-2" />
                  Skills & Expertise
                </h3>
                
                {skills.length > 0 ? (
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {skills.map((skill) => (
                      <Col key={skill._id}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 hover-lift">
                          <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5 className="mb-0 fw-bold">{skill.skillName}</h5>
                              <Badge pill 
                                style={{ 
                                  background: getLevelBadgeColor(skill.proficiencyLevel),
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 0.8rem'
                                }}
                              >
                                {skill.proficiencyLevel}
                              </Badge>
                            </div>
                            {skill.description && (
                              <p className="text-muted mb-0">{skill.description}</p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info" className="rounded-4 border-0 shadow-sm">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ width: '48px', height: '48px', background: 'rgba(14, 165, 233, 0.1)' }}>
                        <MortarboardFill className="text-info" />
                      </div>
                      <div>
                        <h5 className="mb-0">No skills listed yet</h5>
                        <p className="text-muted mb-0">This teacher hasn't added any skills to their profile.</p>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>
              
              {/* Reviews Section */}
              <div className="p-4">
                <h3 className="mb-4 d-flex align-items-center">
                  <Chat className="text-primary me-2" />
                  Recent Reviews
                </h3>
                
                {recentReviews.length > 0 ? (
                  <Row xs={1} md={2} className="g-4">
                    {recentReviews.map((review) => (
                      <Col key={review._id}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 hover-lift">
                          <Card.Body className="p-4">
                            <div className="d-flex justify-content-between mb-3">
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                                  style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    background: `hsl(${(review.studentId.name?.charCodeAt(0) * 70) % 360 || 0}, 70%, 65%)`,
                                    color: 'white'
                                  }}>
                                  <span className="fw-bold">{getInitials(review.studentId.name)}</span>
                                </div>
                                <div>
                                  <h5 className="mb-0 fw-bold">{review.studentId.name}</h5>
                                  <div className="d-flex align-items-center text-muted small">
                                    <MortarboardFill className="me-1" />
                                    <span>Learned {review.skillId.skillName}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ms-2 d-flex align-items-center rounded-pill px-3 py-1" 
                                style={{ 
                                  background: 'linear-gradient(to right, #facc15, #eab308)',
                                  boxShadow: '0 4px 6px -1px rgba(250, 204, 21, 0.3)'
                                }}>
                                <StarFill className="text-white me-1" />
                                <span className="fw-bold text-white">{review.rating}</span>
                              </div>
                            </div>
                            
                            <Card style={{ 
                              background: 'rgba(243, 244, 246, 0.5)', 
                              border: '1px solid rgba(229, 231, 235, 0.8)',
                              borderRadius: '0.75rem'
                            }}>
                              <Card.Body className="p-3">
                                <p className="mb-0">{review.reviewText || "No additional feedback provided."}</p>
                              </Card.Body>
                            </Card>
                            
                            <div className="d-flex align-items-center text-muted small mt-3">
                              <Clock className="me-1" />
                              <span>
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info" className="rounded-4 border-0 shadow-sm">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                        style={{ width: '48px', height: '48px', background: 'rgba(14, 165, 233, 0.1)' }}>
                        <Chat className="text-info" />
                      </div>
                      <div>
                        <h5 className="mb-0">No reviews yet</h5>
                        <p className="text-muted mb-0">Be the first to learn from this teacher and leave a review!</p>
                      </div>
                    </div>
                  </Alert>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Call to Action Section */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden mt-4">
        <div className="position-relative" style={{ 
          background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
          padding: '2rem',
          overflow: 'hidden'
        }}>
          <div className="position-absolute" style={{ 
            top: '-20px', 
            right: '-20px', 
            width: '200px', 
            height: '200px', 
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0) 70%)',
            borderRadius: '50%'
          }}></div>
          
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="fw-bold mb-3" style={{ color: '#0c4a6e' }}>Ready to learn from {teacher.name}?</h3>
              <p className="mb-0 text-muted">Book a session now and start improving your skills with personalized guidance.</p>
            </Col>
            <Col md={4} className="text-md-end mt-4 mt-md-0">
              <Button 
                variant="primary" 
                onClick={handleBookSession}
                className="rounded-pill py-3 px-4"
                style={{ 
                  background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
                }}
              >
                Get Started Now
              </Button>
            </Col>
          </Row>
        </div>
      </Card>
      
      {/* Custom styles */}
      <style>
        {`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        
        .hover-lift {
          transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        `}
      </style>
    </Container>
  );
};

export default TeacherProfilePage;