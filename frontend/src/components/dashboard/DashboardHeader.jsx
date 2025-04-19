import React, { useState, useEffect } from 'react';
import { Card, Button, Dropdown, Nav } from 'react-bootstrap';
import { PersonFill, BoxArrowRight, ThreeDotsVertical, Globe } from 'react-bootstrap-icons';
import NotificationCenter from '../NotificationCenter';
import useResponsive from '../../hooks/useResponsive';
import styled, { keyframes } from 'styled-components';
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
      justify-content: center;
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
  
  .search-icon-mobile {
    @media (max-width: ${breakpoints.md}px) {
      padding: 0.375rem 0.5rem;
      
      .dropdown-toggle::after {
        display: none;
      }
    }
  }
  
  /* Fix to ensure notification badges are visible */
  :global(.notification-badge) {
    z-index: 5;
    position: relative;
  }
  
  /* Override any potential z-index issues for notifications */
  .notification-wrapper {
    position: relative;
    
    /* Ensure any notification counter appears above other elements */
    :global(.badge),
    :global(.notification-counter) {
      z-index: 1000;
      position: absolute;
      top: -5px;
      right: -5px;
    }
  }
`;

// Keyframes for the globe rotation
const rotateGlobe = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
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

// Styled component for the revolving globe
const RevolvingGlobe = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border-radius: 50%;
  padding: 10px;
  width: ${props => props.isMobile ? '35px' : '42px'};
  height: ${props => props.isMobile ? '35px' : '42px'};
  animation: ${rotateGlobe} 10s linear infinite, ${pulseGlow} 4s ease-in-out infinite;
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

// Enhanced title with typing animation - NOW WITH BLACK TEXT
const EnhancedTitle = styled.div`
  margin-bottom: 0;
  
  .title-container {
    position: relative;
    display: inline-block;
  }
  
  .main-title {
    font-family: 'Space Grotesk', 'Orbitron', sans-serif;
    font-weight: 800;
    letter-spacing: 1.5px;
    font-size: ${props => props.isMobile ? '1.4rem' : '1.8rem'};
    color: #000000; /* Direct black color instead of gradient */
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
    text-transform: uppercase;
    margin: 0;
    padding-bottom: 4px;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  
  .typing-text {
    position: relative;
    display: inline-block;
    
    &::after {
      content: '|';
      position: absolute;
      right: -8px;
      animation: blink-caret 0.75s step-end infinite;
      color: #4361ee;
      font-weight: 400;
    }
  }
  
  @keyframes blink-caret {
    from, to { opacity: 0; }
    50% { opacity: 1; }
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
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #64748b;
    margin-top: 2px;
    opacity: 0.8;
    text-align: center;
    animation: fade-in 1s ease-in;
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
  
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 0.8; transform: translateY(0); }
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
  
  /* This ensures any badges from NotificationCenter are visible */
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

const DashboardHeader = ({ handleLogout, navigate }) => {
  const { isMobile } = useResponsive();
  const [displayText, setDisplayText] = useState('');
  const fullText = isMobile ? 'Skill Barter' : 'Skill Barter Platform';
  const [showCursor, setShowCursor] = useState(true);
  
  // Typing animation effect
  useEffect(() => {
    if (displayText === fullText) {
      // Text is fully typed, start blinking cursor for a moment
      const timeout = setTimeout(() => {
        setShowCursor(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    
    const timeout = setTimeout(() => {
      setDisplayText(fullText.substring(0, displayText.length + 1));
    }, 100); // Speed of typing
    
    return () => clearTimeout(timeout);
  }, [displayText, fullText]);
  
  // Reset typing animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText('');
      setShowCursor(true);
    }, 10000); // Reset every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Add font import to document head
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap';
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
            <RevolvingGlobe isMobile={isMobile}>
              <Globe />
            </RevolvingGlobe>
            
            <EnhancedTitle isMobile={isMobile}>
              <div className="title-container">
                <h1 className="main-title">
                  <span className={showCursor ? "typing-text" : ""}>
                    {displayText}
                  </span>
                </h1>
                <div className="title-accent"></div>
                <div className="title-glow"></div>
                {!isMobile && <div className="subtitle">Exchange Expertise Globally</div>}
              </div>
            </EnhancedTitle>
          </div>
          
          <div className="right-container">
            <div className="search-notification-container">
              <Nav.Item className="mx-2 search-icon-mobile">
                <NavbarSearchDropdown />
              </Nav.Item>
              <NotificationWrapper>
                <NotificationCenter />
              </NotificationWrapper>
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