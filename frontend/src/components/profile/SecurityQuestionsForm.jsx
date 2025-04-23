import React from 'react';
import { Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { SECURITY_QUESTIONS } from './shared/constants';
import { ShieldLockFill, KeyFill, CheckCircleFill } from 'react-bootstrap-icons';

const SecurityQuestionsForm = ({
  securityQuestions,
  onSecurityQuestionChange,
  onSubmit,
  error
}) => {
  return (
    <Card className="shadow-lg border-0 rounded-4 overflow-hidden" style={{ background: '#f8fafc' }}>
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
            <h2 className="mb-0" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>Security Questions</h2>
            <p className="text-white-50 mb-0">Protect your account with personal verification</p>
          </div>
        </div>
      </div>

      <Card.Body className="p-4 bg-white">
        <Form onSubmit={onSubmit}>
          {error && (
            <Alert 
              variant="danger" 
              className="rounded-3 border-0 shadow-sm"
              style={{ 
                background: 'linear-gradient(to right, #fee2e2, #fecaca)',
                borderLeft: '4px solid #ef4444'
              }}
            >
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    background: '#ef4444',
                    color: 'white'
                  }}>
                  !
                </div>
                {error}
              </div>
            </Alert>
          )}

          <div className="mb-4 p-3 rounded-3" style={{ background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)' }}>
            <div className="d-flex">
              <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: '#0ea5e9',
                  color: 'white',
                  flexShrink: 0
                }}>
                <KeyFill size={16} />
              </div>
              <p className="text-muted mb-0" style={{ color: '#0c4a6e' }}>
                Security questions will help you recover your account if you forget your password.
                Choose questions you can easily remember but others cannot guess.
              </p>
            </div>
          </div>

          <Row className="gx-4">
            {securityQuestions.map((q, index) => (
              <Col md={12} lg={4} key={index} className="mb-4">
                <Card className="h-100 border-0 shadow-sm rounded-4" style={{ background: index === 0 ? 'linear-gradient(to right, #f0f9ff, #dbeafe)' : 
                                                                            index === 1 ? 'linear-gradient(to right, #f0fdf4, #dcfce7)' :
                                                                            'linear-gradient(to right, #fdf2f8, #fce7f3)' }}>
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          background: index === 0 ? '#3b82f6' : 
                                      index === 1 ? '#10b981' : 
                                      '#ec4899',
                          color: 'white',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                        {index + 1}
                      </div>
                      <h6 className="fw-bold mb-0" style={{ color: index === 0 ? '#1e40af' : 
                                                                  index === 1 ? '#047857' : 
                                                                  '#be185d' }}>
                        Question {index + 1}
                      </h6>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px', color: '#64748b' }}>
                        Select Question
                      </Form.Label>
                      <Form.Select
                        value={q.question}
                        onChange={(e) => onSecurityQuestionChange(index, 'question', e.target.value)}
                        required
                        className="rounded-3 border-0 shadow-sm"
                        style={{ fontSize: '0.95rem', padding: '0.6rem 1rem' }}
                      >
                        {SECURITY_QUESTIONS.map((question, qIdx) => (
                          <option key={qIdx} value={question}>{question}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group>
                      <Form.Label className="fw-semibold small text-uppercase" style={{ letterSpacing: '0.5px', color: '#64748b' }}>
                        Your Answer
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={q.answer}
                        onChange={(e) => onSecurityQuestionChange(index, 'answer', e.target.value)}
                        placeholder="Enter your answer here"
                        required
                        className="rounded-3 border-0 shadow-sm"
                        style={{ fontSize: '0.95rem', padding: '0.6rem 1rem' }}
                      />
                      <Form.Text style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        Answers are case-insensitive. Remember your answers exactly.
                      </Form.Text>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mt-2 d-grid gap-2">
            <Button 
              type="submit"
              className="rounded-pill py-3 d-flex align-items-center justify-content-center position-relative" 
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
              }}
            >
              <CheckCircleFill size={18} className="me-2" />
              <span className="fw-semibold">Save Security Questions</span>
            </Button>
            <div className="text-center mt-2">
              <small className="text-muted">
                Your security is our priority. These questions will help verify your identity.
              </small>
            </div>
          </div>
        </Form>
      </Card.Body>

      {/* Add custom animation for the glowing effect */}
      <style>
        {`
        @media (max-width: 767.98px) {
          .rounded-4 {
            border-radius: 1rem !important;
          }
        }
        
        .form-control:focus, .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
        }
        
        .form-control, .form-select {
          transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
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

export default SecurityQuestionsForm;