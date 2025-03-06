import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

const SessionScheduler = ({ onSchedule, initialTimeSlots = [] }) => {
  const [timeSlots, setTimeSlots] = useState(
    initialTimeSlots.length > 0
      ? initialTimeSlots.map(slot => ({
          startTime: new Date(slot.startTime).toISOString().slice(0, 16),
          endTime: new Date(slot.endTime).toISOString().slice(0, 16),
        }))
      : [{ startTime: '', endTime: '' }]
  );
  const [errors, setErrors] = useState([]);

  const addTimeSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
    } else {
      setErrors([...errors, 'You can propose a maximum of 5 time slots.']);
    }
  };

  const removeTimeSlot = (index) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (index, field, value) => {
    setTimeSlots(timeSlots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)));
  };

  const validateTimeSlots = () => {
    const newErrors = [];

    if (timeSlots.length === 0) {
      newErrors.push('At least one time slot is required.');
      return false;
    }

    timeSlots.forEach((slot, index) => {
      if (!slot.startTime || !slot.endTime) {
        newErrors.push(`Time slot ${index + 1}: Both start and end times are required.`);
      } else {
        const start = new Date(slot.startTime);
        const end = new Date(slot.endTime);

        if (end <= start) {
          newErrors.push(`Time slot ${index + 1}: End time must be after start time.`);
        }
        
        if (start < new Date()) {
          newErrors.push(`Time slot ${index + 1}: Start time cannot be in the past.`);
        }
        
        // Session should be at least 15 minutes
        const durationMinutes = (end - start) / (1000 * 60);
        if (durationMinutes < 15) {
          newErrors.push(`Time slot ${index + 1}: Session must be at least 15 minutes long.`);
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateTimeSlots()) {
      onSchedule(
        timeSlots.map(slot => ({
          startTime: new Date(slot.startTime).toISOString(),
          endTime: new Date(slot.endTime).toISOString(),
        }))
      );
    }
  };

  return (
    <Card className="shadow-sm p-3">
      <Card.Body>
        <Card.Title className="text-primary mb-2">Propose Time Slots</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">Suggest multiple options to increase chance of matching</Card.Subtitle>

        {errors.length > 0 && (
          <Alert variant="danger">
            <strong>Please fix the following issues:</strong>
            <ul className="mb-0">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
          </Alert>
        )}

        <Form id="sessionSchedulerForm" onSubmit={handleSubmit}>
          {timeSlots.map((slot, index) => (
            <Row key={index} className="mb-3 align-items-center">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Start Time {index + 1}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={slot.startTime}
                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>End Time {index + 1}</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={slot.endTime}
                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex justify-content-end">
                {timeSlots.length > 1 && (
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    className="mt-2"
                    onClick={() => removeTimeSlot(index)}
                  >
                    ✕
                  </Button>
                )}
              </Col>
            </Row>
          ))}

          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-primary" 
              onClick={addTimeSlot} 
              type="button"
              disabled={timeSlots.length >= 5}
            >
              + Add Another Time Option
            </Button>
            <Button variant="primary" type="submit">
              Submit Schedule
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SessionScheduler;