import React, { useState } from 'react';
import { Card, Badge, Row, Col, ListGroup, Modal, Button } from 'react-bootstrap';
import { 
  Calendar, MapPin, Briefcase, Book, Award, 
  Edit, Star, MessageCircle, Share2, 
  CheckCircle, XCircle, BarChart2 
} from 'lucide-react';

const ProfileCard = ({ profile }) => {

  console.log(profile)
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkillType, setSelectedSkillType] = useState(null);

  // Function to generate initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Function to generate a consistent color based on the name
  const generateAvatarColor = (name) => {
    const colors = [
      '#3498db', // Blue
      '#2ecc71', // Green
      '#e74c3c', // Red
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#1abc9c', // Teal
      '#34495e'  // Dark Blue-Gray
    ];
  
    // Create a consistent hash from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    // Use the hash to select a color consistently
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Skill proficiency color mapping
  const getProficiencyColor = (level) => {
    switch(level.toLowerCase()) {
      case 'beginner': return 'secondary';
      case 'intermediate': return 'primary';
      case 'advanced': return 'success';
      case 'expert': return 'warning';
      default: return 'light';
    }
  };

  const initials = getInitials(profile.name);
  const avatarColor = generateAvatarColor(profile.name);

  // Modal for detailed skill view
  const SkillDetailModal = () => (
    <Modal show={showSkillModal} onHide={() => setShowSkillModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedSkillType === 'teaching' ? 'Teaching Skills' : 'Learning Skills'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedSkillType === 'teaching' ? (
          profile.teachingSkills.map((skill) => (
            <div key={skill._id} className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-1">{skill.skillName}</h6>
                <Badge bg={getProficiencyColor(skill.proficiencyLevel)}>
                  {skill.proficiencyLevel}
                </Badge>
              </div>
              {skill.description && (
                <p className="text-muted small">{skill.description}</p>
              )}
            </div>
          ))
        ) : (
          profile.learningSkills.map((skill) => (
            <div key={skill._id} className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-1">{skill.skillName}</h6>
                <Badge bg={getProficiencyColor(skill.proficiencyLevel)}>
                  {skill.proficiencyLevel}
                </Badge>
              </div>
              {skill.description && (
                <p className="text-muted small">{skill.description}</p>
              )}
            </div>
          ))
        )}
      </Modal.Body>
    </Modal>
  );

  return (
    <>
      <Card className="shadow-lg">
        <Card.Body>
          {/* Profile Header with Enhanced Avatar */}
          <div className="text-center mb-4 position-relative">
            <div 
              style={{
                width: '150px', 
                height: '150px', 
                borderRadius: '50%', 
                backgroundColor: avatarColor,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '4rem',
                fontWeight: 'bold',
                margin: '0 auto 15px',
                boxShadow: '0 6px 10px rgba(0,0,0,0.2)',
                border: '4px solid white'
              }}
            >
              {initials}
            </div>
            
            {/* Profile Action Buttons */}
            <div className="d-flex justify-content-center mt-2">
              <Button variant="primary" size="sm" className="me-2">
                <Edit size={16} className="me-1" /> Edit Profile
              </Button>
              <Button variant="primary" size="sm">
                <Share2 size={16} className="me-1" /> Share Profile
              </Button>
            </div>

            <h2 className="mb-1 mt-3">{profile.name}</h2>
            <p className="text-muted">{profile.email}</p>
          </div>

          {/* Detailed Profile Information */}
          <ListGroup variant="flush" className="mb-4">
            {[
              { icon: MapPin, text: profile.location, label: 'Location' },
              { icon: Briefcase, text: profile.profession, label: 'Profession' },
              { icon: Book, text: profile.education, label: 'Education' },
              { 
                icon: Calendar, 
                text: profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : null, 
                label: 'Joined' 
              }
            ].map((item, index) => (
              item.text && (
                <ListGroup.Item 
                  key={index} 
                  className="d-flex align-items-center justify-content-between"
                >
                  <div className="d-flex align-items-center">
                    <item.icon className="me-2 text-muted" size={20} />
                    <span>{item.text}</span>
                  </div>
                </ListGroup.Item>
              )
            ))}
          </ListGroup>

          {/* Skills Section with More Details */}
          <Row className="mb-4">
            <Col md={6}>
              <h5 className="mb-3">
                <Award className="me-2 text-primary" size={20} />
                Teaching Skills
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedSkillType('teaching');
                    setShowSkillModal(true);
                  }}
                >
                  View All
                </Button>
              </h5>
              <div>
                {profile.teachingSkills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill._id} 
                    bg={getProficiencyColor(skill.proficiencyLevel)} 
                    className="me-2 mb-2"
                  >
                    {skill.skillName}
                  </Badge>
                ))}
                {profile.teachingSkills.length > 3 && (
                  <Badge bg="info">
                    +{profile.teachingSkills.length - 3} more
                  </Badge>
                )}
              </div>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">
                <Book className="me-2 text-secondary" size={20} />
                Learning Skills
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setSelectedSkillType('learning');
                    setShowSkillModal(true);
                  }}
                >
                  View All
                </Button>
              </h5>
              <div>
                {profile.learningSkills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill._id} 
                    bg={getProficiencyColor(skill.proficiencyLevel)} 
                    className="me-2 mb-2"
                  >
                    {skill.skillName}
                  </Badge>
                ))}
                {profile.learningSkills.length > 3 && (
                  <Badge bg="info">
                    +{profile.learningSkills.length - 3} more
                  </Badge>
                )}
              </div>
            </Col>
          </Row>

          {/* Enhanced Profile Stats */}
          <Card className="bg-light">
            <Card.Body>
              <Row>
                <Col className="text-center">
                  <BarChart2 className="text-muted mb-2" size={24} />
                  <h6 className="text-muted mb-1">Teaching Skills</h6>
                  <strong className="h4">{profile.teachingSkills.length}</strong>
                </Col>
                <Col className="text-center">
                  <Book className="text-muted mb-2" size={24} />
                  <h6 className="text-muted mb-1">Learning Skills</h6>
                  <strong className="h4">{profile.learningSkills.length}</strong>
                </Col>
                {profile.matchesCompleted && (
                  <Col className="text-center">
                    <CheckCircle className="text-muted mb-2" size={24} />
                    <h6 className="text-muted mb-1">Matches Completed</h6>
                    <strong className="h4">{profile.matchesCompleted}</strong>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Skill Detail Modal */}
      <SkillDetailModal />
    </>
  );
};

export default ProfileCard;