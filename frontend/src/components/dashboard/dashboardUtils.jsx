// Fetch teaching and learning requests counts
// Fetch teaching and learning requests counts
export const fetchRequestCounts = async (userId, backendUrl) => {
  try {
    const response = await fetch(`${backendUrl}/api/skills/requests/counts/${userId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!response.ok) {
      console.warn('Unable to fetch request counts');
      return { teachingRequestsCount: 0, learningRequestsCount: 0 };
    }

    const data = await response.json();
    return {
      teachingRequestsCount: data.teachingRequestsCount || 0,
      learningRequestsCount: data.learningRequestsCount || 0
    };
  } catch (error) {
    console.error('Error fetching request counts:', error);
    return { teachingRequestsCount: 0, learningRequestsCount: 0 };
  }
};

// Helper function to get readable time until session
export const getTimeUntilSession = (sessionTime) => {
    const now = new Date();
    const sessionStart = new Date(sessionTime);
    const timeDiff = sessionStart - now;
    
    if (timeDiff <= 0) return 'Now';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  // Helper to format date and time
  export const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };
  
  // Check if a session is joinable (within 5 minutes before to 1 hour after start time)
  export const isSessionJoinable = (startTime) => {
    const now = new Date();
    const sessionStart = new Date(startTime);
    const timeDiff = sessionStart - now;
    return timeDiff <= 5 * 60 * 1000 && timeDiff > -60 * 60 * 1000;
  };
  
  // Fetch completed sessions count
  export const fetchCompletedSessionsCount = async (userId, backendUrl) => {
    try {
      const response = await fetch(`${backendUrl}/api/sessions/user/${userId}?status=completed`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
  
      if (!response.ok) {
        console.warn('Unable to fetch completed sessions count');
        return 0;
      }
  
      const data = await response.json();
      return data.sessions?.length || 0;
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
      return 0;
    }
  };
  
  // Fetch user profile data
  export const fetchUserProfile = async (userId, backendUrl) => {
    // Fetch user data and skills
    const [userResponse, skillsResponse] = await Promise.all([
      fetch(`${backendUrl}/api/users/${userId}`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      }),
      fetch(`${backendUrl}/api/skills/${userId}`, { 
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`, 
          'Content-Type': 'application/json' 
        } 
      })
    ]);
  
    if (!userResponse.ok || !skillsResponse.ok) throw new Error('Failed to fetch user data');
  
    const [userData, skillsData] = await Promise.all([
      userResponse.json(), 
      skillsResponse.json()
    ]);
    
    // Initialize result with skills data
    const result = { 
      learningSkills: skillsData.learningSkills || [], 
      teachingSkills: skillsData.teachingSkills || [],
      points: userData.points || 0
    };
  
    // Try to fetch sessions separately
    try {
      const sessionsResponse = await fetch(`${backendUrl}/api/sessions/user/${userId}?status=scheduled`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      });
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        result.upcomingSessions = sessionsData.sessions || [];
      } else {
        console.warn('Unable to fetch sessions:', await sessionsResponse.text());
        result.upcomingSessions = [];
      }
    } catch (sessionError) {
      console.warn('Session fetch error:', sessionError);
      result.upcomingSessions = [];
    }
    
    // Try to fetch matches separately
    try {
      const matchesResponse = await fetch(`${backendUrl}/api/matches/user/${userId}?status=accepted,pending,rejected`, { 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
      });
      
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        result.recentMatches = matchesData.matches || [];
      } else {
        console.warn('Unable to fetch matches:', await matchesResponse.text());
        result.recentMatches = [];
      }
    } catch (matchError) {
      console.warn('Match fetch error:', matchError);
      result.recentMatches = [];
    }
  
    return result;
  };