import React, { memo } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Trophy, Fire } from 'react-bootstrap-icons';
import { getInitials } from './utils/formatUtils';
import { getBadgeLevel, getBadgeColorClass } from './utils/badgeUtils';

const UserStatsCard = memo(({ userRank, userDetails }) => {
  // Calculate badges for the user
  const userBadges = [
    getBadgeLevel('streak', userDetails.streak),
    getBadgeLevel('contributor', userDetails.points)
  ].filter(Boolean);
  
  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body className="p-4">
        <Row>
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="position-relative me-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style={{ width: '64px', height: '64px' }}>
                  <h2 className="mb-0 fw-bold text-primary">{getInitials(localStorage.getItem('userName') || 'You')}</h2>
                </div>
                <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                  <Trophy className="text-white" size={14} />
                </div>
              </div>
              <div>
                <h5 className="mb-1 fw-bold">{localStorage.getItem('userName') || 'You'}</h5>
                <div className="d-flex align-items-center">
                  <div className="badge bg-primary bg-opacity-10 text-primary me-2">
                    Rank #{userRank}
                  </div>
                  <div className="badge bg-success bg-opacity-10 text-success">
                    Top {userDetails.percentile}%
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <Row className="g-3">
              <Col xs={6}>
                <div className="p-3 rounded bg-light">
                  <div className="small text-muted">Points</div>
                  <div className="fs-4 fw-bold text-primary">{userDetails.points}</div>
                </div>
              </Col>
              <Col xs={6}>
                <div className="p-3 rounded bg-light">
                  <div className="small text-muted">Current Streak</div>
                  <div className="d-flex align-items-center">
                    <Fire className="text-danger me-1" />
                    <span className="fs-4 fw-bold">{userDetails.streak} days</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        
        {/* Badges Section */}
        {userBadges.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="text-muted mb-2">Your Badges</h6>
            <div className="d-flex flex-wrap gap-2">
              {userBadges.map((badge, idx) => (
                <div key={idx} className={`badge ${getBadgeColorClass(badge.color)} px-3 py-2`}>
                  {badge.icon} {badge.name} {badge.level && `Lvl ${badge.level}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
});

UserStatsCard.displayName = 'UserStatsCard';
export default UserStatsCard;