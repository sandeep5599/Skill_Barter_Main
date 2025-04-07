import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, Dropdown, Tab, Nav, ProgressBar } from 'react-bootstrap';
import { Award, Trophy, Star, Calendar2Check, Search, ChevronUp, ChevronDown, Filter, ArrowLeft, Fire, Lightning, PersonFill, Globe, PeopleFill, GeoAlt, ListUl } from 'react-bootstrap-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  
  // Achievement badges configuration
  const badges = useMemo(() => ({
    teacher: {
      name: 'Teaching Master',
      icon: <PersonFill className="text-primary" />,
      description: 'Completed 10+ teaching sessions',
      levels: [
        { min: 1, color: 'bronze' },
        { min: 5, color: 'silver' },
        { min: 10, color: 'gold' },
      ]
    },
    learner: {
      name: 'Knowledge Seeker',
      icon: <Lightning className="text-warning" />,
      description: 'Completed 10+ learning sessions',
      levels: [
        { min: 1, color: 'bronze' },
        { min: 5, color: 'silver' },
        { min: 10, color: 'gold' },
      ]
    },
    streak: {
      name: 'Consistency King',
      icon: <Fire className="text-danger" />,
      description: 'Maintained a login streak',
      levels: [
        { min: 3, color: 'bronze' },
        { min: 7, color: 'silver' },
        { min: 14, color: 'gold' },
      ]
    },
    contributor: {
      name: 'Top Contributor',
      icon: <Star className="text-warning" />,
      description: 'Earned points through platform contributions',
      levels: [
        { min: 50, color: 'bronze' },
        { min: 100, color: 'silver' },
        { min: 250, color: 'gold' },
      ]
    }
  }), []);

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get medal color based on rank
  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#6c757d'; // Default gray
  };

  // Get user badge level
  const getBadgeLevel = (type, value) => {
    const badgeConfig = badges[type];
    if (!badgeConfig) return null;
    
    // Find the highest level the user qualifies for
    for (let i = badgeConfig.levels.length - 1; i >= 0; i--) {
      if (value >= badgeConfig.levels[i].min) {
        return {
          ...badgeConfig,
          level: i + 1,
          color: badgeConfig.levels[i].color
        };
      }
    }
    
    return null;
  };

  // Get badge color class
  const getBadgeColorClass = (color) => {
    switch (color) {
      case 'gold': return 'bg-warning text-dark';
      case 'silver': return 'bg-secondary text-white';
      case 'bronze': return 'bg-danger bg-opacity-75 text-white';
      default: return 'bg-light text-dark';
    }
  };

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
    const fetchLeaderboardData = async () => {
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
        
        // In a real app, we would include all these parameters
        // For this example, we'll use the basic endpoint
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
    };
    
    fetchLeaderboardData();
  }, [timeFrame, category, page, limit, sortBy, sortDirection, searchQuery]);

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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Scroll to top for better UX when changing pages
      window.scrollTo(0, 0);
    }
  };

  // Pagination UI
  const renderPagination = () => {
    const pageNumbers = [];
    
    // Add first page and ellipsis if needed
    if (page > 3) {
      pageNumbers.push(1);
      if (page > 4) pageNumbers.push('...');
    }
    
    // Add page numbers around current page
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (page < totalPages - 2) {
      if (page < totalPages - 3) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    
    return (
      <div className="d-flex justify-content-center align-items-center mt-4">
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => handlePageChange(page - 1)} 
          disabled={page === 1}
          className="me-2"
        >
          Previous
        </Button>
        
        {pageNumbers.map((num, index) => (
          <Button 
            key={index}
            variant={num === page ? "primary" : "outline-primary"}
            size="sm"
            className="mx-1"
            onClick={() => typeof num === 'number' && handlePageChange(num)}
            disabled={typeof num !== 'number'}
          >
            {num}
          </Button>
        ))}
        
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => handlePageChange(page + 1)} 
          disabled={page === totalPages}
          className="ms-2"
        >
          Next
        </Button>
      </div>
    );
  };

  // User stats card
  const renderUserStatsCard = () => {
    if (!userRank || !userDetails) return null;
    
    // Calculate badges for the user
    const userBadges = [
      getBadgeLevel('streak', userDetails.streak),
      getBadgeLevel('contributor', userDetails.points)
    ].filter(Boolean);
    
    return (
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <div className="position-relative me-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10" style={{ width: '64px', height: '64px' }}>
                    <h2 className="mb-0 fw-bold text-primary">{getInitials(localStorage.getItem('userName') || 'You')}</h2>
                  </div>
                  <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                    <Trophy className="text-white" size={14} />
                  </div>
                </div>
                <div>
                  <h5 className="mb-1 fw-bold">{localStorage.getItem('userName') || 'You'}</h5>
                  <div className="d-flex align-items-center">
                    <div className="badge bg-primary bg-opacity-10 text-primary me-2">
                      Rank #{userRank}
                    </div>
                    <div className="badge bg-success bg-opacity-10 text-success">
                      Top {userDetails.percentile}%
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <Row className="g-3">
                <Col xs={6}>
                  <div className="p-3 rounded bg-light">
                    <div className="small text-muted">Points</div>
                    <div className="fs-4 fw-bold text-primary">{userDetails.points}</div>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 rounded bg-light">
                    <div className="small text-muted">Current Streak</div>
                    <div className="d-flex align-items-center">
                      <Fire className="text-danger me-1" />
                      <span className="fs-4 fw-bold">{userDetails.streak} days</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          
          {/* Badges Section */}
          {userBadges.length > 0 && (
            <div className="mt-3 pt-3 border-top">
              <h6 className="text-muted mb-2">Your Badges</h6>
              <div className="d-flex flex-wrap gap-2">
                {userBadges.map((badge, idx) => (
                  <div key={idx} className={`badge ${getBadgeColorClass(badge.color)} px-3 py-2`}>
                    {badge.icon} {badge.name} {badge.level && `Lvl ${badge.level}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Back button & page title */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <Button className="text-decoration-none ps-0" onClick={() => navigate('/')}>
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
      {renderUserStatsCard()}
      
      {/* Leaderboard Panel */}
      <Card className="border-0 shadow-sm">
        {/* Sticky header with filters that shows when scrolled */}
        <div className={`position-sticky top-0 bg-white z-3 px-4 py-3 d-flex align-items-center justify-content-between border-bottom transition-all ${isScrolledDown ? 'shadow-sm' : ''}`} style={{ zIndex: 1000 }}>
          <div className="d-flex align-items-center gap-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <Award className="text-warning me-2" /> Top Contributors
            </h5>
            <Badge bg="primary" className="rounded-pill">{timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}</Badge>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <Button 
              variant="light" 
              size="sm" 
              className="d-flex align-items-center" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="me-1" /> Filters
            </Button>
            
            <Dropdown>
              <Dropdown.Toggle variant="light" size="sm">
                {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={timeFrame === 'daily'} onClick={() => setTimeFrame('daily')}>Daily</Dropdown.Item>
                <Dropdown.Item active={timeFrame === 'weekly'} onClick={() => setTimeFrame('weekly')}>Weekly</Dropdown.Item>
                <Dropdown.Item active={timeFrame === 'monthly'} onClick={() => setTimeFrame('monthly')}>Monthly</Dropdown.Item>
                <Dropdown.Item active={timeFrame === 'allTime'} onClick={() => setTimeFrame('allTime')}>All Time</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        
        {/* Filter section */}
        {showFilters && (
          <div className="bg-light p-3 border-bottom">
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Category</Form.Label>
                  <Form.Select 
                    size="sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="teaching">Teaching</option>
                    <option value="learning">Learning</option>
                    <option value="engagement">Engagement</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form onSubmit={handleSearch}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">Search Users</Form.Label>
                    <div className="d-flex">
                      <Form.Control 
                        type="text" 
                        placeholder="Search by name" 
                        size="sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button 
                        variant="primary" 
                        type="submit" 
                        size="sm" 
                        className="ms-2"
                      >
                        <Search />
                      </Button>
                    </div>
                  </Form.Group>
                </Form>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Show</Form.Label>
                  <Form.Select 
                    size="sm"
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1); // Reset to first page when changing limit
                    }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>
        )}
        
        {/* Main content tabs */}
        <Card.Body className="p-0">
          <Tab.Container defaultActiveKey="table">
            <Nav variant="tabs" className="px-4 pt-3">
              <Nav.Item>
                <Nav.Link eventKey="table" className="d-flex align-items-center">
                  <ListUl className="me-2" /> Table View
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
                      onClick={() => window.location.reload()}
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
                  <div className="table-responsive">
                    <Table hover className="mb-0">
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
                          <th 
                            className="cursor-pointer" 
                            onClick={() => handleSort('streak')}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center">
                              Streak {getSortIcon('streak')}
                            </div>
                          </th>
                          <th>Badges</th>
                          <th className="text-center">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.map((user, index) => {
                          // Calculate badges for this user
                          const userBadges = [
                            user.streak >= 3 ? getBadgeLevel('streak', user.streak) : null,
                            user.points >= 50 ? getBadgeLevel('contributor', user.points) : null
                          ].filter(Boolean);
                          
                          return (
                            <tr key={user.userId} className={user.rank === userRank ? 'bg-primary bg-opacity-10' : ''}>
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
                                  <div 
                                    className="me-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                                    style={{ 
                                      width: '40px', 
                                      height: '40px',
                                      background: user.rank === 1 ? '#ffc107' : 
                                               user.rank === 2 ? '#adb5bd' :
                                               user.rank === 3 ? '#cd7f32' : 
                                               '#e9ecef',
                                      color: user.rank <= 3 ? '#fff' : '#6c757d',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {user.avatar ? user.avatar : getInitials(user.name)}
                                  </div>
                                  <div>
                                    <h6 className="mb-0 fw-semibold">{user.name}</h6>
                                    <div className="small text-muted">
                                      <GeoAlt size={12} className="me-1" /> Unknown Location
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="d-flex align-items-center">
                                  <Award className="text-warning me-2" size={16} />
                                  <span className="fw-bold">{user.points}</span>
                                </div>
                                <ProgressBar 
                                  now={Math.min(100, (user.points / 300) * 100)} 
                                  variant="primary" 
                                  className="mt-1" 
                                  style={{ height: '5px' }} 
                                />
                              </td>
                              <td className="align-middle">
                                <div className="d-flex align-items-center">
                                  <Fire className={user.streak > 0 ? "text-danger me-2" : "text-muted me-2"} size={16} />
                                  <span className="fw-bold">{user.streak} days</span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="d-flex flex-wrap gap-1">
                                  {userBadges.length === 0 ? (
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
                              <td className="text-center align-middle">
                                <Button 
                                  variant="light" 
                                  size="sm" 
                                  className="rounded-pill"
                                  onClick={() => navigate(`/profile/${user.userId}`)}
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
                )}
                
                {/* Pagination Controls */}
                {!isLoading && !error && leaderboardData.length > 0 && renderPagination()}
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
        <Card.Footer className="bg-white border-top text-center p-3">
          <Row className="align-items-center justify-content-between">
            <Col xs={12} md={6} className="text-md-start mb-3 mb-md-0">
              <div className="d-flex align-items-center text-muted">
                <Calendar2Check className="me-2" />
                <small>Leaderboard is updated every 15 minutes</small>
              </div>
            </Col>
            <Col xs={12} md={6} className="text-md-end">
              <Button variant="primary" size="sm" className="rounded-pill" onClick={() => window.location.reload()}>
                Refresh Data
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
      
      {/* Achievement Guide Card */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold d-flex align-items-center">
            <Star className="text-warning me-2" /> Achievement Guide
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {Object.entries(badges).map(([key, badge], idx) => (
              <Col md={3} sm={6} key={key} className="mb-4 mb-md-0">
                <div className="text-center p-3 h-100 d-flex flex-column">
                  <div className="mb-3">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 bg-light">
                      {React.cloneElement(badge.icon, { size: 24 })}
                    </div>
                  </div>
                  <h6 className="fw-bold mb-2">{badge.name}</h6>
                  <p className="text-muted small mb-3">{badge.description}</p>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="badge bg-danger bg-opacity-75 text-white">Bronze</span>
                      <span>{badge.levels[0].min}+</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="badge bg-secondary text-white">Silver</span>
                      <span>{badge.levels[1].min}+</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="badge bg-warning text-dark">Gold</span>
                      <span>{badge.levels[2].min}+</span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Leaderboard;