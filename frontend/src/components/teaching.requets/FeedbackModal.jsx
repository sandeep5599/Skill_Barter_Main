import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { submitTeacherFeedback } from '../services/api.services';
import { toast } from 'react-toastify';

const TeacherFeedbackModal = ({
  show,
  onHide,
  sessionId,
  studentId,
  studentName,
  onFeedbackSubmitted
}) => {
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    privateNotes: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async () => {
    if (!feedback.comment.trim()) {
      setError('Please provide feedback comments');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      await submitTeacherFeedback(sessionId, {
        sessionId,
        studentId,
        rating: feedback.rating,
        comment: feedback.comment,
        privateNotes: feedback.privateNotes
      });
      
      toast.success('Feedback submitted successfully');
      onHide();
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Provide Feedback for {studentName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Rating (1-5 stars)</Form.Label>
            <Form.Select
              name="rating"
              value={feedback.rating}
              onChange={handleInputChange}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Feedback Comments (will be shared with the student)</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="comment"
              value={feedback.comment}
              onChange={handleInputChange}
              placeholder="Share your experience working with this student..."
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Private Notes (not shared with the student)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="privateNotes"
              value={feedback.privateNotes}
              onChange={handleInputChange}
              placeholder="Optional notes for your own reference or platform administrators..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={processing}
        >
          {processing ? <Spinner size="sm" animation="border" /> : 'Submit Feedback'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export { TeacherFeedbackModal };