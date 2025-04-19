import React from 'react';
import { 
  Card, Button, Badge, OverlayTrigger, Tooltip, 
  Container, Row, Col, Spinner
} from 'react-bootstrap';
import { 
  CalendarCheck, 
  PersonFill, 
  ClockFill, 
  CheckCircleFill,
  ChevronRight,
  MortarboardFill,
  BookFill
} from 'react-bootstrap-icons';
import { isSessionJoinable, getTimeUntilSession } from './dashboardUtils';

const SessionsTab = ({ sessions, matches, navigate, loading = false }) => {
  // Helper function to get skill name
  const getSkillName = (session) => {
    if (session.skillName) {
      return session.skillName;
    } else if (matches && matches.length > 0) {
      const relatedMatch = matches.find(match => match._id === session.matchId);
      if (relatedMatch && relatedMatch.skillName) {
        return relatedMatch.skillName;
      }
    }
    return 'Skill Session';
  };

  // Get session status with styling info
  const getSessionStatus = (session) => {
    const isJoinable = isSessionJoinable(session.startTime);
    
    if (isJoinable) {
      return { 
        status: 'Ready to Join', 
        variant: 'success',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
        icon: <CheckCircleFill />
      };
    } else {
      return { 
        status: getTimeUntilSession(session.startTime) + ' remaining', 
        variant: 'warning',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.2)',
        icon: <ClockFill />
      };
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{
            width: '3rem',
            height: '3rem',
            borderWidth: '0.25rem'
          }}>
            <span className="visually-hidden">Loading sessions...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
      <div style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        padding: '1.5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div className="position-absolute" style={{ 
          top: '-20px', 
          right: '-20px', 
          width: '150px', 
          height: '150px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div className="position-absolute" style={{ 
          bottom: '-40px', 
          left: '10%', 
          width: '150px', 
          height: '150px',  
          background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <Row className="align-items-center position-relative">
          <Col>
            <div className="d-flex align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                <CalendarCheck size={20} className="text-white" />
              </div>
              <h3 className="mb-0" style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>
                Upcoming Sessions
              </h3>
            </div>
          </Col>
        </Row>
      </div>

      <Card.Body className="p-3 p-md-4">
        {sessions && sessions.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {sessions.map((session, i) => {
              const sessionStart = new Date(session.startTime);
              const isJoinable = isSessionJoinable(session.startTime);
              const skillName = getSkillName(session);
              const statusInfo = getSessionStatus(session);
              
              return (
                <SessionCard 
                  key={i} 
                  session={session}
                  skillName={skillName}
                  statusInfo={statusInfo}
                  sessionStart={sessionStart}
                  isJoinable={isJoinable}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10" 
              style={{ width: '64px', height: '64px' }}>
              <CalendarCheck className="text-info" size={28} />
            </div>
            <h4 className="fw-bold mb-2">No Sessions Found</h4>
            <p className="text-muted mb-4">You don't have any upcoming sessions scheduled yet.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/match/learning')}
              className="rounded-pill px-4 py-2"
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
              }}
            >
              Find Learning Opportunities
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Session Card Component
const SessionCard = ({ session, skillName, statusInfo, sessionStart, isJoinable }) => {
  return (
    <Card 
      className="border-0 shadow-sm rounded-4 overflow-hidden"
      style={{ 
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Status Indicator */}
          <Col xs="auto">
            <div 
              className="d-flex align-items-center justify-content-center h-100"
              style={{ 
                width: '10px', 
                background: statusInfo.color,
              }}
            ></div>
          </Col>
          
          {/* Session Details */}
          <Col>
            <div className="p-3">
              <Row className="align-items-center">
                {/* Left section: Status and Title */}
                <Col xs={12} md={4} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center mb-2">
                    <div 
                      className="me-2 d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%',
                        background: statusInfo.bgColor,
                        color: statusInfo.color
                      }}
                    >
                      {statusInfo.icon}
                    </div>
                    <Badge 
                      className="rounded-pill px-3 py-2"
                      style={{ 
                        background: statusInfo.bgColor,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.borderColor}`,
                      }}
                    >
                      {statusInfo.status}
                    </Badge>
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                    {skillName}
                  </h5>
                </Col>
                
                {/* Middle section: Date/Time and Person */}
                <Col xs={12} md={5} className="mb-3 mb-md-0">
                  <div className="d-flex flex-column flex-md-row">
                    <div className="me-md-4 mb-2 mb-md-0">
                      <div className="text-muted small mb-1">Date & Time</div>
                      <div className="d-flex align-items-center">
                        <CalendarCheck className="me-2" style={{ color: '#3b82f6' }} />
                        <div>
                          {sessionStart.toLocaleDateString()} at {sessionStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-muted small mb-1">Teacher</div>
                      <div className="d-flex align-items-center">
                        <PersonFill className="me-2" style={{ color: '#3b82f6' }} />
                        <div>{session.teacherName}</div>
                      </div>
                    </div>
                  </div>
                </Col>
                
                {/* Right section: Action */}
                <Col xs={12} md={3} className="d-flex align-items-center justify-content-between justify-content-md-end">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-session-action`}>
                        {isJoinable ? 'Click to join the session' : 'This button will be enabled 5 minutes before the session starts'}
                      </Tooltip>
                    }
                  >
                    <div>
                      <Button 
                        variant="primary" 
                        href={session.meetLink || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        disabled={!isJoinable}
                        className="rounded-pill d-flex align-items-center" 
                        style={{ 
                          background: isJoinable ? 'linear-gradient(to right, #10b981, #059669)' : '#e5e7eb',
                          border: 'none',
                          boxShadow: isJoinable ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)' : 'none',
                          color: isJoinable ? 'white' : '#9ca3af',
                        }}
                      >
                        {isJoinable ? 'Join Now' : 'Join Soon'}
                        <ChevronRight className="ms-1" size={16} />
                      </Button>
                    </div>
                  </OverlayTrigger>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SessionsTab;