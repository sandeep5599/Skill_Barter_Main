import React from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { PersonFill, EnvelopeFill, GeoAltFill, LockFill, ShieldLockFill, CheckCircleFill } from 'react-bootstrap-icons';
import { COUNTRIES } from '../shared/constants';

const EditProfileModal = ({
  show,
  onHide,
  editProfileData,
  setEditProfileData,
  onSubmit,
  error
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      className="rounded-4 overflow-hidden"
    >
      <div className="position-relative">
        {/* Header with gradient background */}
        <Modal.Header className="border-0 pb-0" style={{ 
          background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
          padding: '1.5rem 2rem 1rem',
          color: 'white'
        }}>
          {/* Decorative Elements */}
          <div className="position-absolute" style={{ 
            top: '-20px', 
            right: '-20px', 
            width: '150px', 
            height: '150px', 
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div className="position-absolute" style={{ 
            bottom: '-20px', 
            left: '10%', 
            width: '120px', 
            height: '120px',  
            background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
            borderRadius: '50%'
          }}></div>
          
          <Modal.Title className="w-100">
            <h4 className="mb-0 fw-bold d-flex align-items-center" style={{ letterSpacing: '-0.5px' }}>
              <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}>
                <PersonFill size={20} />
              </div>
              Edit Profile
            </h4>
            <p className="text-white-50 small mb-0 mt-2">Update your personal information</p>
          </Modal.Title>
          <Button 
            variant="link" 
            onClick={onHide} 
            className="ms-auto p-0 text-white shadow-none" 
            style={{ position: 'relative', zIndex: 5 }}
          >
            <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>&times;</span>
          </Button>
        </Modal.Header>
      </div>

      <Modal.Body className="p-4 bg-white">
        {error && (
          <Alert 
            variant="danger" 
            className="d-flex align-items-center mb-4 border-0 rounded-3"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <div className="me-3 rounded-circle d-flex align-items-center justify-content-center bg-danger" 
              style={{ width: '32px', height: '32px', minWidth: '32px' }}>
              <span className="text-white fw-bold">!</span>
            </div>
            <div>{error}</div>
          </Alert>
        )}

        <Form onSubmit={onSubmit}>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2" style={{ color: '#1e40af' }}>
                  <PersonFill className="me-2" />
                  Name
                </Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="text"
                    value={editProfileData.name}
                    onChange={(e) => 
                      setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="rounded-3 py-3 ps-3"
                    style={{ 
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2" style={{ color: '#1e40af' }}>
                  <EnvelopeFill className="me-2" />
                  Email
                </Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="email"
                    value={editProfileData.email}
                    onChange={(e) => 
                      setEditProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="rounded-3 py-3 ps-3"
                    style={{ 
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2" style={{ color: '#1e40af' }}>
                  <GeoAltFill className="me-2" />
                  Country
                </Form.Label>
                <div className="position-relative">
                  <Form.Select 
                    value={editProfileData.country}
                    onChange={(e) => 
                      setEditProfileData(prev => ({ ...prev, country: e.target.value }))}
                    className="rounded-3 py-3"
                    style={{ 
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-in-out',
                      appearance: 'auto'
                    }}
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country, index) => (
                      <option key={index} value={country}>{country}</option>
                    ))}
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <div className="p-4 rounded-4 mb-3" style={{ background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)' }}>
                <h6 className="mb-3 d-flex align-items-center" style={{ color: '#0c4a6e' }}>
                  <ShieldLockFill className="me-2" />
                  <span>Security Settings</span>
                </h6>
                <p className="small text-muted mb-0">Update your password to enhance account security. Current password is required for all changes.</p>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2" style={{ color: '#1e40af' }}>
                  <LockFill className="me-2" />
                  Current Password <span className="text-danger">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="password"
                    value={editProfileData.currentPassword}
                    onChange={(e) => 
                      setEditProfileData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="rounded-3 py-3 ps-3"
                    style={{ 
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    placeholder="Required to make changes"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2" style={{ color: '#0891b2' }}>
                  <LockFill className="me-2" />
                  New Password <span className="text-muted small">(optional)</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="password"
                    value={editProfileData.newPassword}
                    onChange={(e) => 
                      setEditProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="rounded-3 py-3 ps-3"
                    style={{ 
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold mb-2" style={{ color: '#0891b2' }}>
                  <CheckCircleFill className="me-2" />
                  Confirm New Password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="password"
                    value={editProfileData.confirmPassword}
                    onChange={(e) => 
                      setEditProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="rounded-3 py-3 ps-3"
                    style={{ 
                      border: '1.5px solid #e2e8f0',
                      boxShadow: 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    placeholder="Confirm your new password"
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={onHide}
              className="rounded-pill px-4 py-2"
              style={{ borderWidth: '1.5px' }}
            >
              Cancel
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
              <CheckCircleFill className="me-2" />
              Update Profile
            </Button>
          </div>
        </Form>
      </Modal.Body>

      {/* Add custom animation styles */}
      <style>
        {`
        .form-control:focus, .form-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25) !important;
        }
        
        @media (max-width: 768px) {
          .modal-body {
            padding: 1.5rem !important;
          }
        }
        `}
      </style>
    </Modal>
  );
};

export default EditProfileModal;