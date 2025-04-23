import React, { useState } from 'react';
import { Container, Row, Col, Tabs, Tab, Card, Button, Spinner } from 'react-bootstrap';
import { 
  Globe, 
  PeopleFill, 
  Person, 
  Award, 
  BarChartFill, 
  ChevronRight, 
  Clock, 
  StarFill, 
  GraphUp, 
  Lightning, 
  MortarboardFill,
  Trophy,
  BookFill,
  CheckCircleFill,
  GearFill,
  GlobeAmericas,
  ListOl
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

/**
 * Component to render profile views with placeholder states for pending features
 */
const PlaceholderViews = () => {
  const [activeKey, setActiveTab] = useState('stats');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Memoized date
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  // Generate placeholder gradient
  const profileGradient = 'linear-gradient(135deg, hsl(210, 80%, 50%), hsl(250, 80%, 40%))';

  // Navigate to leaderboard
  const handleLeaderboardNavigation = () => {
    navigate('/leaderboard');
  };

  // Badge definitions for achievement tab
  const badges = [
    {
      id: 1,
      name: "Fast Learner",
      icon: <Lightning size={28} className="text-warning" />,
      description: "Completed 5 courses in record time",
      earned: false,
      color: "#fbbf24"
    },
    {
      id: 2,
      name: "Knowledge Master",
      icon: <BookFill size={28} className="text-info" />,
      description: "Achieved 90%+ score in all assessments",
      earned: false,
      color: "#0ea5e9"
    },
    {
      id: 3,
      name: "Helpful Mentor",
      icon: <PeopleFill size={28} className="text-success" />,
      description: "Helped 10+ students with their questions",
      earned: false,
      color: "#10b981" 
    },
    {
      id: 4,
      name: "Perfect Attendance",
      icon: <CheckCircleFill size={28} className="text-primary" />,
      description: "Attended all scheduled sessions",
      earned: false,
      color: "#3b82f6"
    },
    {
      id: 5,
      name: "Innovative Thinker",
      icon: <GearFill size={28} className="text-indigo" />,
      description: "Created an original project",
      earned: false,
      color: "#6366f1"
    },
    {
      id: 6,
      name: "Global Contributor",
      icon: <Globe size={28} className="text-violet" />,
      description: "Collaborated with users from 5+ countries",
      earned: false,
      color: "#8b5cf6"
    }
  ];

  return (
    <Card className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Hero Section - Futuristic */}
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
        
        {/* Date Display */}
        <div className="position-absolute top-0 end-0 mt-3 me-3 d-none d-md-flex">
          <div className="d-flex align-items-center backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
            <Clock className="text-primary me-2" />
            <span className="text-white fw-semibold">{formattedDate}</span>
          </div>
        </div>

        {/* Leaderboard Navigation Button */}
        <div className="position-absolute top-0 start-0 mt-3 ms-3 d-none d-md-flex">
          <Button 
            onClick={handleLeaderboardNavigation}
            variant="primary" 
            className="rounded-pill d-flex align-items-center justify-content-center px-3 py-2"
            style={{ 
              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
            }}
          >
            <ListOl className="me-2" />
            Leaderboard
          </Button>
        </div>
        
        <Row className="align-items-center mb-4 position-relative">
          <Col>
            <h2 className="mb-1" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
              <Person className="me-2" />
              User Profile
            </h2>
            <p className="text-white-50 mb-0">View detailed user information and statistics</p>
          </Col>
        </Row>
        
        <div className="d-flex flex-wrap gap-3 mt-3">
          <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
            <Award className="me-2 text-warning" /> 
            <span className="fw-semibold">Achievement Data Coming Soon</span>
          </div>
          <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
            <Globe className="me-2 text-info" /> 
            <span className="fw-semibold">Location Features In Development</span>
          </div>
        </div>
      </div>
      
      <Card.Body className="p-0 bg-white">
        {/* Tab Navigation - Modern style */}
        <div className="border-bottom">
          <Tabs
            activeKey={activeKey}
            onSelect={(k) => setActiveTab(k)}
            className="px-3 pt-3 custom-tabs"
            fill
          >
            <Tab 
              eventKey="stats" 
              title={
                <div className="d-flex align-items-center justify-content-center py-2">
                  <BarChartFill className={`me-2 ${activeKey === 'stats' ? 'text-primary' : 'text-muted'}`} />
                  <span className={`d-none d-sm-inline ${activeKey === 'stats' ? 'fw-semibold' : ''}`}>Statistics</span>
                </div>
              }
            />
            
            <Tab 
              eventKey="achievements" 
              title={
                <div className="d-flex align-items-center justify-content-center py-2">
                  <Award className={`me-2 ${activeKey === 'achievements' ? 'text-warning' : 'text-muted'}`} />
                  <span className={`d-none d-sm-inline ${activeKey === 'achievements' ? 'fw-semibold' : ''}`}>Achievements</span>
                </div>
              }
            />
            
            <Tab 
              eventKey="map" 
              title={
                <div className="d-flex align-items-center justify-content-center py-2">
                  <Globe className={`me-2 ${activeKey === 'map' ? 'text-info' : 'text-muted'}`} />
                  <span className={`d-none d-sm-inline ${activeKey === 'map' ? 'fw-semibold' : ''}`}>Location</span>
                </div>
              }
            />
          </Tabs>
        </div>
        
        {/* Tab Content - Row-based layout for responsiveness */}
        <Row className="g-0">
          {/* Content Area */}
          <Col xs={12}>
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <Spinner animation="border" role="status" variant="primary" style={{
                    width: '3rem',
                    height: '3rem',
                    borderWidth: '0.25rem'
                  }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-3 text-muted">Loading profile data...</p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                {activeKey === 'stats' && (
                  <Container>
                    <Row>
                      <Col lg={4} className="mb-4">
                        {/* User Points Card */}
                        <Card className="border-0 rounded-4 shadow-sm h-100">
                          <Card.Body className="text-center p-4">
                            <div className="mb-3 mx-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(59, 130, 246, 0.3))' }}>
                              <div className="rounded-circle d-flex align-items-center justify-content-center border-0" 
                                  style={{ 
                                    width: '110px', 
                                    height: '110px', 
                                    background: profileGradient,
                                    boxShadow: '0 0 0 5px rgba(255, 255, 255, 0.8), 0 0 0 10px rgba(59, 130, 246, 0.1)'
                                  }}>
                                <div className="text-center">
                                  <BarChartFill className="text-white mb-2" size={32} />
                                  <div className="text-white-50 small">STATS</div>
                                </div>
                              </div>
                            </div>
                            <h4 className="fw-bold mb-1" style={{ color: '#1e40af' }}>
                              User Statistics
                            </h4>
                            <p className="text-muted mb-3">
                              Comprehensive analytics about user performance and contributions.
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                              {[...Array(5)].map((_, i) => (
                                <StarFill 
                                  key={i} 
                                  size={18} 
                                  className={`${i < 3 ? "text-warning" : "text-muted"}`} 
                                />
                              ))}
                            </div>
                          </Card.Body>
                          <Card.Footer className="bg-white border-0 text-center p-3">
                            <Button 
                              variant="primary" 
                              disabled={true}
                              className="rounded-pill d-flex align-items-center justify-content-center mx-auto px-4"
                              style={{ 
                                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                              }}
                            >
                              <GraphUp className="me-2" />
                              Coming Soon
                              <ChevronRight className="ms-2" />
                            </Button>
                          </Card.Footer>
                        </Card>
                      </Col>
                      
                      <Col lg={8}>
                        {/* Progress Timeline */}
                        <Card className="border-0 rounded-4 shadow-sm mb-4">
                          <div className="p-4">
                            <div className="d-flex align-items-center mb-4 justify-content-between">
                              <div className="d-flex align-items-center">
                                <div className="me-3">
                                  <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                      style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                                      }}>
                                    <Lightning size={22} className="text-white" />
                                  </div>
                                </div>
                                <div>
                                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Learning Progress</h5>
                                  <p className="text-muted small mb-0">
                                    This feature will track user's progress over time
                                  </p>
                                </div>
                              </div>
                              <Button 
                                onClick={handleLeaderboardNavigation}
                                variant="outline-primary" 
                                className="rounded-pill d-md-none d-flex align-items-center"
                              >
                                <ListOl className="me-2" /> Leaderboard
                              </Button>
                            </div>
                            
                            <div className="position-relative mb-3" style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: '60%', 
                                  height: '100%', 
                                  background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                                  borderRadius: '5px',
                                  position: 'relative',
                                  transition: 'width 1s ease-in-out'
                                }} 
                              >
                                {/* Glowing Effect */}
                                <div style={{ 
                                  position: 'absolute', 
                                  top: '0', 
                                  right: '0', 
                                  width: '10px', 
                                  height: '100%', 
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  filter: 'blur(3px)',
                                  animation: 'pulse 2s infinite' 
                                }}></div>
                              </div>
                            </div>
                            
                            <p className="text-center text-muted">
                              Progress display coming in next update
                            </p>
                          </div>
                        </Card>
                        
                        {/* Skills Overview Card */}
                        <Card className="border-0 rounded-4 shadow-sm">
                          <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-4">
                              <div className="me-3">
                                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                    style={{ 
                                      width: '48px', 
                                      height: '48px', 
                                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                      boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                                    }}>
                                  <MortarboardFill size={22} className="text-white" />
                                </div>
                              </div>
                              <div>
                                <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Skills Overview</h5>
                                <p className="text-muted small mb-0">
                                  Detailed breakdown of user's skills will appear here
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-center py-4">
                              <p className="text-muted mb-3">
                                This section will show detailed analytics about the user's teaching and learning skills, with progress indicators and skill level assessments.
                              </p>
                              <div className="d-inline-block border border-primary rounded-pill px-4 py-2 text-primary fw-semibold">
                                <Clock className="me-2" /> Coming Soon
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Container>
                )}
                
                {activeKey === 'achievements' && (
                  <Container>
                    <Row className="justify-content-center">
                      <Col md={10} className="text-center">
                        <div className="mb-4">
                          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                              style={{ 
                                width: '96px', 
                                height: '96px', 
                                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.3)'
                              }}>
                            <Award size={48} className="text-white" />
                          </div>
                          <h3 className="fw-bold mb-3" style={{ color: '#92400e' }}>User Achievements</h3>
                          <p className="text-muted">
                            This feature is coming soon. Here you'll find all badges, awards, and milestones this user has achieved throughout their learning journey.
                          </p>
                          
                          {/* Leaderboard button (mobile only) */}
                          <div className="d-md-none mt-3 mb-4">
                            <Button 
                              onClick={handleLeaderboardNavigation}
                              variant="warning" 
                              className="rounded-pill d-inline-flex align-items-center px-4"
                            >
                              {/* <ListOl className="me-2" /> View Leaderboard */}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="row row-cols-1 row-cols-md-3 g-4 justify-content-center">
                          {badges.map((badge) => (
                            <div className="col" key={badge.id}>
                              <div className="rounded-4 p-4 border h-100" 
                                style={{ 
                                  background: '#f8fafc',
                                  opacity: 0.6,
                                  transition: 'all 0.3s ease'
                                }}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                    style={{ 
                                      width: '80px', 
                                      height: '80px', 
                                      background: '#e2e8f0'
                                    }}>
                                  <span className="text-muted fs-4">?</span>
                                </div>
                                <h5 className="mb-2">{badge.name}</h5>
                                <p className="text-muted small mb-0">{badge.description}</p>
                                <div className="mt-3">
                                  <span className="badge bg-secondary rounded-pill px-3 py-2">
                                    Coming Soon
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </Container>
                )}
                
                {activeKey === 'map' && (
                  <Container>
                    <Row className="justify-content-center">
                      <Col lg={10} className="text-center">
                        <div className="mb-4">
                          <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                              style={{ 
                                width: '96px', 
                                height: '96px', 
                                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                              }}>
                            <Globe size={48} className="text-white" />
                          </div>
                          <h3 className="fw-bold mb-3" style={{ color: '#0891b2' }}>User Location</h3>
                          <p className="text-muted">
                            This feature is coming soon. The map will show geographical information about this user's activities and potential for in-person learning sessions.
                          </p>
                          
                          {/* Leaderboard button (mobile only) */}
                          <div className="d-md-none mt-3 mb-4">
                            <Button 
                              onClick={handleLeaderboardNavigation}
                              variant="info" 
                              className="rounded-pill d-inline-flex align-items-center px-4 text-white"
                            >
                              <ListOl className="me-2" /> View Leaderboard
                            </Button>
                          </div>
                        </div>
                        
                        {/* Placeholder for map */}
                        <div className="rounded-4 mb-4" style={{ 
                          height: '300px', 
                          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                          border: '1px dashed #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div className="text-center">
                            <Globe size={48} className="text-muted mb-3" />
                            <p className="text-muted">Geographic data visualization coming soon</p>
                            <div className="mt-4">
                              <div className="d-inline-block border border-info rounded-pill px-4 py-2 text-info fw-semibold">
                                <Clock className="me-2" /> Feature In Development
                              </div>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
      
      <Card.Footer className="border-0 bg-white d-flex justify-content-between align-items-center py-3 px-4">
        <Button 
          variant="outline-primary"
          onClick={handleLeaderboardNavigation}
          className="rounded-pill d-flex align-items-center"
        >
          <ListOl className="me-2" /> View Leaderboard
        </Button>
        <small className="text-muted">Information last updated: April 19, 2025</small>
      </Card.Footer>
      
      {/* Add custom animation and styling */}
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
        
        /* Custom tab styling */
        .custom-tabs .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          border-radius: 0;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          background: transparent;
          color: #64748b;
        }
        
        .custom-tabs .nav-link:hover {
          color: #0f172a;
          background-color: rgba(241, 245, 249, 0.5);
        }
        
        .custom-tabs .nav-link.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background-color: transparent;
        }
        
        /* Achievement badge hover effect */
        .achievement-badge {
          transition: all 0.3s ease;
        }
        
        .achievement-badge:hover {
          transform: translateY(-5px);
        }
        
        .achievement-earned:hover {
          box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.15);
        }
        `}
      </style>
    </Card>
  );
};

export default PlaceholderViews;