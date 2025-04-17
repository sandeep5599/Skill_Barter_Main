import React from 'react';
import { Card, Button, Dropdown, Nav } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ThreeDotsVertical } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';
import useResponsive from '../../hooks/useResponsive';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import NavbarSearchDropdown from '../search/NavbarSearchDropdown';

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

  .desktop-actions {
    display: flex;
    gap: 2px;
    
    @media (max-width: ${breakpoints.md}px) {
      display: none !important;
    }
  }

  .mobile-menu {
    display: none;
    
    @media (max-width: ${breakpoints.md}px) {
      display: flex !important;
    }
  }

  .search-notification-container {
    display: flex;
    align-items: center;
    
    @media (max-width: ${breakpoints.sm}px) {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .right-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    @media (max-width: ${breakpoints.sm}px) {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .search-icon-mobile {
    @media (max-width: ${breakpoints.md}px) {
      padding: 0.375rem 0.5rem;
      
      .dropdown-toggle::after {
        display: none;
      }
    }
  }
`;

const DashboardHeader = ({ handleLogout, navigate }) => {
  const { isMobile } = useResponsive();

  const renderDesktopActions = () => (
    <div className="desktop-actions">
      <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => navigate('/profile')}>
        <PersonFill /> {!isMobile && 'Profile'}
      </Button>
      <Button variant="danger" className="d-flex align-items-center gap-2" onClick={handleLogout}>
        <BoxArrowRight /> {!isMobile && 'Logout'}
      </Button>
    </div>
  );

  const renderMobileMenu = () => (
    <Dropdown align="end" className="mobile-menu">
      <Dropdown.Toggle variant="light" id="mobile-menu" className="border-0 bg-transparent">
        <ThreeDotsVertical size={24} />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => navigate('/profile')}>
          <PersonFill className="me-2" /> Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={handleLogout} className="text-danger">
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
          
          <div className="right-container">
            <div className="search-notification-container">
              <Nav.Item className="mx-2 search-icon-mobile">
                <NavbarSearchDropdown />
              </Nav.Item>
              <NotificationCenter />
            </div>
            
            {renderDesktopActions()}
            {renderMobileMenu()}
          </div>
        </div>
      </Card.Body>
    </ResponsiveHeader>
  );
};

export default DashboardHeader;