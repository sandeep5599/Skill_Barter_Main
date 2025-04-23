import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { formatDateTime } from '../../../utils/formatHelpers';
import { getEffectiveStatus } from '../../../utils/statusHelpers';

const SessionCreationModal = ({
  show,
  onHide,
  sessionDetails,
  selectedRequest,
  handleSessionDetailsChange,
  handleTimeSlotSelect,
  onSubmit,
  processing
}) => {
  if (!selectedRequest) return null;
  
  const effectiveStatus = getEffectiveStatus(selectedRequest);
  const isRescheduleAccepted = effectiveStatus === 'reschedule_accepted';
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isRescheduleAccepted ? 'Confirm Rescheduled Session' : 'Create Teaching Session'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Session Title</Form.Label>
            <Form.Control 
              type="text" 
              name="title"
              value={sessionDetails.title}
              onChange={handleSessionDetailsChange}
              placeholder="Enter a title for this session"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description"
              value={sessionDetails.description}
              onChange={handleSessionDetailsChange}
              placeholder="Describe what will be covered in this session"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Meeting Link</Form.Label>
            <Form.Control 
              type="text" 
              name="meetingLink"
              value={sessionDetails.meetingLink}
              onChange={handleSessionDetailsChange}
              placeholder="Zoom, Google Meet, or other video conferencing link"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Prerequisites</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={2}
              name="prerequisites"
              value={sessionDetails.prerequisites}
              onChange={handleSessionDetailsChange}
              placeholder="Any prerequisites the student should prepare before the session"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={2}
              name="notes"
              value={sessionDetails.notes}
              onChange={handleSessionDetailsChange}
              placeholder="Any additional notes or information for the student"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Select Time Slot</Form.Label>
            {selectedRequest?.timeSlots && selectedRequest.timeSlots.length > 0 ? (
              selectedRequest.timeSlots.map((slot, index) => (
                <div key={index} className="mb-2">
                  <Form.Check
                    type="radio"
                    id={`timeslot-${index}`}
                    label={`${formatDateTime(slot.startTime)} - ${formatDateTime(slot.endTime)}`}
                    name="timeSlot"
                    checked={sessionDetails.selectedTimeSlot && 
                            sessionDetails.selectedTimeSlot.startTime === slot.startTime}
                    onChange={() => handleTimeSlotSelect(slot)}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted">No time slots available</p>
            )}
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
          disabled={processing || !sessionDetails.selectedTimeSlot}
        >
          {processing ? <Spinner size="sm" animation="border" /> : 
            (isRescheduleAccepted ? 'Confirm Session' : 'Create Session')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionCreationModal;