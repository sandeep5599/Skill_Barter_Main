import React, { useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const RescheduleModal = ({
  show,
  onHide,
  proposedDateTime,
  setProposedDateTime,
  proposedEndTime,
  setProposedEndTime,
  onSubmit,
  processing,
  selectedRequest // Add this prop to get access to the current request
}) => {
  // Initialize form fields with current times when modal opens
  useEffect(() => {
    if (show && selectedRequest) {
      // Extract current start and end times from the request
      const currentStartTime = selectedRequest.selectedTimeSlot?.startTime || 
                               selectedRequest.startTime;
      const currentEndTime = selectedRequest.selectedTimeSlot?.endTime || 
                             selectedRequest.endTime;
      
      // Format date for datetime-local input (YYYY-MM-DDThh:mm)
      if (currentStartTime) {
        const startDate = new Date(currentStartTime);
        setProposedDateTime(startDate.toISOString().slice(0, 16));
      }
      
      if (currentEndTime) {
        const endDate = new Date(currentEndTime);
        setProposedEndTime(endDate.toISOString().slice(0, 16));
      }
    }
  }, [show, selectedRequest, setProposedDateTime, setProposedEndTime]);

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
        {selectedRequest && (
          <Alert variant="info" className="mb-3">
            <strong>Currently Scheduled:</strong>
            <div>
              {selectedRequest.selectedTimeSlot?.startTime || selectedRequest.startTime ? (
                <>
                  <strong>Start:</strong> {new Date(selectedRequest.selectedTimeSlot?.startTime || selectedRequest.startTime).toLocaleString()}
                </>
              ) : "No start time set"}
            </div>
            <div>
              {selectedRequest.selectedTimeSlot?.endTime || selectedRequest.endTime ? (
                <>
                  <strong>End:</strong> {new Date(selectedRequest.selectedTimeSlot?.endTime || selectedRequest.endTime).toLocaleString()}
                </>
              ) : "No end time set"}
            </div>
          </Alert>
        )}
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