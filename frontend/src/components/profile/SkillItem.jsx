// src/components/profile/SkillItem.jsx
import React from 'react';
import { XCircleFill } from 'react-bootstrap-icons';

const SkillItem = ({ skill, type, onRemove, badgeColor, badgeTextColor }) => {
  // Function to get the appropriate badge color based on proficiency
  const getProficiencyColor = (level) => {
    switch(level) {
      case 'Expert':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a' };
      case 'Intermediate':
        return { bg: 'rgba(249, 115, 22, 0.1)', text: '#ea580c' };
      case 'Beginner':
        return { bg: 'rgba(99, 102, 241, 0.1)', text: '#4f46e5' };
      default:
        return { bg: badgeColor, text: badgeTextColor };
    }
  };

  const profColors = getProficiencyColor(skill.proficiencyLevel);
  
  return (
    <div className="position-relative d-inline-block">
      <div className="badge rounded-pill position-relative pe-4 ps-3 py-2" 
        style={{ 
          background: badgeColor, 
          color: badgeTextColor,
          border: `1px solid ${badgeTextColor}20`,
          fontSize: '0.85rem',
          transition: 'all 0.2s ease',
          cursor: 'default'
        }}
      >
        <span>{skill.skillName}</span>
        <span className="ms-2 badge rounded-pill" 
          style={{ 
            background: profColors.bg, 
            color: profColors.text,
            fontSize: '0.7rem'
          }}
        >
          {skill.proficiencyLevel}
        </span>
        
        <button 
          onClick={() => onRemove(type, skill._id)}
          className="btn btn-sm position-absolute top-50 end-0 translate-middle-y p-0 me-1"
          style={{ 
            background: 'transparent', 
            border: 'none',
            color: badgeTextColor,
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <XCircleFill size={16} />
        </button>
      </div>
    </div>
  );
};

export default SkillItem;

// Add this to your CSS or styleSheet for responsiveness
const customStyles = `
  /* Custom CSS for responsiveness */
  @media (max-width: 992px) {
    .border-end-lg {
      border-right: none !important;
      border-bottom: 1px solid #e5e7eb;
    }
  }

  .skill-section .add-skill-form {
    transition: all 0.3s ease;
  }

  .skill-section .add-skill-form:hover {
    background: rgba(241, 245, 249, 0.9) !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
`;