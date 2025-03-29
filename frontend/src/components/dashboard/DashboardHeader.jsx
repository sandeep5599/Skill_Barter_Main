import React, { useState } from 'react';
import { Card, Button, Spinner, Dropdown } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ArrowClockwise, ThreeDotsVertical } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';
import useResponsive from '../../hooks/useResponsive';  // Changed from named to default import
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';

const ResponsiveHeader = styled(Card)`
  .header-content {
    flex-direction: row;
    
    @media (max-width: ${breakpoints.sm}px) {
      flex-direction: column;
      gap: 1rem;
    }
  }

  .title {
    @media (max-width: ${breakpoints.sm}px) {
      font-size: 1.5rem;
    }
  }

  .actions-container {
    @media (max-width: ${breakpoints.md}px) {
      display: none;
    }
  }

  .mobile-menu {
    display: none;
    @media (max-width: ${breakpoints.md}px) {
      display: block;
    }
  }
`;

const DashboardHeader = ({ handleLogout, navigate, triggerRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isMobile, isTablet } = useResponsive();

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

  const renderActions = () => (
    <>
      <Button 
        variant="primary" 
        className="d-flex align-items-center gap-2" 
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
            {!isMobile && 'Refreshing...'}
          </>
        ) : (
          <>
            <ArrowClockwise /> {!isMobile && 'Refresh'}
          </>
        )}
      </Button>
      <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => navigate('/profile')}>
        <PersonFill /> {!isMobile && 'Profile'}
      </Button>
      <Button variant="danger" className="d-flex align-items-center gap-2" onClick={handleLogout}>
        <BoxArrowRight /> {!isMobile && 'Logout'}
      </Button>
    </>
  );

  const renderMobileMenu = () => (
    <Dropdown align="end">
      <Dropdown.Toggle variant="primary" id="mobile-menu">
        <ThreeDotsVertical />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={handleRefresh}>
          <ArrowClockwise className="me-2" /> Refresh
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate('/profile')}>
          <PersonFill className="me-2" /> Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={handleLogout}>
          <BoxArrowRight className="me-2" /> Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <ResponsiveHeader className="mb-4 bg-gradient-primary shadow">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center header-content">
          <div className="d-flex align-items-center">
            <h1 className="text-primary fw-bold mb-0 fs-3 title">
              <span className="border-bottom border-3 border-primary pb-1">
                {isMobile ? 'Skill Barter' : 'Skill Barter Platform'}
              </span>
            </h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <NotificationCenter />
            <div className="d-flex gap-2 actions-container">
              {renderActions()}
            </div>
            <div className="mobile-menu">
              {renderMobileMenu()}
            </div>
          </div>
        </div>
      </Card.Body>
    </ResponsiveHeader>
  );
};

export default DashboardHeader;