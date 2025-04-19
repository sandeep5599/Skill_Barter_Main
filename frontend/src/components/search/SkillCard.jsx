import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { StarFill, PersonFill, MortarboardFill, ArrowRight } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const SkillCard = ({ skill }) => {
  const navigate = useNavigate();
  
  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 'Beginner':
        return 'linear-gradient(to right, #22c55e, #16a34a)';
      case 'Intermediate':
        return 'linear-gradient(to right, #f59e0b, #d97706)';
      case 'Expert':
        return 'linear-gradient(to right, #ef4444, #dc2626)';
      default:
        return 'linear-gradient(to right, #64748b, #475569)';
    }
  };
  
  const getLevelTextColor = (level) => {
    switch(level) {
      case 'Beginner':
        return '#16a34a';
      case 'Intermediate':
        return '#d97706';
      case 'Expert':
        return '#dc2626';
      default:
        return '#475569';
    }
  };
  
  const viewProfile = () => {
    navigate(`/teacher/${skill.teacherId}`);
  };
  
  return (
    <Card 
      className="h-100 border-0 shadow-sm rounded-4 overflow-hidden" 
      style={{
        transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        cursor: 'pointer'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 1rem 3rem rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0, 0, 0, 0.05)';
      }}
      onClick={viewProfile}
    >
      <div 
        className="position-absolute top-0 end-0 m-3"
        style={{ zIndex: 1 }}
      >
        <Badge 
          className="px-3 py-2 fw-semibold"
          style={{ 
            background: getLevelBadgeColor(skill.proficiencyLevel),
            border: 'none',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {skill.proficiencyLevel}
        </Badge>
      </div>
      
      <Card.Body className="p-4">
        <h4 
          className="mb-3 fw-bold" 
          style={{ 
            color: '#1e3a8a',
            fontSize: '1.25rem'
          }}
        >
          {skill.skillName}
        </h4>
        
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <div 
              className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
              style={{ 
                width: '32px', 
                height: '32px', 
                background: 'rgba(59, 130, 246, 0.1)' 
              }}
            >
              <PersonFill className="text-primary" />
            </div>
            <h6 className="mb-0 fw-semibold">{skill.teacherName}</h6>
          </div>
          
          <div className="d-flex align-items-center mt-3">
            <div className="d-flex align-items-center me-3">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: 'rgba(250, 204, 21, 0.1)' 
                }}
              >
                <StarFill className="text-warning" size={12} />
              </div>
              <span className="fw-bold">{skill.averageRating.toFixed(1)}</span>
            </div>
            
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle d-inline-flex align-items-center justify-content-center me-2"
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: 'rgba(99, 102, 241, 0.1)' 
                }}
              >
                <MortarboardFill className="text-indigo" size={12} style={{ color: '#4f46e5' }} />
              </div>
              <span className="text-muted">{skill.reviewCount} reviews</span>
            </div>
          </div>
        </div>
        
        {skill.description && (
          <Card.Text className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
            {skill.description.length > 120 
              ? `${skill.description.substring(0, 120)}...` 
              : skill.description}
          </Card.Text>
        )}
        
        <div className="mt-auto text-end">
          <Button 
            variant="outline-primary"
            className="rounded-pill px-4 d-inline-flex align-items-center"
            style={{ 
              borderWidth: '1.5px',
              transition: 'all 0.2s ease-out'
            }}
            onMouseOver={(e) => {
              e.stopPropagation();
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseOut={(e) => {
              e.stopPropagation();
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
          >
            <span className="me-2">View Profile</span>
            <ArrowRight />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SkillCard;