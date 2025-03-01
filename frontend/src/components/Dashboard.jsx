import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
      console.log('Generated Matches:', result);
  
      if (result.matchesFound && result.matchesFound.length > 0) {
        // Using the imported toast function correctly
        toast.success(`🎉 Found ${result.matchesFound.length} matches for your learning needs!`);
      } else {
        toast.info('ℹ️ No new matches found. Try adding more skills you want to learn!');
      }
  
      navigate('/match/learning');
    } catch (error) {
      console.error('Error generating matches:', error);
      // Using the imported toast function correctly
      toast.error('❌ Failed to generate matches. Please try again.');
    } finally {
      setIsGeneratingMatches(false);
    }
  };
  
  const fetchUserProfile = async () => {
    try {
      const [userResponse, skillsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/users/${user._id}`, { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        }),
        fetch(`${BACKEND_URL}/api/skills/${user._id}`, { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`, 
            'Content-Type': 'application/json' 
          } 
        }),
      ]);

      if (!userResponse.ok || !skillsResponse.ok) throw new Error('Failed to fetch data');

      const [userData, skillsData] = await Promise.all([
        userResponse.json(), 
        skillsResponse.json()
      ]);
      
      setStats(prevStats => ({ 
        ...prevStats, 
        learningSkills: skillsData.learningSkills || [], 
        teachingSkills: skillsData.teachingSkills || [] 
      }));
    } catch (error) {
      // Using the imported toast function correctly
      toast.error('Error fetching user profile');
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Removed the Bootstrap ToastContainer since we're using react-toastify */}
      
      <Card className="mb-4 bg-light">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="text-xl font-medium mb-0">Skill Barter Platform</h1>
          <div>
            <Button variant="primary" onClick={() => navigate('/profile')} className="me-2">Profile</Button>
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
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
            <Button variant="success" onClick={() => navigate('/match/teaching')}>View Match Requests</Button>
          </div>
        </Card.Body>
      </Card>

      <Row>
        {[
          { title: 'Upcoming Sessions', data: stats.upcomingSessions }, 
          { title: 'Recent Matches', data: stats.recentMatches }
        ].map(({ title, data }, idx) => (
          <Col xs={12} md={6} key={idx}>
            <Card className="mb-4">
              <Card.Header>{title}</Card.Header>
              <Card.Body>
                {data.length 
                  ? data.map((item, i) => <p key={i}>{item.name || item.title}</p>) 
                  : <p>No {title.toLowerCase()}.</p>
                }
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