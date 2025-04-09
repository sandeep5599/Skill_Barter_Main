import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col, InputGroup, Accordion } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaGlobe, FaShieldAlt } from 'react-icons/fa';

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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    securityQuestions: [
      { question: SECURITY_QUESTIONS[0], answer: '' },
      { question: SECURITY_QUESTIONS[1], answer: '' }
    ]
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'danger', text: 'Passwords do not match. Please ensure both passwords are identical.' });
    }

    // Validate security questions
    const hasEmptyAnswers = formData.securityQuestions.some(q => !q.answer.trim());
    if (hasEmptyAnswers) {
      return setMessage({ type: 'danger', text: 'Please answer all security questions. They are required for account recovery.' });
    }

    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        securityQuestions: formData.securityQuestions
      });

      login(response.data);
      setMessage({ type: 'success', text: 'User successfully created! Redirecting to login...' });
      
      // Simulate a delay to show success message
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed. Please try again.';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.securityQuestions];
    updatedQuestions[index][field] = value;
    setFormData({
      ...formData,
      securityQuestions: updatedQuestions
    });
  };

  const formFields = [
    { 
      id: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      icon: <FaUser className="text-primary" />
    },
    { 
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      icon: <FaEnvelope className="text-primary" />
    },
    { 
      id: 'country',
      label: 'Country',
      type: 'select',
      placeholder: 'Select your country',
      icon: <FaGlobe className="text-primary" />,
      options: COUNTRIES
    },
    { 
      id: 'password',
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Create a strong password',
      icon: <FaLock className="text-primary" />,
      toggleIcon: showPassword ? 
        <FaEyeSlash className="text-muted" onClick={() => setShowPassword(!showPassword)} /> : 
        <FaEye className="text-muted" onClick={() => setShowPassword(!showPassword)} />
    },
    { 
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: showConfirmPassword ? 'text' : 'password',
      placeholder: 'Confirm your password',
      icon: <FaLock className="text-primary" />,
      toggleIcon: showConfirmPassword ? 
        <FaEyeSlash className="text-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : 
        <FaEye className="text-muted" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
    }
  ];

  return (
    <div className="register-page bg-light">
      <Container fluid>
        <Row className="vh-100">
          {/* Left side - Image and info */}
          <Col md={6} lg={7} xl={8} className="d-none d-md-flex align-items-center">
            <div className="position-relative w-100 h-100">
              <div 
                className="position-absolute w-100 h-100 bg-primary"
                style={{
                  backgroundImage: 'url(https://source.unsplash.com/random/1200x900/?skills,teaching)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0 100%)',
                }}
              ></div>
              <div 
                className="position-absolute w-100 h-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(65, 88, 208, 0.8) 0%, rgba(200, 80, 192, 0.8) 46%, rgba(255, 204, 112, 0.8) 100%)',
                  clipPath: 'polygon(0 0, 90% 0, 100% 100%, 0 100%)',
                }}
              ></div>
              <div className="position-absolute top-50 start-50 translate-middle text-white text-center" style={{ width: '80%' }}>
                <h2 className="display-4 fw-bold mb-4">Join Our Community</h2>
                <p className="lead mb-4">Share your knowledge and expertise with others while gaining new skills from talented individuals.</p>
                <div className="d-flex justify-content-center">
                  <div className="px-4 py-3 bg-white bg-opacity-10 rounded-3 backdrop-blur-sm">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <div className="display-6 fw-bold">500+</div>
                        <div className="small">Skills exchanged</div>
                      </div>
                      <div className="vr bg-white opacity-25 mx-3 h-100"></div>
                      <div>
                        <div className="display-6 fw-bold">10k+</div>
                        <div className="small">Active members</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right side - Registration form */}
          <Col md={6} lg={5} xl={4} className="d-flex align-items-center">
            <Container className="py-5">
              <div className="text-center mb-5">
                <h1 className="fw-bold text-primary">SkillBarter</h1>
                <p className="text-muted">Exchange skills, grow together</p>
              </div>

              <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="p-4 p-md-5">
                  <h2 className="text-center mb-4 fw-bold">Create Account</h2>
                  
                  {message.text && (
                    <Alert 
                      variant={message.type} 
                      className="text-center animate__animated animate__fadeIn"
                    >
                      {message.text}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    {formFields.map((field) => (
                      <Form.Group className="mb-4" controlId={field.id} key={field.id}>
                        <Form.Label>{field.label}</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-light">
                            {field.icon}
                          </InputGroup.Text>
                          {field.type === 'select' ? (
                            <Form.Select
                              placeholder={field.placeholder}
                              value={formData[field.id]}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              required
                              className="py-2"
                            >
                              <option value="">Select your country</option>
                              {field.options.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                              ))}
                            </Form.Select>
                          ) : (
                            <Form.Control
                              type={field.type}
                              placeholder={field.placeholder}
                              value={formData[field.id]}
                              onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                              required
                              className="py-2"
                            />
                          )}
                          {field.toggleIcon && (
                            <InputGroup.Text 
                              className="bg-light cursor-pointer"
                              style={{ cursor: 'pointer' }}
                            >
                              {field.toggleIcon}
                            </InputGroup.Text>
                          )}
                        </InputGroup>
                      </Form.Group>
                    ))}

                    {/* Security Questions Section */}
                    <Accordion className="mb-4">
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <div className="d-flex align-items-center">
                            <FaShieldAlt className="text-primary me-2" />
                            <span>Security Questions (Required)</span>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <p className="text-muted small mb-3">
                            Security questions help you recover your account if you forget your password.
                            Choose questions you can easily remember but others cannot guess.
                          </p>
                          
                          {formData.securityQuestions.map((q, index) => (
                            <div key={index} className="mb-3">
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
                                  Remember your answer exactly as typed.
                                </Form.Text>
                              </Form.Group>
                            </div>
                          ))}
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>

                    <div className="d-grid mb-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg" 
                        className="py-2"
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Create Account'} <FaUserPlus className="ms-2" />
                      </Button>
                    </div>

                    <div className="text-center">
                      <span className="text-muted">Already have an account?</span>{' '}
                      <Link to="/login" className="text-primary fw-bold text-decoration-none">
                        Login
                      </Link>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Container>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS */}
      <style jsx>{`
        .register-page {
          min-height: 100vh;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .bg-opacity-10 {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .backdrop-blur-sm {
          backdrop-filter: blur(4px);
        }
      `}</style>
    </div>
  );
};

export default Register;