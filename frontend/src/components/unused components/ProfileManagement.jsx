import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Badge, Modal, Alert, Tabs, Tab, Nav, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../NotificationCenter';
import ProfileCard from '../ProfileCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// List of countries for the dropdown
const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "India",
  "Germany", "France", "Japan", "China", "Brazil", "Mexico", "Spain",
  "Italy", "Netherlands", "Sweden", "South Korea", "Russia", "Other"
];

// List of security questions to choose from
const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What high school did you attend?",
  "What was the make of your first car?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you grow up on?"
];

const ProfileManagement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('skills');
  const [profile, setProfile] = useState({ 
    teachingSkills: [], 
    learningSkills: [],
    name: '',
    email: '',
    country: '',
    hasSecurityQuestions: false
  });
  const [newTeachingSkill, setNewTeachingSkill] = useState({ name: '', proficiency: 'Beginner', description: '' });
  const [newLearningSkill, setNewLearningSkill] = useState({ name: '', proficiency: 'Beginner', description: '' });

  // Edit profile states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    country: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [editProfileError, setEditProfileError] = useState('');

  const [profileEditErrors, setProfileEditErrors] = useState({
    general: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  
  // Security questions states
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: SECURITY_QUESTIONS[0], answer: '' },
    { question: SECURITY_QUESTIONS[1], answer: '' }
  ]);
  const [showSecurityQuestionsModal, setShowSecurityQuestionsModal] = useState(false);
  const [securityQuestionsError, setSecurityQuestionsError] = useState('');

  useEffect(() => {
    if (user?._id) {
      fetchUserProfile();
    }
  }, [user?._id]);

  const fetchUserProfile = async () => {
    try {
      // First, fetch skills
      const skillsResponse = await fetch(`${BACKEND_URL}/api/skills/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!skillsResponse.ok) throw new Error('Failed to fetch skills');
      const skillsData = await skillsResponse.json();
  
      // Then, fetch user details
      const userResponse = await fetch(`${BACKEND_URL}/api/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!userResponse.ok) throw new Error('Failed to fetch user profile');
      const userData = await userResponse.json();
  
      setProfile(prev => ({
        ...prev,
        teachingSkills: skillsData.teachingSkills || [], 
        learningSkills: skillsData.learningSkills || [],
        name: userData.name || '',
        email: userData.email || '',
        country: userData.country || '',
        hasSecurityQuestions: userData.securityQuestions && userData.securityQuestions.length > 0,
        joinedDate: userData.createdAt || new Date(),
        matchesCompleted: userData.matchesCompleted || 0
      }));
  
      // Prefill edit profile data
      setEditProfileData({
        name: userData.name || '',
        email: userData.email || '',
        country: userData.country || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // If user has security questions, prefill the questions (not answers)
      if (userData.securityQuestions && userData.securityQuestions.length > 0) {
        setSecurityQuestions(userData.securityQuestions.map(q => ({
          question: q.question,
          answer: '' // Never load the hashed answers from server
        })));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const validatePasswords = () => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      general: ''
    };


    if (passwordChangeMode) {
      // Current password validation
      if (!editProfileData.currentPassword) {
        errors.currentPassword = 'Current password is required';
        isValid = false;
      }

      // New password validation
      if (!editProfileData.newPassword) {
        errors.newPassword = 'New password is required';
        isValid = false;
      } else if (editProfileData.newPassword.length < 8) {
        errors.newPassword = 'New password must be at least 8 characters long';
        isValid = false;
      }

      // Confirm new password validation
      if (editProfileData.newPassword !== editProfileData.confirmNewPassword) {
        errors.confirmNewPassword = 'New passwords do not match';
        isValid = false;
      }
    }

    setProfileEditErrors(errors);
    return isValid;
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
      // First, delete the skill
      const deleteSkillResponse = await fetch(`${BACKEND_URL}/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!deleteSkillResponse.ok) throw new Error('Failed to delete skill');
  
      // Then, delete any matches associated with this skill
      const deleteMatchesResponse = await fetch(`${BACKEND_URL}/api/matches/by-skill/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!deleteMatchesResponse.ok) throw new Error('Failed to delete associated matches');
  
      // Update the UI by removing the skill from the state
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditProfileError('');

    if (!validatePasswords()) return;

    try {
      const updateData = {
        name: editProfileData.name,
        email: editProfileData.email,
        country: editProfileData.country,
        currentPassword: editProfileData.currentPassword,
      };

      // Only include new password if it's not empty
      if (editProfileData.newPassword) {
        updateData.newPassword = editProfileData.newPassword;
      }

      const response = await fetch(`${BACKEND_URL}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log("Hello")
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        name: editProfileData.name,
        email: editProfileData.email,
        country: editProfileData.country
      }));

      // Close modal and reset
      setShowEditProfileModal(false);
      setEditProfileData({
        ...editProfileData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setProfileEditErrors({
        ...profileEditErrors,
        general: 'Profile updated successfully!'
      });
      
      // Reset password change mode
      setPasswordChangeMode(false);
    } catch (error) {
      setEditProfileError(error.message);
      setProfileEditErrors({
        ...profileEditErrors,
        general: error.message
      });
      console.error('Error updating profile:', error);
    }
  };

  const handleUpdateSecurityQuestions = async (e) => {
    e.preventDefault();
    setSecurityQuestionsError('');

    // Validate all security questions have answers
    const hasEmptyAnswers = securityQuestions.some(q => !q.answer.trim());
    if (hasEmptyAnswers) {
      setSecurityQuestionsError('All security questions must have answers');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/security-questions`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ securityQuestions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update security questions');
      }

      // Update profile state to indicate user has security questions
      setProfile(prev => ({
        ...prev,
        hasSecurityQuestions: true
      }));

      // Reset form and close modal
      setSecurityQuestions(securityQuestions.map(q => ({ 
        question: q.question, 
        answer: '' 
      })));
      setShowSecurityQuestionsModal(false);
      
      // Show success message
      setProfileEditErrors({
        ...profileEditErrors,
        general: 'Security questions updated successfully!'
      });
    } catch (error) {
      setSecurityQuestionsError(error.message);
      console.error('Error updating security questions:', error);
    }
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index][field] = value;
    setSecurityQuestions(updatedQuestions);
  };

  const renderEditProfileModal = () => (
    <Modal show={showEditProfileModal} onHide={() => setShowEditProfileModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdateProfile}>
          {editProfileError && <Alert variant="danger">{editProfileError}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={editProfileData.name}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={editProfileData.email}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Select
              value={editProfileData.country}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, country: e.target.value }))}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((country, index) => (
                <option key={index} value={country}>{country}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Current Password (required to make changes)</Form.Label>
            <Form.Control
              type="password"
              value={editProfileData.currentPassword}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password (optional)</Form.Label>
            <Form.Control
              type="password"
              value={editProfileData.newPassword}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              value={editProfileData.confirmPassword}
              onChange={(e) => setEditProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Update Profile
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
  
  const renderSecurityQuestionsModal = () => (
    <Modal show={showSecurityQuestionsModal} onHide={() => setShowSecurityQuestionsModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Set Security Questions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleUpdateSecurityQuestions}>
          {securityQuestionsError && <Alert variant="danger">{securityQuestionsError}</Alert>}
          
          <p className="text-muted mb-3">
            Security questions will help you recover your account if you forget your password.
            Choose questions you can easily remember but others cannot guess.
          </p>
          
          {securityQuestions.map((q, index) => (
            <div key={index} className="mb-4">
              <Form.Group className="mb-2">
                <Form.Label>Question {index + 1}</Form.Label>
                <Form.Select
                  value={q.question}
                  onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                  required
                >
                  {SECURITY_QUESTIONS.map((question, qIdx) => (
                    <option key={qIdx} value={question}>{question}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Answer</Form.Label>
                <Form.Control
                  type="text"
                  value={q.answer}
                  onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                  placeholder="Your answer"
                  required
                />
                <Form.Text muted>
                  Answers are case-insensitive. Remember your answers exactly as you type them.
                </Form.Text>
              </Form.Group>
            </div>
          ))}

          <Button variant="primary" type="submit" className="w-100">
            Save Security Questions
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
   
  const renderSkillSection = (type, skills, newSkill) => (
    <div className="mb-4">
      <h4>{type === 'teach' ? 'Skills I Can Teach' : 'Skills I Want to Learn'}</h4>
      <div className="mb-2 d-flex flex-wrap">
        {skills.map((skill) => (
          <Badge
            key={skill._id}
            bg={type === 'teach' ? 'primary' : 'secondary'}
            className="me-2 mb-2 d-flex align-items-center"
            style={{ cursor: 'pointer' }}
          >
            <span className="me-2">{skill.skillName} ({skill.proficiencyLevel})</span>
            <Button 
              variant="link" 
              className="p-0 text-white" 
              onClick={() => handleRemoveSkill(type, skill._id)}
            >
              ×
            </Button>
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
        Add Skill
      </Button>
    </div>
  );

  return (
    <Container fluid className="py-4">
      <Card className="mb-4 bg-light shadow-sm">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h1 className="text-xl font-medium mb-0">Skill Barter Platform</h1>
          <div className="d-flex align-items-center gap-3">
            <NotificationCenter />
            <div className="d-flex gap-2">
              <Button variant="danger" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {renderEditProfileModal()}
      {renderSecurityQuestionsModal()}

      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Body>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'skills'} 
                    onClick={() => setActiveTab('skills')}
                  >
                    Manage Skills
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                  >
                    Edit Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'security'} 
                    onClick={() => setActiveTab('security')}
                  >
                    Security Settings
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'view'} 
                    onClick={() => setActiveTab('view')}
                  >
                    View Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>
        <Col md={9}>
          {activeTab === 'skills' && (
            <Card className="mb-4">
              <Card.Body>
                {renderSkillSection('teach', profile.teachingSkills, newTeachingSkill)}
                <hr />
                {renderSkillSection('learn', profile.learningSkills, newLearningSkill)}
              </Card.Body>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="mb-4">
              <Card.Body>
                <h3>Edit Profile</h3>
                {profileEditErrors.general && (
                  <Alert 
                    variant={profileEditErrors.general.includes('successfully') ? 'success' : 'danger'}
                  >
                    {profileEditErrors.general}
                  </Alert>
                )}
                <Form onSubmit={handleUpdateProfile}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editProfileData.name}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={editProfileData.email}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Select
                      value={editProfileData.country}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, country: e.target.value }))}
                    >
                      <option value="">Select a country</option>
                      {COUNTRIES.map((country, index) => (
                        <option key={index} value={country}>{country}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={editProfileData.currentPassword}
                      onChange={(e) => setEditProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                      isInvalid={!!profileEditErrors.currentPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {profileEditErrors.currentPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Password Change Section */}
                  <div className="mb-3">
                    <Form.Check 
                      type="switch"
                      id="password-change-switch"
                      label="Change Password"
                      checked={passwordChangeMode}
                      onChange={() => setPasswordChangeMode(!passwordChangeMode)}
                    />
                  </div>

                  {passwordChangeMode && (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={editProfileData.newPassword}
                          onChange={(e) => setEditProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                          isInvalid={!!profileEditErrors.newPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {profileEditErrors.newPassword}
                        </Form.Control.Feedback>
                        <Form.Text muted>
                          Password must be at least 8 characters long
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <Form.Control
                          type="password"
                          value={editProfileData.confirmNewPassword}
                          onChange={(e) => setEditProfileData(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                          isInvalid={!!profileEditErrors.confirmNewPassword}
                        />
                        <Form.Control.Feedback type="invalid">
                          {profileEditErrors.confirmNewPassword}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </>
                  )}

                  <Button variant="primary" type="submit">
                    Update Profile
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card className="mb-4">
              <Card.Body>
                <h3>Security Settings</h3>
                <div className="mb-4">
                  <h4>Security Questions</h4>
                  <p>
                    Security questions help you recover your account if you forget your password.
                  </p>
                  
                  {profile.hasSecurityQuestions ? (
                    <>
                      <Alert variant="success">
                        <Alert.Heading>Security Questions Set</Alert.Heading>
                        <p>
                          You have already set up security questions for your account. 
                          You can update them at any time.
                        </p>
                      </Alert>
                      <Button 
                        variant="outline-primary"
                        onClick={() => setShowSecurityQuestionsModal(true)}
                      >
                        Update Security Questions
                      </Button>
                    </>
                  ) : (
                    <>
                      <Alert variant="warning">
                        <Alert.Heading>No Security Questions</Alert.Heading>
                        <p>
                          You haven't set up security questions yet. We recommend setting them up
                          to help recover your account if you forget your password.
                        </p>
                      </Alert>
                      <Button 
                        variant="primary"
                        onClick={() => setShowSecurityQuestionsModal(true)}
                      >
                        Set Up Security Questions
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {activeTab === 'view' && (
            <Card className="mb-4">
              <Card.Body>
                <h3>Profile Preview</h3>
                <ProfileCard 
                  profile={{
                    name: profile.name,
                    email: profile.email,
                    country: profile.country,
                    teachingSkills: profile.teachingSkills,
                    learningSkills: profile.learningSkills
                  }} 
                />
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProfileManagement;