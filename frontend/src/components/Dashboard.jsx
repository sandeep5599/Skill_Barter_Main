import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  OverlayTrigger, Tooltip, Spinner, Dropdown,
  Nav, ProgressBar, Image, Accordion
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Alert } from 'react-bootstrap';
import axios from 'axios';
import DashboardMatchesDisplay from './DashboardMatchesDisplay';

import { 
  BellFill, PersonFill, BoxArrowRight, 
  CalendarCheck, PeopleFill, Award, 
  ArrowRepeat, Clock, CheckCircleFill,
  XCircleFill
} from 'react-bootstrap-icons';

import NotificationCenter from './NotificationCenter';

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'accepted': 'bg-green-100 text-green-800',
  'completed': 'bg-purple-100 text-purple-800',
  'not_requested': 'bg-gray-100 text-gray-800'
};




const MatchStatusDisplay = ({ match }) => {
  // Helper to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  // Get the latest time slot if available
  const getLatestTimeSlot = () => {
    if (!match.timeSlots || match.timeSlots.length === 0) return null;
    return match.timeSlots[match.timeSlots.length - 1];
  };

  const latestTimeSlot = getLatestTimeSlot();

  if (match.status === 'rejected') {
    return (
      <div className="match-status-container">
        <div className="status-badge rejected">Rejected</div>
        {match.rejectionReason && (
          <div className="rejection-reason">
            <p>Reason: {match.rejectionReason}</p>
          </div>
        )}
      </div>
    );
  } 

  const statusColor = statusColors[match.status] || 'bg-gray-100 text-gray-800';
  
  
  if (match.status === 'pending' && match.isRescheduled) {
    return (
      <div className="match-status-container">
        <div className="status-badge rescheduled">Rescheduled</div>
        <div className="reschedule-message">
          <p>{match.teacherName} proposed a new time slot. Go to requests page to check out.</p>
          {latestTimeSlot && (
            <p className="time-slot-info">
              <span>Proposed time: </span>
              {formatDateTime(latestTimeSlot.startTime)} - {formatDateTime(latestTimeSlot.endTime)}
            </p>
          )}
        </div>
      </div>
    );
  }

  
return (
  <div className="match-status-container">
    <div className={`status-badge ${match.status.toLowerCase()}`}>
      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
    </div>
  </div>
);
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    points: 0,
    sessionsCompleted: 0,
    upcomingSessions: [],
    recentMatches: [],
    teachingSkills: [],
    learningSkills: [],
  });
  

  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Renamed this to avoid conflict with the imported toast
  const [localToast, setLocalToast] = useState({ 
    show: false, 
    message: '', 
    variant: 'success' 
  });
 

  const { user, logout } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (user?._id) fetchUserProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showLocalToast = (message, variant = 'success') => {
    setLocalToast({ show: true, message, variant });
    setTimeout(() => setLocalToast({ show: false, message: '', variant: 'success' }), 3000);
  };

  const handleFindLearningMatches = async () => {
    try {
      setIsGeneratingMatches(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate matches');
      }
  
      const result = await response.json();
  
      // Check both learning and teaching matches
      const learningMatches = result.matchesFound || [];
      const teachingMatches = result.teachingMatchesCreated || [];
      const totalMatches = learningMatches.length + teachingMatches.length;
      
      if (totalMatches > 0) {
        if (learningMatches.length > 0 && teachingMatches.length > 0) {
          // Both learning and teaching matches found
          toast.success(`🎉 Found ${learningMatches.length} learning matches and created ${teachingMatches.length} teaching matches!`);
        } else if (learningMatches.length > 0) {
          // Only learning matches found
          toast.success(`🎉 Found ${learningMatches.length} matches for your learning needs!`);
        } else {
          // Only teaching matches created
          toast.success(`🎉 Created ${teachingMatches.length} teaching matches!`);
        }
      } else {
        toast.info('ℹ️ No new matches found. Try adding more skills you want to learn or teach!');
      }
  
      // Navigate to the appropriate matching interface tab
      if (learningMatches.length > 0) {
        navigate('/match/learning');
      } else if (teachingMatches.length > 0) {
        navigate('/match/teaching');
      } else {
        navigate('/match/learning');
      }
    } catch (error) {
      console.error('Error generating matches:', error);
      toast.error('❌ Failed to generate matches. Please try again.');
    } finally {
      setIsGeneratingMatches(false);
    }
  };
  
  const fetchUserProfile = async () => {
    try {
      // Start with the endpoints we know are working
      const [userResponse, skillsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/users/${user._id}`, { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        }),
        fetch(`${BACKEND_URL}/api/skills/${user._id}`, { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`, 
            'Content-Type': 'application/json' 
          } 
        })
      ]);
  
      if (!userResponse.ok || !skillsResponse.ok) throw new Error('Failed to fetch user data');
  
      const [userData, skillsData] = await Promise.all([
        userResponse.json(), 
        skillsResponse.json()
      ]);
      
      // Set initial data
      setStats(prevStats => ({ 
        ...prevStats, 
        learningSkills: skillsData.learningSkills || [], 
        teachingSkills: skillsData.teachingSkills || [] 
      }));
      
      // Now try to fetch sessions and matches separately
      try {
        const sessionsResponse = await fetch(`${BACKEND_URL}/api/sessions/user/${user._id}?status=scheduled`, { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        });
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setStats(prevStats => ({ 
            ...prevStats, 
            upcomingSessions: sessionsData.sessions || [] 
          }));
        } else {
          console.warn('Unable to fetch sessions:', await sessionsResponse.text());
          setStats(prevStats => ({ ...prevStats, upcomingSessions: [] }));
        }
      } catch (sessionError) {
        console.warn('Session fetch error:', sessionError);
        setStats(prevStats => ({ ...prevStats, upcomingSessions: [] }));
      }
      
      // Try to fetch matches separately
      try {
        const matchesResponse = await fetch(`${BACKEND_URL}/api/matches/user/${user._id}?status=accepted,pending,rejected`, { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        });
        
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setStats(prevStats => ({ 
            ...prevStats, 
            recentMatches: matchesData.matches || [] 
          }));
        } else {
          console.warn('Unable to fetch matches:', await matchesResponse.text());
          setStats(prevStats => ({ ...prevStats, recentMatches: [] }));
        }
      } catch (matchError) {
        console.warn('Match fetch error:', matchError);
        setStats(prevStats => ({ ...prevStats, recentMatches: [] }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Error fetching user profile');
    }
  };

  // Helper function to get readable time until session
  const getTimeUntilSession = (sessionTime) => {
    const now = new Date();
    const sessionStart = new Date(sessionTime);
    const timeDiff = sessionStart - now;
    
    if (timeDiff <= 0) return 'Now';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Calculate skill distribution percentages
  const teachingSkillsCount = stats.teachingSkills.length;
  const learningSkillsCount = stats.learningSkills.length;
  const totalSkills = teachingSkillsCount + learningSkillsCount;
  const teachingPercentage = totalSkills > 0 ? Math.round((teachingSkillsCount / totalSkills) * 100) : 0;
  const learningPercentage = totalSkills > 0 ? 100 - teachingPercentage : 0;

  return (
    <Container fluid className="py-4">
      {/* Header with Navigation */}
      <Card className="mb-4 bg-gradient-primary shadow">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h1 className="text-primary fw-bold mb-0 fs-3">
                <span className="border-bottom border-3 border-primary pb-1">Skill Barter Platform</span>
              </h1>
            </div>
            <div className="d-flex align-items-center gap-3">
              <NotificationCenter />
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  className="d-flex align-items-center gap-2" 
                  onClick={() => navigate('/profile')}
                >
                  <PersonFill /> Profile
                </Button>
                <Button 
                  variant="danger" 
                  className="d-flex align-items-center gap-2" 
                  onClick={handleLogout}
                >
                  <BoxArrowRight /> Logout
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* User Welcome Card */}
      <Card className="mb-4 shadow-sm bg-light border-0">
        <Card.Body className="p-4">
          <Row>
            <Col md={8}>
              <h2 className="display-6 mb-3">Welcome back, <span className="text-primary">{user?.name}</span></h2>
              
              <div className="d-flex align-items-center mb-4">
                <div className="border border-2 border-primary rounded-circle p-2 me-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                    <h3 className="mb-0">{stats.points}</h3>
                  </div>
                </div>
                <div>
                  <h5 className="text-muted mb-1">Skill Points</h5>
                  <div className="d-flex align-items-center">
                    <Badge bg="success" className="me-3">
                      <CheckCircleFill className="me-1" /> {stats.sessionsCompleted} Sessions Completed
                    </Badge>
                    <Badge bg="warning" text="dark">
                      <Clock className="me-1" /> {stats.upcomingSessions.length} Upcoming
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-3">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="d-flex align-items-center gap-2" 
                  onClick={handleFindLearningMatches} 
                  disabled={isGeneratingMatches}
                >
                  {isGeneratingMatches ? (
                    <><Spinner animation="border" size="sm" /> Finding Matches...</>
                  ) : (
                    <><PeopleFill /> Find Learning Matches</>
                  )}
                </Button>
                
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="success" 
                    id="dropdown-requests" 
                    className="d-flex align-items-center gap-2"
                    size="lg"
                  >
                    <Award /> View Requests
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate('/match/teaching-requests')}>
                      <span className="fw-bold text-primary me-2">👨‍🏫</span> Teaching Requests
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => navigate('/match/learning-requests')}>
                      <span className="fw-bold text-success me-2">👨‍🎓</span> Learner Requests
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
            
            <Col md={4} className="mt-4 mt-md-0">
              <Card className="bg-white h-100">
                <Card.Body>
                  <h5 className="mb-3">Skill Distribution</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Teaching Skills</span>
                      <span className="text-primary fw-bold">{teachingPercentage}%</span>
                    </div>
                    <ProgressBar variant="primary" now={teachingPercentage} className="mb-3" />
                    
                    <div className="d-flex justify-content-between mb-1">
                      <span>Learning Skills</span>
                      <span className="text-success fw-bold">{learningPercentage}%</span>
                    </div>
                    <ProgressBar variant="success" now={learningPercentage} />
                  </div>
                  <div className="text-center mt-4">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => navigate('/profile/skills')}
                      className="w-100"
                    >
                      Manage Skills
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tab Navigation */}
      <Nav variant="tabs" className="mb-4 border-0">
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'overview' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('overview')}
            active={activeTab === 'overview'}
          >
            Overview
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'sessions' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('sessions')}
            active={activeTab === 'sessions'}
          >
            Sessions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'matches' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('matches')}
            active={activeTab === 'matches'}
          >
            Matches
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'skills' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('skills')}
            active={activeTab === 'skills'}
          >
            Skills
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Row>
            <Col lg={8}>
              <Row>
                <Col md={6}>
                  <Card className="mb-4 shadow-sm border-0 h-100">
                    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Upcoming Sessions</h5>
                      <Badge bg="light" text="primary" pill>
                        {stats.upcomingSessions.length}
                      </Badge>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {stats.upcomingSessions && stats.upcomingSessions.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {stats.upcomingSessions.map((session, i) => {
                            // Calculate if the session is about to start (within 5 minutes)
                            const now = new Date();
                            const sessionStart = new Date(session.startTime);
                            const timeDiff = sessionStart - now;
                            const isJoinable = timeDiff <= 5 * 60 * 1000 && timeDiff > -60 * 60 * 1000; // 5 min before to 1 hour after
                            
                            // Find the skill name from session or matches data
                            let skillName = '';
                            if (session.skillName) {
                              skillName = session.skillName;
                            } else if (stats.recentMatches && stats.recentMatches.length > 0) {
                              const relatedMatch = stats.recentMatches.find(match => match._id === session.matchId);
                              if (relatedMatch && relatedMatch.skillName) {
                                skillName = relatedMatch.skillName;
                              }
                            }
                            
                            // Calculate time until session becomes joinable
                            let tooltipText = '';
                            if (!isJoinable && timeDiff > 5 * 60 * 1000) {
                              const minutesRemaining = Math.floor(timeDiff / 60000) - 5;
                              const hoursRemaining = Math.floor(minutesRemaining / 60);
                              
                              if (hoursRemaining > 0) {
                                tooltipText = `This button will be enabled in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} and ${minutesRemaining % 60} minute${(minutesRemaining % 60) !== 1 ? 's' : ''} before the session`;
                              } else {
                                tooltipText = `This button will be enabled in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} before the session`;
                              }
                            }

                            return (
                              <div key={i} className="list-group-item p-3">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <h6 className="mb-0 fw-bold">{skillName}</h6>
                                    <div className="text-muted mb-2">
                                      <small>
                                        <CalendarCheck className="me-1" />
                                        {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </small>
                                    </div>
                                    <div className="d-flex align-items-center">
                                      <div className="bg-light rounded-circle p-1 me-2" style={{ width: '30px', height: '30px' }}>
                                        <PersonFill className="text-primary" />
                                      </div>
                                      <div>
                                        <small>Skill Sharer: {session.teacherName}</small>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ms-3 d-flex flex-column justify-content-between align-items-end">
                                    <Badge bg={isJoinable ? 'success' : 'secondary'} className="mb-2">
                                      {isJoinable ? 'Ready' : getTimeUntilSession(session.startTime)}
                                    </Badge>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip id={`tooltip-${session._id}`}>
                                          {isJoinable ? 'Click to join the session' : tooltipText || 'This button will be enabled 5 minutes before the session starts'}
                                        </Tooltip>
                                      }
                                    >
                                      <div>
                                        <Button 
                                          variant="primary" 
                                          size="sm" 
                                          onClick={() => {
                                            if (session.meetingLink) {
                                              window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
                                            }
                                          }}
                                          disabled={!isJoinable}
                                        >
                                          Join Now
                                        </Button>
                                      </div>
                                    </OverlayTrigger>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="text-muted mb-3">No upcoming sessions found.</div>
                          <Button variant="primary" size="sm" onClick={() => navigate('/match/learning')}>
                            Find Sessions
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4 shadow-sm border-0 h-100">
                    <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Recent Matches</h5>
                      <Badge bg="light" text="success" pill>
                        {stats.recentMatches.length}
                      </Badge>
                    </Card.Header>
                    <Card.Body className="p-0">
                    {stats.recentMatches && stats.recentMatches.length > 0 ? (
  <div className="list-group list-group-flush">
    {stats.recentMatches.map((match, i) => {
      // Find the teacher in the database using teacherId

      console.log('Match teacherId:', match.teacherId);
      console.log('User ID:', user._id);
      const isTeacher = match.teacherId._id === user._id;
      const displayName = isTeacher ? match.requesterName : match.teacherName;
      const roleLabel = isTeacher ? "Learner" : "Skill Sharer";
      
      return (
        <div key={i} className="list-group-item p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-bold">{match.skillName}</h6>
              <div className="d-flex align-items-center mt-2">
                <div className="bg-light rounded-circle p-1 me-2" style={{ width: '30px', height: '30px' }}>
                  <PersonFill className="text-primary" />
                </div>
                <div>
                  <small>{roleLabel}: {displayName}</small>
                </div>
              </div>
            </div>
            <div>
              <Badge 
                bg={match.status === 'accepted' ? 'success' : 'warning'}
                text={match.status === 'accepted' ? 'white' : 'dark'}
                className="text-uppercase"
              >
                {match.status}
              </Badge>
            </div>
          </div>
        </div>
      );
    })}
  </div>
) : (
                        <div className="text-center p-4">
                          <div className="text-muted mb-3">No recent matches found.</div>
                          <Button variant="primary" size="sm" onClick={handleFindLearningMatches}>
                            Find Matches
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col lg={4}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Quick Actions</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-grid gap-3">
                    <Button variant="primary" className="d-flex justify-content-between align-items-center" onClick={() => navigate('/profile/skills')}>
                      <span>Add New Skills</span>
                      <ArrowRepeat />
                    </Button>
                    <Button variant="primary" className="d-flex justify-content-between align-items-center" onClick={() => navigate('/schedule')}>
                      <span>Schedule a Session</span>
                      <CalendarCheck />
                    </Button>
                    <Button variant="primary" className="d-flex justify-content-between align-items-center" onClick={() => navigate('/history')}>
                      <span>View Session History</span>
                      <Award />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Upcoming Sessions</h5>
            </Card.Header>
            <Card.Body>
              {stats.upcomingSessions && stats.upcomingSessions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Teacher</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.upcomingSessions.map((session, i) => {
                        const now = new Date();
                        const sessionStart = new Date(session.startTime);
                        const timeDiff = sessionStart - now;
                        const isJoinable = timeDiff <= 5 * 60 * 1000 && timeDiff > -60 * 60 * 1000;
                        
                        let skillName = '';
                        if (session.skillName) {
                          skillName = session.skillName;
                        } else if (stats.recentMatches && stats.recentMatches.length > 0) {
                          const relatedMatch = stats.recentMatches.find(match => match._id === session.matchId);
                          if (relatedMatch && relatedMatch.skillName) {
                            skillName = relatedMatch.skillName;
                          }
                        }
                        
                        return (
                          <tr key={i}>
                            <td>
                              <span className="fw-bold">{skillName}</span>
                            </td>
                            <td>{session.teacherName}</td>
                            <td>
                              {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td>
                              <Badge 
                                bg={isJoinable ? 'success' : 'secondary'} 
                                pill
                              >
                                {isJoinable ? 'Ready to Join' : getTimeUntilSession(session.startTime) + ' remaining'}
                              </Badge>
                            </td>
                            <td>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-session-${i}`}>
                                    {isJoinable ? 'Click to join the session' : 'This button will be enabled 5 minutes before the session starts'}
                                  </Tooltip>
                                }
                              >
                                <div>
                                  <Button 
                                    variant="primary" 
                                    size="sm" 
                                    href={session.meetLink || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    disabled={!isJoinable}
                                  >
                                    Join Now
                                  </Button>
                                </div>
                              </OverlayTrigger>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="text-muted mb-3">No upcoming sessions found.</div>
                  <Button variant="primary" onClick={() => navigate('/match/learning')}>
                    Find Learning Opportunities
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Matches Tab */}
{activeTab === 'matches' && (
  <Card className="mb-4 shadow-sm border-0">
    <Card.Header className="bg-success text-white">
      <h5 className="mb-0">Recent Matches</h5>
    </Card.Header>
    <Card.Body>
      {stats.recentMatches && stats.recentMatches.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Teacher</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentMatches.map((match, i) => (
                        <tr key={i}>
                          <td>
                            <span className="fw-bold">{match.skillName}</span>
                          </td>
                          <td>{match.teacherName || 'Satwika'}</td>
                          <td>
                            <Badge 
                              bg={match.status === 'accepted' ? 'success' : 'warning'}
                              text={match.status === 'accepted' ? 'white' : 'dark'}
                              pill
                            >
                              {match.status}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant={match.status === 'accepted' ? 'primary' : 'outline-primary'} 
                              size="sm"
                              onClick={() => navigate(`/match/details/${match._id}`)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="text-muted mb-3">No recent matches found.</div>
                  <Button variant="success" onClick={handleFindLearningMatches}>
                    Find New Matches
                  </Button>
                </div>
              )}
    </Card.Body>
  </Card>
)}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <Row>
            <Col md={6}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Skills I Can Teach</h5>
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={() => navigate('/profile/skills')}
                  >
                    <small>Add New</small>
                  </Button>
                </Card.Header>
                <Card.Body>
                  {stats.teachingSkills.length > 0 ? (
                    <div>
                      {stats.teachingSkills.map((skill, index) => (
                        <Card key={index} className="mb-3 border-0 shadow-sm">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0 fw-bold">{skill.skillName}</h6>
                                <span className="text-muted"><small>Proficiency: {skill.proficiencyLevel}</small></span>
                              </div>
                              <Badge bg="primary" pill>Teacher</Badge>
                            </div>
                            {skill.description && (
                              <p className="text-muted small mt-2 mb-0">{skill.description}</p>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-muted mb-3">No teaching skills added yet.</div>
                      <Button variant="outline-primary" size="sm" onClick={() => navigate('/profile/skills')}>
                        Add Skills to Teach
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4 shadow-sm border-0">
                <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Skills I Want to Learn</h5>
                  <Button 
                    variant="light" 
                    size="sm" 
                    onClick={() => navigate('/profile/skills')}
                  >
                    <small>Add New</small>
                  </Button>
                </Card.Header>
                <Card.Body>
                  {stats.learningSkills.length > 0 ? (
                    <div>
                      {stats.learningSkills.map((skill, index) => (
                        <Card key={index} className="mb-3 border-0 shadow-sm">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-0 fw-bold">{skill.skillName}</h6>
                                <span className="text-muted"><small>Target Level: {skill.proficiencyLevel}</small></span>
                              </div>
                              <Badge bg="success" pill>Learner</Badge>
                            </div>
                            {skill.description && (
                              <p className="text-muted small mt-2 mb-0">{skill.description}</p>
                            )}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-muted mb-3">No learning skills added yet.</div>
                      <Button variant="primary" size="sm" onClick={() => navigate('/profile/skills')}>
                        Add Skills to Learn
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </Container>
  );
};

export default Dashboard;