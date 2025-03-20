import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { PersonFill, BoxArrowRight } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';

const DashboardHeader = ({ handleLogout, navigate }) => {
  return (
    <Card className="mb-4 bg-gradient-primary shadow">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h1 className="text-primary fw-bold mb-0 fs-3">
              <span className="border-bottom border-3 border-primary pb-1">Skill Barter Platform</span>
            </h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <NotificationCenter />
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                className="d-flex align-items-center gap-2" 
                onClick={() => navigate('/profile')}
              >
                <PersonFill /> Profile
              </Button>
              <Button 
                variant="danger" 
                className="d-flex align-items-center gap-2" 
                onClick={handleLogout}
              >
                <BoxArrowRight /> Logout
              </Button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DashboardHeader;