import React from 'react';
import { Card, Button, Dropdown, Nav } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ThreeDotsVertical } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';
import useResponsive from '../../hooks/useResponsive';
import styled from 'styled-components';
import { breakpoints } from '../../styles/breakpoints';
import NavbarSearchDropdown from '../search/NavbarSearchDropdown';

// Custom styled components
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

// Custom styled component for the futuristic title
const FuturisticTitle = styled.h1`
  font-family: 'Orbitron', 'Rajdhani', 'Play', 'Exo 2', sans-serif;
  letter-spacing: 1px;
  color: #1a1a2e;
  text-transform: uppercase;
  font-weight: 800;
  margin-bottom: 0;
  font-size: ${props => props.isMobile ? '1.5rem' : '1.8rem'};
  
  .title-text {
    position: relative;
    display: inline-block;
    padding-bottom: 4px;
    border-bottom: 3px solid;
    border-image: linear-gradient(90deg, #3a3a3a, #121212) 1;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 30%;
      height: 3px;
      background: linear-gradient(90deg, #4361ee, #3a0ca3);
      animation: glow 2s infinite alternate;
    }
  }
  
  @keyframes glow {
    from {
      width: 30%;
    }
    to {
      width: 100%;
    }
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
  padding: 0.5rem 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DashboardHeader = ({ handleLogout, navigate }) => {
  const { isMobile } = useResponsive();

  // Add font import to document head
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@500;600;700&family=Exo+2:wght@400;500;600;700&family=Play:wght@400;700&display=swap';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const renderDesktopActions = () => (
    <div className="desktop-actions">
      <ActionButton 
        variant="primary" 
        className="d-flex align-items-center gap-2" 
        onClick={() => navigate('/profile')}
        style={{ 
          background: 'linear-gradient(to right, #3b82f6, #1e40af)',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
        }}
      >
        <PersonFill /> {!isMobile && 'Profile'}
      </ActionButton>
      <ActionButton 
        variant="danger" 
        className="d-flex align-items-center gap-2" 
        onClick={handleLogout}
        style={{ 
          background: 'linear-gradient(to right, #ef4444, #b91c1c)',
          boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
        }}
      >
        <BoxArrowRight /> {!isMobile && 'Logout'}
      </ActionButton>
    </div>
  );

  const renderMobileMenu = () => (
    <Dropdown align="end" className="mobile-menu">
      <Dropdown.Toggle 
        variant="light" 
        id="mobile-menu" 
        className="border-0 bg-transparent"
        style={{ boxShadow: 'none' }}
      >
        <ThreeDotsVertical size={24} />
      </Dropdown.Toggle>
      <Dropdown.Menu className="shadow-lg border-0 rounded-3">
        <Dropdown.Item 
          onClick={() => navigate('/profile')} 
          className="d-flex align-items-center py-2"
        >
          <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: '28px', 
              height: '28px',
              background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
              color: 'white'
            }}>
            <PersonFill size={14} />
          </div>
          <span>Profile</span>
        </Dropdown.Item>
        <Dropdown.Item 
          onClick={handleLogout} 
          className="d-flex align-items-center py-2 text-danger"
        >
          <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
            style={{ 
              width: '28px', 
              height: '28px',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: 'white'
            }}>
            <BoxArrowRight size={14} />
          </div>
          <span>Logout</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <ResponsiveHeader className="mb-4 bg-gradient-primary shadow">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center header-content">
          <div className="d-flex align-items-center">
            <FuturisticTitle isMobile={isMobile} className="text-primary fw-bold fs-3 title">
              <span className="title-text">
                {isMobile ? 'Skill Barter' : 'Skill Barter Platform'}
              </span>
            </FuturisticTitle>
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