// src/components/profile/SkillsManagement.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import SkillSection from './SkillSection';

const SkillsManagement = ({
  teachingSkills,
  learningSkills,
  onAddSkill,
  onRemoveSkill
}) => {
  return (
    <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#f8fafc' }}>
      <Card.Header className="border-0 py-4" style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        color: 'white'
      }}>
        <h4 className="mb-0 fw-bold">Manage Your Skills</h4>
        <p className="text-white-50 mb-0">Add or remove skills that you can teach or want to learn</p>
      </Card.Header>
      
      <Card.Body className="p-0">
        <Row className="g-0">
          {/* Teaching Skills Column */}
          <Col lg={6} className="border-end-lg">
            <div className="p-4">
              <SkillSection 
                type="teach" 
                skills={teachingSkills} 
                onAddSkill={onAddSkill} 
                onRemoveSkill={onRemoveSkill}
                headerGradient="linear-gradient(135deg, #3b82f6, #1e40af)"
                iconColor="#3b82f6"
                badgeColor="rgba(59, 130, 246, 0.1)"
                badgeTextColor="#3b82f6"
                buttonGradient="linear-gradient(to right, #3b82f6, #1e40af)"
              />
            </div>
          </Col>
          
          {/* Learning Skills Column */}
          <Col lg={6}>
            <div className="p-4">
              <SkillSection 
                type="learn" 
                skills={learningSkills} 
                onAddSkill={onAddSkill} 
                onRemoveSkill={onRemoveSkill}
                headerGradient="linear-gradient(135deg, #06b6d4, #0891b2)"
                iconColor="#06b6d4"
                badgeColor="rgba(6, 182, 212, 0.1)"
                badgeTextColor="#0891b2"
                buttonGradient="linear-gradient(to right, #06b6d4, #0891b2)"
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SkillsManagement;