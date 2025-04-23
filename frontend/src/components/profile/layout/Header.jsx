import React, { useState, useEffect } from 'react';
import { Card, Button, Dropdown } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ThreeDotsVertical, Gear } from 'react-bootstrap-icons';
import NotificationCenter from '../../NotificationCenter';
import styled, { keyframes } from 'styled-components';

// Define breakpoints directly in this file to avoid the import error
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

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

  .right-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    @media (max-width: ${breakpoints.sm}px) {
      width: 100%;
      justify-content: center;
    }
  }
  
  .notification-wrapper {
    position: relative;
    
    :global(.badge),
    :global(.notification-counter) {
      z-index: 1000;
      position: absolute;
      top: -5px;
      right: -5px;
    }
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 5px 2px rgba(67, 97, 238, 0.3);
  }
  50% {
    box-shadow: 0 0 12px 4px rgba(76, 201, 240, 0.5);
  }
  100% {
    box-shadow: 0 0 5px 2px rgba(67, 97, 238, 0.3);
  }
`;

// Styled icon container
const IconContainer = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border-radius: 50%;
  padding: 10px;
  width: ${props => props.isMobile ? '35px' : '42px'};
  height: ${props => props.isMobile ? '35px' : '42px'};
  animation: ${pulseGlow} 4s ease-in-out infinite;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
  }
  
  svg {
    color: white;
    height: ${props => props.isMobile ? '18px' : '22px'};
    width: ${props => props.isMobile ? '18px' : '22px'};
  }
  
  @media (max-width: ${breakpoints.sm}px) {
    margin-right: 8px;
  }
`;

// Enhanced title
const EnhancedTitle = styled.div`
  margin-bottom: 0;
  
  .title-container {
    position: relative;
    display: inline-block;
  }
  
  .main-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    letter-spacing: 1px;
    font-size: ${props => props.isMobile ? '1.4rem' : '1.7rem'};
    color: #000000;
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    margin: 0;
    padding-bottom: 4px;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  
  .title-accent {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: 100%;
    background: linear-gradient(90deg, #4361ee, #3a0ca3, #480ca8, #4cc9f0);
    background-size: 300% 300%;
    animation: gradient-shift 8s ease infinite;
    border-radius: 2px;
    z-index: 0;
  }
  
  .title-glow {
    position: absolute;
    bottom: -4px;
    left: 25%;
    width: 50%;
    height: 12px;
    background: radial-gradient(ellipse at center, rgba(76, 201, 240, 0.6) 0%, rgba(67, 97, 238, 0) 70%);
    filter: blur(4px);
    opacity: 0.7;
    animation: glow-pulse 3s ease-in-out infinite alternate;
  }
  
  .subtitle {
    font-family: 'Inter', sans-serif;
    font-size: ${props => props.isMobile ? '0.7rem' : '0.8rem'};
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #64748b;
    margin-top: 2px;
    opacity: 0.8;
  }
  
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes glow-pulse {
    0% { opacity: 0.3; transform: translateX(-5px); }
    100% { opacity: 0.7; transform: translateX(5px); }
  }
  
  &:hover {
    .main-title {
      transform: translateY(-2px);
      text-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .title-accent {
      height: 5px;
      animation-duration: 4s;
    }
    
    .title-glow {
      opacity: 0.9;
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

// Styled wrapper for notification center to ensure badge visibility
const NotificationWrapper = styled.div`
  position: relative;
  z-index: 1;
  
  && {
    .badge, 
    [class*="badge"],
    [class*="notification-badge"],
    [class*="notification-counter"] {
      position: absolute;
      top: -8px;
      right: -8px;
      z-index: 10;
    }
  }
`;

const Header = ({ logout }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Add responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add font import to document head
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const renderDesktopActions = () => (
    <div className="desktop-actions">
      <ActionButton 
        variant="danger" 
        className="d-flex align-items-center gap-2" 
        onClick={logout}
        style={{ 
          background: 'linear-gradient(to right, #ef4444, #b91c1c)',
          boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
        }}
      >
        <BoxArrowRight /> Logout
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
          onClick={logout} 
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
            <IconContainer isMobile={isMobile}>
              <Gear />
            </IconContainer>
            
            <EnhancedTitle isMobile={isMobile}>
              <div className="title-container">
                <h1 className="main-title">
                  Profile Management
                </h1>
                <div className="title-accent"></div>
                <div className="title-glow"></div>
                {!isMobile && <div className="subtitle">Manage your account settings</div>}
              </div>
            </EnhancedTitle>
          </div>
          
          <div className="right-container">
            <NotificationWrapper>
              <NotificationCenter />
            </NotificationWrapper>
            
            {renderDesktopActions()}
            {renderMobileMenu()}
          </div>
        </div>
      </Card.Body>
    </ResponsiveHeader>
  );
};

export default Header;