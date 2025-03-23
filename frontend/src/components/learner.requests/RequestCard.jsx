// components/requests/RequestCard.js
import React, { useCallback, useState } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import TimeSlotsList from './TimeSlotsList';
import StatusBadge from './StatusBadge';
import ActionButtons from './ActionButtons';

const RequestCard = ({ request, navigate, handleStatusUpdate, isProcessing }) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [declineSubmitting, setDeclineSubmitting] = useState(false);

  const requestId = request._id || request.id;
  const sessionId = request.sessionId || requestId;

  // Handle accepting a time slot
  const handleAccept = () => {
    handleStatusUpdate(requestId, 'accepted');
  };

  // Handle declining a request
  const handleDeclineSubmit = async () => {
    setDeclineSubmitting(true);
    await handleStatusUpdate(requestId, 'rejected', rejectionReason);
    setDeclineSubmitting(false);
    setShowDeclineModal(false);
  };

  return (
    <>
      <Card className="mb-3 shadow-sm border-0 hover-shadow" 
        style={{ transition: 'all 0.3s ease' }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col xs={12} md={8}>
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3 shadow" 
                  style={{ 
                    width: 60, 
                    height: 60, 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    backgroundColor: request.status === 'accepted' ? '#198754' : 
                                   request.status === 'rejected' ? '#dc3545' : 
                                   request.status === 'pending' ? '#ffc107' : '#0d6efd'
                  }}>
                  {request.teacherName?.charAt(0).toUpperCase() || 
                   request.name?.charAt(0).toUpperCase() || "T"}
                </div>
                <div>
                  <h4 className="mb-1">{request.teacherName || request.name || "Unknown Teacher"}</h4>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-book me-2 text-primary"></i>
                    <span>{request.skillName || request.expertise || "Not specified"}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <strong className="me-2">Status:</strong> 
                  <StatusBadge status={request.status} />
                </div>
                
                <p className="mb-1">
                  <strong>Requested Time Slots:</strong>
                </p>
                <TimeSlotsList 
                  timeSlots={request.timeSlots} 
                  selectedTimeSlot={request.selectedTimeSlot} 
                />
                
                {request.rejectionReason && (
                  <div className="mt-2 p-2 bg-danger-subtle rounded">
                    <span className="text-danger">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <strong>Reason for rejection:</strong> {request.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
              
              <p className="mb-0 text-muted">
                <small>
                  <i className="bi bi-calendar-event me-2"></i>
                  Requested on: {new Date(request.createdAt).toLocaleDateString()}
                </small>
              </p>
            </Col>
            <Col xs={12} md={4} className="d-flex flex-column justify-content-center mt-3 mt-md-0">
              <ActionButtons 
                request={request}
                navigate={navigate}
                onAccept={handleAccept}
                onDecline={() => setShowDeclineModal(true)}
                isProcessing={isProcessing}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Decline Confirmation Modal */}
      <Modal show={showDeclineModal} onHide={() => setShowDeclineModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Decline Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to decline this request?</p>
          <Form.Group>
            <Form.Label>Reason (optional):</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Let the teacher know why you're declining..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeclineModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeclineSubmit}
            disabled={declineSubmitting}
          >
            {declineSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Submitting...</span>
              </>
            ) : 'Decline Request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RequestCard;