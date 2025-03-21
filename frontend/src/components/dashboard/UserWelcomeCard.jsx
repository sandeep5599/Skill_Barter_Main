import React, { useMemo } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Dropdown } from 'react-bootstrap';
import { PeopleFill, Award, Clock, CheckCircleFill, MortarboardFill, BookFill, ChevronRight, ChevronDown } from 'react-bootstrap-icons';

const UserWelcomeCard = ({ 
  user, 
  stats, 
  handleFindLearningMatches, 
  isGeneratingMatches, 
  teachingPercentage, 
  learningPercentage, 
  navigate 
}) => {
  // Memoized values to prevent unnecessary recalculations
  const formattedDate = useMemo(() => 
    new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    []
  );
  
  const userLevel = useMemo(() => 
    Math.floor((stats?.points || 0) / 100) + 1,
    [stats?.points]
  );
  
  const teachingSkillCount = useMemo(() => 
    Object.keys(user?.teachingSkills || {}).length,
    [user?.teachingSkills]
  );
  
  const learningSkillCount = useMemo(() => 
    Object.keys(user?.learningSkills || {}).length,
    [user?.learningSkills]
  );
  
  const teachingStatus = useMemo(() => 
    teachingPercentage > 70 ? 'Expert' : teachingPercentage > 40 ? 'Intermediate' : 'Beginner',
    [teachingPercentage]
  );
  
  const learningStatus = useMemo(() => 
    learningPercentage > 70 ? 'Enthusiast' : learningPercentage > 40 ? 'Active' : 'Exploring',
    [learningPercentage]
  );

  // Dummy leaderboard data
  const leaderboardData = useMemo(() => [
    { id: 1, name: "Emma Thompson", points: 2845, avatar: "ET" },
    { id: 2, name: "Michael Chen", points: 2760, avatar: "MC" },
    { id: 3, name: "Sophia Rodriguez", points: 2590, avatar: "SR" },
    { id: 4, name: "Daniel Kim", points: 2475, avatar: "DK" },
    { id: 5, name: "Olivia Wilson", points: 2310, avatar: "OW" }
  ], []);

  return (
    <Card className="mb-4 shadow-lg bg-white border-0 rounded-4 overflow-hidden">
      {/* Hero Section with Enhanced Gradient Background */}
      <div className="p-4 position-relative" style={{
        background: 'linear-gradient(135deg, #e8f4ff 0%, #c9e8ff 50%, #a3d8f4 100%)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {/* Floating Date Display */}
        <div className="position-absolute top-0 end-0 mt-3 me-3">
          <div className="d-flex align-items-center bg-white bg-opacity-50 rounded-pill px-3 py-2" 
               style={{ backdropFilter: 'blur(10px)' }}>
            <Clock className="text-primary me-2" />
            <span className="text-dark fw-semibold">{formattedDate}</span>
          </div>
        </div>
        
        <Row className="align-items-center mb-3">
          <Col>
            <h2 className="text-dark mb-1 display-6">
              Welcome back, <span className="fw-bold text-transparent" 
                                style={{ 
                                  backgroundImage: 'linear-gradient(90deg, #0077b6, #00b4d8)', 
                                  WebkitBackgroundClip: 'text',
                                  WebkitTextFillColor: 'transparent' 
                                }}>
                {user?.name}
              </span>
            </h2>
            <p className="text-muted mb-0">Your learning journey visualization</p>
          </Col>
        </Row>
        
        <div className="d-flex flex-wrap gap-3 mt-3">
          <div className="bg-white bg-opacity-50 rounded-pill px-3 py-2" 
               style={{ backdropFilter: 'blur(10px)' }}>
            <CheckCircleFill className="me-2 text-success" /> 
            <span className="fw-semibold text-dark">{stats.sessionsCompleted} Sessions</span>
          </div>
          <div className="bg-white bg-opacity-50 rounded-pill px-3 py-2" 
               style={{ backdropFilter: 'blur(10px)' }}>
            <Clock className="me-2 text-primary" /> 
            <span className="fw-semibold text-dark">{stats.upcomingSessions.length} Upcoming</span>
          </div>
        </div>
      </div>
      
      <Card.Body className="p-0 bg-white">
        {/* Main Content - 3 Columns */}
        <Row className="g-0">
          {/* Column 1: User Stats */}
          <Col md={4} className="border-end border-light">
            <div className="p-4 h-100 d-flex flex-column">
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {/* Points Circle with Animated Gradient */}
                  <div className="p-1 mb-2 mx-auto" style={{
                    border: '3px solid transparent',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0077b6, #00b4d8, #90e0ef) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '90px', 
                          height: '90px', 
                          background: 'radial-gradient(circle, #00b4d8, #0077b6)',
                          boxShadow: '0 0 15px rgba(0, 180, 216, 0.3)',
                          position: 'relative',
                        }}>
                      <h2 className="mb-0 fw-bold text-white" style={{ position: 'relative', zIndex: 5 }}>{stats.points}</h2>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="position-absolute top-0 end-0 translate-middle-y">
                    <div className="bg-success rounded-circle p-1 shadow-lg">
                      <CheckCircleFill className="text-white" size={22} />
                    </div>
                  </div>
                </div>
                <h4 className="fw-bold mb-1" style={{ 
                  color: '#0077b6'
                }}>Skill Points</h4>
                <p className="text-muted small mb-0">
                  Level {userLevel} 
                  <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">+{stats.points % 100} XP</span>
                </p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-uppercase text-muted fw-semibold small mb-3">Quick Actions</h6>
                <div className="d-grid gap-3">
                  {/* Find Learning Matches Button with Hover Effect */}
                  <Button 
                    variant="primary" 
                    className="rounded-pill py-2 d-flex align-items-center justify-content-center position-relative overflow-hidden" 
                    onClick={handleFindLearningMatches} 
                    disabled={isGeneratingMatches}
                    style={{ 
                      background: 'linear-gradient(90deg, #0077b6, #00b4d8)',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className="me-2">
                      {isGeneratingMatches ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <PeopleFill />
                      )}
                    </div>
                    <span>{isGeneratingMatches ? 'Finding Matches...' : 'Find Learning Matches'}</span>
                    <div className="position-absolute top-0 end-0 bottom-0 p-2 d-flex align-items-center" 
                         style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                      <ChevronRight />
                    </div>
                  </Button>
                  
                  {/* View Requests Dropdown with Enhanced UI */}
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="success" 
                      id="dropdown-requests" 
                      className="rounded-pill py-2 d-flex align-items-center justify-content-center w-100 text-start"
                      style={{ 
                        background: 'linear-gradient(90deg, #00b4d8, #0077b6)',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="me-2">
                        <Award />
                      </div>
                      <span>View Requests</span>
                      <div className="ms-auto">
                        <ChevronDown />
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-lg border-0 rounded-3 bg-white">
                      <Dropdown.Item 
                        onClick={() => navigate('/match/teaching-requests')} 
                        className="d-flex align-items-center py-2"
                        style={{ backgroundColor: 'transparent', transition: 'background-color 0.2s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 119, 182, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span className="me-2 fs-5">👨‍🏫</span> 
                        <div>
                          <div className="fw-semibold">Teaching Requests</div>
                          <div className="text-muted small">Share your knowledge</div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Divider className="border-light" />
                      <Dropdown.Item 
                        onClick={() => navigate('/match/learning-requests')} 
                        className="d-flex align-items-center py-2"
                        style={{ backgroundColor: 'transparent', transition: 'background-color 0.2s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 180, 216, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span className="me-2 fs-5">👨‍🎓</span> 
                        <div>
                          <div className="fw-semibold">Learner Requests</div>
                          <div className="text-muted small">Improve your skills</div>
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Col>
          
          {/* Column 2: Skill Distribution with Animated Progress Bars */}
          <Col md={4} className="border-end border-light">
            <div className="p-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Skill Distribution</h5>
                <Button 
                  variant="link" 
                  className="p-0 text-decoration-none"
                  onClick={() => navigate('/profile/skills')}
                  style={{ color: '#00b4d8' }}
                >
                  Edit
                </Button>
              </div>
              
              <div className="mb-4">
                {/* Teaching Skills */}
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: '42px', 
                           height: '42px', 
                           background: 'linear-gradient(135deg, #0077b6, #023e8a)',
                           boxShadow: '0 0 10px rgba(0, 119, 182, 0.3)' 
                         }}>
                      <MortarboardFill size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Teaching Skills</span>
                      <span className="fw-bold" style={{ color: '#0077b6' }}>{teachingPercentage}%</span>
                    </div>
                    {/* Custom Progress Bar with Animation */}
                    <div className="position-relative mb-1" style={{ height: '10px', backgroundColor: 'rgba(0, 119, 182, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${teachingPercentage}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #0077b6, #00b4d8)',
                          boxShadow: '0 0 8px rgba(0, 119, 182, 0.3)',
                          borderRadius: '5px',
                          transition: 'width 1s ease-in-out'
                        }} 
                      />
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">{teachingSkillCount} skills</span>
                      <span className="small" style={{ color: '#00b4d8' }}>{teachingStatus}</span>
                    </div>
                  </div>
                </div>
                
                {/* Learning Skills */}
                <div className="d-flex align-items-center mt-4">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center" 
                         style={{ 
                           width: '42px', 
                           height: '42px', 
                           background: 'linear-gradient(135deg, #00b4d8, #0077b6)',
                           boxShadow: '0 0 10px rgba(0, 180, 216, 0.3)' 
                         }}>
                      <BookFill size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Learning Skills</span>
                      <span className="fw-bold" style={{ color: '#00b4d8' }}>{learningPercentage}%</span>
                    </div>
                    {/* Custom Progress Bar with Animation */}
                    <div className="position-relative mb-1" style={{ height: '10px', backgroundColor: 'rgba(0, 180, 216, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${learningPercentage}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #00b4d8, #0077b6)',
                          boxShadow: '0 0 8px rgba(0, 180, 216, 0.3)',
                          borderRadius: '5px',
                          transition: 'width 1s ease-in-out'
                        }} 
                      />
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">{learningSkillCount} skills</span>
                      <span className="small" style={{ color: '#0077b6' }}>{learningStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Suggested Next Step Card with Enhanced Visual Design */}
              <div className="mt-auto">
                <Card className="border-0 rounded-4 overflow-hidden" style={{ 
                  background: 'linear-gradient(45deg, rgba(0, 119, 182, 0.05), rgba(0, 180, 216, 0.05))',
                  backdropFilter: 'blur(10px)',
                  borderLeft: '3px solid #0077b6'
                }}>
                  <Card.Body className="p-3">
                    <h6 className="text-uppercase text-muted fw-semibold small mb-2">Suggested Next Step</h6>
                    <p className="small mb-3 text-muted">Complete your skill assessment to unlock more personalized matches.</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="rounded-pill px-3"
                      onClick={() => navigate('/profile/assessment')}
                      style={{ 
                        borderColor: '#00b4d8',
                        color: '#00b4d8',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #0077b6, #00b4d8)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#00b4d8';
                        e.currentTarget.style.borderColor = '#00b4d8';
                      }}
                    >
                      Take Assessment
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
          
          {/* Column 3: Leaderboard with Enhanced Visual Hierarchy */}
          <Col md={4}>
            <div className="h-100 d-flex flex-column">
              {/* Leaderboard Header */}
              <div className="px-4 py-3 d-flex align-items-center" style={{ 
                background: 'linear-gradient(90deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.03))',
                borderBottom: '1px solid rgba(255, 193, 7, 0.1)'
              }}>
                <div className="me-2">
                  <Award className="text-warning" />
                </div>
                <h5 className="mb-0 fw-bold">Top Contributors</h5>
                <Badge bg="warning" text="dark" className="ms-auto rounded-pill">Weekly</Badge>
              </div>
              
              {/* Leaderboard Content with Improved Styling */}
              <div className="flex-grow-1 overflow-auto" style={{ 
                maxHeight: '300px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#0077b6 #f8f9fa'
              }}>
                <div className="p-3">
                  {leaderboardData.map((user, index) => (
                    <div key={user.id} className="d-flex align-items-center p-2 mb-2 rounded-3" style={{
                      background: index === 0 ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                      transition: 'background-color 0.2s ease',
                      borderBottom: index !== leaderboardData.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                    }}>
                      <div className="me-3 fw-bold" style={{ width: '24px', color: index < 3 ? '#ffc107' : '#6c757d' }}>
                        #{index + 1}
                      </div>
                      <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" style={{
                        width: '36px',
                        height: '36px',
                        background: index === 0 ? 'linear-gradient(135deg, #ffc107, #fd7e14)' : 
                                 index === 1 ? 'linear-gradient(135deg, #adb5bd, #ced4da)' :
                                 index === 2 ? 'linear-gradient(135deg, #cd7f32, #deb887)' : 
                                 'linear-gradient(135deg, #e9ecef, #dee2e6)',
                        color: index < 3 ? '#fff' : '#6c757d',
                        fontWeight: 'bold'
                      }}>
                        {user.avatar}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{user.name}</div>
                        <div className="small text-muted d-flex align-items-center">
                          <Award size={12} className="me-1 text-warning" /> {user.points} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer Section with Enhanced Visual Design */}
              <div className="p-3 border-top border-light" style={{ 
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(0, 119, 182, 0.05))'
              }}>
                <Row className="align-items-center g-0">
                  <Col xs={4} className="text-center border-end border-light">
                    <div className="text-muted fw-semibold small">Your Rank</div>
                    <div className="fs-3 fw-bold" style={{ 
                      background: 'linear-gradient(90deg, #0077b6, #00b4d8)', 
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent' 
                    }}>#12</div>
                  </Col>
                  <Col xs={8}>
                    <div className="ps-3">
                      <Button 
                        variant="warning" 
                        className="rounded-pill w-100 d-flex align-items-center justify-content-center"
                        onClick={() => navigate('/leaderboard')}
                        size="sm"
                        style={{ 
                          background: 'linear-gradient(90deg, #ffc107, #fd7e14)',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          color: '#000'
                        }}
                      >
                        <div className="me-2">
                          <Award />
                        </div>
                        <span>View Full Leaderboard</span>
                      </Button>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default UserWelcomeCard;