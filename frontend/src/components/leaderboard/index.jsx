// src/components/Leaderboard/index.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { ArrowLeft, Trophy } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

// Import components
import LeaderboardTable from './LeaderboardTable';
import UserStatsCard from './UserStatsCard';
import AchievementGuide from './AchievementGuide';
import LeaderboardFilter from './LeaderboardFilters';
import LeaderboardHeader from './LeaderboardHeader';
import Pagination from './Pagination';

// Import utilities
import { fetchLeaderboardData, fetchUserRankData } from './utils/apiUtils';

const Leaderboard = () => {
  // Navigation
  const navigate = useNavigate();
  
  // States
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
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Handle scroll event for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      setIsLoading(true);
      
      const result = await fetchLeaderboardData({
        timeFrame,
        category,
        page,
        limit,
        sortBy,
        sortDirection,
        searchQuery
      });
      
      setLeaderboardData(result.leaderboard);
      setTotalPages(result.totalPages);
      setError(result.error);
      setIsLoading(false);
      
      // Fetch user's rank if not already fetched
      if (!userRank) {
        const userRankResult = await fetchUserRankData();
        if (userRankResult.success) {
          setUserRank(userRankResult.rank);
          setUserDetails(userRankResult.details);
        }
      }
    };
    
    loadLeaderboardData();
  }, [timeFrame, category, page, limit, sortBy, sortDirection, searchQuery, userRank]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top of table on page change
      document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Container fluid className="py-4">
      <LeaderboardHeader />

      {/* User stats section if logged in */}
      {userRank && userDetails && (
        <UserStatsCard userRank={userRank} userDetails={userDetails} />
      )}
      
      {/* Leaderboard Panel */}
      <Card className="border-0 shadow-sm">
        <LeaderboardFilter 
          isScrolledDown={isScrolledDown}
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          category={category}
          setCategory={setCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          limit={limit}
          setLimit={setLimit}
          setPage={setPage}
        />
        
        <LeaderboardTable 
          isLoading={isLoading}
          error={error}
          leaderboardData={leaderboardData}
          userRank={userRank}
          sortBy={sortBy}
          sortDirection={sortDirection}
          handleSort={(column) => {
            if (sortBy === column) {
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy(column);
              setSortDirection('desc');
            }
            setPage(1);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* Integrate our new pagination component */}
        {!isLoading && !error && totalPages > 1 && (
          <Pagination 
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </Card>
      
      {/* Achievement Guide Card */}
      <AchievementGuide />
    </Container>
  );
};

export default Leaderboard;