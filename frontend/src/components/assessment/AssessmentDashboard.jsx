import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Import components
import AssessmentList from './AssessmentList';
import CreateAssessment from './CreateAssessment';
import CreateSessionAssessment from './CreateSessionAssessment ';
import SubmissionsList from './SubmissionsList';
import LearnerSubmissionsList from './LearnerSubmissionsList';
import SubmitAssessment from './SubmitAssessment';
import EvaluateSubmission from './EvaluateSubmission';
import SubmissionSuccess from './SubmissionSucess';
import Loading from '../common/Loading';
import Error from '../common/Error';

// Import icons
import { 
  ClipboardCheck, 
  PlusCircle, 
  Inbox, 
  PersonBadge, 
  ArrowRight, 
  ChevronRight,
  ArrowLeftCircle,
  House
} from 'react-bootstrap-icons';

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
  const [stats, setStats] = useState({
    totalAssessments: 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    averageScore: 0
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
    } else {
      setActiveTab('available');
    }

    // Check if user is a skill sharer and fetch skill data
    const fetchSkillData = async () => {
      try {
        if (skillId) {
          const response = await axios.get(`/api/skills/${skillId}`);
          setSkillData(response.data.skill);
          
          // Update this line to check directly for the boolean value true
          setIsSkillSharer(response.data.skill.isTeaching === true);
          
          // Fetch assessment stats
          const statsResponse = await axios.get(`/api/skills/${skillId}/assessment-stats`);
          if (statsResponse.data.success) {
            setStats(statsResponse.data.stats);
          }
        }
      } catch (err) {
        console.error('Error fetching skill data:', err);
        setError('Failed to load skill information');
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, [location.pathname, skillId, user._id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'available') {
      navigate(`/skills/${skillId}/assessments`);
    } else if (tab === 'create') {
      navigate(`/skills/${skillId}/assessments/create`);
    } else if (tab === 'create-session') {
      navigate(`/skills/${skillId}/assessments/create-session`);
    } else if (tab === 'submissions') {
      navigate(`/skills/${skillId}/assessments/submissions`);
    } else if (tab === 'my-submissions') {
      navigate(`/skills/${skillId}/assessments/my-submissions`);
    }
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // TabNavigation component with improved UI
  const TabNavigation = ({ activeTab, handleTabChange, isSkillSharer, isAuthenticated }) => {
    return (
      <div className="bg-light border-bottom p-0">
        <div className="d-flex align-items-center justify-content-between px-4 py-3">
          <div className="d-flex align-items-center">
            <h4 className="mb-0 me-2 fw-bold text-primary">
              {skillData?.title ? skillData.title : 'Skill'} Assessments
            </h4>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
              {stats.totalAssessments} Available
            </span>
          </div>
          
          {/* Back to Dashboard Button */}
          <button 
            className="btn primary rounded-pill btn-sm d-flex align-items-center"
            onClick={navigateToDashboard}
          >
            <House className="me-2" /> Back to Dashboard
          </button>
        </div>
        
        <div className="d-flex align-items-center border-top overflow-auto">
          <div 
            className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'available' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
            onClick={() => handleTabChange('available')}
            style={{ cursor: 'pointer' }}
          >
            <ClipboardCheck className="me-2" /> Available Assessments
          </div>
          
          {isAuthenticated && (
            <div 
              className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'my-submissions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
              onClick={() => handleTabChange('my-submissions')}
              style={{ cursor: 'pointer' }}
            >
              <PersonBadge className="me-2" /> My Submissions
            </div>
          )}
          
          {isSkillSharer && (
            <>
              <div 
                className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'create' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleTabChange('create')}
                style={{ cursor: 'pointer' }}
              >
                <PlusCircle className="me-2" /> Create Assessment
              </div>
              
              <div 
                className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'create-session' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleTabChange('create-session')}
                style={{ cursor: 'pointer' }}
              >
                <PlusCircle className="me-2" /> Create from Session
              </div>
              
              <div 
                className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'submissions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleTabChange('submissions')}
                style={{ cursor: 'pointer' }}
              >
                <Inbox className="me-2" /> All Submissions
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading message="Loading assessment dashboard..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Dashboard Header Card */}
        <div className="card mb-4 shadow-sm border-0 rounded-3 overflow-hidden">
          <div className="card-body p-0">
            <div className="row g-0">
              {/* Left Column - Skill Info */}
              <div className="col-md-4 border-end">
                <div className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary me-3"
                         style={{ width: '48px', height: '48px' }}>
                      <ClipboardCheck size={24} className="text-white" />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{skillData?.title || 'Skill Assessments'}</h5>
                      <p className="text-muted mb-0 small">
                        {skillData?.category || 'Learning Assessment Platform'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-4">
                    {skillData?.description || 'Demonstrate your skills and receive valuable feedback through our assessment platform.'}
                  </p>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center position-relative"
                      onClick={() => navigate(`/skills/${skillId}/assessments`)}
                    >
                      <span>Browse Available Assessments</span>
                      <ChevronRight className="position-absolute end-0 me-3" />
                    </button>
                    
                    {isSkillSharer && (
                      <>
                        <button 
                          className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                          onClick={() => navigate(`/skills/${skillId}/assessments/create`)}
                        >
                          <PlusCircle className="me-2" />
                          <span>Create New Assessment</span>
                        </button>
                        
                        <button 
                          className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                          onClick={() => navigate(`/skills/${skillId}/assessments/create-session`)}
                        >
                          <PlusCircle className="me-2" />
                          <span>Create from Session/Match</span>
                        </button>
                      </>
                    )}
                    
                    {/* Back to Dashboard Button - Alternative Placement */}
                    <button 
                      className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                      onClick={navigateToDashboard}
                    >
                      <ArrowLeftCircle className="me-2" />
                      <span>Back to Dashboard</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Stats */}
              <div className="col-md-8">
                <div className="p-4">
                  <h5 className="fw-bold mb-3">Assessment Statistics</h5>
                  
                  <div className="row g-3">
                    {/* Stat Card 1 */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              <ClipboardCheck className="text-primary" />
                            </div>
                            <span className="text-muted small">Total Assessments</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-primary">{stats.totalAssessments}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 2 */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-2">
                              <Inbox className="text-warning" />
                            </div>
                            <span className="text-muted small">Pending Review</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-warning">{stats.pendingSubmissions}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 3 */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-success bg-opacity-10 p-2 me-2">
                              <PersonBadge className="text-success" />
                            </div>
                            <span className="text-muted small">Completed</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-success">{stats.completedSubmissions}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 4 */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                              <ArrowRight className="text-info" />
                            </div>
                            <span className="text-muted small">Avg. Score</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-info">{stats.averageScore}%</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Card */}
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
          {/* Tabs */}
          <TabNavigation 
            activeTab={activeTab} 
            handleTabChange={handleTabChange} 
            isSkillSharer={isSkillSharer} 
            isAuthenticated={!!user}
          />

          {/* Content */}
          <div className="p-4">
            <Routes>
              <Route path="/" element={<AssessmentList skillId={skillId} isSkillSharer={isSkillSharer} />} />
              <Route path="/create" element={<CreateAssessment skillId={skillId} />} />
              <Route path="/create-session" element={<CreateSessionAssessment userId={user?._id} />} />
              <Route path="/submissions" element={<SubmissionsList skillId={skillId} />} />
              <Route path="/my-submissions" element={<LearnerSubmissionsList userId={user?._id} />} />
              <Route path="/assessment/:assessmentId/submit" element={<SubmitAssessment />} />
              <Route path="/assessment/:assessmentId/submissions" element={<SubmissionsList />} />
              <Route path="/submission/:submissionId/evaluate" element={<EvaluateSubmission />} />
              <Route path="/submitted" element={<SubmissionSuccess />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;