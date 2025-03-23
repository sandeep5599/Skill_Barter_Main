// src/components/FeedbackModals.js
import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { submitTeacherFeedback, submitStudentFeedback } from '../services/api.services';
import { toast } from 'react-toastify';

// Star Rating Component
export const StarRating = ({ rating, onRatingChange, disabled = false }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="d-flex align-items-center mb-3">
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !disabled && onRatingChange(star)}
          className={`fs-3 ${disabled ? '' : 'cursor-pointer'}`}
          style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', marginRight: '5px' }}
        >
          ★
        </span>
      ))}
      <span className="ms-2 text-muted">({rating || 0} of 5)</span>
    </div>
  );
};

// Teacher Feedback Modal (feedback only, no rating)
export const TeacherFeedbackModal = ({ show, onHide, sessionId, sessionTitle, onFeedbackSubmitted }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      await submitTeacherFeedback(sessionId, feedback);
      
      toast.success('Feedback submitted successfully!');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Provide Feedback for Session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p className="mb-3">
          <strong>Session:</strong> {sessionTitle}
        </p>
        
        <Form.Group className="mb-3">
          <Form.Label>Your Feedback for the Student</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts on the student's engagement, progress, and areas for improvement..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting || !feedback.trim()}
        >
          {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Submit Feedback'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Student Feedback Modal (includes rating and feedback)
export const StudentFeedbackModal = ({ show, onHide, sessionId, sessionTitle, teacherName, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await submitStudentFeedback(sessionId, rating, feedback);
      
      toast.success('Feedback and rating submitted successfully!');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      onHide();
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rate and Review Your Session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p className="mb-3">
          <strong>Session:</strong> {sessionTitle}<br />
          <strong>Teacher:</strong> {teacherName}
        </p>
        
        <Form.Group className="mb-3">
          <Form.Label><strong>Rate Your Experience</strong></Form.Label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Your Feedback</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts on the teacher's effectiveness, clarity, and any other feedback..."
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Submit Review'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};