import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Card, Button, Spinner, Nav, Row, Col, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

// Import subcomponents
import DashboardHeader from './dashboard/DashboardHeader';
import UserWelcomeCard from './dashboard/UserWelcomeCard';
import OverviewTab from './dashboard/OverviewTab';
import SessionsTab from './dashboard/SessionsTab';
import MatchesTab from './dashboard/MatchesTab';
import SkillsTab from './dashboard/SkillsTab';
import { fetchUserProfile, fetchCompletedSessionsCount } from './dashboard/dashboardUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';

// Styled components for responsive design
const FullScreenContainer = styled(Container)`
  min-height: 100vh;
  padding: 0;
  margin: 0;
  max-width: 100%;
`;

const DashboardContent = styled.div`
  padding: 0 1rem;
  
  @media (min-width: 992px) {
    padding: 0 2rem;
  }
  
  @media (min-width: 1200px) {
    padding: 0 3rem;
    max-width: 1800px;
    margin: 0 auto;
  }
`;

const TabNavigation = styled(Nav)`
  border-bottom: 1px solid #dee2e6;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .nav-link {
    white-space: nowrap;
    font-weight: 600;
    padding: 1rem 1.5rem;
    color: #6c757d;
    border: none;
    
    &.active {
      color: #0d6efd;
      border-bottom: 3px solid #0d6efd;
      background-color: transparent;
    }
    
    &:hover:not(.active) {
      color: #0d6efd;
      border-bottom: 3px solid #e9ecef;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, transparent, #0d6efd, transparent);
  animation: progress 1.5s infinite;
  z-index: 1100;
  
  @keyframes progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ErrorAlert = styled(Alert)`
  margin: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

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
  const refreshTimeoutRef = useRef(null);

  // Auto-refresh mechanism when child components trigger updates
  const handleChildUpdate = useCallback(() => {
    // Clear any existing timeout to prevent multiple refreshes
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Set a small delay before refreshing to batch potential multiple updates
    refreshTimeoutRef.current = setTimeout(() => {
      triggerRefresh();
    }, 300);
  }, []);

  // Create a memoized refresh function with forced updates
  const triggerRefresh = useCallback(async () => {
    // First update the refresh trigger
    setRefreshTrigger(prev => prev + 1);
    
    // Then force a direct data fetch with no delay
    if (user?._id) {
      try {
        setIsLoading(true);
        
        // Force fetch all critical data in parallel
        const [leaderboardResponse, pointsResponse] = await Promise.all([
          // Force fetch leaderboard directly
          fetch(`${BACKEND_URL}/api/points/leaderboard`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            cache: 'no-store',
            credentials: 'include' // Include credentials for potential CORS situations
          }),
          
          // Force fetch user points directly
          fetch(`${BACKEND_URL}/api/points/user-points`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            cache: 'no-store',
            credentials: 'include'
          })
        ]);
        
        // Handle potential API errors
        if (!leaderboardResponse.ok) {
          console.warn(`Leaderboard fetch failed: ${leaderboardResponse.status}`);
        }
        
        if (!pointsResponse.ok) {
          console.warn(`Points fetch failed: ${pointsResponse.status}`);
        }
        
        // Parse responses
        const [leaderboardData, pointsData] = await Promise.all([
          leaderboardResponse.ok ? leaderboardResponse.json() : { userRank: null, leaderboard: [] },
          pointsResponse.ok ? pointsResponse.json() : { points: 0, streak: 0 }
        ]);
        
        // Immediate state update with latest data
        setStats(prevStats => ({
          ...prevStats,
          points: pointsData.points !== undefined ? pointsData.points : prevStats.points,
          streak: pointsData.streak !== undefined ? pointsData.streak : prevStats.streak,
          userRank: leaderboardData.userRank !== undefined ? leaderboardData.userRank : prevStats.userRank,
          leaderboard: leaderboardData.leaderboard || prevStats.leaderboard
        }));
      } catch (error) {
        console.error('Error in forced refresh:', error);
        setError('Failed to refresh data. Please try again.');
        safeToast('Failed to refresh data. Please try again.', { type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

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
        .finally(() => {
          setIsLoading(false);
          if (isFirstLoad) {
            setIsFirstLoad(false);
          }
        });
    } else {
      setIsLoading(false);
    }
  }, [user, refreshTrigger]); // Added refreshTrigger as a dependency

  // Redirect to login if no user
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !isLoading) {
        navigate('/login', { state: { from: location }, replace: true });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, navigate, location]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
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
        pauseOnHover: true,
        draggable: true,
        position: "top-right",
        hideProgressBar: false,
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
      const fireEmojis = '🔥'.repeat(Math.floor(streak / 5) || 1);
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
        },
        credentials: 'include'
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
        credentials: 'include'
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
        cache: 'no-store', // Prevent caching
        credentials: 'include'
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
          cache: 'no-store', // Prevent caching
          credentials: 'include'
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
      throw error; // Re-throw to be handled by the caller
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
      <FullScreenContainer fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} className="mb-4" />
          <h4 className="text-primary">Loading your dashboard...</h4>
          <p className="text-muted">Please wait while we prepare your experience</p>
        </div>
      </FullScreenContainer>
    );
  }

  if (error && !user) {
    return (
      <FullScreenContainer fluid className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <Card className="shadow-lg border-0 p-4 text-center" style={{ maxWidth: "500px" }}>
          <Card.Body>
            <h3 className="text-danger mb-3">Authentication Error</h3>
            <p className="mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/login', { replace: true })} 
              className="px-4 py-2"
              size="lg"
            >
              Go to Login
            </Button>
          </Card.Body>
        </Card>
      </FullScreenContainer>
    );
  }

  return (
    <FullScreenContainer fluid className="dashboard-wrapper bg-light">
      {/* Loading indicator */}
      {isLoading && <LoadingOverlay />}
      
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
        onUpdate={handleChildUpdate}
      />

      <DashboardContent>
        {/* Error alert */}
        {error && (
          <ErrorAlert variant="danger" dismissible onClose={() => setError(null)}>
            <Alert.Heading>Error</Alert.Heading>
            <p className="mb-0">{error}</p>
          </ErrorAlert>
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
          onUpdate={handleChildUpdate}
        />

        {/* Tab Navigation - Responsive */}
        <div className="dashboard-tabs mb-4">
          <TabNavigation className="mb-4">
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('overview')}
                active={activeTab === 'overview'}
              >
                <i className="bi bi-grid me-2"></i>
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('sessions')}
                active={activeTab === 'sessions'}
              >
                <i className="bi bi-calendar-check me-2"></i>
                Sessions
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('matches')}
                active={activeTab === 'matches'}
              >
                <i className="bi bi-people me-2"></i>
                Matches
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                onClick={() => setActiveTab('skills')}
                active={activeTab === 'skills'}
              >
                <i className="bi bi-star me-2"></i>
                Skills
              </Nav.Link>
            </Nav.Item>
          </TabNavigation>
        </div>

        {/* Tab Content */}
        <div className="tab-content pb-5">
          {activeTab === 'overview' && (
            <OverviewTab 
              stats={stats} 
              navigate={navigate} 
              handleFindLearningMatches={handleFindLearningMatches}
              handleDailyCheckIn={handleDailyCheckIn}
              user={user}
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsTab 
              sessions={stats.upcomingSessions} 
              matches={stats.recentMatches} 
              navigate={navigate} 
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesTab 
              matches={stats.recentMatches} 
              navigate={navigate} 
              handleFindLearningMatches={handleFindLearningMatches} 
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsTab 
              teachingSkills={stats.teachingSkills} 
              learningSkills={stats.learningSkills} 
              navigate={navigate} 
              onUpdate={handleChildUpdate}
              isLoading={isLoading}
            />
          )}
        </div>
      </DashboardContent>
    </FullScreenContainer>
  );
};

export default Dashboard;