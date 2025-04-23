// src/pages/ProfileManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { 
  MortarboardFill, 
  BookFill, 
  PersonFill, 
  ShieldLockFill, 
  EyeFill,
  GearFill,
  ChevronLeft
} from 'react-bootstrap-icons';

// Components
import Header from '../components/profile/layout/Header';
import ProfileNavigation from '../components/profile/ProfileNavigation';
import SkillsManagement from '../components/profile/SkillsManagement';
import EditProfileForm from '../components/profile/EditProfileForm';
import SecuritySettings from '../components/profile/SecuritySettings';
import ProfilePreview from '../components/profile/ProfilePreview';
import EditProfileModal from '../components/profile/modals/EditProfileModal';
import SecurityQuestionsModal from '../components/profile/modals/SecurityQuestionsModal';
import ProfileCard from '../components/profile/ProfileCard';

// API
import { 
  fetchUserProfile, 
  addSkill, 
  removeSkill, 
  updateProfile, 
  updateSecurityQuestions 
} from '../utils/api';

// Constants
import { SECURITY_QUESTIONS } from '../components/profile/shared/constants';

const ProfileManagement = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('skills');
  const [profile, setProfile] = useState({ 
    teachingSkills: [], 
    learningSkills: [],
    name: '',
    email: '',
    country: '',
    hasSecurityQuestions: false
  });

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
  
  // Security questions states
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: SECURITY_QUESTIONS[0], answer: '' },
    { question: SECURITY_QUESTIONS[1], answer: '' }
  ]);
  const [showSecurityQuestionsModal, setShowSecurityQuestionsModal] = useState(false);
  const [securityQuestionsError, setSecurityQuestionsError] = useState('');

  useEffect(() => {
    if (user?._id) {
      loadUserProfile();
    }
  }, [user?._id]);

  const loadUserProfile = async () => {
    try {
      const profileData = await fetchUserProfile(user._id, token);
      
      setProfile(profileData);
      
      // Update the edit profile form data
      setEditProfileData({
        name: profileData.name,
        email: profileData.email,
        country: profileData.country,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Update security questions if they exist
      if (profileData.securityQuestions && profileData.securityQuestions.length > 0) {
        setSecurityQuestions(profileData.securityQuestions);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Handle error appropriately
    }
  };

  const handleAddSkill = async (type, skillData) => {
    try {
      const skillType = type === 'teach' ? 'teaching' : 'learning';
      
      const newSkill = await addSkill({
        userId: user._id,
        skillName: skillData.name,
        proficiencyLevel: skillData.proficiency,
        description: skillData.description,
        type: skillType
      }, token);
      
      // Update state with new skill
      setProfile(prev => ({
        ...prev,
        [`${skillType}Skills`]: [...prev[`${skillType}Skills`], newSkill]
      }));
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleRemoveSkill = async (type, skillId) => {
    try {
      await removeSkill(skillId, token);
      
      const skillType = type === 'teach' ? 'teachingSkills' : 'learningSkills';
      
      // Update state by removing the skill
      setProfile(prev => ({
        ...prev,
        [skillType]: prev[skillType].filter(skill => skill._id !== skillId)
      }));
    } catch (error) {
      console.error('Error removing skill:', error);
    }
  };

  const handleUpdateProfile = async (formData, passwordChangeMode) => {
    try {
      // Reset error states
      setProfileEditErrors({
        general: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      // Validate passwords if changing password
      if (passwordChangeMode) {
        if (!formData.newPassword) {
          setProfileEditErrors(prev => ({ ...prev, newPassword: 'New password is required' }));
          return;
        }
        
        if (formData.newPassword.length < 8) {
          setProfileEditErrors(prev => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
          return;
        }
        
        if (formData.newPassword !== formData.confirmNewPassword) {
          setProfileEditErrors(prev => ({ ...prev, confirmNewPassword: 'Passwords do not match' }));
          return;
        }
      }

      // Proceed with update
      const updatedProfile = await updateProfile({
        userId: user._id,
        name: formData.name,
        email: formData.email,
        country: formData.country,
        currentPassword: formData.currentPassword,
        newPassword: passwordChangeMode ? formData.newPassword : undefined
      }, token);

      // Update state with new profile data
      setProfile(prev => ({
        ...prev,
        name: updatedProfile.name,
        email: updatedProfile.email,
        country: updatedProfile.country
      }));

      // Show success message
      setProfileEditErrors(prev => ({ ...prev, general: 'Profile updated successfully!' }));
      
      // Clear password fields
      setEditProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.message && error.message.includes('current password')) {
        setProfileEditErrors(prev => ({ 
          ...prev, 
          currentPassword: 'Current password is incorrect' 
        }));
      } else {
        setProfileEditErrors(prev => ({ 
          ...prev, 
          general: error.message || 'Failed to update profile'
        }));
      }
    }
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    const updatedQuestions = [...securityQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setSecurityQuestions(updatedQuestions);
  };

  const handleSecurityQuestionsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSecurityQuestionsError('');

      // Validate answers are provided
      if (securityQuestions.some(q => !q.answer.trim())) {
        setSecurityQuestionsError('All questions must have answers');
        return;
      }

      await updateSecurityQuestions(securityQuestions, token);
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        hasSecurityQuestions: true,
        securityQuestions: [...securityQuestions]
      }));
      
      // Close modal
      setShowSecurityQuestionsModal(false);
    } catch (error) {
      console.error('Error updating security questions:', error);
      setSecurityQuestionsError(error.message || 'Failed to update security questions');
    }
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const getTabIcon = (tab) => {
    switch(tab) {
      case 'skills':
        return <MortarboardFill size={22} />;
      case 'profile':
        return <PersonFill size={22} />;
      case 'security':
        return <ShieldLockFill size={22} />;
      case 'view':
        return <EyeFill size={22} />;
      default:
        return <GearFill size={22} />;
    }
  };

  const getTabTitle = (tab) => {
    switch(tab) {
      case 'skills':
        return 'Skills Management';
      case 'profile':
        return 'Profile Information';
      case 'security':
        return 'Security Settings';
      case 'view':
        return 'Profile Preview';
      default:
        return 'Settings';
    }
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Header logout={logout} />
      
      {/* Mobile Navigation Toggle */}
      <div className="d-flex d-md-none align-items-center justify-content-between p-3 sticky-top" style={{
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        color: 'white',
        zIndex: 100
      }}>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-link text-white p-0 me-3"
            onClick={navigateToDashboard}
          >
            <ChevronLeft size={24} />
          </button>
          <h5 className="mb-0 fw-bold">{getTabTitle(activeTab)}</h5>
        </div>
        <Button
          variant="outline-light"
          size="sm"
          className="rounded-pill"
          onClick={toggleMobileNav}
        >
          {mobileNavOpen ? 'Close Menu' : 'Menu'}
        </Button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="d-md-none" style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 99
        }}>
          <div style={{
            background: 'white',
            height: '100%',
            maxWidth: '300px',
            padding: '1rem',
            overflowY: 'auto',
            boxShadow: '0 0 20px rgba(0,0,0,0.2)'
          }}>
            <div className="profile-mobile-nav">
              <ProfileNavigation
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileNavOpen(false);
                }}
                navigateToDashboard={navigateToDashboard}
              />
            </div>
          </div>
        </div>
      )}
      
      <Container fluid className="py-4">
        <Row>
          {/* Left sidebar - Hidden on mobile */}
          <Col md={3} className="d-none d-md-block mb-4">
            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
              <Card.Body className="p-0">
                <div className="p-4" style={{ background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)', color: 'white' }}>
                  <h4 className="fw-bold mb-0">Profile Settings</h4>
                  <p className="text-white-50 mb-0">Manage your account</p>
                </div>
                <ProfileNavigation 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  navigateToDashboard={navigateToDashboard} 
                />
              </Card.Body>
            </Card>
          </Col>
          
          {/* Main content area */}
          <Col md={9}>
            <div className="content-area">
              {activeTab === 'skills' && (
                <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
                  <Card.Header className="bg-white border-0 p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                        }}>
                        <MortarboardFill size={22} className="text-white" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">Skills Management</h4>
                        <p className="text-muted mb-0">Manage what you teach and learn</p>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <SkillsManagement 
                      teachingSkills={profile.teachingSkills} 
                      learningSkills={profile.learningSkills}
                      onAddSkill={handleAddSkill}
                      onRemoveSkill={handleRemoveSkill}
                    />
                  </Card.Body>
                </Card>
              )}
              
              {activeTab === 'profile' && (
                <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
                  <Card.Header className="bg-white border-0 p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                          boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3)'
                        }}>
                        <PersonFill size={22} className="text-white" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">Profile Information</h4>
                        <p className="text-muted mb-0">Update your personal details</p>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <EditProfileForm 
                      profileData={{
                        name: profile.name,
                        email: profile.email,
                        country: profile.country,
                        currentPassword: '',
                        newPassword: '',
                        confirmNewPassword: ''
                      }}
                      onUpdateProfile={handleUpdateProfile}
                      editProfileErrors={profileEditErrors}
                    />
                  </Card.Body>
                </Card>
              )}
              
              {activeTab === 'security' && (
                <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
                  <Card.Header className="bg-white border-0 p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #10b981, #047857)',
                          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                        }}>
                        <ShieldLockFill size={22} className="text-white" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">Security Settings</h4>
                        <p className="text-muted mb-0">Enhance your account protection</p>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <SecuritySettings 
                      hasSecurityQuestions={profile.hasSecurityQuestions}
                      onShowSecurityQuestionsModal={() => setShowSecurityQuestionsModal(true)}
                    />
                  </Card.Body>
                </Card>
              )}
              
              {activeTab === 'view' && (
                <Card className="mb-4 shadow-sm border-0 rounded-4 overflow-hidden">
                  <Card.Header className="bg-white border-0 p-4">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle me-3 d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                          boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
                        }}>
                        <EyeFill size={22} className="text-white" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">Profile Preview</h4>
                        <p className="text-muted mb-0">See how others view your profile</p>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="profile-preview-container">
                      <ProfilePreview profile={profile} />
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <EditProfileModal 
        show={showEditProfileModal}
        onHide={() => setShowEditProfileModal(false)}
        editProfileData={editProfileData}
        setEditProfileData={setEditProfileData}
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateProfile(editProfileData, !!editProfileData.newPassword);
          setShowEditProfileModal(false);
        }}
        error={editProfileError}
      />

      <SecurityQuestionsModal 
        show={showSecurityQuestionsModal}
        onHide={() => setShowSecurityQuestionsModal(false)}
        securityQuestions={securityQuestions}
        onSecurityQuestionChange={handleSecurityQuestionChange}
        onSubmit={handleSecurityQuestionsSubmit}
        error={securityQuestionsError}
      />
      
      {/* Custom CSS for animations and effects */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .content-area {
          animation: fadeIn 0.3s ease-out;
        }
        
        @media (max-width: 767.98px) {
          .container-fluid {
            padding-top: 0 !important;
          }
        }
        
        /* Better focus styles for accessibility */
        button:focus, input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
        }
        
        /* Smooth hover transitions */
        .card {
          transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        `}
      </style>
    </div>
  );
};

export default ProfileManagement;