import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';

const SessionCreationForm = ({ match, onSubmit, onCancel, processing = false }) => {
  const [sessionDetails, setSessionDetails] = useState({
    title: `${match.skillName || 'Tutoring'} Session`,
    description: '',
    meetingLink: '',
    prerequisites: '',
    notes: '',
    selectedTimeSlot: match.proposedTimeSlots && match.proposedTimeSlots.length > 0 
      ? match.proposedTimeSlots[0] 
      : null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSessionDetails({
      ...sessionDetails,
      [name]: value
    });
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSessionDetails({
      ...sessionDetails,
      selectedTimeSlot: timeSlot
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(sessionDetails);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Session Title</Form.Label>
        <Form.Control
          name="title"
          value={sessionDetails.title}
          onChange={handleChange}
          required
          placeholder="E.g. Introduction to Python, Guitar Basics, etc."
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={sessionDetails.description}
          onChange={handleChange}
          placeholder="What will be covered in this session?"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Meeting Link (optional)</Form.Label>
        <Form.Control
          name="meetingLink"
          value={sessionDetails.meetingLink}
          onChange={handleChange}
          placeholder="Zoom/Google Meet link"
        />
        <Form.Text className="text-muted">
          You can add this now or update it later
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Prerequisites</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="prerequisites"
          value={sessionDetails.prerequisites}
          onChange={handleChange}
          placeholder="What should the student prepare or know beforehand?"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Additional Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          name="notes"
          value={sessionDetails.notes}
          onChange={handleChange}
          placeholder="Any other information the student should know"
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Select Time Slot</Form.Label>
        {match.proposedTimeSlots && match.proposedTimeSlots.map((slot, index) => (
          <Form.Check
            key={index}
            type="radio"
            id={`slot-${index}`}
            label={`${formatDateTime(slot.startTime)} - ${formatDateTime(slot.endTime)}`}
            checked={sessionDetails.selectedTimeSlot === slot}
            onChange={() => handleTimeSlotSelect(slot)}
            className="mb-2"
          />
        ))}
      </Form.Group>
      
      <div className="d-flex justify-content-end gap-2 mt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={processing}>
          {processing ? <Spinner size="sm" animation="border" className="me-2" /> : null}
          Create Session
        </Button>
      </div>
    </Form>
  );
};

export default SessionCreationForm;