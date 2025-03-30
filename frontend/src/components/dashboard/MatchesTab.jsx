import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const MatchesTab = ({ matches, navigate }) => {
  console.log('MatchesTab matches:', matches);
  
  // Function to format date and time in a readable format
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <Card.Header>Recent Matches</Card.Header>
      <Card.Body>
        {matches && matches.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Skill Sharer</th>
                  <th>Status</th>
                  <th>Time Slots</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, i) => (
                  <tr key={i}>
                    <td>{match.skillName}</td>
                    <td>{match.teacherName}</td>
                    <td>
                      <Badge 
                        bg={match.status === 'completed' ? 'success' : 
                           match.status === 'pending' ? 'warning' : 'primary'}
                      >
                        {match.status}
                      </Badge>
                    </td>
                    <td>
                      {match.proposedTimeSlots && match.proposedTimeSlots.length > 0 ? (
                        <div>
                          <strong>Proposed Time Slots:</strong>
                          <ul className="list-unstyled mb-0">
                            {match.proposedTimeSlots.map((slot, index) => (
                              <li key={index}>
                                {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => navigate(`/match/details/${match._id}`)}
                        >
                          View Details
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center">
            <p>No recent matches found.</p>
            <Button variant="primary" onClick={() => navigate('/match/finding')}>
              Find New Matches
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MatchesTab;