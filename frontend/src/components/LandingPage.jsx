import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { title: "Free Learning", text: "Exchange skills without any monetary cost." },
    { title: "Expert Teachers", text: "Learn from experienced professionals." },
    { title: "Flexible Schedule", text: "Learn at your own pace and time." }
  ];

  const steps = [
    { step: "1", title: "Sign Up", text: "Create a free account and set up your profile." },
    { step: "2", title: "Find a Skill", text: "Browse available skills and connect with mentors." },
    { step: "3", title: "Start Learning", text: "Exchange knowledge and enhance your expertise." }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section bg-primary text-white text-center py-5">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold">Skill Barter Platform</h1>
              <p className="lead">Exchange skills, grow together. Join our community of learners and teachers.</p>
              <div className="mt-4 d-flex justify-content-center gap-3">
                <Button variant="outline-light" size="lg" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="outline-light" size="lg" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Why Choose Skill Barter? */}
      <Container className="py-5">
        <h2 className="text-center mb-4">Why Choose Skill Barter?</h2>
        <Row className="gy-4">
          {features.map(({ title, text }, index) => (
            <Col md={4} key={index}>
              <Card className="h-100 shadow-sm border-0 text-center p-3">
                <Card.Body>
                  <h3 className="h5">{title}</h3>
                  <p>{text}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4">How It Works?</h2>
          <Row className="text-center gy-4">
            {steps.map(({ step, title, text }, index) => (
              <Col md={4} key={index}>
                <Card className="h-100 shadow-sm border-0 p-3">
                  <Card.Body>
                    <div className="display-4 fw-bold text-primary">{step}</div>
                    <h3 className="h5 mt-3">{title}</h3>
                    <p>{text}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;
