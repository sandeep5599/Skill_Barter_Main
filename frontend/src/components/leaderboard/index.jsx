import React, { useState, useEffect } from 'react';
import { Container, Card, Tab, Nav, Spinner, Alert, Button } from 'react-bootstrap';
import { Trophy, Globe, PeopleFill, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

import LeaderboardHeader from './LeaderboardHeader';
import UserStatsCard from './UserStatsCard';
import LeaderboardTable from './LeaderboardTable';
import LeaderboardFilters from './LeaderboardFilters';
import AchievementGuide from './AchievementGuide';
import Pagination from './Pagination';
import useLeaderboardData from './hooks/userLeaderboardData.js';
import { scrollToTop } from './utils/formatUtils';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('table');
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const {
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
  } = useLeaderboardData();

  // Handle scroll event for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledDown(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      scrollToTop();
    }
  };

  return (
    <Container fluid className="py-4 px-md-4">
      {/* Back button & page title */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <Button variant="link" className="text-decoration-none ps-0" onClick={() => navigate('/dashboard')}>
          <ArrowLeft /> Back to Dashboard
        </Button>
        <div>
          <h1 className="mb-0 d-flex align-items-center">
            <Trophy className="text-warning me-2" size={30} /> Leaderboard
          </h1>
        </div>
        <div style={{ width: '120px' }}></div> {/* Empty div for flex alignment */}
      </div>

      {/* User stats section if logged in */}
      {userRank && userDetails && (
        <UserStatsCard userRank={userRank} userDetails={userDetails} />
      )}
      
      {/* Leaderboard Panel */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Sticky header with filters */}
        <LeaderboardHeader 
          isScrolledDown={isScrolledDown}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          timeFrame={timeFrame}
          setTimeFrame={setTimeFrame}
        />
        
        {/* Filter section */}
        {showFilters && (
          <LeaderboardFilters 
            category={category}
            setCategory={setCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            limit={limit}
            setLimit={setLimit}
            handleSearch={handleSearch}
          />
        )}
        
        {/* Main content tabs */}
        <Card.Body className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="px-4 pt-3">
              <Nav.Item>
                <Nav.Link eventKey="table" className="d-flex align-items-center">
                  <i className="bi bi-list me-2"></i> Table View
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="map" className="d-flex align-items-center">
                  <Globe className="me-2" /> Global Map
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="stats" className="d-flex align-items-center">
                  <PeopleFill className="me-2" /> Community Stats
                </Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content>
              {/* Table View */}
              <Tab.Pane eventKey="table" className="p-0">
                {isLoading ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading leaderboard data...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger" className="m-4">
                    {error}
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="ms-3"
                      onClick={refreshData}
                    >
                      Retry
                    </Button>
                  </Alert>
                ) : leaderboardData.length === 0 ? (
                  <div className="text-center p-5">
                    <div className="text-muted mb-3">No results found</div>
                    {searchQuery && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <LeaderboardTable 
                      leaderboardData={leaderboardData}
                      userRank={userRank}
                      handleSort={handleSort}
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      navigate={navigate}
                    />
                    
                    {/* Pagination Controls */}
                    <Pagination 
                      page={page}
                      totalPages={totalPages}
                      handlePageChange={handlePageChange}
                    />
                  </>
                )}
              </Tab.Pane>
              
              {/* Global Map View - Placeholder */}
              <Tab.Pane eventKey="map" className="p-5 text-center">
                <div className="mb-3">
                  <Globe size={48} className="text-primary mb-3" />
                  <h4>Global Distribution</h4>
                  <p className="text-muted">This feature is coming soon. The map will show the geographical distribution of our community members.</p>
                </div>
              </Tab.Pane>
              
              {/* Community Stats - Placeholder */}
              <Tab.Pane eventKey="stats" className="p-5 text-center">
                <div className="mb-3">
                  <PeopleFill size={48} className="text-primary mb-3" />
                  <h4>Community Statistics</h4>
                  <p className="text-muted">This feature is coming soon. Here you'll find detailed analytics about our growing community.</p>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
        
        {/* Card Footer */}
        <Card.Footer className="bg-white border-top p-3">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="text-muted mb-3 mb-md-0">
              <span className="d-flex align-items-center">
                <i className="bi bi-clock-history me-2"></i>
                <small>Leaderboard updated every 15 minutes</small>
              </span>
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              className="rounded-pill" 
              onClick={refreshData}
            >
              <i className="bi bi-arrow-repeat me-1"></i> Refresh Data
            </Button>
          </div>
        </Card.Footer>
      </Card>
      
      {/* Achievement Guide Card */}
      <AchievementGuide />
    </Container>
  );
};

export default Leaderboard;
