import React from 'react';
import { Card } from 'react-bootstrap';
import ProfileCard from './ProfileCard';

const ProfilePreview = ({ profile }) => {
  // Transform profile data structure if needed
  const transformedProfile = {
    name: profile.name,
    email: profile.email,
    country: profile.country,
    // Convert object-based skills to array-based skills if needed
    teachingSkills: profile.teachingSkills ? 
      Array.isArray(profile.teachingSkills) ? 
        profile.teachingSkills : 
        Object.keys(profile.teachingSkills).map(skillName => ({
          skillName,
          proficiencyLevel: profile.teachingSkills[skillName]
        })) : 
      [],
    learningSkills: profile.learningSkills ? 
      Array.isArray(profile.learningSkills) ? 
        profile.learningSkills : 
        Object.keys(profile.learningSkills).map(skillName => ({
          skillName,
          proficiencyLevel: profile.learningSkills[skillName]
        })) : 
      []
  };

  return (
    <Card className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Header Section */}
      <div className="position-relative" style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        padding: '1.5rem',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div className="position-absolute" style={{ 
          top: '-20px', 
          right: '-20px', 
          width: '200px', 
          height: '200px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div className="position-absolute" style={{ 
          bottom: '-40px', 
          left: '10%', 
          width: '180px', 
          height: '180px',  
          background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <h3 className="mb-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>Profile Preview</h3>
        <p className="text-white-50 mb-0">Review how your profile will appear to others</p>
      </div>
      
      <Card.Body className="p-4">
        <ProfileCard profile={transformedProfile} />
      </Card.Body>
    </Card>
  );
};

export default ProfilePreview;