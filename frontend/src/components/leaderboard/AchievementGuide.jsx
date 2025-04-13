// File: components/leaderboard/AchievementGuide.jsx
import React, { memo } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Star, PersonFill, Lightning, Fire } from 'react-bootstrap-icons';

const AchievementGuide = memo(() => {
  return (
    <Card className="mt-4 border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0 fw-bold"><Star className="text-warning me-2" /> Achievement Guide</h5>
      </Card.Header>
      <Card.Body>
        <p className="text-muted mb-4">
          Earn points and badges by participating in our community. Here's how the scoring system works:
        </p>
        
        <Row className="g-4">
          <Col md={4}>
            <div className="border rounded p-3">
              <h6 className="d-flex align-items-center fw-bold mb-3">
                <PersonFill className="text-primary me-2" /> Contribution Points
              </h6>
              <ul className="list-unstyled small">
                <li className="mb-2">✓ Creating a new lesson: 15 points</li>
                <li className="mb-2">✓ Answering a question: 5 points</li>
                <li className="mb-2">✓ Providing feedback: 3 points</li>
                <li className="mb-2">✓ Daily login bonus: 1 point</li>
                <li className="mb-2">✓ Upvoted content: 2 points per upvote</li>
              </ul>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="border rounded p-3">
              <h6 className="d-flex align-items-center fw-bold mb-3">
                <Fire className="text-danger me-2" /> Streaks
              </h6>
              <ul className="list-unstyled small">
                <li className="mb-2">✓ Log in daily to maintain your streak</li>
                <li className="mb-2">✓ 7-day streak: Bronze Streak Badge</li>
                <li className="mb-2">✓ 30-day streak: Silver Streak Badge</li>
                <li className="mb-2">✓ 100-day streak: Gold Streak Badge</li>
                <li className="mb-2">✓ Bonus points for milestones: 10/25/50</li>
              </ul>
            </div>
          </Col>
          
          <Col md={4}>
            <div className="border rounded p-3">
              <h6 className="d-flex align-items-center fw-bold mb-3">
                <Lightning className="text-warning me-2" /> Badges
              </h6>
              <ul className="list-unstyled small">
                <li className="mb-2">✓ Contributor (Bronze/Silver/Gold)</li>
                <li className="mb-2">✓ Streak Master (Bronze/Silver/Gold)</li>
                <li className="mb-2">✓ Content Creator (Bronze/Silver/Gold)</li>
                <li className="mb-2">✓ Community Builder (Bronze/Silver/Gold)</li>
                <li className="mb-2">✓ Seasonal badges for special events</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
});

AchievementGuide.displayName = 'AchievementGuide';
export default AchievementGuide;