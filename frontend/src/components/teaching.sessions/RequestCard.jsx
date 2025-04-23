import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Clock, Calendar3, PersonFill, BookFill, InfoCircleFill, ExclamationTriangleFill } from 'react-bootstrap-icons';
import ActionButtons from './ActionButtons';
import { formatDateTime } from '../../utils/formatHelpers';
import { getEffectiveStatus } from '../../utils/statusHelpers';

const RequestCard = ({ 
  request, 
  processing, 
  toggleModal, 
  navigate 
}) => {
  if (!request) return null;
  
  const effectiveStatus = getEffectiveStatus(request);
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'primary', text: 'Pending' },
      accepted: { bg: 'success', text: 'Accepted' },
      scheduled: { bg: 'info', text: 'Scheduled' },
      completed: { bg: 'secondary', text: 'Completed' },
      rejected: { bg: 'danger', text: 'Rejected' },
      rescheduled: { bg: 'warning', text: 'Rescheduled' },
      canceled: { bg: 'dark', text: 'Canceled' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge 
        bg={config.bg} 
        className="rounded-pill px-3 py-2"
        style={{ fontSize: '0.8rem' }}
      >
        {config.text}
      </Badge>
    );
  };

  return (
    <Card 
      className="border-0 shadow-sm rounded-4 h-100 overflow-hidden" 
      style={{ transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out' }}
    >
      {/* Card Header with gradient background */}
      <div 
        className="px-4 pt-4 pb-3"
        style={{ 
          background: effectiveStatus === 'pending' 
            ? 'linear-gradient(135deg, #3b82f6, #1e40af)' 
            : effectiveStatus === 'accepted' || effectiveStatus === 'scheduled'
              ? 'linear-gradient(135deg, #10b981, #047857)'
              : effectiveStatus === 'completed'
                ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                : 'linear-gradient(135deg, #64748b, #334155)',
          color: 'white'
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="fw-bold mb-1">{request.skillName || request.expertise || "Teaching Request"}</h5>
            <div className="d-flex align-items-center">
              <PersonFill className="me-1" />
              <small>{request.studentName || "Student"}</small>
            </div>
          </div>
          <div>
            {getStatusBadge(effectiveStatus)}
          </div>
        </div>
      </div>
      
      <Card.Body className="p-4">
        {/* Request Details */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" 
              style={{ 
                width: '24px', 
                height: '24px', 
                background: '#f0f9ff',
                color: '#0c4a6e'
              }}
            >
              <InfoCircleFill size={14} />
            </div>
            <h6 className="fw-bold mb-0">Request Details</h6>
          </div>
          <div className="ps-4">
            <p className="mb-2 text-secondary">{request.message || "No additional details provided."}</p>
            
            {request.topic && (
              <div className="mb-2">
                <div className="d-flex align-items-center">
                  <BookFill className="me-2 text-primary" size={14} />
                  <span className="fw-semibold">Topic:</span>
                </div>
                <p className="ps-4 mb-0 text-secondary">{request.topic}</p>
              </div>
            )}
            
            {request.additionalNotes && (
              <div className="mb-2">
                <div className="d-flex align-items-center">
                  <InfoCircleFill className="me-2 text-primary" size={14} />
                  <span className="fw-semibold">Additional Notes:</span>
                </div>
                <p className="ps-4 mb-0 text-secondary">{request.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Time Slots */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" 
              style={{ 
                width: '24px', 
                height: '24px', 
                background: '#f0f9ff',
                color: '#0c4a6e'
              }}
            >
              <Clock size={14} />
            </div>
            <h6 className="fw-bold mb-0">Time Slots</h6>
          </div>
          
          <div className="ps-4">
            {request.timeSlots && request.timeSlots.length > 0 ? (
              <div className="row g-2">
                {request.timeSlots.map((slot, index) => (
                  <div key={index} className="col-12 col-md-6">
                    <Card className="bg-light border-0 p-2 mb-2">
                      <div className="d-flex align-items-center mb-1">
                        <Calendar3 className="me-2 text-primary" size={14} />
                        <small className="fw-semibold">{formatDateTime(slot.startTime, 'date')}</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <Clock className="me-2 text-primary" size={14} />
                        <small>{formatDateTime(slot.startTime, 'time')} - {formatDateTime(slot.endTime, 'time')}</small>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No specific time slots proposed</p>
            )}
          </div>
        </div>
        
        {/* Rejection Reason */}
        {request.rejectionReason && (
          <div className="mb-3">
            <div className="alert alert-warning border-0 rounded-3 p-3">
              <div className="d-flex">
                <ExclamationTriangleFill className="text-warning me-2 flex-shrink-0" size={18} />
                <div>
                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Rescheduled Information */}
        {effectiveStatus === 'rescheduled' && request.selectedTimeSlot && (
          <div className="mb-3">
            <div className="alert alert-info border-0 rounded-3 p-3">
              <div className="d-flex">
                <Calendar3 className="text-info me-2 flex-shrink-0" size={18} />
                <div>
                  <strong>Rescheduled Time:</strong>
                  <div>{formatDateTime(request.selectedTimeSlot.startTime)}</div>
                  <div>{formatDateTime(request.selectedTimeSlot.endTime)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
      
      {/* Card Footer with Action Buttons */}
      <Card.Footer className="bg-white border-0 p-3">
        <ActionButtons 
          request={request}
          processing={processing}
          toggleModal={toggleModal}
          navigate={navigate}
          getEffectiveStatus={getEffectiveStatus}
        />
      </Card.Footer>
    </Card>
  );
};

export default RequestCard;