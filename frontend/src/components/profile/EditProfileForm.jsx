import React, { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Person, Envelope, GlobeAmericas, Lock, Key, Check, ArrowClockwise } from 'react-bootstrap-icons';
import { COUNTRIES } from './shared/constants';

const EditProfileForm = ({ 
  profileData, 
  onUpdateProfile, 
  editProfileErrors 
}) => {
  const [formData, setFormData] = useState(profileData);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData, passwordChangeMode);
  };

  return (
    <div className="edit-profile-container">
      {/* Header Section - Futuristic */}
      <div className="position-relative mb-4" style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        padding: '2rem',
        color: 'white',
        borderRadius: '1rem',
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
        
        <h2 className="mb-1" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>
          Edit Your Profile
        </h2>
        <p className="text-white-50 mb-0">Update your personal information and settings</p>
      </div>

      <Form onSubmit={handleSubmit} className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {/* Success/Error Alert */}
          {editProfileErrors.general && (
            <Alert 
              variant={editProfileErrors.general.includes('successfully') ? 'success' : 'danger'}
              className="m-4 mb-0 d-flex align-items-center"
              style={{
                borderRadius: '0.75rem',
                border: 'none',
                boxShadow: editProfileErrors.general.includes('successfully') ? 
                  '0 4px 12px rgba(16, 185, 129, 0.2)' : 
                  '0 4px 12px rgba(239, 68, 68, 0.2)'
              }}
            >
              <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  background: editProfileErrors.general.includes('successfully') ? 
                    'rgba(16, 185, 129, 0.2)' : 
                    'rgba(239, 68, 68, 0.2)',
                  color: editProfileErrors.general.includes('successfully') ? 
                    '#10b981' : 
                    '#ef4444'
                }}>
                {editProfileErrors.general.includes('successfully') ? 
                  <Check size={20} /> : 
                  <span className="fw-bold">!</span>
                }
              </div>
              {editProfileErrors.general}
            </Alert>
          )}
          
          <div className="p-4">
            <Row className="g-4">
              {/* Personal Information */}
              <Col lg={6}>
                <div className="mb-4">
                  <h6 className="text-uppercase fw-semibold small mb-3" style={{ color: '#64748b', letterSpacing: '1px' }}>
                    Personal Information
                  </h6>
                </div>
                
                {/* Name Field */}
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        color: '#3b82f6'
                      }}>
                      <Person size={16} />
                    </div>
                    <Form.Label className="mb-0 fw-semibold" style={{ color: '#0f172a' }}>Name</Form.Label>
                  </div>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="form-control-modern"
                    style={{ 
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </Form.Group>

                {/* Email Field */}
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        color: '#3b82f6'
                      }}>
                      <Envelope size={16} />
                    </div>
                    <Form.Label className="mb-0 fw-semibold" style={{ color: '#0f172a' }}>Email</Form.Label>
                  </div>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="form-control-modern"
                    style={{ 
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none'
                    }}
                  />
                </Form.Group>
                
                {/* Country Field */}
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        color: '#3b82f6'
                      }}>
                      <GlobeAmericas size={16} />
                    </div>
                    <Form.Label className="mb-0 fw-semibold" style={{ color: '#0f172a' }}>Country</Form.Label>
                  </div>
                  <Form.Select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="form-control-modern"
                    style={{ 
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none'
                    }}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country, index) => (
                      <option key={index} value={country}>{country}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              {/* Security Information */}
              <Col lg={6}>
                <div className="mb-4">
                  <h6 className="text-uppercase fw-semibold small mb-3" style={{ color: '#64748b', letterSpacing: '1px' }}>
                    Security Settings
                  </h6>
                </div>
                
                {/* Current Password Field */}
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        color: '#3b82f6'
                      }}>
                      <Lock size={16} />
                    </div>
                    <Form.Label className="mb-0 fw-semibold" style={{ color: '#0f172a' }}>Current Password</Form.Label>
                  </div>
                  <Form.Control
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    required
                    isInvalid={!!editProfileErrors.currentPassword}
                    className="form-control-modern"
                    style={{ 
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {editProfileErrors.currentPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password Change Switch */}
                <div className="mb-4">
                  <div className="d-flex align-items-center p-3 rounded-4" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                    <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '36px', 
                        height: '36px', 
                        background: passwordChangeMode ? 'linear-gradient(135deg, #3b82f6, #1e40af)' : '#e2e8f0',
                        color: passwordChangeMode ? 'white' : '#64748b',
                        transition: 'all 0.3s ease'
                      }}>
                      <Key size={18} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold" style={{ color: '#0f172a' }}>Change Password</div>
                      <div className="small text-muted">Update your password to enhance security</div>
                    </div>
                    <Form.Check 
                      type="switch"
                      id="password-change-switch"
                      checked={passwordChangeMode}
                      onChange={() => setPasswordChangeMode(!passwordChangeMode)}
                      className="ms-2"
                    />
                  </div>
                </div>

                {/* Password Change Fields */}
                {passwordChangeMode && (
                  <div className="password-fields-container p-3 rounded-4" style={{ 
                    background: 'rgba(59, 130, 246, 0.05)',
                    animation: 'fadeIn 0.3s ease-out'
                  }}>
                    <Form.Group className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#3b82f6'
                          }}>
                          <Key size={14} />
                        </div>
                        <Form.Label className="mb-0 fw-semibold" style={{ color: '#0f172a' }}>New Password</Form.Label>
                      </div>
                      <Form.Control
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        isInvalid={!!editProfileErrors.newPassword}
                        className="form-control-modern"
                        style={{ 
                          borderRadius: '0.75rem',
                          padding: '0.75rem 1rem',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: 'none'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {editProfileErrors.newPassword}
                      </Form.Control.Feedback>
                      <Form.Text style={{ color: '#64748b' }}>
                        Password must be at least 8 characters long
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            background: 'rgba(59, 130, 246, 0.1)', 
                            color: '#3b82f6'
                          }}>
                          <Check size={14} />
                        </div>
                        <Form.Label className="mb-0 fw-semibold" style={{ color: '#0f172a' }}>Confirm New Password</Form.Label>
                      </div>
                      <Form.Control
                        type="password"
                        value={formData.confirmNewPassword}
                        onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                        isInvalid={!!editProfileErrors.confirmNewPassword}
                        className="form-control-modern"
                        style={{ 
                          borderRadius: '0.75rem',
                          padding: '0.75rem 1rem',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: 'none'
                        }}
                      />
                      <Form.Control.Feedback type="invalid">
                        {editProfileErrors.confirmNewPassword}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </div>
                )}
              </Col>
            </Row>
          </div>
          
          {/* Button Section - Futuristic */}
          <div className="p-4 border-top">
            <div className="d-flex flex-wrap justify-content-end gap-3">
              <Button 
                variant="outline-secondary" 
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-pill px-4 py-2 d-flex align-items-center"
                style={{ 
                  borderWidth: '1.5px'
                }}
              >
                <ArrowClockwise className="me-2" size={16} />
                Reset
              </Button>
              
              <Button 
                variant="primary" 
                type="submit"
                className="rounded-pill px-4 py-2 d-flex align-items-center"
                style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Check className="me-2" size={16} />
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </Form>
      
      {/* Add custom animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .form-control-modern:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
        }
        
        @media (max-width: 992px) {
          .edit-profile-container {
            padding: 0 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .edit-profile-container > div:first-child {
            padding: 1.5rem !important;
          }
        }
        
        @media (max-width: 576px) {
          .edit-profile-container > div:first-child {
            padding: 1.25rem !important;
          }
          .edit-profile-container > div:first-child h2 {
            font-size: 1.5rem;
          }
        }
        `}
      </style>
    </div>
  );
};

export default EditProfileForm;