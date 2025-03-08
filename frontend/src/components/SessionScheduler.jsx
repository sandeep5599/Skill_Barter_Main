import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert} from 'react-bootstrap';
import { Trash, XCircle } from 'react-bootstrap-icons';
import { FaTimes } from 'react-icons/fa';




const SessionScheduler = ({ onSchedule,submitting , initialTimeSlots = [] }) => {
  const getNextHour = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 10);
  };

  const getDefaultTime = (offset = 0) => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1 + offset);
    return now.toISOString().slice(11, 16);
  };

  const [timeSlots, setTimeSlots] = useState(
    initialTimeSlots.length > 0
      ? initialTimeSlots.map(slot => ({
          date: new Date(slot.startTime).toISOString().slice(0, 10),
          startTime: new Date(slot.startTime).toISOString().slice(11, 16),
          endTime: new Date(slot.endTime).toISOString().slice(11, 16),
        }))
      : [{ date: getNextHour(), startTime: getDefaultTime(), endTime: getDefaultTime(1) }]
  );
  const [errors, setErrors] = useState({});

  const addTimeSlot = () => {
    if (timeSlots.length < 5) {
      setTimeSlots([...timeSlots, { date: getNextHour(), startTime: getDefaultTime(), endTime: getDefaultTime(1) }]);
    }
  };

  const removeTimeSlot = (index) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (index, field, value) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][field] = value;
    setTimeSlots(updatedSlots);
    validateTimeSlots(updatedSlots);
  };

  const validateTimeSlots = (slots) => {
    let newErrors = {};
    slots.forEach((slot, index) => {
      const start = new Date(`${slot.date}T${slot.startTime}`);
      const end = new Date(`${slot.date}T${slot.endTime}`);

      if (end <= start) {
        newErrors[index] = 'End time must be after start time.';
      } else if (start < new Date()) {
        newErrors[index] = 'Start time cannot be in the past.';
      } else if ((end - start) / (1000 * 60) < 15) {
        newErrors[index] = 'Session must be at least 15 minutes long.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateTimeSlots(timeSlots)) {
      onSchedule(
        timeSlots.map(slot => ({
          startTime: new Date(`${slot.date}T${slot.startTime}`).toISOString(),
          endTime: new Date(`${slot.date}T${slot.endTime}`).toISOString(),
        }))
      );
    }
  };

  return (
    <Card className="shadow-sm p-3">
      <Card.Body>
        <Card.Title className="text-primary mb-2">Propose Time Slots</Card.Title>
        <Card.Subtitle className="mb-3 text-muted">Suggest multiple options to increase the chance of matching</Card.Subtitle>

        <Form id="sessionSchedulerForm" onSubmit={handleSubmit}>
          {timeSlots.map((slot, index) => (
            <Row key={index} className="mb-3 align-items-center">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={slot.date}
                    onChange={(e) => handleTimeChange(index, 'date', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-center">
                {timeSlots.length > 1 && (
                  <Button variant="primary" size="sm" onClick={() => removeTimeSlot(index)}>
                   <Trash size={16} />
                  </Button>
                
                )}
              </Col>
              {errors[index] && <Col md={12}><Alert variant="danger" className="mt-2">{errors[index]}</Alert></Col>}
            </Row>
          ))}

          <div className="d-flex justify-content-between mt-3">
            <Button 
              variant="primary" 
              onClick={addTimeSlot} 
              type="button"
              disabled={timeSlots.length >= 3}
            >
              + Add Another Time Option
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Schedule'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SessionScheduler;
