import React from 'react';
import { Nav } from 'react-bootstrap';
import { 
  ClipboardCheck, 
  PlusCircle, 
  Inbox, 
  PersonBadge, 
  CheckCircle,
  Mortarboard,
  House
} from 'react-bootstrap-icons';

const AssessmentTabs = ({ 
  activeTab, 
  handleTabChange, 
  isSkillSharer, 
  isAuthenticated, 
  completedSessions,
  stats,
  skillData
}) => {
  return (
    <div className="bg-light border-bottom shadow-sm">
      {/* Header with gradient background similar to UserWelcomeCard */}
      <div className="position-relative" style={{ 
        background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
        padding: '1.5rem',
        color: 'white',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div className="position-absolute" style={{ 
          top: '-20px', 
          right: '-20px', 
          width: '200px', 
          height: '200px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div className="position-absolute" style={{ 
          bottom: '-40px', 
          left: '10%', 
          width: '180px', 
          height: '180px',  
          background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
          borderRadius: '50%'
        }}></div>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center">
            <h4 className="mb-0 me-2 fw-bold" style={{ letterSpacing: '-0.5px' }}>
              {skillData?.title ? skillData.title : 'Skill'} Assessments
            </h4>
            <span className="badge bg-white bg-opacity-20 text-black rounded-pill d-flex align-items-center">
              <span className="me-1">{stats.totalAssessments}</span> Available
            </span>
          </div>
        </div>
      </div>
      
      {/* Responsive Tabs with scrolling support */}
      <div className="position-relative">
        <Nav className="flex-nowrap overflow-auto border-top" style={{ scrollbarWidth: 'thin' }}>
          <Nav.Item>
            <Nav.Link 
              className={`px-4 py-3 border-end d-flex align-items-center ${activeTab === 'available' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
              onClick={() => handleTabChange('available')}
              style={{ 
                cursor: 'pointer', 
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <ClipboardCheck className="me-2" /> 
              <span className="d-none d-sm-inline">Available Assessments</span>
              <span className="d-inline d-sm-none">Available</span>
            </Nav.Link>
          </Nav.Item>
          
          {isAuthenticated && (
            <Nav.Item>
              <Nav.Link 
                className={`px-4 py-3 border-end d-flex align-items-center ${activeTab === 'my-submissions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleTabChange('my-submissions')}
                style={{ 
                  cursor: 'pointer', 
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <PersonBadge className="me-2" /> 
                <span className="d-none d-sm-inline">My Submissions</span>
                <span className="d-inline d-sm-none">My Submissions</span>
              </Nav.Link>
            </Nav.Item>
          )}
          
          {isSkillSharer && (
            <>
              <Nav.Item>
                <Nav.Link 
                  className={`px-4 py-3 border-end d-flex align-items-center ${activeTab === 'completed-sessions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => handleTabChange('completed-sessions')}
                  style={{ 
                    cursor: 'pointer', 
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle className="me-2" /> 
                  <span className="d-none d-md-inline">Teaching Sessions</span>
                  <span className="d-inline d-md-none">Teaching</span>
                  {completedSessions.length > 0 && (
                    <span className="ms-2 badge rounded-pill" style={{ 
                      background: 'linear-gradient(to right, #3b82f6, #1e40af)', 
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                    }}>
                      {completedSessions.length}
                    </span>
                  )}
                </Nav.Link>
              </Nav.Item>
              
              <Nav.Item>
                <Nav.Link 
                  className={`px-4 py-3 border-end d-flex align-items-center ${activeTab === 'create-session' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => handleTabChange('create-session')}
                  style={{ 
                    cursor: 'pointer', 
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <PlusCircle className="me-2" /> 
                  <span className="d-none d-md-inline">Create from Session</span>
                  <span className="d-inline d-md-none">Create</span>
                </Nav.Link>
              </Nav.Item>
              
              <Nav.Item>
                <Nav.Link 
                  className={`px-4 py-3 border-end d-flex align-items-center ${activeTab === 'submissions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => handleTabChange('submissions')}
                  style={{ 
                    cursor: 'pointer', 
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Inbox className="me-2" /> 
                  <span className="d-none d-md-inline">All Submissions</span>
                  <span className="d-inline d-md-none">Submissions</span>
                  {stats.pendingSubmissions > 0 && (
                    <span className="ms-2 badge rounded-pill" style={{ 
                      background: 'linear-gradient(to right, #f59e0b, #d97706)', 
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                    }}>
                      {stats.pendingSubmissions}
                    </span>
                  )}
                </Nav.Link>
              </Nav.Item>
              
              <Nav.Item>
                <Nav.Link 
                  className={`px-4 py-3 border-end d-flex align-items-center ${activeTab === 'evaluate' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                  onClick={() => handleTabChange('evaluate')}
                  style={{ 
                    cursor: 'pointer', 
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Mortarboard className="me-2" /> 
                  <span className="d-none d-md-inline">Evaluate Learners</span>
                  <span className="d-inline d-md-none">Evaluate</span>
                </Nav.Link>
              </Nav.Item>
            </>
          )}
        </Nav>
        
        {/* Gradient fade indicators for scrolling */}
        <div className="position-absolute d-none d-lg-block" style={{ 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '40px', 
          background: 'linear-gradient(to right, rgba(248, 249, 250, 0), rgba(248, 249, 250, 1))',
          pointerEvents: 'none'
        }}></div>
      </div>
      
      {/* Add custom animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .nav-link.active {
          animation: fadeIn 0.2s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default AssessmentTabs;