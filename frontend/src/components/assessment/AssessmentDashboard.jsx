import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Import components
import AssessmentList from './AssessmentList';
import CreateAssessment from './CreateAssessment';
import CreateSessionAssessment from './CreateSessionAssessment';
import CompletedSessionsList from './CompletedSessionsList';
import SubmissionsList from './SubmissionsList';
import LearnerSubmissionsList from './LearnerSubmissionsList';
import SubmitAssessment from './SubmitAssessment';
import EvaluateSubmission from './EvaluateSubmission';
import SubmissionSuccess from './SubmissionSuccess'; 
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
  House,
  Calendar,
  CheckCircle,
  Mortarboard 
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
    } else {
      setActiveTab('available');
    }
  
    // Check if user is a skill sharer and fetch skill data
    const fetchData = async () => {
      try {
        console.log("Starting fetchData function");
        setLoading(true);
        setError('');
        
        let userIsSkillSharer = false; // Initialize flag
        
// Inside the fetchData function in AssessmentDashboard.jsx

// Replace the stats fetch block with this improved version
console.log("About to fetch stats for skillId:", skillId);
// Fetch assessment stats
if (skillId) {
  try {
    const statsResponse = await fetch(`/api/assessments/${skillId}/assessment-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      cache: 'no-store'
    });
    
    console.log("Assessment dashboard stats response: ", statsResponse.status);

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log("Stats Data from Assessment Dashboard: ", statsData);
      
      if (statsData && statsData.success && statsData.stats) {
        setStats({
          totalAssessments: statsData.stats.totalAssessments || 0,
          pendingSubmissions: statsData.stats.pendingSubmissions || 0,
          completedSubmissions: statsData.stats.completedSubmissions || 0,
          averageScore: statsData.stats.averageScore || 0,
          totalCompletedSessions: completedSessions.length // Set this after fetching sessions
        });
        
        console.log("Updated stats:", statsData.stats);
      } else {
        console.warn("Stats data format unexpected:", statsData);
      }
    } else {
      console.warn("Failed to fetch stats:", statsResponse.status);
    }
  } catch (statsError) {
    console.error("Error fetching stats:", statsError);
    // Don't fail the entire component load if stats fetch fails
  }
}

// Add this to the AssessmentDashboard component's fetchData function

// If no skillId is present, fetch general stats
if (!skillId) {
  console.log("No skillId present, fetching general stats");
  try {
    const generalStatsResponse = await fetch(`/api/assessments/general-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      cache: 'no-store'
    });
    
    if (generalStatsResponse.ok) {
      const generalStatsData = await generalStatsResponse.json();
      
      if (generalStatsData && generalStatsData.success && generalStatsData.stats) {
        setStats({
          totalAssessments: generalStatsData.stats.totalAssessments || 0,
          pendingSubmissions: generalStatsData.stats.pendingSubmissions || 0,
          completedSubmissions: generalStatsData.stats.completedSubmissions || 0,
          averageScore: generalStatsData.stats.averageScore || 0,
          totalCompletedSessions: completedSessions.length // Set this after fetching sessions
        });
      }
    }
  } catch (error) {
    console.error("Error fetching general stats:", error);
    // Use default stats values
    setStats({
      totalAssessments: 0,
      pendingSubmissions: 0,
      completedSubmissions: 0,
      averageScore: 0,
      totalCompletedSessions: completedSessions.length
    });
  }
}

        // Fetch completed sessions where user was the teacher
        if (user?._id) {
          try {
            const sessionsResponse = await fetch(`/api/sessions/user/${user._id}?status=completed&status=scheduled`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              cache: 'no-store'
            });
            
            if (!sessionsResponse.ok) {
              throw new Error(`Failed to fetch sessions: ${sessionsResponse.status}`);
            }
            
            const sessionsData = await sessionsResponse.json();
            
            // Filter sessions where user is the teacher (using teacherId)
            // Include both 'completed' and 'scheduled' sessions
            if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
              
              // Use this more robust comparison instead
              const teachingSessions = sessionsData.sessions.filter(session => {
                const sessionTeacherId = typeof session.teacherId === 'object' ? 
                  session.teacherId._id || session.teacherId.$oid : session.teacherId;
                const userIdForComparison = user._id.$oid || user._id;
                
                return (session.status === 'completed' || session.status === 'scheduled') && 
                      sessionTeacherId === userIdForComparison;
              });
              
              setCompletedSessions(teachingSessions);
              
              // If user has teaching sessions, they are a skill sharer
              if (teachingSessions.length > 0) {
                userIsSkillSharer = true;
              }
              
              // Update the total completed sessions count in stats
              setStats(prevStats => ({
                ...prevStats,
                totalCompletedSessions: teachingSessions.length
              }));
              
              console.log("Total completed sessions updated:", teachingSessions.length);
            } else {
              console.error('Sessions data is not in expected format:', sessionsData);
              setCompletedSessions([]);
            }
          } catch (sessionErr) {
            console.error('Error fetching sessions:', sessionErr);
            // Don't fail the entire component if sessions fetch fails
            setCompletedSessions([]);
          }
        }
        
        // Set the isSkillSharer state after all checks
        setIsSkillSharer(userIsSkillSharer);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load information. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
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
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    handleTabChange('create-session');
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
            className="btn btn-primary rounded-pill btn-sm d-flex align-items-center"
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
                className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'completed-sessions' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleTabChange('completed-sessions')}
                style={{ cursor: 'pointer' }}
              >
                <CheckCircle className="me-2" /> Teaching Sessions
                {completedSessions.length > 0 && (
                  <span className="ms-2 badge bg-primary rounded-pill">{completedSessions.length}</span>
                )}
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
                {stats.pendingSubmissions > 0 && (
                  <span className="ms-2 badge bg-warning rounded-pill">{stats.pendingSubmissions}</span>
                )}
              </div>
              
              <div 
                className={`px-4 py-3 cursor-pointer border-end d-flex align-items-center ${activeTab === 'evaluate' ? 'bg-white border-bottom-0 fw-bold text-primary' : 'text-muted'}`}
                onClick={() => handleTabChange('evaluate')}
                style={{ cursor: 'pointer' }}
              >
                <Mortarboard  className="me-2" /> Evaluate Learners
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Define TeacherCompletedSessionsList as a proper component
  const TeacherCompletedSessionsList = ({ sessions, onCreateAssessment, existingAssessments }) => {
    console.log("TeacherCompletedSessionsList received sessions:", sessions);
    
    if (!sessions || sessions.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <Calendar size={48} className="text-muted" />
          </div>
          <h5 className="fw-bold">No Teaching Sessions</h5>
          <p className="text-muted">You haven't taught any sessions yet or they're not available.</p>
          <button 
            className="btn btn-outline-primary rounded-pill mt-3"
            onClick={() => handleTabChange('available')}
          >
            <ClipboardCheck className="me-2" /> Browse Available Assessments
          </button>
        </div>
      );
    }
  
    // Helper function to check if a session already has an assessment
    const hasExistingAssessment = (sessionId) => {
      if (!existingAssessments || !Array.isArray(existingAssessments)) return false;
      return existingAssessments.some(assessment => 
        assessment.sessionId === sessionId || 
        (assessment.sessionId && typeof assessment.sessionId === 'object' && assessment.sessionId._id === sessionId)
      );
    };
  
    // Helper function to get the button for assessment action
    const getAssessmentButton = (session) => {
      const sessionId = session._id;
      const hasAssessment = hasExistingAssessment(sessionId);
      
      if (hasAssessment) {
        const assessment = existingAssessments.find(a => 
          a.sessionId === sessionId || 
          (a.sessionId && typeof a.sessionId === 'object' && a.sessionId._id === sessionId)
        );
        
        return (
          <div className="d-grid mt-3">
            <button 
              className="btn btn-outline-success rounded-pill py-2 d-flex align-items-center justify-content-center"
              onClick={() => onViewAssessment(assessment)}
            >
              <CheckCircle className="me-2" />
              <span>View Assessment</span>
            </button>
          </div>
        );
      } else {
        return (
          <div className="d-grid mt-3">
            <button 
              className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
              onClick={() => onCreateAssessment(session)}
            >
              <PlusCircle className="me-2" />
              <span>Create Assessment</span>
            </button>
          </div>
        );
      }
    };
  
    // We'll need this function for the button
    const onViewAssessment = (assessment) => {
      // Navigate to assessment view page
      window.location.href = `/assessment/${assessment._id}/view`;
      // Alternatively, if using react-router-dom:
      // navigate(`/assessment/${assessment._id}/view`);
    };
  
    return (
      <div className="sessions-list">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Your Teaching Sessions ({sessions.length})</h5>
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle rounded-pill btn-sm" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              Sort By
            </button>
            <ul className="dropdown-menu" aria-labelledby="sortDropdown">
              <li><button className="dropdown-item">Most Recent</button></li>
              <li><button className="dropdown-item">Oldest First</button></li>
              <li><button className="dropdown-item">Student Name</button></li>
            </ul>
          </div>
        </div>
        
        <div className="row g-4">
          {sessions.map((session, index) => {
            // Format date and time
            const sessionDate = session.startTime ? new Date(session.startTime) : 
                               session.date ? new Date(session.date) : new Date();
            const formattedDate = sessionDate.toLocaleDateString();
            const formattedTime = sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Calculate duration
            let duration = 'N/A';
            if (session.duration) {
              duration = `${session.duration} minutes`;
            } else if (session.startTime && session.endTime) {
              const startTime = new Date(session.startTime);
              const endTime = new Date(session.endTime);
              if (!isNaN(startTime) && !isNaN(endTime)) {
                const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
                duration = `${durationMinutes} minutes`;
              }
            }
            
            // Get session title
            const sessionTitle = session.title || 
                               (session.skillDetails && session.skillDetails.title) || 
                               (session.skillId && typeof session.skillId === 'object' && session.skillId.title) ||
                               'Skill Session';
            
            // Get student name
            const studentName = session.studentName || 
                              (session.learnerDetails && session.learnerDetails.name) ||
                              (session.studentId && typeof session.studentId === 'object' && session.studentId.name) ||
                              'Student';
            
            return (
              <div key={session._id || index} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-3 position-relative">
                  {/* Status badge */}
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className={`badge ${session.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                      {session.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </span>
                    {hasExistingAssessment(session._id) && (
                      <span className="badge bg-info ms-1">Assessment Created</span>
                    )}
                  </div>
                  
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                        <Calendar className="text-primary" />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">{sessionTitle}</h5>
                        <p className="text-muted mb-0 small">
                          {formattedDate} at {formattedTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Duration:</span>
                        <span className="fw-medium">{duration}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Student:</span>
                        <span className="fw-medium">{studentName}</span>
                      </div>
                      {session.description && (
                        <div className="mt-3">
                          <p className="text-muted small mb-1">Description:</p>
                          <p className="mb-0 small text-truncate">{session.description}</p>
                        </div>
                      )}
                      {session.notes && (
                        <div className="mt-3">
                          <p className="text-muted small mb-1">Session Notes:</p>
                          <p className="mb-0 small text-truncate">{session.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    {getAssessmentButton(session)}
                  </div>
                </div>
              </div>
            );
          })}
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

  // Function to format stats safely
  const formatStat = (value, isPercentage = false) => {
    if (value === null || value === undefined) return isPercentage ? '0%' : '0';
    if (isPercentage) {
      // Format as percentage with one decimal place
      return `${parseFloat(value).toFixed(1)}%`;
    }
    return value.toString();
  };

  // Render content based on active tab instead of using Routes component directly
  const renderContent = () => {
    try {
      if (activeTab === 'completed-sessions') {
        return (
          <TeacherCompletedSessionsList 
            sessions={completedSessions} 
            onCreateAssessment={handleSessionSelect}
          />
        );
      } else if (activeTab === 'create-session') {
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
      } else if (activeTab === 'available') {
        return <AssessmentList skillId={skillId} isSkillSharer={isSkillSharer} />;
      } else if (activeTab === 'create') {
        return <CreateAssessment skillId={skillId} />;
      } else if (activeTab === 'submissions') {
        return <SubmissionsList skillId={skillId} />;
      } else if (activeTab === 'my-submissions') {
        // Check if LearnerSubmissionsList is a valid component before rendering
        if (typeof LearnerSubmissionsList !== 'function') {
          console.error('LearnerSubmissionsList is not a valid component:', LearnerSubmissionsList);
          return <div className="alert alert-danger">Unable to load submissions. Component error.</div>;
        }
        return <LearnerSubmissionsList userId={user?._id} />;
      } else if (activeTab === 'evaluate') {
        return <EvaluateSubmission skillId={skillId} userId={user?._id} />;
      } else {
        // Default to assessment list if no match
        return <AssessmentList skillId={skillId} isSkillSharer={isSkillSharer} />;
      }
    } catch (err) {
      console.error('Error rendering content:', err);
      return <div className="alert alert-danger">Failed to render content: {err.message}</div>;
    }
  };

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
                      <h5 className="mb-0 fw-bold">{skillData?.title || 'Assessment Dashboard'}</h5>
                      <p className="text-muted mb-0 small">
                        {skillData?.category || 'Skill Assessment Platform'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted mb-4">
                    {skillData?.description || 'Demonstrate your skills and receive valuable feedback through our assessment platform.'}
                  </p>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center position-relative"
                      onClick={() => handleTabChange('available')}
                    >
                      <span>Browse Available Assessments</span>
                      <ChevronRight className="position-absolute end-0 me-3" />
                    </button>
                    
                    {isSkillSharer && (
                      <>
                        <button 
                          className="btn primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                          onClick={() => handleTabChange('completed-sessions')}
                        >
                          <CheckCircle className="me-2" />
                          <span>View Teaching Sessions</span>
                          {completedSessions.length > 0 && (
                            <span className="ms-2 badge bg-primary rounded-pill">{completedSessions.length}</span>
                          )}
                        </button>
                        
                        <button 
                          className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                          onClick={() => handleTabChange('evaluate')}
                        >
                          <Mortarboard  className="me-2" />
                          <span>Evaluate Learner Submissions</span>
                        </button>
                      </>
                    )}
                    
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
                  <h5 className="fw-bold mb-3">Assessment Statistics</h5>
                  
                  <div className="row g-3">
                    {/* Stat Card 1 - Total Assessments */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                              <ClipboardCheck className="text-primary" />
                            </div>
                            <span className="text-muted small">Total Assessments</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-primary">{formatStat(stats.totalAssessments)}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 2 - Pending Review */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-2">
                              <Inbox className="text-warning" />
                            </div>
                            <span className="text-muted small">Pending Review</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-warning">{formatStat(stats.pendingSubmissions)}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 3 - Teaching Sessions */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div className="rounded-circle bg-success bg-opacity-10 p-2 me-2">
                              <CheckCircle className="text-success" />
                            </div>
                            <span className="text-muted small">Teaching Sessions</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-success">{formatStat(stats.totalCompletedSessions)}</h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stat Card 4 - Average Score */}
                    <div className="col-md-6 col-lg-3">
                      <div className="card h-100 border-0 shadow-sm rounded-3">
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center mb-2">
                          <div className="rounded-circle bg-info bg-opacity-10 p-2 me-2">
                              <ArrowRight className="text-info" />
                            </div>
                            <span className="text-muted small">Avg. Score</span>
                          </div>
                          <h3 className="fw-bold mb-0 text-info">{formatStat(stats.averageScore, true)}</h3>
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
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;