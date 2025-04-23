// src/components/profile/SkillSection.jsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { MortarboardFill, BookFill, PlusCircleFill } from 'react-bootstrap-icons';
import SkillItem from './SkillItem';

const SkillSection = ({ 
  type, 
  skills, 
  onAddSkill, 
  onRemoveSkill, 
  headerGradient, 
  iconColor, 
  badgeColor, 
  badgeTextColor,
  buttonGradient
}) => {
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'Beginner', description: '' });
  const [validation, setValidation] = useState({ error: false, message: '' });
  
  const handleInputChange = (field, value) => {
    setNewSkill(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user types
    if (field === 'name' && value.trim() !== '') {
      setValidation({ error: false, message: '' });
    }
  };
  
  const handleAdd = () => {
    if (newSkill.name.trim() === '') {
      setValidation({ error: true, message: 'Skill name is required' });
      return;
    }
    
    onAddSkill(type, newSkill);
    setNewSkill({ name: '', proficiency: 'Beginner', description: '' });
    setValidation({ error: false, message: '' });
  };

  return (
    <div className="skill-section">
      {/* Header with Icon */}
      <div className="d-flex align-items-center mb-4">
        <div className="me-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center" 
               style={{ 
                 width: '48px', 
                 height: '48px', 
                 background: headerGradient,
                 boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
               }}>
            {type === 'teach' ? (
              <MortarboardFill size={22} className="text-white" />
            ) : (
              <BookFill size={22} className="text-white" />
            )}
          </div>
        </div>
        <div>
          <h5 className="fw-bold mb-0" style={{ color: type === 'teach' ? '#1e40af' : '#0891b2' }}>
            {type === 'teach' ? 'Skills I Can Teach' : 'Skills I Want to Learn'}
          </h5>
          <p className="text-muted small mb-0">
            {type === 'teach' ? 'Share your expertise with others' : 'Find mentors to help you learn'}
          </p>
        </div>
      </div>
      
      {/* Skills List */}
      <div className="mb-4">
        {skills.length === 0 ? (
          <div className="text-center p-4 rounded-4" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
            <p className="text-muted mb-0">
              {type === 'teach' 
                ? "You haven't added any teaching skills yet." 
                : "You haven't added any learning skills yet."}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <SkillItem 
                key={skill._id} 
                skill={skill} 
                type={type} 
                onRemove={onRemoveSkill}
                badgeColor={badgeColor}
                badgeTextColor={badgeTextColor}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Add New Skill Form */}
      <div className="add-skill-form p-4 rounded-4" style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
        <h6 className="fw-semibold mb-3">Add New {type === 'teach' ? 'Teaching' : 'Learning'} Skill</h6>
        
        {validation.error && (
          <Alert variant="danger" className="py-2 px-3 mb-3">
            {validation.message}
          </Alert>
        )}
        
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Skill Name</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter skill name"
            value={newSkill.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="rounded-pill border-0 shadow-sm"
            style={{ background: 'rgba(255, 255, 255, 0.8)' }}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Proficiency Level</Form.Label>
          <Form.Select 
            value={newSkill.proficiency}
            onChange={(e) => handleInputChange('proficiency', e.target.value)}
            className="rounded-pill border-0 shadow-sm"
            style={{ background: 'rgba(255, 255, 255, 0.8)' }}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Description (Optional)</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={2}
            placeholder="Add a brief description of your experience with this skill"
            value={newSkill.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="rounded-3 border-0 shadow-sm"
            style={{ background: 'rgba(255, 255, 255, 0.8)' }}
          />
        </Form.Group>
        
        <div className="d-grid">
          <Button 
            variant="primary" 
            onClick={handleAdd}
            className="rounded-pill py-2 d-flex align-items-center justify-content-center"
            style={{ 
              background: buttonGradient,
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
            }}
          >
            <PlusCircleFill className="me-2" size={18} />
            <span className="fw-semibold">Add Skill</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillSection;