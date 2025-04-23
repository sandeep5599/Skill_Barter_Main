import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import SecurityQuestionsForm from '../SecurityQuestionsForm';
import { ShieldLockFill } from 'react-bootstrap-icons';

const SecurityQuestionsModal = ({ 
  show, 
  onHide, 
  securityQuestions, 
  onSecurityQuestionChange, 
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
                <ShieldLockFill size={20} />
              </div>
              Set Security Questions
            </h4>
            <p className="text-white-50 small mb-0 mt-2">Enhance your account recovery options</p>
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
        <SecurityQuestionsForm 
          securityQuestions={securityQuestions}
          onSecurityQuestionChange={onSecurityQuestionChange}
          onSubmit={onSubmit}
          error={error}
        />
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

export default SecurityQuestionsModal;