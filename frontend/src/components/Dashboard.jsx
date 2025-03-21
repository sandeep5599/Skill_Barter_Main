import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Nav } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    upcomingSessions: [],
    recentMatches: [],
    teachingSkills: [],
    learningSkills: [],
  });
  
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [localToast, setLocalToast] = useState({ 
    show: false, 
    message: '', 
    variant: 'success' 
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) loadUserProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showLocalToast = (message, variant = 'success') => {
    setLocalToast({ show: true, message, variant });
    setTimeout(() => setLocalToast({ show: false, message: '', variant: 'success' }), 3000);
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
  
      // Check both learning and teaching matches
      const learningMatches = result.matchesFound || [];
      const teachingMatches = result.teachingMatchesCreated || [];
      const totalMatches = learningMatches.length + teachingMatches.length;
      
      if (totalMatches > 0) {
        if (learningMatches.length > 0 && teachingMatches.length > 0) {
          // Both learning and teaching matches found
          toast.success(`🎉 Found ${learningMatches.length} learning matches and created ${teachingMatches.length} teaching matches!`);
        } else if (learningMatches.length > 0) {
          // Only learning matches found
          toast.success(`🎉 Found ${learningMatches.length} matches for your learning needs!`);
        } else {
          // Only teaching matches created
          toast.success(`🎉 Created ${teachingMatches.length} teaching matches!`);
        }
      } else {
        toast.info('ℹ️ No new matches found. Try adding more skills you want to learn or teach!');
      }
  
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
      toast.error('❌ Failed to generate matches. Please try again.');
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
      toast.error('Failed to load your points information');
      return { points: 0, streak: 0 };
    }
  };


  const loadUserProfile = async () => {
    try {
      const userData = await fetchUserProfile(user._id, BACKEND_URL);
      const completedSessionsCount = await fetchCompletedSessionsCount(user._id, BACKEND_URL);
      const pointsData = await fetchUserPoints(user._id);
      
      setStats(prevStats => ({
        ...prevStats,
        ...userData,
        sessionsCompleted: completedSessionsCount,
        points: pointsData.points || 0,
        streak: pointsData.streak || 0
      }));
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Error fetching user profile');
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
      {/* Header with Navigation */}
      <DashboardHeader handleLogout={handleLogout} navigate={navigate} />

      {/* User Welcome Card */}
      <UserWelcomeCard 
        user={user}
        stats={stats}
        handleFindLearningMatches={handleFindLearningMatches}
        isGeneratingMatches={isGeneratingMatches}
        teachingPercentage={teachingPercentage}
        learningPercentage={learningPercentage}
        navigate={navigate}
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
            user={user}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsTab 
            sessions={stats.upcomingSessions} 
            matches={stats.recentMatches} 
            navigate={navigate} 
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab 
            matches={stats.recentMatches} 
            navigate={navigate} 
            handleFindLearningMatches={handleFindLearningMatches} 
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab 
            teachingSkills={stats.teachingSkills} 
            learningSkills={stats.learningSkills} 
            navigate={navigate} 
          />
        )}
      </div>
    </Container>
  );
};

export default Dashboard;