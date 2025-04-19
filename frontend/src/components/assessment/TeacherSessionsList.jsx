import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { 
  Calendar, 
  CheckCircle, 
  PlusCircle 
} from 'react-bootstrap-icons';

const TeacherSessionsList = ({ sessions, onCreateAssessment, existingAssessments = [] }) => {
  console.log("TeacherSessionsList received sessions:", sessions);
  
  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <Calendar size={48} className="text-muted" />
        </div>
        <h5 className="fw-bold">No Teaching Sessions</h5>
        <p className="text-muted">You haven't taught any sessions yet or they're not available.</p>
        <Button 
          variant="primary"
          className="rounded-pill px-4 py-2 mt-3"
          style={{ 
            background: 'linear-gradient(to right, #3b82f6, #1e40af)',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}
          onClick={() => window.location.href = '/dashboard'}
        >
          <Calendar className="me-2" /> Go to Dashboard
        </Button>
      </div>
    );
  }

  // Helper function to check if a session already has an assessment
  const hasExistingAssessment = (sessionId) => {
    if (!existingAssessments || !Array.isArray(existingAssessments)) return false;
    return existingAssessments.some(assessment => 
      assessment.sessionId === sessionId || 
      (assessment.sessionId && typeof assessment.sessionId === 'object' && assessment.sessionId._id === sessionId)
    );
  };

  // Helper function to get the button for assessment action
  const getAssessmentButton = (session) => {
    const sessionId = session._id;
    const hasAssessment = hasExistingAssessment(sessionId);
    
    if (hasAssessment) {
      const assessment = existingAssessments.find(a => 
        a.sessionId === sessionId || 
        (a.sessionId && typeof a.sessionId === 'object' && a.sessionId._id === sessionId)
      );
      
      return (
        <div className="d-grid mt-3">
          <Button 
            variant="outline-success"
            className="rounded-pill py-2 d-flex align-items-center justify-content-center"
            onClick={() => onViewAssessment(assessment)}
          >
            <CheckCircle className="me-2" />
            <span>View Assessment</span>
          </Button>
        </div>
      );
    } else {
      return (
        <div className="d-grid mt-3">
          <Button 
            variant="primary"
            className="rounded-pill py-2 d-flex align-items-center justify-content-center"
            style={{ 
              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}
            onClick={() => onCreateAssessment(session)}
          >
            <PlusCircle className="me-2" />
            <span>Create Assessment</span>
          </Button>
        </div>
      );
    }
  };

  // We'll need this function for the button
  const onViewAssessment = (assessment) => {
    // Navigate to assessment view page
    window.location.href = `/assessment/${assessment._id}/view`;
  };

  return (
    <div className="sessions-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Your Teaching Sessions ({sessions.length})</h5>
        <div className="dropdown">
          <Button 
            variant="outline-secondary" 
            className="dropdown-toggle rounded-pill btn-sm" 
            id="sortDropdown" 
            data-bs-toggle="dropdown"
          >
            Sort By
          </Button>
          <ul className="dropdown-menu" aria-labelledby="sortDropdown">
            <li><Button className="dropdown-item">Most Recent</Button></li>
            <li><Button className="dropdown-item">Oldest First</Button></li>
            <li><Button className="dropdown-item">Student Name</Button></li>
          </ul>
        </div>
      </div>
      
      <Row className="g-4">
        {sessions.map((session, index) => {
          // Format date and time
          const sessionDate = session.startTime ? new Date(session.startTime) : 
                             session.date ? new Date(session.date) : new Date();
          const formattedDate = sessionDate.toLocaleDateString();
          const formattedTime = sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          // Calculate duration
          let duration = 'N/A';
          if (session.duration) {
            duration = `${session.duration} minutes`;
          } else if (session.startTime && session.endTime) {
            const startTime = new Date(session.startTime);
            const endTime = new Date(session.endTime);
            if (!isNaN(startTime) && !isNaN(endTime)) {
              const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
              duration = `${durationMinutes} minutes`;
            }
          }
          
          // Get session title
          const sessionTitle = session.title || 
                             (session.skillDetails && session.skillDetails.title) || 
                             (session.skillId && typeof session.skillId === 'object' && session.skillId.title) ||
                             'Skill Session';
          
          // Get student name
          const studentName = session.studentName || 
                            (session.learnerDetails && session.learnerDetails.name) ||
                            (session.studentId && typeof session.studentId === 'object' && session.studentId.name) ||
                            'Student';
          
          return (
            <Col md={6} lg={4} key={session._id || index}>
              <Card 
                className="h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative"
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
                {/* Status badge */}
                <div className="position-absolute top-0 end-0 m-3">
                  <Badge 
                    bg={session.status === 'completed' ? 'success' : 'warning'}
                    className="rounded-pill px-3 py-2"
                    style={{ 
                      background: session.status === 'completed' ? 
                        'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: session.status === 'completed' ? '#10b981' : '#f59e0b',
                      border: `1px solid ${
                        session.status === 'completed' ? 
                          'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                      }`,
                    }}
                  >
                    {session.status === 'completed' ? 'Completed' : 'Scheduled'}
                  </Badge>
                  {hasExistingAssessment(session._id) && (
                    <Badge 
                      bg="info"
                      className="ms-1 rounded-pill px-3 py-2"
                      style={{ 
                        background: 'rgba(6, 182, 212, 0.1)',
                        color: '#06b6d4',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                      }}
                    >
                      Assessment Created
                    </Badge>
                  )}
                </div>
                
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <Calendar className="text-primary" />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{sessionTitle}</h5>
                      <p className="text-muted mb-0 small">
                        {formattedDate} at {formattedTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="text-muted mb-1 small">Student:</h6>
                    <p className="mb-0 fw-semibold">{studentName}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="text-muted mb-1 small">Duration:</h6>
                    <p className="mb-0">{duration}</p>
                  </div>
                  
                  {session.notes && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-1 small">Notes:</h6>
                      <p className="mb-0 text-truncate" style={{ maxWidth: '100%' }}>
                        {session.notes}
                      </p>
                    </div>
                  )}
                  
                  {getAssessmentButton(session)}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default TeacherSessionsList;