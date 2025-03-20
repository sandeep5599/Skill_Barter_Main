import React from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';

const SkillsTab = ({ teachingSkills, learningSkills, navigate }) => {
  return (
    <Row>
      <Col md={6}>
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Skills I Can Teach</h5>
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => navigate('/profile')}
            >
              <small>Add New</small>
            </Button>
          </Card.Header>
          <Card.Body>
            {teachingSkills.length > 0 ? (
              <div>
                {teachingSkills.map((skill, index) => (
                  <Card key={index} className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0 fw-bold">{skill.skillName}</h6>
                          <span className="text-muted"><small>Proficiency: {skill.proficiencyLevel}</small></span>
                        </div>
                        <Badge bg="primary" pill>Teacher</Badge>
                      </div>
                      {skill.description && (
                        <p className="text-muted small mt-2 mb-0">{skill.description}</p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="text-muted mb-3">No teaching skills added yet.</div>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/profile')}>
                  Add Skills to Teach
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Skills I Want to Learn</h5>
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => navigate('/profile')}
            >
              <small>Add New</small>
            </Button>
          </Card.Header>
          <Card.Body>
            {learningSkills.length > 0 ? (
              <div>
                {learningSkills.map((skill, index) => (
                  <Card key={index} className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0 fw-bold">{skill.skillName}</h6>
                          <span className="text-muted"><small>Target Level: {skill.proficiencyLevel}</small></span>
                        </div>
                        <Badge bg="success" pill>Learner</Badge>
                      </div>
                      {skill.description && (
                        <p className="text-muted small mt-2 mb-0">{skill.description}</p>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="text-muted mb-3">No learning skills added yet.</div>
                <Button variant="primary" size="sm" onClick={() => navigate('/profile')}>
                  Add Skills to Learn
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default SkillsTab;