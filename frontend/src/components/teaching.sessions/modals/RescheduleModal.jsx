import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const RescheduleModal = ({
  show,
  onHide,
  proposedDateTime,
  setProposedDateTime,
  proposedEndTime,
  setProposedEndTime,
  onSubmit,
  processing
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Propose New Time</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Proposed Start Time</Form.Label>
            <Form.Control 
              type="datetime-local" 
              value={proposedDateTime}
              onChange={(e) => setProposedDateTime(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Proposed End Time</Form.Label>
            <Form.Control 
              type="datetime-local" 
              value={proposedEndTime}
              onChange={(e) => setProposedEndTime(e.target.value)}
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
          onClick={onSubmit}
          disabled={processing || !proposedDateTime || !proposedEndTime}
        >
          {processing ? <Spinner size="sm" animation="border" /> : 'Submit Proposal'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RescheduleModal;