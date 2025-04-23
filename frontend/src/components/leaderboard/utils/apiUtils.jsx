// src/components/Leaderboard/utils/apiUtils.js
import axios from 'axios';

// Fetch leaderboard data
export const fetchLeaderboardData = async (params) => {
  try {
    // Construct the query parameters
    const queryParams = new URLSearchParams({
      timeFrame: params.timeFrame,
      category: params.category,
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      search: params.searchQuery || ''
    });
    
    const response = await axios.get(`/api/points/leaderboard?${queryParams.toString()}`);
    
    if (response.data.success) {
      return {
        leaderboard: response.data.leaderboard,
        totalPages: Math.ceil(response.data.total / params.limit) || 1,
        error: null
      };
    } else {
      throw new Error('Failed to fetch leaderboard data');
    }
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return {
      leaderboard: [],
      totalPages: 1,
      error: 'Failed to load leaderboard data. Please try again.'
    };
  }
};

// Fetch user's rank and details
export const fetchUserRankData = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const response = await axios.get('/api/points/user-rank', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.data.success) {
      return {
        success: true,
        rank: response.data.rank,
        details: {
          points: response.data.points,
          streak: response.data.streak,
          percentile: response.data.percentile
        }
      };
    } else {
      throw new Error('Failed to fetch user rank data');
    }
  } catch (err) {
    console.error('Error fetching user rank:', err);
    return {
      success: false,
      error: 'Failed to load user ranking information'
    };
  }
};