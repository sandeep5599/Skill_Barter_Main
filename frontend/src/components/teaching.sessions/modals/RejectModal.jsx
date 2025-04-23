import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const RejectModal = ({
  show,
  onHide,
  rejectionReason,
  setRejectionReason,
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
        <Modal.Title>Reject Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Rejection (Optional)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this request"
            />
            <Form.Text className="text-muted">
              This will be shared with the student to help them understand why their request was rejected.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={onSubmit}
          disabled={processing}
        >
          {processing ? <Spinner size="sm" animation="border" /> : 'Confirm Rejection'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RejectModal;