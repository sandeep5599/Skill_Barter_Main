import React from 'react';
import { Card, Nav } from 'react-bootstrap';
import { 
  GearFill, 
  PersonFill, 
  ShieldLockFill, 
  EyeFill, 
  Speedometer2 as SpeeddometerFill,
  ChevronRight
} from 'react-bootstrap-icons';

const ProfileNavigation = ({ activeTab, setActiveTab, navigateToDashboard }) => {
  // Navigation items with icons and descriptions
  const navItems = [
    {
      id: 'skills',
      title: 'Manage Skills',
      icon: <SpeeddometerFill />,
      description: 'Update your learning & teaching skills'
    },
    {
      id: 'profile',
      title: 'Edit Profile',
      icon: <PersonFill />,
      description: 'Update your personal information'
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: <ShieldLockFill />,
      description: 'Manage your account security'
    },
    {
      id: 'view',
      title: 'View Profile',
      icon: <EyeFill />,
      description: 'See how others view your profile'
    }
  ];

  return (
    <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
  
      <Card.Body className="p-0">
        <Nav className="flex-column">
          {navItems.map(item => (
            <Nav.Item key={item.id}>
              <Nav.Link 
                active={activeTab === item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`border-bottom d-flex align-items-center p-3 ${activeTab === item.id ? 'active-nav-link' : ''}`}
                style={{ 
                  borderLeft: activeTab === item.id ? '4px solid #3b82f6' : '4px solid transparent',
                  background: activeTab === item.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: activeTab === item.id ? 
                      'linear-gradient(135deg, #3b82f6, #1e40af)' : 
                      'rgba(203, 213, 225, 0.2)',
                    color: activeTab === item.id ? 'white' : '#64748b',
                    transition: 'all 0.3s ease'
                  }}>
                  {item.icon}
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold" style={{ 
                    color: activeTab === item.id ? '#3b82f6' : '#0f172a' 
                  }}>
                    {item.title}
                  </div>
                  <div className="small text-muted">
                    {item.description}
                  </div>
                </div>
                {activeTab === item.id && (
                  <ChevronRight className="ms-2" style={{ color: '#3b82f6' }} />
                )}
              </Nav.Link>
            </Nav.Item>
          ))}
          
          {/* Dashboard Button with gradient */}
          <Nav.Item>
            <Nav.Link 
              onClick={navigateToDashboard}
              className="d-flex align-items-center p-3"
              style={{ 
                background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                border: 'none'
              }}
            >
              <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: 'white'
                }}>
                <GearFill />
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold" style={{ color: '#0c4a6e' }}>
                  Go to Dashboard
                </div>
                <div className="small text-muted">
                  Return to main dashboard
                </div>
              </div>
              <ChevronRight className="ms-2" style={{ color: '#0ea5e9' }} />
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Body>
      
      {/* Decorative Elements */}
      <div className="position-absolute" style={{ 
        top: '20px', 
        right: '20px', 
        width: '100px', 
        height: '100px', 
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }}></div>
      
      {/* Custom CSS for active navigation items */}
      <style>
        {`
        .nav-link {
          color: #0f172a;
        }
        
        .nav-link:hover:not(.active-nav-link) {
          background: rgba(241, 245, 249, 0.7);
          transform: translateX(5px);
        }
        
        /* Override Bootstrap's active styles */
        .nav-pills .nav-link.active, 
        .nav-pills .show > .nav-link {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .nav-link {
            padding: 0.8rem 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .flex-grow-1 .small {
            display: none;
          }
        }
        `}
      </style>
    </Card>
  );
};

export default ProfileNavigation;