import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: New Password
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error requesting password reset');
      }
      
      // Store questions and reset token
      setQuestions(data.questions);
      setResetToken(data.resetToken);
      setAnswers(new Array(data.questions.length).fill(''));
      setStep(2);
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };
  
  const handleVerifyQuestions = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-security-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, answers }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify security questions');
      }
      
      // Store verification token
      setVerificationToken(data.verificationToken);
      setStep(3);
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'danger' });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters long', type: 'danger' });
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          verificationToken,
          newPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      setMessage({ text: 'Password reset successful! You can now login with your new password.', type: 'success' });
      setStep(4);
    } catch (error) {
      setMessage({ text: error.message, type: 'danger' });
    }
  };
  
  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };
  
  return (
    <Container className="mt-5">
      <Card className="mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Reset Password</h4>
        </Card.Header>
        <Card.Body>
          {message.text && (
            <Alert variant={message.type}>
              {message.text}
            </Alert>
          )}
          
          {step === 1 && (
            <Form onSubmit={handleRequestReset}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
                <Form.Text className="text-muted">
                  We'll send you security questions to reset your password.
                </Form.Text>
              </Form.Group>
              <Button variant="primary" type="submit">
                Request Password Reset
              </Button>
            </Form>
          )}
          
          {step === 2 && (
            <Form onSubmit={handleVerifyQuestions}>
              <h5 className="mb-3">Answer Your Security Questions</h5>
              {questions.map((q, index) => (
                <Form.Group key={index} className="mb-3">
                  <Form.Label>{q.question}</Form.Label>
                  <Form.Control
                    type="text"
                    value={answers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Your answer"
                    required
                  />
                </Form.Group>
              ))}
              <Button variant="primary" type="submit">
                Verify Answers
              </Button>
            </Form>
          )}
          
          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <h5 className="mb-3">Set New Password</h5>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <Form.Text className="text-muted">
                  Password must be at least 8 characters long.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Reset Password
              </Button>
            </Form>
          )}
          
          {step === 4 && (
            <div className="text-center">
              <p>Your password has been reset successfully!</p>
              <Button variant="primary" href="/login">
                Go to Login
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PasswordReset;