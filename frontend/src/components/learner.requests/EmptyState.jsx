// components/common/EmptyState.js
import React from 'react';
import { Card, Button } from 'react-bootstrap';

const EmptyState = ({ navigate, actionPath, actionText }) => {
  return (
    <Card className="text-center my-5 border-0 shadow-sm bg-light py-5">
      <Card.Body className="p-5">
        <i className="bi bi-search display-1 mb-4 text-primary opacity-75"></i>
        <h3 className="fw-bold">No learning requests found</h3>
        <p className="text-muted mb-4 lead">Start by finding a teacher to learn from!</p>
        <Button variant="primary" size="lg" className="rounded-pill px-4 py-2 shadow" onClick={() => navigate(actionPath)}>
          <i className="bi bi-plus-circle-fill me-2"></i> {actionText}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default EmptyState;

