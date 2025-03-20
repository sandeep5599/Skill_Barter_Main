import React from 'react';
import { Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { isSessionJoinable, getTimeUntilSession } from './dashboardUtils';

const SessionsTab = ({ sessions, matches, navigate }) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Upcoming Sessions</h5>
      </Card.Header>
      <Card.Body>
        {sessions && sessions.length > 0 ? (
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
                {sessions.map((session, i) => {
                  const sessionStart = new Date(session.startTime);
                  const isJoinable = isSessionJoinable(session.startTime);
                  
                  let skillName = '';
                  if (session.skillName) {
                    skillName = session.skillName;
                  } else if (matches && matches.length > 0) {
                    const relatedMatch = matches.find(match => match._id === session.matchId);
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
  );
};

export default SessionsTab;