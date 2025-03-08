import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';


const ProfileManagement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ teachingSkills: [], learningSkills: [] });
  const [newTeachingSkill, setNewTeachingSkill] = useState({ name: '', proficiency: 'Beginner', description: '' });
  const [newLearningSkill, setNewLearningSkill] = useState({ name: '', proficiency: 'Beginner', description: '' });

  useEffect(() => {
    if (user?._id) {
      fetchUserProfile();
    }
  }, [user?._id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/skills/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      
      setProfile({ teachingSkills: data.teachingSkills || [], learningSkills: data.learningSkills || [] });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAddSkill = async (type) => {
    const skillsKey = type === 'teach' ? 'teachingSkills' : 'learningSkills';
    const currentSkill = type === 'teach' ? newTeachingSkill : newLearningSkill;
    
    const newSkill = {
      skillName: currentSkill.name,
      proficiencyLevel: currentSkill.proficiency,
      description: currentSkill.description,
      isTeaching: type === 'teach',
      isLearning: type !== 'teach',
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newSkill),
      });

      if (!response.ok) throw new Error('Failed to add skill');
      const addedSkill = await response.json();

      setProfile(prev => ({
        ...prev,
        [skillsKey]: [...prev[skillsKey], addedSkill],
      }));
      
      if (type === 'teach') setNewTeachingSkill({ name: '', proficiency: 'Beginner', description: '' });
      else setNewLearningSkill({ name: '', proficiency: 'Beginner', description: '' });

    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleRemoveSkill = async (type, skillId) => {
    const skillsKey = type === 'teach' ? 'teachingSkills' : 'learningSkills';

    try {
      const response = await fetch(`${BACKEND_URL}/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete skill');

      setProfile(prev => ({
        ...prev,
        [skillsKey]: prev[skillsKey].filter(skill => skill._id !== skillId),
      }));
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const handleSkillInputChange = (type, field, value) => {
    const setSkill = type === 'teach' ? setNewTeachingSkill : setNewLearningSkill;
    setSkill(prev => ({ ...prev, [field]: value }));
  };

  const renderSkillSection = (type, skills, newSkill) => (
    <div className="mb-4">
      <h4>{type === 'teach' ? 'Skills I Can Teach' : 'Skills I Want to Learn'}</h4>
      <div className="mb-2">
        {skills.map((skill) => (
          <Badge
            key={skill._id}
            bg={type === 'teach' ? 'primary' : 'secondary'}
            className="me-2 mb-2"
            onClick={() => handleRemoveSkill(type, skill._id)}
            style={{ cursor: 'pointer' }}
          >
            {skill.skillName} ({skill.proficiencyLevel}) ×
          </Badge>
        ))}
      </div>
      <Form.Control
        type="text"
        placeholder="Skill Name"
        value={newSkill.name}
        onChange={(e) => handleSkillInputChange(type, 'name', e.target.value)}
      />
      <Form.Select
        value={newSkill.proficiency}
        onChange={(e) => handleSkillInputChange(type, 'proficiency', e.target.value)}
        className="mt-2"
      >
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Expert">Expert</option>
      </Form.Select>
      <Form.Control
        as="textarea"
        placeholder="Description"
        value={newSkill.description}
        onChange={(e) => handleSkillInputChange(type, 'description', e.target.value)}
        className="mt-2"
      />
      <Button 
        variant="success" 
        onClick={() => handleAddSkill(type)} 
        className="mt-2"
        disabled={!newSkill.name.trim()}
      >
        Add
      </Button>
    </div>
  );

  return (
    <Container className="py-4">
     <Card className="mb-4 bg-light shadow-sm">
  <Card.Body className="d-flex justify-content-between align-items-center">
    <h1 className="text-xl font-medium mb-0">Skill Barter Platform</h1>
    <div className="d-flex align-items-center gap-3">
      <NotificationCenter />
      <div className="d-flex gap-2">
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  </Card.Body>
</Card>


      <Card className="mb-4">
        <Card.Body>
          {renderSkillSection('teach', profile.teachingSkills, newTeachingSkill)}
          {renderSkillSection('learn', profile.learningSkills, newLearningSkill)}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfileManagement;
