// src/components/Leaderboard/LeaderboardTable.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert, ProgressBar, Container, Row, Col } from 'react-bootstrap';
import { Award, Trophy, Fire, ChevronUp, ChevronDown, GeoAlt } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { getMedalColor } from './utils/formatUtils';
import { calculateUserBadges, getBadgeColorClass } from './utils/badgeUtils';
import UserAvatar from '../UI/UserAvatar';

const LeaderboardTable = ({ 
  isLoading, 
  error, 
  leaderboardData = [], 
  userRank, 
  searchQuery, 
  setSearchQuery, 
  sortBy, 
  setSortBy,
  sortDirection, 
  setSortDirection,
  setPage
}) => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Corrected handleViewProfile function
  const handleViewProfile = (userId) => {
    // Navigate to the placeholder route
    navigate(`/placeholder`);
    
    // You can store the userId in localStorage if needed for the placeholder component
    localStorage.setItem('selectedUserId', userId);
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

  // Get sort icon
  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (isLoading) {
    return (
      <Container className="text-center p-4">
        <Row className="justify-content-center">
          <Col xs={12} md={6} className="d-flex flex-column align-items-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading leaderboard data...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Error Loading Leaderboard</Alert.Heading>
        <p>{error || "An unexpected error occurred"}</p>
        <div className="d-flex justify-content-end">
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <Container className="text-center p-4">
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <div className="text-muted mb-3">No results found</div>
            {searchQuery && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setSearchQuery && setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    );
  }

  // Determine if we should show a compact view on mobile
  const isCompactView = windowWidth < 768;

  return (
    <div className="table-responsive">
      <Table hover responsive className="mb-0">
        <thead className="bg-light">
          <tr>
            <th className="text-center" style={{ width: '80px' }}>Rank</th>
            <th>User</th>
            <th 
              className="cursor-pointer" 
              onClick={() => handleSort('points')}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                Points {getSortIcon('points')}
              </div>
            </th>
            {!isCompactView && (
              <th 
                className="cursor-pointer" 
                onClick={() => handleSort('streak')}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  Streak {getSortIcon('streak')}
                </div>
              </th>
            )}
            {!isCompactView && <th>Badges</th>}
            <th className="text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user) => {
            // Calculate badges for this user
            const userBadges = calculateUserBadges(user);
            const isCurrentUser = user.rank === userRank;

            return (
              <tr 
                key={user.userId} 
                className={isCurrentUser ? 'bg-primary bg-opacity-10' : ''}
                aria-label={isCurrentUser ? 'Your position' : `User ranked ${user.rank}`}
              >
                <td className="text-center align-middle">
                  <div className="position-relative">
                    {user.rank <= 3 ? (
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle mx-auto" 
                        style={{ 
                          width: '35px', 
                          height: '35px', 
                          backgroundColor: getMedalColor(user.rank),
                          color: user.rank === 1 ? '#000' : '#fff'
                        }}
                        aria-label={`Rank ${user.rank}`}
                      >
                        <Trophy size={16} />
                      </div>
                    ) : (
                      <span className="fw-bold text-muted">#{user.rank}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <UserAvatar 
                        name={user.name || 'Unknown'} 
                        avatar={user.avatar} 
                        rank={user.rank} 
                        size={isCompactView ? 32 : 40} 
                      />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold">{user.name || 'Unknown'}</h6>
                      <div className="small text-muted">
                        <GeoAlt size={12} className="me-1" />
                        {user.country || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="d-flex align-items-center">
                    <Award className="text-warning me-2" size={16} />
                    <span className="fw-bold">{user.points || 0}</span>
                  </div>
                  <ProgressBar 
                    now={Math.min(100, ((user.points || 0) / 300) * 100)} 
                    variant="primary" 
                    className="mt-1" 
                    style={{ height: '5px' }} 
                  />
                </td>
                {!isCompactView && (
                  <td className="align-middle">
                    <div className="d-flex align-items-center">
                      <Fire className={(user.streak || 0) > 0 ? "text-danger me-2" : "text-muted me-2"} size={16} />
                      <span className="fw-bold">{user.streak || 0} days</span>
                    </div>
                  </td>
                )}
                {!isCompactView && (
                  <td className="align-middle">
                    <div className="d-flex flex-wrap gap-1">
                      {(!userBadges || userBadges.length === 0) ? (
                        <span className="text-muted small">No badges yet</span>
                      ) : (
                        userBadges.map((badge, badgeIdx) => (
                          <Badge 
                            key={badgeIdx} 
                            className={`${getBadgeColorClass(badge.color)}`}
                          >
                            {badge.icon} {badge.level && `L${badge.level}`}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                )}
                <td className="text-center align-middle">
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="rounded-pill"
                    onClick={() => handleViewProfile(user.userId)}
                    aria-label={`View ${user.name}'s profile`}
                  >
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;