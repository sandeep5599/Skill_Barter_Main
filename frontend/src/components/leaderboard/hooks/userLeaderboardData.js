
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useLeaderboardData = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('points');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchLeaderboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construct the query parameters
      const params = new URLSearchParams({
        timeFrame,
        category,
        page,
        limit,
        sortBy,
        sortDirection,
        search: searchQuery
      });
      
      const response = await axios.get(`/api/points/leaderboard?${params.toString()}`);
      
      if (response.data.success) {
        setLeaderboardData(response.data.leaderboard);
        setTotalPages(Math.ceil(response.data.total / limit) || 1);
      } else {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      // Fetch user's rank if not already fetched
      if (!userRank) {
        const token = localStorage.getItem('token');
        if (token) {
          const userRankResponse = await axios.get('/api/points/user-rank', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (userRankResponse.data.success) {
            setUserRank(userRankResponse.data.rank);
            setUserDetails({
              points: userRankResponse.data.points,
              streak: userRankResponse.data.streak,
              percentile: userRankResponse.data.percentile
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [timeFrame, category, page, limit, sortBy, sortDirection, searchQuery, userRank]);

  // Fetch data when parameters change
  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setPage(1);
  };

  // Handle sort change
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, set to desc by default
      setSortBy(column);
      setSortDirection('desc');
    }
    
    // Reset to first page
    setPage(1);
  };

  // Refresh data manually
  const refreshData = () => {
    fetchLeaderboardData();
  };

  return {
    leaderboardData,
    isLoading,
    error,
    userRank,
    userDetails,
    timeFrame,
    setTimeFrame,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    limit,
    setLimit,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    handleSearch,
    handleSort,
    refreshData
  };
};

export default useLeaderboardData;
