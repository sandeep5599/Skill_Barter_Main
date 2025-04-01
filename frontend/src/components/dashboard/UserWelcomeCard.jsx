import React, { useMemo, useEffect, useState } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Dropdown } from 'react-bootstrap';
import { PeopleFill, Award, Clock, CheckCircleFill, MortarboardFill, BookFill, ChevronRight, ChevronDown } from 'react-bootstrap-icons';
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
          // This endpoint doesn't exist in your provided code, but we'll assume it's implemented
          // For complete solution, you might want to add this endpoint to pointsController
          const userRankResponse = await axios.get('/api/points/user-rank', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (userRankResponse.data.success) {
            setUserRank(userRankResponse.data.rank);
          } else {
            // If we can't fetch the rank, we can search for the user in the full leaderboard
            // This is just a fallback and not efficient for large datasets
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

  return (
    <Card className="mb-4 shadow border rounded-3 overflow-hidden">
      {/* Hero Section - Simplified */}
      <div className="p-4 position-relative bg-light border-bottom">
        {/* Date Display */}
        <div className="position-absolute top-0 end-0 mt-3 me-3">
          <div className="d-flex align-items-center bg-white rounded-pill px-3 py-2 shadow-sm">
            <Clock className="text-primary me-2" />
            <span className="text-dark fw-semibold">{formattedDate}</span>
          </div>
        </div>
        
        <Row className="align-items-center mb-3">
          <Col>
            <h2 className="text-dark mb-1">
              Welcome back, <span className="fw-bold text-primary">{user?.name}</span>
            </h2>
            <p className="text-muted mb-0">Your learning journey visualization</p>
          </Col>
        </Row>
        
        <div className="d-flex flex-wrap gap-3 mt-3">
          <div className="bg-white rounded-pill px-3 py-2 shadow-sm">
            <CheckCircleFill className="me-2 text-success" /> 
            <span className="fw-semibold text-dark">{stats.sessionsCompleted} Sessions</span>
          </div>
          <div className="bg-white rounded-pill px-3 py-2 shadow-sm">
            <Clock className="me-2 text-primary" /> 
            <span className="fw-semibold text-dark">{stats.upcomingSessions.length} Upcoming</span>
          </div>
        </div>
      </div>
      
      <Card.Body className="p-0 bg-white">
        {/* Main Content - 3 Columns */}
        <Row className="g-0">
          {/* Column 1: User Stats */}
          <Col md={4} className="border-end">
            <div className="p-4 h-100 d-flex flex-column">
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {/* Points Circle - Simplified */}
                  <div className="p-1 mb-2 mx-auto">
                    <div className="rounded-circle d-flex align-items-center justify-content-center border border-primary" 
                        style={{ 
                          width: '90px', 
                          height: '90px', 
                          background: '#f8f9fa'
                        }}>
                      <h2 className="mb-0 fw-bold text-primary">{stats.points}</h2>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="position-absolute top-0 end-0 translate-middle-y">
                    <div className="bg-success rounded-circle p-1 shadow">
                      <CheckCircleFill className="text-white" size={22} />
                    </div>
                  </div>
                </div>
                <h4 className="fw-bold mb-1 text-primary">Skill Points</h4>
                <p className="text-muted small mb-0">
                  Level {userLevel} 
                  <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">+{stats.points % 100} XP</span>
                </p>
              </div>
              
              <div className="mb-4">
                <h6 className="text-uppercase text-muted fw-semibold small mb-3">Quick Actions</h6>
                <div className="d-grid gap-3">
                  {/* Find Learning Matches Button - Simplified */}
                  <Button 
                    variant="primary" 
                    className="rounded-pill py-2 d-flex align-items-center justify-content-center" 
                    onClick={handleFindLearningMatches} 
                    disabled={isGeneratingMatches}
                  >
                    <div className="me-2">
                      {isGeneratingMatches ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <PeopleFill />
                      )}
                    </div>
                    <span>{isGeneratingMatches ? 'Finding Matches...' : 'Discover Study Partners'}</span>
                    <div className="position-absolute top-0 end-0 bottom-0 p-2 d-flex align-items-center">
                      <ChevronRight />
                    </div>
                  </Button>
                  
                  {/* View Requests Dropdown - Simplified */}
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="success" 
                      id="dropdown-requests" 
                      className="rounded-pill py-2 d-flex align-items-center justify-content-center w-100 text-start"
                    >
                      <div className="me-2">
                        <Award />
                      </div>
                      <span>Manage Sessions</span>
                      <div className="ms-auto">
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="shadow border rounded-3 bg-white">
                      <Dropdown.Item 
                        onClick={() => navigate('/match/teaching-requests')} 
                        className="d-flex align-items-center py-2"
                      >
                        <span className="me-2 fs-5">👨‍🏫</span> 
                        <div>
                          <div className="fw-semibold">Teaching Sessions</div>
                          <div className="text-muted small">Share your knowledge</div>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item 
                        onClick={() => navigate('/match/learning-requests')} 
                        className="d-flex align-items-center py-2"
                      >
                        <span className="me-2 fs-5">👨‍🎓</span> 
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
          
          {/* Column 2: Skill Distribution - Simplified Progress Bars */}
          <Col md={4} className="border-end">
            <div className="p-4 h-100 d-flex flex-column">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0">Skill Distribution</h5>
                <Button 
                  variant="primary" 
                  className="p-0 text-decoration-none primary"
                  onClick={() => navigate('/profile')}
                >
                  Edit
                </Button>
              </div>
              
              <div className="mb-4">
                {/* Teaching Skills */}
                <div className="d-flex align-items-center mb-3">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary" 
                         style={{ width: '42px', height: '42px' }}>
                      <MortarboardFill size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Teaching Skills</span>
                      <span className="fw-bold text-primary">{teachingPercentage}%</span>
                    </div>
                    {/* Standard Progress Bar */}
                    <div className="progress mb-1" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar" 
                        style={{ width: `${teachingPercentage}%` }} 
                        aria-valuenow={teachingPercentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100" 
                      />
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">{teachingSkillCount} skills</span>
                      <span className="small text-primary">{teachingStatus}</span>
                    </div>
                  </div>
                </div>
                
                {/* Learning Skills */}
                <div className="d-flex align-items-center mt-4">
                  <div className="me-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-info" 
                         style={{ width: '42px', height: '42px' }}>
                      <BookFill size={20} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="fw-semibold">Learning Skills</span>
                      <span className="fw-bold text-info">{learningPercentage}%</span>
                    </div>
                    {/* Standard Progress Bar */}
                    <div className="progress mb-1" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        role="progressbar" 
                        style={{ width: `${learningPercentage}%` }} 
                        aria-valuenow={learningPercentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100" 
                      />
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted small">{learningSkillCount} skills</span>
                      <span className="small text-info">{learningStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Suggested Next Step Card - Simplified */}
              <div className="mt-auto">
                <Card className="border bg-light rounded-3">
                  <Card.Body className="p-3">
                    <h6 className="text-uppercase text-muted fw-semibold small mb-2">Suggested Next Step</h6>
                    <p className="small mb-3 text-muted">Complete your skill assessment to unlock more personalized matches.</p>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="rounded-pill px-3"
                      onClick={() => navigate('/assessments')}
                    >
                      Take Assessment
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </Col>
          
          {/* Column 3: Leaderboard - Dynamic Data */}
          <Col md={4}>
            <div className="h-100 d-flex flex-column">
              {/* Leaderboard Header */}
              <div className="px-4 py-3 d-flex align-items-center bg-light border-bottom">
                <div className="me-2">
                  <Award className="text-warning" />
                </div>
                <h5 className="mb-0 fw-bold">Top Contributors</h5>
                <Badge bg="warning" text="dark" className="ms-auto rounded-pill">Weekly</Badge>
              </div>
              
              {/* Leaderboard Content - Dynamic */}
              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: '300px' }}>
                {isLoadingLeaderboard ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" role="status" variant="primary">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : leaderboardError ? (
                  <div className="text-center p-3 text-danger">
                    <p>{leaderboardError}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="p-3">
                    {leaderboardData.length === 0 ? (
                      <div className="text-center p-3 text-muted">
                        <p>No leaderboard data available yet.</p>
                      </div>
                    ) : (
                      leaderboardData.map((entry, index) => (
                        <div 
                          key={entry.userId} 
                          className="d-flex align-items-center p-2 mb-2 rounded-3" 
                          style={{
                            background: index === 0 ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                            borderBottom: index !== leaderboardData.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'
                          }}
                        >
                          <div className="me-3 fw-bold" style={{ 
                            width: '24px', 
                            color: index < 3 ? '#ffc107' : '#6c757d' 
                          }}>
                            #{entry.rank}
                          </div>
                          <div 
                            className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                            style={{
                              width: '36px',
                              height: '36px',
                              background: index === 0 ? '#ffc107' : 
                                       index === 1 ? '#adb5bd' :
                                       index === 2 ? '#cd7f32' : 
                                       '#e9ecef',
                              color: index < 3 ? '#fff' : '#6c757d',
                              fontWeight: 'bold'
                            }}
                          >
                            {entry.avatar ? entry.avatar : getInitials(entry.name)}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{entry.name}</div>
                            <div className="small text-muted d-flex align-items-center">
                              <Award size={12} className="me-1 text-warning" /> {entry.points} points
                              {entry.streak > 1 && (
                                <span className="ms-2 badge bg-primary bg-opacity-10 text-primary">
                                  {entry.streak} day streak
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Footer Section with User Rank - Dynamic */}
              <div className="p-3 border-top">
                <Row className="align-items-center g-0">
                  <Col xs={4} className="text-center border-end">
                    <div className="text-muted fw-semibold small">Your Rank</div>
                    {isLoadingLeaderboard ? (
                      <div className="py-1">
                        <Spinner animation="border" size="sm" variant="primary" />
                      </div>
                    ) : (
                      <div className="fs-3 fw-bold text-primary">
                        {userRank ? `#${userRank}` : '-'}
                      </div>
                    )}
                  </Col>
                  <Col xs={8}>
                    <div className="ps-3">
                      <Button 
                        variant="warning" 
                        className="rounded-pill w-100 d-flex align-items-center justify-content-center"
                        onClick={() => navigate('/leaderboard')}
                        size="sm"
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