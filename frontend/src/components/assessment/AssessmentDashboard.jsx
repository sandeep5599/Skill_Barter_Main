import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Card, Row, Col, Button, Spinner } from 'react-bootstrap';
import { 
  ClipboardCheck, 
  House,
  ArrowLeftCircle,
  Calendar
} from 'react-bootstrap-icons';

// Import components
import AssessmentTabs from './AssessmentTabs';
import AssessmentStats from './AssessmentStats';
import TeacherSessionsList from './TeacherSessionsList';
import AssessmentList from './AssessmentList';
import CreateAssessment from './CreateAssessment';
import CreateSessionAssessment from './CreateSessionAssessment';
import SubmissionsList from './SubmissionsList';
import LearnerSubmissionsList from './LearnerSubmissionsList';
import EvaluateSubmission from './EvaluateSubmission';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { fetchAssessmentStats, fetchGeneralStats, fetchCompletedSessions } from './DashboardUtils';

const AssessmentDashboard = () => {
  const { skillId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('available');
  const [isSkillSharer, setIsSkillSharer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillData, setSkillData] = useState(null);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    averageScore: 0,
    totalCompletedSessions: 0
  });

  useEffect(() => {
    // Determine active tab from URL
    if (location.pathname.includes('/submissions')) {
      setActiveTab('submissions');
    } else if (location.pathname.includes('/create-session')) {
      setActiveTab('create-session');
    } else if (location.pathname.includes('/create')) {
      setActiveTab('create');
    } else if (location.pathname.includes('/my-submissions')) {
      setActiveTab('my-submissions');
    } else if (location.pathname.includes('/evaluate')) {
      setActiveTab('evaluate');
    } else if (location.pathname.includes('/completed-sessions')) {
      setActiveTab('completed-sessions');
    } else {
      setActiveTab('available');
    }
  
    // Fetch data
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Initialize flags and data
        let userIsSkillSharer = false;
        
        // Fetch stats based on whether we have a skillId
        if (skillId) {
          const statsData = await fetchAssessmentStats(skillId);
          if (statsData) {
            setStats(prevStats => ({
              ...prevStats,
              ...statsData
            }));
          }
        } else {
          const generalStatsData = await fetchGeneralStats();
          if (generalStatsData) {
            setStats(prevStats => ({
              ...prevStats,
              ...generalStatsData
            }));
          }
        }
        
        // Fetch sessions if user exists
        if (user?._id) {
          const sessionsData = await fetchCompletedSessions(user._id);
          
          if (sessionsData && sessionsData.length > 0) {
            setCompletedSessions(sessionsData);
            userIsSkillSharer = true;
            
            // Update completed sessions count in stats
            setStats(prevStats => ({
              ...prevStats,
              totalCompletedSessions: sessionsData.length
            }));
          } else {
            setCompletedSessions([]);
          }
        }
        
        // Set isSkillSharer state
        setIsSkillSharer(userIsSkillSharer);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load information. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
  
    loadDashboardData();
  }, [location.pathname, skillId, user?._id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'available') {
      navigate(skillId ? `/skills/${skillId}/assessments` : '/assessments');
    } else if (tab === 'create') {
      navigate(skillId ? `/skills/${skillId}/assessments/create` : '/assessments/create');
    } else if (tab === 'submissions') {
      navigate(skillId ? `/skills/${skillId}/assessments/submissions` : '/assessments/submissions');
    } else if (tab === 'my-submissions') {
      navigate(skillId ? `/skills/${skillId}/assessments/my-submissions` : '/assessments/my-submissions');
    } else if (tab === 'completed-sessions') {
      navigate(skillId ? `/skills/${skillId}/assessments/completed-sessions` : '/assessments/completed-sessions');
    } else if (tab === 'evaluate') {
      navigate(skillId ? `/skills/${skillId}/assessments/evaluate` : '/assessments/evaluate');
    } else if (tab === 'create-session') {
      navigate(skillId ? `/skills/${skillId}/assessments/create-session` : '/assessments/create-session');
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    handleTabChange('create-session');
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <div className="d-flex justify-content-center align-items-center">
            <div className="text-center">
              <Spinner animation="border" role="status" variant="primary" className="mb-3" style={{
                width: '4rem',
                height: '4rem',
                borderWidth: '0.35rem'
              }}>
                <span className="visually-hidden">Loading assessment dashboard...</span>
              </Spinner>
              <p className="fs-5 text-muted">Loading assessment dashboard...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return <Error message={error} />;
  }

  // Render content based on active tab
  const renderContent = () => {
    try {
      switch(activeTab) {
        case 'completed-sessions':
          return (
            <TeacherSessionsList 
              sessions={completedSessions} 
              onCreateAssessment={handleSessionSelect}
            />
          );
        case 'create-session':
          return (
            <CreateSessionAssessment 
              userId={user?._id} 
              initialSession={selectedSession}
              onComplete={() => {
                setSelectedSession(null);
                handleTabChange('available');
              }}
            />
          );
        case 'available':
          return <AssessmentList skillId={skillId} isSkillSharer={isSkillSharer} />;
        case 'create':
          return <CreateAssessment skillId={skillId} />;
        case 'submissions':
          return <SubmissionsList skillId={skillId} />;
        case 'my-submissions':
          if (typeof LearnerSubmissionsList !== 'function') {
            console.error('LearnerSubmissionsList is not a valid component:', LearnerSubmissionsList);
            return <div className="alert alert-danger">Unable to load submissions. Component error.</div>;
          }
          return <LearnerSubmissionsList userId={user?._id} />;
        case 'evaluate':
          return <EvaluateSubmission skillId={skillId} userId={user?._id} />;
        default:
          return <AssessmentList skillId={skillId} isSkillSharer={isSkillSharer} />;
      }
    } catch (err) {
      console.error('Error rendering content:', err);
      return <div className="alert alert-danger">Failed to render content: {err.message}</div>;
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Container fluid className="px-3 px-md-4 px-lg-5 py-4 flex-grow-1">
        {/* Dashboard Header Card */}
        <Card className="mb-4 shadow border-0 rounded-lg overflow-hidden">
          <div className="dashboard-header position-relative" style={{ 
            background: 'linear-gradient(120deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
            padding: '1.75rem',
            color: 'white',
          }}>
            {/* Decorative Elements */}
            <div className="position-absolute" style={{ 
              top: '-30px', 
              right: '-20px', 
              width: '200px', 
              height: '200px', 
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%'
            }}></div>
            
            <div className="position-absolute" style={{ 
              bottom: '-50px', 
              left: '15%', 
              width: '180px', 
              height: '180px',  
              background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
              borderRadius: '50%'
            }}></div>
            
            <Row className="g-4">
              {/* Left Column - Skill Info */}
              <Col lg={5} className="mb-4 mb-lg-0">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                    style={{ 
                      width: '52px', 
                      height: '52px', 
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                    <ClipboardCheck size={26} className="text-white" />
                  </div>
                  <div>
                    <h2 className="mb-0 fw-bold fs-3">{skillData?.title || 'Assessment Dashboard'}</h2>
                    <p className="text-white-50 mb-0 fs-6">{skillData?.category || 'Skill Assessment Platform'}</p>
                  </div>
                </div>
                
                <p className="text-white-50 mb-4 fs-6">
                  {skillData?.description || 'Demonstrate your skills and receive valuable feedback through our assessment platform.'}
                </p>
                
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    variant="light" 
                    className="rounded-pill fw-medium px-4 py-2 d-flex align-items-center shadow-sm"
                    onClick={() => handleTabChange('available')}
                    style={{
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                    }}
                  >
                    <ClipboardCheck size={18} className="me-2" />
                    Browse Assessments
                  </Button>
                  
                  <Button 
                    variant="outline-light" 
                    className="rounded-pill fw-medium px-4 py-2 d-flex align-items-center"
                    onClick={navigateToDashboard}
                    style={{
                      transition: 'all 0.2s ease',
                      borderWidth: '1.5px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <House size={18} className="me-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </Col>
              
              {/* Right Column - Stats */}
              <Col lg={7}>
                <div className="h-100">
                  <AssessmentStats stats={stats} />
                </div>
              </Col>
            </Row>
          </div>
        </Card>
        
        {/* Main Content Card */}
        <Card className="shadow border-0 rounded-lg overflow-hidden flex-grow-1">
          {/* Tabs */}
          <AssessmentTabs 
            activeTab={activeTab} 
            handleTabChange={handleTabChange} 
            isSkillSharer={isSkillSharer} 
            isAuthenticated={!!user}
            completedSessions={completedSessions}
            stats={stats}
            skillData={skillData}
          />

          {/* Content */}
          <Card.Body className="p-3 p-md-4">
            {renderContent()}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AssessmentDashboard;