import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

const CompleteSessionModal = ({ 
  show, 
  onHide, 
  processing, 
  onConfirmCompletion 
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
        <p>After completion, both you and the student will be prompted to provide feedback.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={onConfirmCompletion}
          disabled={processing}
        >
          {processing ? <Spinner size="sm" animation="border" /> : 'Confirm Completion'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CompleteSessionModal;