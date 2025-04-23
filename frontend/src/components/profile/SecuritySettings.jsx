import React from 'react';
import { Card, Button, Alert, Row, Col } from 'react-bootstrap';
import { ShieldLockFill, CheckCircleFill, ExclamationTriangleFill, ArrowRightCircleFill } from 'react-bootstrap-icons';

const SecuritySettings = ({ 
  hasSecurityQuestions, 
  onShowSecurityQuestionsModal 
}) => {
  return (
    <Card className="mb-4 shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        padding: '1.5rem',
        color: 'white',
        position: 'relative',
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

        <div className="d-flex align-items-center mb-2">
          <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
            <ShieldLockFill className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="mb-0" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>Security Settings</h2>
            <p className="text-white-50 mb-0">Manage your account protection</p>
          </div>
        </div>
      </div>

      <Card.Body className="p-4 bg-white">
        <div className="mb-4">
          <h4 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Security Questions</h4>
          <p className="text-muted">
            Security questions help you recover your account if you forget your password. 
            We recommend setting up security questions for additional account protection.
          </p>
          
          {hasSecurityQuestions ? (
            <Row className="mt-4">
              <Col md={12}>
                <div className="p-3 rounded-4 border-0 shadow-sm mb-4" style={{ 
                  background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
                  borderLeft: '4px solid #10b981'
                }}>
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: '#10b981',
                          color: 'white',
                          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                        }}>
                        <CheckCircleFill size={24} />
                      </div>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2" style={{ color: '#047857' }}>Security Questions Set</h5>
                      <p className="mb-0" style={{ color: '#4b5563' }}>
                        You have already set up security questions for your account. 
                        You can update them at any time to maintain strong account protection.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="primary"
                  onClick={onShowSecurityQuestionsModal}
                  className="rounded-pill px-4 py-2 d-flex align-items-center"
                  style={{ 
                    borderWidth: '1.5px',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)',
                    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px -1px rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.1)';
                  }}
                >
                  <ArrowRightCircleFill className="me-2" size={20} />
                  Update Security Questions
                </Button>
              </Col>
            </Row>
          ) : (
            <Row className="mt-4">
              <Col md={12}>
                <div className="p-3 rounded-4 border-0 shadow-sm mb-4" style={{ 
                  background: 'linear-gradient(to right, #fef3c7, #fde68a)',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          background: '#f59e0b',
                          color: 'white',
                          boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
                        }}>
                        <ExclamationTriangleFill size={24} />
                      </div>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2" style={{ color: '#92400e' }}>No Security Questions</h5>
                      <p className="mb-0" style={{ color: '#4b5563' }}>
                        You haven't set up security questions yet. We recommend setting them up
                        to help recover your account if you forget your password.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="primary"
                  onClick={onShowSecurityQuestionsModal}
                  className="rounded-pill py-3 px-4 d-flex align-items-center"
                  style={{ 
                    background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                    border: 'none',
                    fontWeight: '600',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                    transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <ShieldLockFill className="me-2" size={20} />
                  Set Up Security Questions
                </Button>
              </Col>
            </Row>
          )}
        </div>
      </Card.Body>

      {/* Add custom animation for hover effects */}
      <style>
        {`
        @media (max-width: 767.98px) {
          .rounded-4 {
            border-radius: 1rem !important;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .card {
          animation: fadeIn 0.3s ease-out;
        }
        `}
      </style>
    </Card>
  );
};

export default SecuritySettings;