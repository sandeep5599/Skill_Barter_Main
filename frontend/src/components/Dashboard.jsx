import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, OverlayTrigger, Tooltip, Spinner, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Alert } from 'react-bootstrap';

import NotificationCenter from './NotificationCenter';

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
      // console.log('Generated Matches:', result);
  
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
        const matchesResponse = await fetch(`${BACKEND_URL}/api/matches/user/${user._id}?status=accepted,pending`, { 
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

  return (
    <Container fluid className="py-4">
      {/* Removed the Bootstrap ToastContainer since we're using react-toastify */}
      
      <Card className="mb-4 bg-light shadow-sm">
  <Card.Body className="d-flex justify-content-between align-items-center">
    <h1 className="text-xl font-medium mb-0">Skill Barter Platform</h1>
    <div className="d-flex align-items-center gap-3">
      <NotificationCenter />
      <div className="d-flex gap-2">
        <Button variant="primary" onClick={() => navigate('/profile')}>
          Profile
        </Button>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  </Card.Body>
</Card>


      <Card className="mb-4 bg-light">
        <Card.Body>
          <h2>Welcome back, {user?.name}</h2>
          <p>Points: {stats.points} | Sessions Completed: {stats.sessionsCompleted}</p>
          <div className="d-flex gap-3">
            <Button variant="primary" onClick={handleFindLearningMatches} disabled={isGeneratingMatches}>
              {isGeneratingMatches ? <Spinner animation="border" size="sm" /> : 'Find Learning Matches'}
            </Button>
            
            {/* Replace the View Session Requests button with a dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-requests">
                View Requests
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate('/match/teaching-requests')}>Teaching Requests</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate('/match/learning-requests')}>Learner Requests</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Body>
      </Card>

      <Row>
  {[
    { 
      title: 'Upcoming Sessions', 
      data: stats.upcomingSessions || [], 
      displayFn: (session) => {
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
          <div className="mb-3">
            <div className="mb-2">
              {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <div className="mb-2">
              <strong>{skillName}</strong><br/>
              Skill Sharer: {session.teacherName || 'Satwika'}
            </div>
            <div>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-${session._id}`}>
                    {isJoinable ? 'Click to join the session' : tooltipText || 'This button will be enabled 5 minutes before the session starts'}
                  </Tooltip>
                }
              >
                <div className="d-grid">
                  <Button 
                    variant="success" 
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
            </div>
          </div>
        );
      }
    },
    { 
      title: 'Recent Matches', 
      data: stats.recentMatches || [], 
      displayFn: (match) => (
        <div className="mb-3">
          <div className="mb-2">
            <Badge bg={match.status === 'accepted' ? 'success' : 'warning'}>
              {match.status}
            </Badge>
          </div>
          <div>
            <strong>{match.skillName}</strong><br/>
            Skill Sharer: {match.teacherName || 'Satwika'}
          </div>
        </div>
      )
    }
  ].map(({ title, data, displayFn }, idx) => (
    <Col xs={12} md={6} key={idx}>
      <Card className="mb-4">
        <Card.Header>{title}</Card.Header>
        <Card.Body>
          {data && data.length > 0 ? (
            data.map((item, i) => (
              <div key={i} className="mb-3">
                {displayFn ? displayFn(item) : (item.name || item.title || '')}
              </div>
            ))
          ) : (
            <p>No {title.toLowerCase()} found.</p>
          )}
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>

      <Row>
        {[
          { title: 'Skills I Can Teach', data: stats.teachingSkills }, 
          { title: 'Skills I Want to Learn', data: stats.learningSkills }
        ].map(({ title, data }, idx) => (
          <Col xs={12} md={6} key={idx}>
            <Card className="mb-4">
              <Card.Header>{title}</Card.Header>
              <Card.Body>
                {data.length 
                  ? data.map((skill, i) => (
                    <OverlayTrigger 
                      key={i} 
                      placement="top" 
                      overlay={<Tooltip>{skill.description || 'No description available'}</Tooltip>}
                    >
                      <Badge 
                        bg={title.includes('Teach') ? 'primary' : 'secondary'} 
                        className="me-2 mb-2"
                      >
                        {skill.skillName} ({skill.proficiencyLevel})
                      </Badge>
                    </OverlayTrigger>
                  )) 
                  : <p>No {title.toLowerCase()} added.</p>
                }
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;