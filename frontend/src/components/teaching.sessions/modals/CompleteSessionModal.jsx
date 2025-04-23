import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const CompleteSessionModal = ({
  show,
  onHide,
  onSubmit,
  processing,
  feedbackText,
  setFeedbackText
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Complete Session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to mark this session as completed?</p>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Session Feedback (Optional)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Provide feedback about this session"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={onSubmit}
          disabled={processing}
        >
          {processing ? <Spinner size="sm" animation="border" /> : 'Confirm Completion'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompleteSessionModal;