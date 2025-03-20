import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const MatchesTab = ({ matches, navigate }) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">Recent Matches</h5>
      </Card.Header>
      <Card.Body>
        {matches && matches.length > 0 ? (
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
                {matches.map((match, i) => (
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
            <Button variant="success" onClick={() => navigate('/match/finding')}>
              Find New Matches
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MatchesTab;