import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { Calendar, LockFill, CreditCard } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
`;

const IconWrapper = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: ${props => props.color || props.theme.primary};
`;

const FeatureUnavailable = ({ featureName = "default", returnPath = "/dashboard" }) => {
  const navigate = useNavigate();

  // Feature types with specific messaging
  const featureMessages = {
    "leaderboard": {
      title: "Leaderboards Coming Soon",
      description: "Our community leaderboard feature is currently under development and will be available in our next release. Track your progress, compare with peers, and earn achievements!",
      icon: "🏆",
      iconColor: "#ffc107",
      availableDate: "April 31, 2025",
      isPremium: false
    },
    "assessment": {
      title: "Skill Assessment Coming Soon",
      description: "Our comprehensive skill assessment system is being fine-tuned to help you identify strengths and areas for improvement. This feature will be available soon.",
      icon: "📝",
      iconColor: "#0d6efd",
      availableDate: "June 10, 2025",
      isPremium: false
    },
    "premium": {
      title: "Premium Feature",
      description: "This feature is available exclusively for premium users. Upgrade your account to access advanced matching algorithms, priority support, and more premium features.",
      icon: "✨",
      iconColor: "#198754",
      isPremium: true
    },
    "default": {
      title: "Coming Soon",
      description: "This feature is currently under development and will be available in a future update. We're working hard to bring you the best learning experience possible.",
      icon: "🚀",
      iconColor: "#0d6efd",
      availableDate: "Coming soon",
      isPremium: false
    }
  };

  // Use the feature-specific message or fall back to default
  const message = featureMessages[featureName] || featureMessages.default;

  // Handle navigation back
  const handleGoBack = () => {
    navigate(returnPath);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <StyledCard>
            <Card.Body className="p-5 text-center">
              <IconWrapper color={message.iconColor}>
                <span role="img" aria-label={message.title}>{message.icon}</span>
              </IconWrapper>
              
              <h2 className="fw-bold mb-3">{message.title}</h2>
              <p className="text-muted mb-4">{message.description}</p>
              
              {message.isPremium ? (
                <div className="mb-4 p-3 bg-light rounded-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="me-3">
                      <CreditCard className="text-success" size={24} />
                    </div>
                    <div className="text-start">
                      <h6 className="mb-1 fw-bold">Upgrade to Premium</h6>
                      <p className="small mb-0 text-muted">Unlock all features with our premium plan</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-light rounded-3">
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="me-3">
                      <Calendar className="text-primary" size={24} />
                    </div>
                    <div className="text-start">
                      <h6 className="mb-1 fw-bold">Expected Release Date</h6>
                      <p className="small mb-0 text-muted">{message.availableDate}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="d-grid gap-3">
                {message.isPremium && (
                  <Button variant="success" className="rounded-pill py-2">
                    Upgrade Now
                  </Button>
                )}
                
                <Button 
                  variant="primary" 
                  className="rounded-pill py-2"
                  onClick={handleGoBack}
                >
                  Return to Dashboard
                </Button>
              </div>
            </Card.Body>
          </StyledCard>
        </Col>
      </Row>
    </Container>
  );
};

export default FeatureUnavailable;