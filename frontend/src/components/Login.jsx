import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Reset message on new submit
    
    try {
      const { token, user } = await login(credentials);
      authLogin(user, token);
      setMessage({ type: 'success', text: 'User logged in successfully!' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      let errorMsg = 'Something went wrong. Please try again later.';
      if (err.response) errorMsg = err.response.data.msg || errorMsg;
      else if (err.request) errorMsg = 'Network error: Unable to reach the server.';
      setMessage({ type: 'danger', text: errorMsg });
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2>
          {message.text && <Alert variant={message.type} className="text-center">{message.text}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </Form.Group>
            <div className="d-grid">
              <Button type="submit" variant="primary">Login</Button>
            </div>
          </Form>
          <p className="text-center mt-2">
            <small>Don't have an account? <Link to="/register">Create one</Link></small>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
