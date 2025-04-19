import React, { useMemo, useEffect, useState } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Dropdown } from 'react-bootstrap';
import { PeopleFill, Award, Clock, CheckCircleFill, MortarboardFill, BookFill, ChevronRight, ChevronDown, 
  Lightning, GraphUp, StarFill, BoxArrowUpRight, GearFill } from 'react-bootstrap-icons';
import axios from 'axios';

const UserWelcomeCard = ({ 
  user, 
  stats, 
  handleFindLearningMatches, 
  isGeneratingMatches, 
  teachingPercentage, 
  learningPercentage, 
  navigate 
}) => {
  // State for leaderboard data
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);
  
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

  // Function to get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Fetch leaderboard data and user rank
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);
      
      try {
        // Fetch leaderboard data
        const leaderboardResponse = await axios.get('/api/points/leaderboard');
        
        if (leaderboardResponse.data.success) {
          setLeaderboardData(leaderboardResponse.data.leaderboard);
        } else {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        // Fetch user's rank if user is logged in
        if (user && user._id) {
          const userRankResponse = await axios.get('/api/points/user-rank', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (userRankResponse.data.success) {
            setUserRank(userRankResponse.data.rank);
          } else {
            // If we can't fetch the rank, we can search for the user in the full leaderboard
            const allLeaderboardResponse = await axios.get('/api/points/leaderboard?limit=0');
            if (allLeaderboardResponse.data.success) {
              const allUsers = allLeaderboardResponse.data.leaderboard;
              const userIndex = allUsers.findIndex(entry => entry.userId === user._id);
              if (userIndex !== -1) {
                setUserRank(userIndex + 1);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setLeaderboardError('Failed to load leaderboard data');
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboardData();
  }, [user]);

  // Generate a gradient based on user level
  const levelGradient = useMemo(() => {
    const hue = (userLevel * 20) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 80%, 50%), hsl(${(hue + 40) % 360}, 80%, 40%))`;
  }, [userLevel]);

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
        
        <Row className="align-items-center mb-4 position-relative">
          <Col>
            <h2 className="mb-1" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
              Welcome back, <span className="text-primary">{user?.name}</span>
            </h2>
            <p className="text-white-50 mb-0">Your learning metrics dashboard</p>
          </Col>
        </Row>
        
        <div className="d-flex flex-wrap gap-3 mt-3">
          <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
            <CheckCircleFill className="me-2 text-success" /> 
            <span className="fw-semibold">{stats.sessionsCompleted} Sessions Completed</span>
          </div>
          <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
            <Clock className="me-2 text-warning" /> 
            <span className="fw-semibold">{stats.upcomingSessions.length} Upcoming</span>
          </div>
        </div>
      </div>
      
      <Card.Body className="p-0 bg-white">
        {/* Main Content - 3 Columns */}
        <Row className="g-0">
          {/* Column 1: User Stats */}
          <Col md={4} className="border-end" style={{ background: '#f8fafc' }}>
            <div className="p-4 h-100 d-flex flex-column">
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {/* Points Circle - Futuristic */}
                  <div className="mb-3 mx-auto" style={{ filter: 'drop-shadow(0 10px 15px rgba(59, 130, 246, 0.3))' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center border-0" 
                        style={{ 
                          width: '110px', 
                          height: '110px', 
                          background: levelGradient,
                          boxShadow: '0 0 0 5px rgba(255, 255, 255, 0.8), 0 0 0 10px rgba(59, 130, 246, 0.1)'
                        }}>
                      <div className="text-center">
                        <h2 className="mb-0 fw-bold text-white" style={{ fontSize: '2.5rem' }}>{stats.points}</h2>
                        <div className="text-white-50 small">POINTS</div>
                      </div>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="position-absolute top-0 end-0 translate-middle">
                    <div className="bg-success rounded-circle p-1 shadow-lg" style={{ border: '2px solid white' }}>
                      <CheckCircleFill className="text-white" size={22} />
                    </div>
                  </div>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: '#1e40af' }}>Skill Mastery</h4>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <p className="text-muted mb-0">Level <span className="fw-bold text-primary">{userLevel}</span></p>
                  <span className="badge" style={{ background: 'linear-gradient(to right, #3b82f6, #1e40af)', color: 'white' }}>
                    +{stats.points % 100} XP
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <h6 className="text-uppercase fw-semibold small mb-3" style={{ color: '#64748b', letterSpacing: '1px' }}>Quick Actions</h6>
                <div className="d-grid gap-3">
                  {/* Find Learning Matches Button - Futuristic */}
                  <Button 
                    variant="primary" 
                    className="rounded-pill py-3 d-flex align-items-center justify-content-center position-relative" 
                    onClick={handleFindLearningMatches} 
                    disabled={isGeneratingMatches}
                    style={{ 
                      background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <div className="me-2">
                      {isGeneratingMatches ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <PeopleFill />
                      )}
                    </div>
                    <span className="fw-semibold">{isGeneratingMatches ? 'Finding Matches...' : 'Discover Study Partners'}</span>
                    <div className="position-absolute top-0 end-0 bottom-0 p-3 d-flex align-items-center">
                      <ChevronRight />
                    </div>
                  </Button>
                  
                  {/* View Requests Dropdown - Futuristic */}
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="success" 
                      id="dropdown-requests" 
                      className="rounded-pill py-3 d-flex align-items-center justify-content-center w-100 text-start"
                      style={{ 
                        background: 'linear-gradient(to right, #10b981, #047857)',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <div className="me-2">
                        <Award />
                      </div>
                      <span className="fw-semibold">Manage Sessions</span>
                      <div className="ms-auto">
                        <ChevronDown />
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow-lg border-0 rounded-3 bg-white mt-2" style={{ 
                      backdropFilter: 'blur(10px)',
                      animation: 'fadeIn 0.2s ease-out'
                    }}>
                      <Dropdown.Item 
                        onClick={() => navigate('/match/teaching-requests')} 
                        className="d-flex align-items-center py-3"
                      >
                        <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                            color: 'white'
                          }}>
                          <MortarboardFill size={18} />
                        </div>
                        <div>
                          <div className="fw-semibold">Teaching Sessions</div>
                          <div className="text-muted small">Share your knowledge</div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item 
                        onClick={() => navigate('/match/learning-requests')} 
                        className="d-flex align-items-center py-3"
                      >
                        <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                            color: 'white'
                          }}>
                          <BookFill size={18} />
                        </div>
                        <div>
                          <div className="fw-semibold">Learning Sessions</div>
                          <div className="text-muted small">Improve your skills</div>
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            </div>
          </Col>
          
          {/* Column 2: Skill Distribution - Neo Futuristic Design */}
          <Col md={4} className="border-end">
            <div className="p-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Skill Distribution</h5>
                  <p className="text-muted small mb-0">Teaching vs. Learning</p>
                </div>
                <Button 
                  variant="primary" 
                  className="rounded-pill px-3 py-1 d-flex align-items-center"
                  onClick={() => navigate('/profile')}
                  style={{ borderWidth: '1.5px' }}
                >
                  <GearFill size={14} className="me-1" />
                  <span>Edit</span>
                </Button>
              </div>
              
              <div className="mb-4">
                {/* Teaching Skills - Futuristic */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ 
                             width: '48px', 
                             height: '48px', 
                             background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                             boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                           }}>
                        <MortarboardFill size={22} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold" style={{ color: '#1e40af' }}>Teaching Skills</span>
                        <span className="fw-bold" style={{ color: '#1e40af' }}>{teachingPercentage}%</span>
                      </div>
                      {/* Futuristic Progress Bar */}
                      <div className="position-relative mb-1" style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${teachingPercentage}%`, 
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
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">{teachingSkillCount} skills</span>
                        <span className="small fw-semibold" style={{ color: '#3b82f6' }}>{teachingStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skill Badges for Teaching */}
                  <div className="d-flex flex-wrap gap-2 ms-5 ps-4">
                    {Object.keys(user?.teachingSkills || {}).slice(0, 3).map((skill, index) => (
                      <span key={`teach-${index}`} className="badge rounded-pill" 
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          padding: '0.4rem 0.8rem'
                        }}>
                        {skill}
                      </span>
                    ))}
                    {Object.keys(user?.teachingSkills || {}).length > 3 && (
                      <span className="badge rounded-pill" 
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.05)', 
                          color: '#3b82f6',
                          padding: '0.4rem 0.8rem'
                        }}>
                        +{Object.keys(user?.teachingSkills || {}).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Learning Skills - Futuristic */}
                <div className="mt-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                           style={{ 
                             width: '48px', 
                             height: '48px', 
                             background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                             boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                           }}>
                        <BookFill size={22} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="fw-semibold" style={{ color: '#0891b2' }}>Learning Skills</span>
                        <span className="fw-bold" style={{ color: '#0891b2' }}>{learningPercentage}%</span>
                      </div>
                      {/* Futuristic Progress Bar */}
                      <div className="position-relative mb-1" style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${learningPercentage}%`, 
                            height: '100%', 
                            background: 'linear-gradient(to right, #06b6d4, #0891b2)',
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
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">{learningSkillCount} skills</span>
                        <span className="small fw-semibold" style={{ color: '#06b6d4' }}>{learningStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skill Badges for Learning */}
                  <div className="d-flex flex-wrap gap-2 ms-5 ps-4">
                    {Object.keys(user?.learningSkills || {}).slice(0, 3).map((skill, index) => (
                      <span key={`learn-${index}`} className="badge rounded-pill" 
                        style={{ 
                          background: 'rgba(6, 182, 212, 0.1)', 
                          color: '#0891b2',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          padding: '0.4rem 0.8rem'
                        }}>
                        {skill}
                      </span>
                    ))}
                    {Object.keys(user?.learningSkills || {}).length > 3 && (
                      <span className="badge rounded-pill" 
                        style={{ 
                          background: 'rgba(6, 182, 212, 0.05)', 
                          color: '#0891b2',
                          padding: '0.4rem 0.8rem'
                        }}>
                        +{Object.keys(user?.learningSkills || {}).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Suggested Next Step Card - Futuristic */}
              <div className="mt-auto">
                <Card className="border-0 rounded-4 shadow-sm" style={{ 
                  background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                  overflow: 'hidden'
                }}>
                  <div className="position-absolute top-0 end-0 mt-2 me-2">
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, rgba(14, 165, 233, 0) 70%)'
                    }}></div>
                  </div>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          background: '#0ea5e9',
                          color: 'white'
                        }}>
                        <Lightning size={14} />
                      </div>
                      <h6 className="text-uppercase fw-semibold small mb-0" style={{ color: '#0c4a6e' }}>Suggested Next Step</h6>
                    </div>
                    <p className="small mb-3 text-muted">Complete your skill assessment to unlock more personalized matches.</p>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-pill px-3 d-flex align-items-center"
                      onClick={() => navigate('/assessments')}
                      style={{ 
                        background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)'
                      }}
                    >
                      <GraphUp size={14} className="me-2" />
                      <span>Explore Assessments</span>
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
          
          {/* Column 3: Leaderboard - Futuristic Space Theme */}
          <Col md={4}>
            <div className="h-100 d-flex flex-column">
              {/* Leaderboard Header */}
              <div className="p-3 d-flex align-items-center" style={{ 
                background: 'linear-gradient(to right, #fef3c7, #fde68a)',
                borderBottom: '1px solid rgba(217, 119, 6, 0.2)'
              }}>
                <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: '#fbbf24',
                    boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.3)'
                  }}>
                  <Award className="text-white" size={18} />
                </div>
                <h5 className="mb-0 fw-bold" style={{ color: '#92400e' }}>Top Contributors</h5>
                <Badge className="ms-auto rounded-pill px-3 py-2" style={{ 
                  background: 'linear-gradient(to right, #fbbf24, #d97706)',
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)'
                }}>Weekly</Badge>
              </div>
              
              {/* Leaderboard Content - Futuristic */}
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '300px', scrollbarWidth: 'thin' }}>
                {isLoadingLeaderboard ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="text-center">
                      <Spinner animation="border" role="status" variant="primary" style={{
                        width: '3rem',
                        height: '3rem',
                        borderWidth: '0.25rem'
                      }}>
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                      <p className="mt-2 text-muted">Loading top contributors...</p>
                    </div>
                  </div>
                ) : leaderboardError ? (
                  <div className="text-center p-4">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger bg-opacity-10" 
                      style={{ width: '64px', height: '64px' }}>
                      <span className="text-danger fs-4">!</span>
                    </div>
                    <p className="text-danger">{leaderboardError}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="rounded-pill px-3"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="p-3">
                    {leaderboardData.length === 0 ? (
                      <div className="text-center p-4">
                        <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10" 
                          style={{ width: '64px', height: '64px' }}>
                          <Award className="text-primary" size={28} />
                        </div>
                        <p className="text-muted">No leaderboard data available yet.</p>
                      </div>
                    ) : (
 
leaderboardData.map((entry, index) => (
  <div 
    key={entry.userId} 
    className="d-flex align-items-center p-3 mb-2 rounded-4" 
    style={{
      background: index === 0 ? 'rgba(251, 191, 36, 0.1)' : 
                 index === 1 ? 'rgba(148, 163, 184, 0.1)' :
                 index === 2 ? 'rgba(205, 127, 50, 0.1)' : 'transparent',
      borderBottom: index !== leaderboardData.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
      transition: 'transform 0.2s ease-out',
      boxShadow: index < 3 ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none'
    }}
    onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-2px)'}}
    onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'}}
  >
    {/* Position Indicator */}
    <div className="me-3">
      <div className="rounded-circle d-flex align-items-center justify-content-center" 
        style={{ 
          width: '36px', 
          height: '36px', 
          background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 
                    index === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 
                    index === 2 ? 'linear-gradient(135deg, #cd7f32, #b06000)' : '#e2e8f0',
          color: 'white',
          boxShadow: index < 3 ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
        }}>
        <span className="fw-bold">{index + 1}</span>
      </div>
    </div>
    
    {/* User Avatar */}
    <div className="me-3">
      <div className="rounded-circle d-flex align-items-center justify-content-center" 
        style={{ 
          width: '40px', 
          height: '40px', 
          background: `hsl(${(entry.userId.charCodeAt(0) * 70) % 360}, 70%, 65%)`,
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
        <span className="fw-bold">{getInitials(entry.name)}</span>
      </div>
    </div>
    
    {/* User Details */}
    <div className="flex-grow-1">
      <div className="fw-semibold">{entry.name}</div>
      <div className="d-flex align-items-center">
        {/* Stars based on level */}
        <div className="me-2">
          {[...Array(Math.min(Math.floor(entry.points / 100) + 1, 5))].map((_, i) => (
            <StarFill key={i} size={12} className="me-1" style={{ 
              color: index === 0 ? '#fbbf24' : 
                    index === 1 ? '#94a3b8' : 
                    index === 2 ? '#cd7f32' : '#cbd5e1'
            }} />
          ))}
        </div>
        <span className="text-muted small">Level {Math.floor(entry.points / 100) + 1}</span>
      </div>
    </div>
    
    {/* Points and Streak */}
    <div>
      <div className="fw-bold text-end" style={{ 
        color: index === 0 ? '#d97706' : 
              index === 1 ? '#64748b' : 
              index === 2 ? '#b06000' : '#0f172a'
      }}>
        {entry.points}
      </div>
      <div className="d-flex align-items-center justify-content-end">
        <Lightning size={12} className="me-1" style={{ color: "#ef4444" }} />
        <span className="text-danger small">{entry.streak}-day streak</span>
      </div>
    </div>
  </div>
))
                    )}
                  </div>
                )}
              </div>
              
              {/* User Rank - Futuristic */}
              <div className="mt-auto p-3 border-top">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: `hsl(${(user?._id?.charCodeAt(0) * 70) % 360 || 0}, 70%, 65%)`,
                        color: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}>
                      <span className="fw-bold">{getInitials(user?.name)}</span>
                    </div>
                    <div>
                      <div className="fw-semibold">Your Rank</div>
                      <div className="d-flex align-items-center">
                        {userRank ? (
                          <>
                            <span className="badge rounded-pill me-2" style={{ 
                              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                              color: 'white'
                            }}>#{userRank}</span>
                            <span className="text-muted small">of {leaderboardData.length}+ users</span>
                          </>
                        ) : (
                          <span className="text-muted small">Complete a session to rank</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                  <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-pill px-3 d-flex align-items-center"
                      onClick={() => navigate('/leaderboard')}
                      style={{ 
                        background: 'linear-gradient(to right, #4f46e5, #3730a3)',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
                      }}
                    >
                      <BoxArrowUpRight size={14} className="me-2" />
                      <span>View Full Leaderboard</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
      
      {/* Add custom animation for the glowing effect */}
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
        `}
      </style>
    </Card>
  );
};

export default UserWelcomeCard;