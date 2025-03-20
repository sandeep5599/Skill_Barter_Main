import React from 'react';
import { Row, Col, Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PersonFill, ArrowRepeat, CalendarCheck, Award } from 'react-bootstrap-icons';
import { isSessionJoinable, getTimeUntilSession } from './dashboardUtils';

const OverviewTab = ({ stats, navigate, handleFindLearningMatches, user }) => {
  return (
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
                      const isTeacher = match.teacherId?._id === user?._id;
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
              <Button variant="primary" className="d-flex justify-content-between align-items-center" onClick={() => navigate('/match/teaching-requests')}>
                <span>Schedule a Session</span>
                <CalendarCheck />
              </Button>
              <Button variant="primary" className="d-flex justify-content-between align-items-center" onClick={() => navigate('/sessions')}>
                <span>View Session History</span>
                <Award />
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default OverviewTab;