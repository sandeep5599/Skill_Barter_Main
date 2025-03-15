import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaGoogle, FaFacebook } from 'react-icons/fa';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have stored credentials
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const { token, user } = await login(credentials);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', credentials.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      authLogin(user, token);
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      
      // Simulate a delay to show success message
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      let errorMsg = 'Something went wrong. Please try again later.';
      if (err.response) errorMsg = err.response.data.msg || errorMsg;
      else if (err.request) errorMsg = 'Network error: Unable to reach the server.';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page bg-light">
      <Container fluid>
        <Row className="vh-100">
          {/* Left side - Login form */}
          <Col md={6} lg={5} xl={4} className="d-flex align-items-center">
            <Container className="py-5">
              <div className="text-center mb-5">
                <h1 className="fw-bold text-primary">SkillBarter</h1>
                <p className="text-muted">Exchange skills, grow together</p>
              </div>

              <Card className="border-0 shadow-sm rounded-3">
                <Card.Body className="p-4 p-md-5">
                  <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
                  
                  {message.text && (
                    <Alert 
                      variant={message.type} 
                      className="text-center animate__animated animate__fadeIn"
                    >
                      {message.text}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4" controlId="email">
                      <Form.Label>Email address</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light">
                          <FaEnvelope className="text-primary" />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email"
                          value={credentials.email}
                          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                          required
                          className="py-2"
                        />
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text className="bg-light">
                          <FaLock className="text-primary" />
                        </InputGroup.Text>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={credentials.password}
                          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                          required
                          className="py-2"
                        />
                        <InputGroup.Text 
                          className="bg-light cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer' }}
                        >
                          {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                        </InputGroup.Text>
                      </InputGroup>
                    </Form.Group>

                    <Row className="mb-4 align-items-center">
                      <Col>
                        <Form.Check
                          type="checkbox"
                          id="rememberMe"
                          label="Remember me"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                        />
                      </Col>
                      <Col className="text-end">
                        <Link to="/forgot-password" className="text-primary text-decoration-none small">
                          Forgot password?
                        </Link>
                      </Col>
                    </Row>

                    <div className="d-grid mb-4">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg" 
                        className="py-2"
                        disabled={loading}
                      >
                        {loading ? 'Logging in...' : 'Login'} <FaSignInAlt className="ms-2" />
                      </Button>
                    </div>

                    <div className="text-center mb-4">
                      <span className="text-muted">Don't have an account?</span>{' '}
                      <Link to="/register" className="text-primary fw-bold text-decoration-none">
                        Sign up
                      </Link>
                    </div>

                    {/* <div className="position-relative mb-4">
                      <hr />
                      <div className="position-absolute top-50 start-50 translate-middle bg-white px-3">
                        <span className="text-muted">OR</span>
                      </div>
                    </div> */}

                    {/* <Row className="g-2">
                      <Col>
                        <Button 
                          variant="outline-danger" 
                          className="w-100"
                        >
                          <FaGoogle className="me-2" /> Google
                        </Button>
                      </Col>
                      <Col>
                        <Button 
                          variant="outline-primary" 
                          className="w-100"
                        >
                          <FaFacebook className="me-2" /> Facebook
                        </Button>
                      </Col>
                    </Row> */}
                  </Form>
                </Card.Body>
              </Card>
            </Container>
          </Col>

          {/* Right side - Image and info */}
          <Col md={6} lg={7} xl={8} className="d-none d-md-flex align-items-center">
            <div className="position-relative w-100 h-100">
              <div 
                className="position-absolute w-100 h-100 bg-primary"
                style={{
                  backgroundImage: 'url(https://source.unsplash.com/random/1200x900/?skills,learning)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                }}
              ></div>
              <div 
                className="position-absolute w-100 h-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(65, 88, 208, 0.8) 0%, rgba(200, 80, 192, 0.8) 46%, rgba(255, 204, 112, 0.8) 100%)',
                  clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                }}
              ></div>
              <div className="position-absolute top-50 start-50 translate-middle text-white text-center" style={{ width: '80%' }}>
                <h2 className="display-4 fw-bold mb-4">Grow Your Skills</h2>
                <p className="lead mb-4">Join our community of learners and teachers to expand your horizons without financial barriers.</p>
                <div className="d-flex justify-content-center">
                  <div className="px-4 py-3 bg-white bg-opacity-10 rounded-3 backdrop-blur-sm">
                    <div className="d-flex align-items-center">
                      <div className="d-flex me-3">
                        <img src="/api/placeholder/40/40" className="rounded-circle border border-2 border-white" alt="" />
                        <img src="/api/placeholder/40/40" className="rounded-circle border border-2 border-white ms-n2" alt="" />
                        <img src="/api/placeholder/40/40" className="rounded-circle border border-2 border-white ms-n2" alt="" />
                      </div>
                      <div className="text-start">
                        <p className="mb-0 small">Join <strong>10,000+</strong> users</p>
                        <p className="mb-0 small">who are already learning</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS */}
      <style jsx>{`
        .login-page {
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
        .ms-n2 {
          margin-left: -0.5rem;
        }
      `}</style>
    </div>
  );
};

export default Login;