// components/requests/RequestsList.js
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import RequestCard from './RequestCard';

const RequestsList = ({ requests, navigate, handleStatusUpdate, processingIds }) => {
  return (
    <Row className="g-3">
      {requests.map(request => (
        <Col key={request._id || request.id} xs={12}>
          <RequestCard 
            request={request}
            navigate={navigate}
            handleStatusUpdate={handleStatusUpdate}
            isProcessing={processingIds.includes(request._id || request.id)}
          />
        </Col>
      ))}
    </Row>
  );
};

export default RequestsList;