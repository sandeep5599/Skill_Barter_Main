import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Spinner, Nav, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Import subcomponents
import DashboardHeader from './dashboard/DashboardHeader';
import UserWelcomeCard from './dashboard/UserWelcomeCard';
import OverviewTab from './dashboard/OverviewTab';
import SessionsTab from './dashboard/SessionsTab';
import MatchesTab from './dashboard/MatchesTab';
import SkillsTab from './dashboard/SkillsTab';
import { fetchUserProfile, fetchCompletedSessionsCount } from './dashboard/dashboardUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

const Dashboard = () => {
  const [stats, setStats] = useState({
    points: 0,
    sessionsCompleted: 0,
    streak: 0,
    upcomingSessions: [],
    recentMatches: [],
    teachingSkills: [],
    learningSkills: [],
    userRank: null,
    leaderboard: []
  });
  
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Create a memoized refresh function with forced updates
  const triggerRefresh = useCallback(async () => {
    // First update the refresh trigger
    setRefreshTrigger(prev => prev + 1);
    
    // Then force a direct leaderboard fetch with no delay
    if (user?._id) {
      try {
        // Force fetch leaderboard directly
        const leaderboardResponse = await fetch(`${BACKEND_URL}/api/points/leaderboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store'
        });
        
        if (!leaderboardResponse.ok) {
          throw new Error(`Failed to fetch leaderboard: ${leaderboardResponse.status}`);
        }
        
        const leaderboardData = await leaderboardResponse.json();
        
        // Force fetch user points directly
        const pointsResponse = await fetch(`${BACKEND_URL}/api/points/user-points`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store'
        });
        
        if (!pointsResponse.ok) {
          throw new Error(`Failed to fetch user points: ${pointsResponse.status}`);
        }
        
        const pointsData = await pointsResponse.json();
        
        // Immediate state update with latest data
        setStats(prevStats => ({
          ...prevStats,
          points: pointsData.points || prevStats.points,
          streak: pointsData.streak || prevStats.streak,
          userRank: leaderboardData.userRank,
          leaderboard: leaderboardData.leaderboard
        }));
      } catch (error) {
        console.error('Error in forced refresh:', error);
        setError('Failed to refresh data. Please try again.');
        safeToast('Failed to refresh data. Please try again.', { type: 'error' });
      }
    }
  }, [user, BACKEND_URL]);

  // Check if user just logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      
      if (justLoggedIn === 'true' && user?._id) {
        // Clear the flag
        sessionStorage.removeItem('justLoggedIn');
        
        // Give a little time for everything to initialize properly
        setTimeout(() => {
          // Perform daily check-in automatically
          handleDailyCheckIn();
        }, 1000);
      }
    };
    
    checkLoginStatus();
  }, [user]); // Only run when user changes

  // Load user profile - now responds to refreshTrigger
  useEffect(() => {
    if (user?._id) {
      setIsLoading(true);
      setError(null);
      loadUserProfile()
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user, refreshTrigger]); // Added refreshTrigger as a dependency

  // Redirect to login if no user
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isLoading) {
        navigate('/login', { state: { from: location } });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, navigate, location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Improved toast display function to address "cannot set properties of undefined" error
  const safeToast = (content, options = {}) => {
    if (!content) return null;
    
    // Clone options to avoid mutations
    const safeOptions = { ...options };
    
    // Remove any problematic handlers that might cause closure issues
    if (safeOptions.onClose) delete safeOptions.onClose;
    if (safeOptions.onOpen) delete safeOptions.onOpen;
    
    try {
      // Use a simple configuration approach
      return toast(content, {
        closeOnClick: true,
        autoClose: 5000,
        ...safeOptions,
      });
    } catch (error) {
      console.error('Toast error:', error);
      console.log('Toast message:', typeof content === 'string' ? content : 'Notification');
      return null;
    }
  };

  // Updated toast for check-in with a more modern, cleaner design
  const showFuturisticCheckInToast = (pointsEarned = 1, streak = 1) => {
    // Create streak display with fire emoji for each 5 days of streak
    const getStreakDisplay = () => {
      const fireEmojis = '🔥'.repeat(Math.floor(streak / 5));
      return `${streak} day${streak !== 1 ? 's' : ''} ${fireEmojis}`;
    };

    // Create content for the toast
    const message = `DAILY CHECK-IN COMPLETE\n💰 +${pointsEarned} | ⚡ ${getStreakDisplay()}`;
    
    // Modern, cleaner toast style
    const toastStyle = {
      background: 'linear-gradient(to right, #4776E6, #8E54E9)',
      color: '#fff',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '16px',
      lineHeight: '1.6',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    };

    // Display the toast with the new styling
    safeToast(message, {
      type: 'success',
      position: "top-right",
      autoClose: 5000,
      style: toastStyle,
      className: 'modern-toast'
    });
  };

  // Handle daily check-in and show toast notification
const handleDailyCheckIn = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/points/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });
    
    // Parse the response json regardless of status code
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Show the updated toast message with streak information
      showFuturisticCheckInToast(data.pointsEarned || 1, data.streak || 1);
      
      // Force immediate refresh of leaderboard data
      await triggerRefresh();
    } else {
      // Check specifically for the already checked in message
      if (data.message === 'Already checked in today') {
        // Show a friendly reminder toast instead of an error
        safeToast(`You've already checked in today! Current streak: ${data.streak || 0} days`, {
          type: 'info',
          style: {
            background: 'linear-gradient(to right, #3498db, #2980b9)',
            color: '#fff',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: '1.6',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }
        });
      } else {
        // Handle other error cases
        safeToast(data.message || 'Unable to process check-in', {
          type: 'warning'
        });
      }
    }
  } catch (error) {
    console.error('Check-in error:', error);
    safeToast('Failed to process daily check-in. Please try again later.', {
      type: 'error'
    });
  }
};

  const handleFindLearningMatches = async () => {
    try {
      setIsGeneratingMatches(true);
      const response = await fetch(`${BACKEND_URL}/api/matches/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId: user._id }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to generate matches: ${response.status}`);
      }
  
      const result = await response.json();
  
      // Check both learning and teaching matches
      const learningMatches = result.matchesFound || [];
      const teachingMatches = result.teachingMatchesCreated || [];
      const totalMatches = learningMatches.length + teachingMatches.length;
      
      if (totalMatches > 0) {
        let message = '';
        
        if (learningMatches.length > 0 && teachingMatches.length > 0) {
          // Both learning and teaching matches found
          message = `🎉 Found ${learningMatches.length} learning matches and created ${teachingMatches.length} teaching matches!`;
        } else if (learningMatches.length > 0) {
          // Only learning matches found
          message = `🎉 Found ${learningMatches.length} matches for your learning needs!`;
        } else {
          // Only teaching matches created
          message = `🎉 Created ${teachingMatches.length} teaching matches!`;
        }
        
        safeToast(message, {
          type: 'success'
        });
      } else {
        safeToast('ℹ️ No new matches found. Try adding more skills you want to learn or teach!', {
          type: 'info'
        });
      }
  
      // Force immediate refresh with no delay
      await triggerRefresh();
      
      // Navigate to the appropriate matching interface tab
      if (learningMatches.length > 0) {
        navigate('/match/learning');
      } else if (teachingMatches.length > 0) {
        navigate('/match/teaching');
      } else {
        navigate('/match/learning');
      }
    } catch (error) {
      console.error('Error generating matches:', error);
      safeToast('❌ Failed to generate matches. Please try again.', {
        type: 'error'
      });
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  const fetchUserPoints = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/points/user-points`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        cache: 'no-store' // Prevent caching
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch user points: ${response.status}`);
      }
  
      const pointsData = await response.json();
      
      if (pointsData.success) {
        setStats(prevStats => ({
          ...prevStats,
          points: pointsData.points || 0,
          streak: pointsData.streak || 0
        }));
        
        return pointsData;
      } else {
        console.warn('Points data fetch returned unsuccessful status');
        return { points: 0, streak: 0 };
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
      safeToast('Failed to load your points information', {
        type: 'error'
      });
      return { points: 0, streak: 0 };
    }
  };

  // Enhanced loadUserProfile function with better error handling
  const loadUserProfile = async () => {
    try {
      if (!user || !user._id) {
        throw new Error('User not authenticated');
      }
      
      // Use Promise.all to parallelize the fetch operations
      const [userData, completedSessionsCount, pointsData, leaderboardData] = await Promise.all([
        fetchUserProfile(user._id, BACKEND_URL).catch(err => {
          console.error('Error fetching user profile:', err);
          return {};
        }),
        fetchCompletedSessionsCount(user._id, BACKEND_URL).catch(err => {
          console.error('Error fetching completed sessions:', err);
          return 0;
        }),
        fetchUserPoints(user._id).catch(err => {
          console.error('Error fetching user points:', err);
          return { points: 0, streak: 0 };
        }),
        // Directly fetch leaderboard here
        fetch(`${BACKEND_URL}/api/points/leaderboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store' // Prevent caching
        })
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
          return res.json();
        })
        .catch(err => {
          console.error('Error fetching leaderboard:', err);
          return { userRank: null, leaderboard: [] };
        })
      ]);
      
      // Update all state at once
      setStats(prevStats => ({
        ...prevStats,
        ...userData,
        sessionsCompleted: completedSessionsCount,
        points: pointsData.points || 0,
        streak: pointsData.streak || 0,
        userRank: leaderboardData.userRank,
        leaderboard: leaderboardData.leaderboard
      }));
      
      setError(null);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile. Please refresh the page.');
      safeToast('Error fetching user profile', {
        type: 'error'
      });
    }
  };

  // Calculate skill distribution percentages
  const teachingSkillsCount = stats.teachingSkills?.length || 0;
  const learningSkillsCount = stats.learningSkills?.length || 0;
  const totalSkills = teachingSkillsCount + learningSkillsCount;
  const teachingPercentage = totalSkills > 0 ? Math.round((teachingSkillsCount / totalSkills) * 100) : 0;
  const learningPercentage = totalSkills > 0 ? 100 - teachingPercentage : 0;

  if (isLoading && isFirstLoad) {
    return (
      <Container fluid className="vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container fluid className="vh-100 d-flex justify-content-center align-items-center">
        <Card className="shadow-sm border-0 p-4 text-center">
          <Card.Body>
            <h4 className="text-danger mb-3">Authentication Error</h4>
            <p>{error}</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/login')} 
              className="mt-3"
            >
              Go to Login
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 dashboard-container">
      {/* Toast Container with fixed configuration to avoid errors */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={false} /* Disabled to avoid potential issues */
        draggable={true}
        pauseOnHover={true}
        limit={3} /* Limit concurrent toasts to avoid performance issues */
      />
      
      {/* Header with Navigation */}
      <DashboardHeader 
        handleLogout={handleLogout} 
        navigate={navigate} 
        triggerRefresh={triggerRefresh}
      />

      {/* Loading indicator for subsequent loads */}
      {isLoading && !isFirstLoad && (
        <div className="position-fixed top-0 start-0 w-100 bg-primary" style={{ height: '3px', zIndex: 1100 }}>
          <div className="loading-bar"></div>
        </div>
      )}
      
      {/* Error alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      {/* User Welcome Card */}
      <UserWelcomeCard 
        user={user}
        stats={stats}
        handleFindLearningMatches={handleFindLearningMatches}
        isGeneratingMatches={isGeneratingMatches}
        teachingPercentage={teachingPercentage}
        learningPercentage={learningPercentage}
        handleDailyCheckIn={handleDailyCheckIn}
        navigate={navigate}
        triggerRefresh={triggerRefresh}
      />

      {/* Tab Navigation - Responsive */}
      <div className="dashboard-tabs mb-4">
        <Nav 
          variant="tabs" 
          className="border-0 flex-nowrap overflow-auto hide-scrollbar"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          }}
        >
          <Nav.Item>
            <Nav.Link 
              className={`fw-bold py-3 px-4 ${activeTab === 'overview' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
              onClick={() => setActiveTab('overview')}
              active={activeTab === 'overview'}
            >
              <i className="bi bi-grid me-2"></i>
              <span className="d-none d-sm-inline">Overview</span>
              <span className="d-sm-none">Overview</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              className={`fw-bold py-3 px-4 ${activeTab === 'sessions' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
              onClick={() => setActiveTab('sessions')}
              active={activeTab === 'sessions'}
            >
              <i className="bi bi-calendar-check me-2"></i>
              <span className="d-none d-sm-inline">Sessions</span>
              <span className="d-sm-none">Sessions</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              className={`fw-bold py-3 px-4 ${activeTab === 'matches' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
              onClick={() => setActiveTab('matches')}
              active={activeTab === 'matches'}
            >
              <i className="bi bi-people me-2"></i>
              <span className="d-none d-sm-inline">Matches</span>
              <span className="d-sm-none">Matches</span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              className={`fw-bold py-3 px-4 ${activeTab === 'skills' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
              onClick={() => setActiveTab('skills')}
              active={activeTab === 'skills'}
            >
              <i className="bi bi-star me-2"></i>
              <span className="d-none d-sm-inline">Skills</span>
              <span className="d-sm-none">Skills</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            navigate={navigate} 
            handleFindLearningMatches={handleFindLearningMatches}
            handleDailyCheckIn={handleDailyCheckIn}
            user={user}
            triggerRefresh={triggerRefresh}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab 
            sessions={stats.upcomingSessions} 
            matches={stats.recentMatches} 
            navigate={navigate} 
            triggerRefresh={triggerRefresh}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab 
            matches={stats.recentMatches} 
            navigate={navigate} 
            handleFindLearningMatches={handleFindLearningMatches} 
            triggerRefresh={triggerRefresh}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab 
            teachingSkills={stats.teachingSkills} 
            learningSkills={stats.learningSkills} 
            navigate={navigate} 
            triggerRefresh={triggerRefresh}
            isLoading={isLoading}
          />
        )}
      </div>
    </Container>
  );
};

// Add CSS for responsive styling
const styles = `
  /* Global responsive adjustments */
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Hide scrollbar but allow scrolling */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Loading bar animation */
  .loading-bar {
    height: 3px;
    background: linear-gradient(90deg, transparent, #ffffff, transparent);
    animation: loading 1.5s infinite;
    width: 50%;
  }

  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  /* Responsive tabs */
  @media (max-width: 768px) {
    .dashboard-tabs .nav-link {
      padding: 0.75rem 1rem !important;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 576px) {
    .dashboard-tabs .nav-link {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.8rem;
    }
  }

  /* Improve toast responsiveness */
  @media (max-width: 576px) {
    .Toastify__toast-container {
      width: 90vw !important;
      padding: 0 !important;
      left: 5vw !important;
    }
  }
`;

// Add the styles to the document
const styleEl = document.createElement('style');
styleEl.innerHTML = styles;
document.head.appendChild(styleEl);

export default Dashboard;