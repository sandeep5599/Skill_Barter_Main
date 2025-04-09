import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Spinner, Nav } from 'react-bootstrap';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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
  
  const { user, logout } = useAuth();
  console.log('User data from Dashboard:', user); // Debugging line to check user object
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
          // Add cache-busting query parameter
          cache: 'no-store'
        });
        
        if (leaderboardResponse.ok) {
          const leaderboardData = await leaderboardResponse.json();
          
          // Force fetch user points directly
          const pointsResponse = await fetch(`${BACKEND_URL}/api/points/user-points`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            // Add cache-busting query parameter
            cache: 'no-store'
          });
          
          if (pointsResponse.ok) {
            const pointsData = await pointsResponse.json();
            
            // Immediate state update with latest data
            setStats(prevStats => ({
              ...prevStats,
              points: pointsData.points || prevStats.points,
              streak: pointsData.streak || prevStats.streak,
              userRank: leaderboardData.userRank,
              leaderboard: leaderboardData.leaderboard
            }));
          }
        }
      } catch (error) {
        console.error('Error in forced refresh:', error);
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
      loadUserProfile();
    }
  }, [user, refreshTrigger]); // Added refreshTrigger as a dependency

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Improved toast display function to address "cannot set properties of undefined" error
  const safeToast = (content, options = {}) => {
    // Clone options to avoid mutations
    const safeOptions = { ...options };
    
    // Remove any problematic handlers that might cause closure issues
    if (safeOptions.onClose) delete safeOptions.onClose;
    if (safeOptions.onOpen) delete safeOptions.onOpen;
    
    try {
      // Use a simple configuration approach
      return toast(content, {
        ...safeOptions,
        // Ensure these props are set properly
        closeOnClick: true,
        autoClose: 5000,
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
      
      const data = await response.json();
      
      if (data.success) {
        // Show the updated toast message with streak information
        showFuturisticCheckInToast(data.pointsEarned || 1, data.streak || 1);
        
        // Force immediate refresh of leaderboard data
        await triggerRefresh();
      } else {
        // Only handle errors, skip "already checked in" notification
        if (data.message !== 'Already checked in today') {
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
        throw new Error('Failed to generate matches');
      }
  
      const result = await response.json();

      console.log('Generated matches:', result);
  
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
        throw new Error('Failed to fetch user points');
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

  // Enhanced loadUserProfile function 
  const loadUserProfile = async () => {
    try {
      // Use Promise.all to parallelize the fetch operations
      const [userData, completedSessionsCount, pointsData, leaderboardData] = await Promise.all([
        fetchUserProfile(user._id, BACKEND_URL),
        fetchCompletedSessionsCount(user._id, BACKEND_URL),
        fetchUserPoints(user._id),
        // Directly fetch leaderboard here
        fetch(`${BACKEND_URL}/api/points/leaderboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store' // Prevent caching
        }).then(res => res.json())
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
    } catch (error) {
      console.error('Error loading user profile:', error);
      safeToast('Error fetching user profile', {
        type: 'error'
      });
    }
  };

  // Calculate skill distribution percentages
  const teachingSkillsCount = stats.teachingSkills.length;
  const learningSkillsCount = stats.learningSkills.length;
  const totalSkills = teachingSkillsCount + learningSkillsCount;
  const teachingPercentage = totalSkills > 0 ? Math.round((teachingSkillsCount / totalSkills) * 100) : 0;
  const learningPercentage = totalSkills > 0 ? 100 - teachingPercentage : 0;

  return (
    <Container fluid className="py-4">
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
      <DashboardHeader handleLogout={handleLogout} navigate={navigate} triggerRefresh={triggerRefresh}/>

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
        triggerRefresh={triggerRefresh} // Pass the refresh function to child components
      />

      {/* Tab Navigation */}
      <Nav variant="tabs" className="mb-4 border-0">
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'overview' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('overview')}
            active={activeTab === 'overview'}
          >
            Overview
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'sessions' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('sessions')}
            active={activeTab === 'sessions'}
          >
            Sessions
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'matches' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('matches')}
            active={activeTab === 'matches'}
          >
            Matches
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            className={`fw-bold ${activeTab === 'skills' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
            onClick={() => setActiveTab('skills')}
            active={activeTab === 'skills'}
          >
            Skills
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            navigate={navigate} 
            handleFindLearningMatches={handleFindLearningMatches}
            handleDailyCheckIn={handleDailyCheckIn}
            user={user}
            triggerRefresh={triggerRefresh} // Pass the refresh function to child components
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab 
            sessions={stats.upcomingSessions} 
            matches={stats.recentMatches} 
            navigate={navigate} 
            triggerRefresh={triggerRefresh} // Pass the refresh function to child components
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab 
            matches={stats.recentMatches} 
            navigate={navigate} 
            handleFindLearningMatches={handleFindLearningMatches} 
            triggerRefresh={triggerRefresh} // Pass the refresh function to child components
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab 
            teachingSkills={stats.teachingSkills} 
            learningSkills={stats.learningSkills} 
            navigate={navigate} 
            triggerRefresh={triggerRefresh} // Pass the refresh function to child components
          />
        )}
      </div>
    </Container>
  );
};

export default Dashboard;