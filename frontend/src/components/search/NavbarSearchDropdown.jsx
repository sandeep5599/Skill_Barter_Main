import React, { useState, useEffect, useRef } from 'react';
import { Form, InputGroup, Button, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';
import { 
  HiOutlineSearch, 
  HiOutlineAdjustments,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
  HiOutlineChip
} from 'react-icons/hi';

const NavbarSearchDropdown = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    skillLevel: ''
  });
  const [showGlow, setShowGlow] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  // Trigger initial animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Create glow effect when focused
  useEffect(() => {
    if (isActive) {
      setShowGlow(true);
    } else {
      const timer = setTimeout(() => setShowGlow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Briefly activate pulse effect when typing
    if (name === 'query' && value.length > 0) {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 800);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create query string
    const queryParams = new URLSearchParams();
    
    if (searchParams.query) {
      queryParams.append('query', searchParams.query);
    }
    
    if (searchParams.skillLevel) {
      queryParams.append('skillLevel', searchParams.skillLevel);
    }
    
    // Navigate to search page with search parameters
    navigate(`/search?${queryParams.toString()}`);
  };

  const getSkillLevelIcon = (level) => {
    switch(level) {
      case 'Beginner': 
        return <HiOutlineLightningBolt className="text-info" />;
      case 'Intermediate': 
        return <HiOutlineSparkles className="text-warning" />;
      case 'Expert': 
        return <HiOutlineChip className="text-danger" />;
      default: 
        return null;
    }
  };

  return (
    <Dropdown 
      onToggle={(isOpen) => {
        setIsActive(isOpen);
        if (isOpen && searchInputRef.current) {
          setTimeout(() => searchInputRef.current.focus(), 100);
        }
      }}
    >
      <Dropdown.Toggle 
        as={Button} 
        variant="transparent" 
        id="dropdown-search"
        className={`futuristic-search-toggle d-flex align-items-center justify-content-center position-relative ${pulseEffect ? 'pulse-animation' : ''}`}
        style={{
          borderRadius: '14px',
          height: isMobile ? '40px' : '42px',
          padding: isMobile ? '0 12px' : '0 18px',
          border: '1px solid rgba(99, 179, 237, 0.4)',
          background: isActive 
            ? 'linear-gradient(145deg, rgba(25, 30, 45, 0.95), rgba(45, 55, 80, 0.9))' 
            : 'linear-gradient(145deg, rgba(30, 35, 50, 0.8), rgba(50, 60, 85, 0.75))',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="search-icon-wrapper position-relative">
          <HiOutlineSearch 
            className={`search-icon ${isMobile ? "" : "me-2"}`} 
            size={isMobile ? 18 : 20}
            style={{
              color: 'rgba(138, 220, 255, 0.9)',
              filter: showGlow ? 'drop-shadow(0 0 3px rgba(138, 220, 255, 0.8))' : 'none',
              transition: 'all 0.3s ease'
            }}
          />
          
          {/* Animated ring around icon */}
          <div className="rings-container position-absolute">
            <div className={`ring ring-1 ${isActive ? 'active' : ''}`}></div>
            <div className={`ring ring-2 ${isActive ? 'active' : ''}`}></div>
          </div>
        </div>
        
        {!isMobile && (
          <span 
            className="search-text"
            style={{
              color: 'rgba(240, 245, 255, 0.9)',
              fontWeight: '500',
              fontSize: '0.95rem',
              letterSpacing: '0.3px',
              textShadow: showGlow ? '0 0 5px rgba(138, 220, 255, 0.5)' : 'none'
            }}
          >
            Discover Skills
          </span>
        )}
        
        {/* Highlight/glow effect */}
        {showGlow && (
          <div 
            className="position-absolute glow-effect"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '14px',
              boxShadow: '0 0 15px 1px rgba(99, 179, 237, 0.5), 0 0 0 1px rgba(99, 179, 237, 0.3) inset',
              opacity: 0.7,
              pointerEvents: 'none'
            }}
          ></div>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className="futuristic-search-menu p-0 border-0"
        style={{ 
          width: isMobile ? '95vw' : '350px',
          maxWidth: isMobile ? '95vw' : '350px',
          background: 'linear-gradient(135deg, rgba(23, 32, 45, 0.95), rgba(35, 45, 65, 0.98))',
          backdropFilter: 'blur(10px)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 179, 237, 0.2)',
          marginTop: '10px',
          border: '1px solid rgba(99, 179, 237, 0.25)'
        }}
        popperConfig={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        }}
      >
        <div className="futuristic-search-content p-3">
          <div 
            className="search-header mb-3 position-relative" 
            style={{
              borderBottom: '1px solid rgba(99, 179, 237, 0.2)',
              paddingBottom: '10px',
            }}
          >
            <h6 
              className="m-0 d-flex align-items-center"
              style={{
                color: 'rgba(138, 220, 255, 0.9)',
                fontWeight: '600',
                fontSize: '1rem',
                letterSpacing: '0.5px'
              }}
            >
              <HiOutlineAdjustments 
                size={18} 
                className="me-2" 
                style={{ color: 'rgba(138, 220, 255, 0.9)' }}
              />
              Advanced Search
            </h6>
            <div 
              className="search-header-accent" 
              style={{
                position: 'absolute',
                bottom: '-1px',
                left: '0',
                width: '35%',
                height: '2px',
                background: 'linear-gradient(to right, rgba(99, 179, 237, 0.9), rgba(99, 179, 237, 0.1))'
              }}
            ></div>
          </div>
          
          <Form onSubmit={handleSubmit} className="neo-form">
            <InputGroup 
              className="mb-3 search-input-group"
              style={{
                background: 'rgba(15, 23, 35, 0.4)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 0 0 1px rgba(99, 179, 237, 0.2) inset, 0 4px 8px rgba(0, 0, 0, 0.1) inset'
              }}
            >
              <InputGroup.Text 
                id="search-addon"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0 0 0 12px'
                }}
              >
                <HiOutlineSearch 
                  size={20} 
                  style={{ color: 'rgba(138, 220, 255, 0.9)' }}
                />
              </InputGroup.Text>
              <Form.Control
                ref={searchInputRef}
                type="text"
                placeholder="Find skills or instructors..."
                name="query"
                value={searchParams.query}
                onChange={handleChange}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(240, 245, 255, 0.9)',
                  padding: '12px 15px',
                  fontSize: '0.95rem',
                  boxShadow: 'none'
                }}
                className="futuristic-input"
              />
            </InputGroup>

            <Form.Group 
              className="mb-3 skill-level-group"
              style={{
                background: 'rgba(15, 23, 35, 0.4)',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 0 0 1px rgba(99, 179, 237, 0.2) inset, 0 4px 8px rgba(0, 0, 0, 0.1) inset'
              }}
            >
              <Form.Label 
                className="d-flex align-items-center mb-2"
                style={{
                  color: 'rgba(138, 220, 255, 0.9)',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px'
                }}
              >
                <HiOutlineLightningBolt size={16} className="me-2" />
                Skill Level
              </Form.Label>
              
              <div 
                className="skill-level-options d-flex flex-wrap gap-2"
                style={{
                  marginTop: '5px'
                }}
              >
                {['', 'Beginner', 'Intermediate', 'Expert'].map((level) => (
                  <Button
                    key={level || 'all'}
                    variant="transparent"
                    className={`skill-level-btn d-flex align-items-center ${searchParams.skillLevel === level ? 'active' : ''}`}
                    style={{
                      background: searchParams.skillLevel === level 
                        ? 'rgba(99, 179, 237, 0.25)' 
                        : 'rgba(30, 40, 60, 0.4)',
                      color: searchParams.skillLevel === level 
                        ? 'rgba(240, 245, 255, 0.95)' 
                        : 'rgba(240, 245, 255, 0.6)',
                      border: `1px solid ${searchParams.skillLevel === level 
                        ? 'rgba(99, 179, 237, 0.5)' 
                        : 'rgba(99, 179, 237, 0.2)'}`,
                      borderRadius: '10px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxShadow: searchParams.skillLevel === level 
                        ? '0 0 8px rgba(99, 179, 237, 0.3)' 
                        : 'none'
                    }}
                    onClick={() => {
                      setSearchParams(prev => ({
                        ...prev,
                        skillLevel: level
                      }));
                    }}
                  >
                    {level === '' ? 'All Levels' : level}
                    {getSkillLevelIcon(level)}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 search-submit-btn"
              style={{
                background: 'linear-gradient(135deg, #3182CE, #2C5282)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(49, 130, 206, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span 
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <HiOutlineSearch size={18} />
                Search
              </span>
              
              {/* Button inner glow effect */}
              <div 
                className="button-glow"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                  opacity: 0.7,
                  zIndex: 1
                }}
              ></div>
            </Button>
          </Form>
        </div>
      </Dropdown.Menu>

      <style jsx>{`
        /* Futuristic component styling */
        .futuristic-search-toggle:hover {
          border-color: rgba(99, 179, 237, 0.6) !important;
          box-shadow: 0 0 15px rgba(99, 179, 237, 0.3) !important;
        }
        
        .futuristic-search-toggle:active {
          transform: translateY(1px);
        }
        
        .futuristic-input::placeholder {
          color: rgba(240, 245, 255, 0.5);
        }
        
        .search-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isMobile ? '22px' : '24px'};
          height: ${isMobile ? '22px' : '24px'};
          position: relative;
        }
        
        .rings-container {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(99, 179, 237, 0.4);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
          transition: all 0.3s ease;
        }
        
        .ring-1 {
          width: 150%;
          height: 150%;
        }
        
        .ring-2 {
          width: 200%;
          height: 200%;
          border-color: rgba(99, 179, 237, 0.2);
        }
        
        .ring.active {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        
        .pulse-animation {
          animation: pulse-search 1.5s ease infinite;
        }
        
        @keyframes pulse-search {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 179, 237, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(99, 179, 237, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 179, 237, 0);
          }
        }
        
        .search-submit-btn {
          transition: all 0.3s ease !important;
        }
        
        .search-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(49, 130, 206, 0.4) !important;
        }
        
        .search-submit-btn:active {
          transform: translateY(1px);
        }
        
        .skill-level-btn:hover {
          background: rgba(99, 179, 237, 0.15) !important;
          border-color: rgba(99, 179, 237, 0.4) !important;
          color: rgba(240, 245, 255, 0.8) !important;
        }
        
        /* For dark mode compatibility */
        .form-control:focus {
          color: rgba(240, 245, 255, 0.9) !important;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .skill-level-options {
            justify-content: space-between;
          }
          
          .skill-level-btn {
            flex: 1;
            min-width: calc(50% - 5px);
            justify-content: center;
          }
        }
      `}</style>
    </Dropdown>
  );
};

export default NavbarSearchDropdown;