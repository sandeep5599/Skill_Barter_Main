import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) fetchUserProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchUserProfile = async () => {
    try {
      const [userResponse, skillsResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/users/${user._id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${BACKEND_URL}/api/skills/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!userResponse.ok || !skillsResponse.ok) throw new Error('Failed to fetch data');

      const [userData, skillsData] = await Promise.all([userResponse.json(), skillsResponse.json()]);

      setStats(prevStats => ({
        ...prevStats,
        learningSkills: skillsData.learningSkills || [],
        teachingSkills: skillsData.teachingSkills || [],
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const SkillBadge = ({ skill, type }) => (
    <OverlayTrigger placement="top" overlay={<Tooltip>{skill.description || 'No description available'}</Tooltip>}>
      <Badge bg={type === 'teach' ? 'primary' : 'secondary'} className="me-2 mb-2">
        {skill.skillName} ({skill.proficiencyLevel})
      </Badge>
    </OverlayTrigger>
  );

  return (
    <Container fluid className="py-4">
      <Card className="mb-4 bg-light">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="text-xl font-medium mb-0">Skill Barter Platform</h1>
          <div>
            <Button variant="primary" onClick={() => navigate('/profile')} className="me-2">Profile Menu</Button>
            <Button variant="danger" onClick={handleLogout}>Logout</Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4 bg-light">
        <Card.Body>
          <h2>Welcome back, {user?.name}</h2>
          <p className="mb-2">Points: {stats.points} | Sessions Completed: {stats.sessionsCompleted}</p>
          <Button variant="primary" onClick={() => navigate('/match')}>Find Match</Button>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        {[{ title: 'Upcoming Sessions', data: stats.upcomingSessions }, { title: 'Recent Matches', data: stats.recentMatches }].map(({ title, data }, idx) => (
          <Col xs={12} md={6} key={idx}>
            <Card className="h-100">
              <Card.Header>{title}</Card.Header>
              <Card.Body>
                {data.length === 0 ? <p>No {title.toLowerCase()}</p> :
                  (title === 'Upcoming Sessions' ? (
                    <ul className="list-unstyled">{data.map((session, i) => <li key={i} className="mb-2">{session.title} - {session.date}</li>)}</ul>
                  ) : (
                    data.map((match, i) => (
                      <div key={i} className="d-flex justify-content-between mb-2">
                        <span>{match.name}</span>
                        <Button variant="outline-primary" size="sm">Message</Button>
                      </div>
                    ))
                  ))}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        {[{ title: 'Skills I Can Teach', data: stats.teachingSkills, type: 'teach' }, { title: 'Skills I Want to Learn', data: stats.learningSkills, type: 'learn' }].map(({ title, data, type }, idx) => (
          <Col xs={12} md={6} key={idx}>
            <Card className="mb-4">
              <Card.Header>{title}</Card.Header>
              <Card.Body>
                {data.length === 0 ? <p>No {title.toLowerCase()} added</p> : data.map((skill, i) => <SkillBadge key={i} skill={skill} type={type} />)}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
