import React from 'react';
import { Card, Button } from 'react-bootstrap';
import NotificationCenter from '../NotificationCenter';

const Header = ({ title, logout, navigate }) => {
  return (
    <Card className="mb-4 bg-light shadow-sm">
      <Card.Body className="d-flex justify-content-between align-items-center">
        <h1 className="mb-0">{title}</h1>
        <div className="d-flex align-items-center">
          <NotificationCenter />
          <div className="ms-3">
            <Button variant="primary" className="me-2" onClick={() => navigate('/dashboard')}>
              <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Button>
            <Button variant="primary" className="me-2" onClick={() => navigate('/profile')}>
              <i className="bi bi-person-circle me-2"></i> Profile
            </Button>
            <Button variant="danger" onClick={() => logout() && navigate('/')}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export  default Header;