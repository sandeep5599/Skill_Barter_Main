import React, { useState } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ArrowClockwise } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';

const DashboardHeader = ({ handleLogout, navigate, triggerRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await triggerRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
              {/* Refresh Button with Loading State */}
              <Button 
                variant="primary" 
                className="d-flex align-items-center gap-2" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <Spinner 
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ArrowClockwise className={`${isRefreshing ? 'spinning' : ''}`} /> Refresh
                  </>
                )}
              </Button>
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