import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'danger', text: 'Passwords do not match. Please ensure both passwords are identical.' });
    }

    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      login(response.data);
      setMessage({ type: 'success', text: 'User successfully created! Redirecting to login...' });

      setTimeout(() => navigate('/login'), 1500);

    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed. Please try again.';
      setMessage({ type: 'danger', text: errorMsg });
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow p-4" style={{ width: '100%', maxWidth: '400px', border: '2px solid #ced4da' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>

          {message.text && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleSubmit}>
            {['name', 'email', 'password', 'confirmPassword'].map((field, index) => (
              <Form.Group key={index} className="mb-3">
                <Form.Label>{field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                <Form.Control
                  type={field.includes('password') ? 'password' : 'text'}
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  required
                />
              </Form.Group>
            ))}

            <Button type="submit" variant="primary" className="w-100">Register</Button>
          </Form>

          <p className="text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
