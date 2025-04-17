import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { 
  PersonFill, 
  ArrowRepeat, 
  CalendarCheck, 
  Award, 
  Lightning, 
  Clock, 
  BarChartFill,
  PlusCircleFill
} from 'react-bootstrap-icons';
import { isSessionJoinable, getTimeUntilSession } from './dashboardUtils';

const OverviewTab = ({ 
  stats, 
  navigate, 
  handleFindLearningMatches, 
  user, 
  triggerRefresh, 
  isLoading, 
  handleDailyCheckIn 
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Filter out duplicate sessions based on session ID
  const uniqueUpcomingSessions = useMemo(() => {
    if (!stats.upcomingSessions || !Array.isArray(stats.upcomingSessions)) {
      return [];
    }
    
    // Use a Map to track sessions by ID
    const sessionMap = new Map();
    stats.upcomingSessions.forEach(session => {
      if (!sessionMap.has(session._id)) {
        sessionMap.set(session._id, session);
      }
    });
    
    return Array.from(sessionMap.values());
  }, [stats.upcomingSessions]);

  return (
    <Row className="g-4">
      <Col lg={8}>
        <Row className="g-4">
          <Col md={6}>
            <Card 
              className="h-100 border-0 shadow-sm" 
              style={{
                borderRadius: '1rem',
                background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)',
                transition: 'all 0.3s ease',
                transform: hoveredCard === 'upcoming' ? 'translateY(-5px)' : 'none',
                boxShadow: hoveredCard === 'upcoming' ? '0 15px 30px rgba(0, 123, 255, 0.1)' : '0 5px 15px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={() => setHoveredCard('upcoming')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center" 
                style={{ 
                  borderRadius: '1rem 1rem 0 0',
                  background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
                  border: 'none',
                  padding: '1.25rem'
                }}>
                <div className="d-flex align-items-center">
                  <Clock className="me-2" size={24} />
                  <h5 className="mb-0 fw-bold">Upcoming Sessions</h5>
                </div>
                <Badge bg="light" text="primary" pill 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '0.5rem 0.8rem',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                  }}>
                  {uniqueUpcomingSessions.length}
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {uniqueUpcomingSessions && uniqueUpcomingSessions.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {uniqueUpcomingSessions.map((session, i) => {
                      const sessionStart = new Date(session.startTime);
                      const isJoinable = isSessionJoinable(session.startTime);
                      
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
                      if (!isJoinable) {
                        const now = new Date();
                        const timeDiff = sessionStart - now;
                        if (timeDiff > 5 * 60 * 1000) {
                          const minutesRemaining = Math.floor(timeDiff / 60000) - 5;
                          const hoursRemaining = Math.floor(minutesRemaining / 60);
                          
                          if (hoursRemaining > 0) {
                            tooltipText = `This button will be enabled in ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} and ${minutesRemaining % 60} minute${(minutesRemaining % 60) !== 1 ? 's' : ''} before the session`;
                          } else {
                            tooltipText = `This button will be enabled in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} before the session`;
                          }
                        }
                      }

                      return (
                        <div 
                          key={session._id || i} 
                          className="list-group-item p-4 border-0 border-bottom"
                          style={{
                            transition: 'background-color 0.3s ease',
                            backgroundColor: i % 2 === 0 ? '#f8f9ff' : '#ffffff',
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="mb-1 fw-bold" style={{ color: '#4361ee' }}>{skillName}</h6>
                              <div className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                                <CalendarCheck className="me-1" />
                                {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle p-2 me-2" 
                                  style={{ 
                                    background: 'linear-gradient(135deg, #e6f0ff, #d1e2ff)',
                                    width: '40px', 
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                  <PersonFill className="text-primary" />
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.9rem' }}>Skill Sharer: <span className="fw-bold">{session.teacherName}</span></span>
                                </div>
                              </div>
                            </div>
                            <div className="ms-3 d-flex flex-column justify-content-between align-items-end">
                              <Badge 
                                bg={isJoinable ? 'success' : 'secondary'} 
                                className="mb-3 px-3 py-2"
                                style={{ 
                                  borderRadius: '0.5rem',
                                  background: isJoinable ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                                  border: 'none',
                                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                                }}
                              >
                                {isJoinable ? 'Ready' : getTimeUntilSession(session.startTime)}
                              </Badge>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id={`tooltip-${session._id || i}`}>
                                    {isJoinable ? 'Click to join the session' : tooltipText || 'This button will be enabled 5 minutes before the session starts'}
                                  </Tooltip>
                                }
                              >
                                <div>
                                  <Button 
                                    variant={isJoinable ? "primary" : "outline-primary"}
                                    size="sm" 
                                    onClick={() => {
                                      if (session.meetingLink) {
                                        window.open(session.meetingLink, '_blank', 'noopener,noreferrer');
                                      }
                                    }}
                                    disabled={!isJoinable}
                                    style={{ 
                                      borderRadius: '2rem',
                                      padding: '0.5rem 1.25rem',
                                      fontWeight: '600',
                                      boxShadow: isJoinable ? '0 5px 15px rgba(67, 97, 238, 0.3)' : 'none',
                                      transition: 'all 0.3s ease',
                                      background: isJoinable ? 'linear-gradient(90deg, #4361ee, #3f37c9)' : 'transparent',
                                      border: isJoinable ? 'none' : '2px solid #4361ee'
                                    }}
                                  >
                                    <Lightning className="me-1" size={16} />
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
                  <div className="text-center p-5">
                    <div className="mb-4">
                      <Clock style={{ width: 48, height: 48, color: '#d1d5db' }} />
                    </div>
                    <div className="text-muted mb-4">No upcoming sessions found.</div>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/match/learning')}
                      style={{ 
                        borderRadius: '2rem',
                        padding: '0.5rem 1.5rem',
                        fontWeight: '600',
                        boxShadow: '0 5px 15px rgba(67, 97, 238, 0.3)',
                        background: 'linear-gradient(90deg, #4361ee, #3f37c9)',
                        border: 'none'
                      }}
                    >
                      <PlusCircleFill className="me-2" />
                      Find Sessions
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card 
              className="h-100 border-0 shadow-sm" 
              style={{
                borderRadius: '1rem',
                background: 'linear-gradient(to right bottom, #ffffff, #f8fff9)',
                transition: 'all 0.3s ease',
                transform: hoveredCard === 'matches' ? 'translateY(-5px)' : 'none',
                boxShadow: hoveredCard === 'matches' ? '0 15px 30px rgba(16, 185, 129, 0.1)' : '0 5px 15px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={() => setHoveredCard('matches')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center" 
                style={{ 
                  borderRadius: '1rem 1rem 0 0',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  padding: '1.25rem'
                }}>
                <div className="d-flex align-items-center">
                  <BarChartFill className="me-2" size={24} />
                  <h5 className="mb-0 fw-bold">Recent Matches</h5>
                </div>
                <Badge bg="light" text="success" pill 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '0.5rem 0.8rem',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                  }}>
                  {stats.recentMatches?.length || 0}
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {stats.recentMatches && stats.recentMatches.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {stats.recentMatches.map((match, i) => {
                      const isTeacher = match.teacherId?._id === user?._id;
                      const displayName = isTeacher ? match.requesterName : match.teacherName;
                      const roleLabel = isTeacher ? "Learner" : "Skill Sharer";
                      
                      return (
                        <div 
                          key={match._id || i} 
                          className="list-group-item p-4 border-0 border-bottom"
                          style={{
                            transition: 'background-color 0.3s ease',
                            backgroundColor: i % 2 === 0 ? '#f8fff9' : '#ffffff',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-2 fw-bold" style={{ color: '#10b981' }}>{match.skillName}</h6>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle p-2 me-2" 
                                  style={{ 
                                    background: 'linear-gradient(135deg, #e6fff9, #d1ffe2)',
                                    width: '40px', 
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                  <PersonFill style={{ color: '#10b981' }} />
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.9rem' }}>{roleLabel}: <span className="fw-bold">{displayName}</span></span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Badge 
                                bg={match.status === 'accepted' ? 'success' : 'warning'}
                                text={match.status === 'accepted' ? 'white' : 'dark'}
                                className="text-uppercase px-3 py-2"
                                style={{ 
                                  borderRadius: '0.5rem',
                                  background: match.status === 'accepted' 
                                    ? 'linear-gradient(135deg, #10b981, #059669)' 
                                    : 'linear-gradient(135deg, #fbbf24, #d97706)',
                                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                                }}
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
                  <div className="text-center p-5">
                    <div className="mb-4">
                      <BarChartFill style={{ width: 48, height: 48, color: '#d1d5db' }} />
                    </div>
                    <div className="text-muted mb-4">No recent matches found.</div>
                    <Button 
                      variant="success" 
                      onClick={handleFindLearningMatches}
                      style={{ 
                        borderRadius: '2rem',
                        padding: '0.5rem 1.5rem',
                        fontWeight: '600',
                        boxShadow: '0 5px 15px rgba(16, 185, 129, 0.3)',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        border: 'none'
                      }}
                    >
                      <PlusCircleFill className="me-2" />
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
        <Card 
          className="border-0 shadow-sm"
          style={{
            borderRadius: '1rem',
            background: 'linear-gradient(to right bottom, #ffffff, #f0f4ff)',
            transition: 'all 0.3s ease',
            transform: hoveredCard === 'actions' ? 'translateY(-5px)' : 'none',
            boxShadow: hoveredCard === 'actions' ? '0 15px 30px rgba(79, 70, 229, 0.1)' : '0 5px 15px rgba(0, 0, 0, 0.05)'
          }}
          onMouseEnter={() => setHoveredCard('actions')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <Card.Header 
            className="text-white" 
            style={{ 
              borderRadius: '1rem 1rem 0 0',
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              border: 'none',
              padding: '1.25rem'
            }}
          >
            <h5 className="mb-0 fw-bold">Quick Actions</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <div className="d-grid gap-4">
              <Button 
                variant="outline-primary" 
                className="d-flex justify-content-between align-items-center p-3"
                style={{
                  borderRadius: '1rem',
                  border: '2px solid #e0e7ff',
                  background: 'linear-gradient(to right, #ffffff, #f5f7ff)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/profile')}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
                      width: '48px',
                      height: '48px'
                    }}
                  >
                    <PlusCircleFill color="white" size={24} />
                  </div>
                  <span className="fw-bold" style={{ fontSize: '1.05rem', color: '#4f46e5' }}>Add New Skills</span>
                </div>
                <ArrowRepeat style={{ color: '#4f46e5' }} size={22} />
              </Button>
              
              <Button 
                variant="outline-primary" 
                className="d-flex justify-content-between align-items-center p-3"
                style={{
                  borderRadius: '1rem',
                  border: '2px solid #e0e7ff',
                  background: 'linear-gradient(to right, #ffffff, #f5f7ff)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/match/teaching-requests')}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
                      width: '48px',
                      height: '48px'
                    }}
                  >
                    <CalendarCheck color="white" size={24} />
                  </div>
                  <span className="fw-bold" style={{ fontSize: '1.05rem', color: '#4f46e5' }}>Schedule a Session</span>
                </div>
                <ArrowRepeat style={{ color: '#4f46e5' }} size={22} />
              </Button>
              
              <Button 
                variant="outline-primary" 
                className="d-flex justify-content-between align-items-center p-3"
                style={{
                  borderRadius: '1rem',
                  border: '2px solid #e0e7ff',
                  background: 'linear-gradient(to right, #ffffff, #f5f7ff)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/sessions')}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
                      width: '48px',
                      height: '48px'
                    }}
                  >
                    <Award color="white" size={24} />
                  </div>
                  <span className="fw-bold" style={{ fontSize: '1.05rem', color: '#4f46e5' }}>View Session History</span>
                </div>
                <ArrowRepeat style={{ color: '#4f46e5' }} size={22} />
              </Button>
              
              <Button 
                className="d-flex justify-content-between align-items-center p-3 mt-2"
                style={{
                  borderRadius: '1rem',
                  border: 'none',
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  boxShadow: '0 8px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease',
                }}
                onClick={handleDailyCheckIn}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      width: '48px',
                      height: '48px'
                    }}
                  >
                    <Lightning color="white" size={24} />
                  </div>
                  <span className="fw-bold text-white" style={{ fontSize: '1.05rem' }}>Daily Check-in</span>
                </div>
                <Badge 
                  bg="light" 
                  text="success" 
                  pill
                  style={{
                    background: 'white',
                    color: '#10b981',
                    padding: '0.5rem 0.75rem',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    fontWeight: 'bold'
                  }}
                >
                  +1
                </Badge>
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewTab;