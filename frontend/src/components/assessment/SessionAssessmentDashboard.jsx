import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Import components
import CompletedSessionsList from './CompletedSessionsList';
import CreateSessionAssessment from './CreateSessionAssessment';
import Loading from '../common/Loading';
import Error from '../common/Error';

// Import icons
import { 
  ClipboardCheck, 
  PlusCircle, 
  CheckCircle,
  Calendar,
  ArrowLeftCircle,
  House
} from 'react-bootstrap-icons';

const SessionAssessmentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('completed-sessions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCompletedSessions: 0,
    totalAcceptedMatches: 0,
    totalAssessments: 0
  });

  useEffect(() => {
    // Determine active tab from URL
    if (location.pathname.includes('/create-assessment')) {
      setActiveTab('create-assessment');
    } else {
      setActiveTab('completed-sessions');
    }

    // Fetch stats about user's sessions and matches
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get completed sessions
        const sessionsResponse = await axios.get(`/api/sessions/user/${user._id}`);
        const completedSessions = sessionsResponse.data.sessions.filter(
          session => session.status === 'completed'
        );
        
        // Get accepted matches
        const matchesResponse = await axios.get(`/api/matches/user/${user._id}`);
        const acceptedMatches = matchesResponse.data.matches.filter(
          match => match.status === 'accepted' || match.status === 'completed'
        );
        
        // Get total assessments
        const assessmentsResponse = await axios.get('/api/assessments/user');
        
        setStats({
          totalCompletedSessions: completedSessions.length,
          totalAcceptedMatches: acceptedMatches.length,
          totalAssessments: assessmentsResponse.data.assessments.length
        });
        
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load session and match information');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [location.pathname, user._id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'completed-sessions') {
      navigate('/sessions/assessments');
    } else if (tab === 'create-assessment') {
      navigate('/sessions/assessments/create-assessment');
    }
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // TabNavigation component
  const TabNavigation = ({ activeTab, handleTabChange, isAuthenticated }) => {
    return (
      <div className="bg-light border-bottom p-0">
        <div className="d-flex align-items-center justify-content-between px-4 py-3">
          <div className="d-flex align-items-center">
            <h4 className="mb-0 me-2 fw-bold text-primary">
              Session Assessments
            </h4>
            <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
              {stats.totalCompletedSessions} Completed Sessions
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
            className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'completed-sessions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
            onClick={() => handleTabChange('completed-sessions')}
            style={{ cursor: 'pointer' }}
          >
            <CheckCircle className="me-2" /> Completed Sessions
          </div>
          
          {isAuthenticated && (
            <div 
              className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'create-assessment' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
              onClick={() => handleTabChange('create-assessment')}
              style={{ cursor: 'pointer' }}
            >
              <PlusCircle className="me-2" /> Create Assessment
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading message="Loading sessions and matches..." />;
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
              {/* Left Column - Info */}
              <div className="col-md-4 border-end">
                <div className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary me-3"
                         style={{ width: '48px', height: '48px' }}>
                      <ClipboardCheck size={24} className="text-white" />
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">Session Assessments</h5>
                      <p className="text-muted mb-0 small">
                        Create assessments from completed sessions
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-4">
                    After completing skill sessions, create assessments to evaluate progress and provide structured feedback.
                  </p>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                      onClick={() => handleTabChange('completed-sessions')}
                    >
                      <CheckCircle className="me-2" />
                      <span>View Completed Sessions</span>
                    </button>
                    
                    <button 
                      className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                      onClick={() => handleTabChange('create-assessment')}
                    >
                      <PlusCircle className="me-2" />
                      <span>Create New Assessment</span>
                    </button>
                    
                    {/* Back to Dashboard Button */}
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
                  <h5 className="fw-bold mb-3">Sessions Overview</h5>
                  
                  <div className="row g-3">
                    {/* Stat Card 1 */}
                    <div className="col-md-4">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-success bg-opacity-10 p-2 me-2">
                              <CheckCircle className="text-success" />
                            </div>
                            <span className="text-muted small">Completed Sessions</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-success">{stats.totalCompletedSessions}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 2 */}
                    <div className="col-md-4">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              <Calendar className="text-primary" />
                            </div>
                            <span className="text-muted small">Accepted Matches</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-primary">{stats.totalAcceptedMatches}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 3 */}
                    <div className="col-md-4">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                              <ClipboardCheck className="text-info" />
                            </div>
                            <span className="text-muted small">Total Assessments</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-info">{stats.totalAssessments}</h3>
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
            isAuthenticated={!!user}
          />

          {/* Content */}
          <div className="p-4">
            <Routes>
              <Route path="/" element={<CompletedSessionsList userId={user?._id} />} />
              <Route path="/create-assessment" element={<CreateSessionAssessment userId={user?._id} />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAssessmentDashboard;