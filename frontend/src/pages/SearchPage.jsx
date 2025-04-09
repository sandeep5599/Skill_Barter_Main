import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Card, Spinner, Toast } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentParams, setCurrentParams] = useState({
    query: '',
    skillLevel: ''
  });
  const [showErrorToast, setShowErrorToast] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get authentication state using useAuth hook

  // Handle initial URL parameters when page loads
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialParams = {
      query: queryParams.get('query') || '',
      skillLevel: queryParams.get('skillLevel') || ''
    };
    
    console.log("From SearchPage: ", initialParams);
    setCurrentParams(initialParams);
    
    // If there are search parameters in URL, perform search
    if (initialParams.query || initialParams.skillLevel) {
      performSearch(initialParams);
    }
  }, [location.search]);

  const performSearch = async (searchParams) => {
    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (searchParams.query) {
        queryParams.append('query', searchParams.query);
      }
      
      if (searchParams.skillLevel) {
        queryParams.append('skillLevel', searchParams.skillLevel);
      }
      
      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await axios.get(`/api/search/skills?${queryParams.toString()}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setSearchResults(response.data.data || []);
      
      // Update URL with search params without triggering a new search
      const newUrl = `${location.pathname}?${queryParams.toString()}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
    } catch (err) {
      console.error('Search error:', err);
      if (err.name === 'AbortError') {
        setError('Search request timed out. Please try again.');
      } else {
        setError(err.response?.data?.message || 'An error occurred while searching');
      }
      setShowErrorToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    setCurrentParams(searchParams);
    performSearch(searchParams);
  };

  const handleRetry = () => {
    performSearch(currentParams);
  };

  // Determine button text and navigation target based on authentication state
  const backButtonText = user ? 'Back to Dashboard' : 'Back to Home';
  const backButtonTarget = user ? '/dashboard' : '/';

  return (
    <div className="search-page-wrapper min-vh-100 d-flex flex-column" 
         style={{ 
           background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
           backgroundAttachment: 'fixed',
           width: '100%'
         }}>
      {/* Error Toast */}
      <Toast 
        onClose={() => setShowErrorToast(false)} 
        show={showErrorToast} 
        delay={5000} 
        autohide
        className="position-fixed top-0 end-0 m-3 z-index-toast"
        style={{ zIndex: 1050 }}
      >
        <Toast.Header closeButton>
          <strong className="me-auto text-danger">Search Error</strong>
        </Toast.Header>
        <Toast.Body>{error}</Toast.Body>
      </Toast>

      {/* Main Content - Full Width */}
      <div className="w-100 p-3 p-md-4 flex-grow-1">
        {/* Back Button - Dynamic based on auth state */}
        <Button 
          variant="primary" 
          className="mb-4 shadow-sm" 
          onClick={() => navigate(backButtonTarget)}
        >
          <FaArrowLeft className="me-2" /> {backButtonText}
        </Button>
        
        {/* Header Section - Full Width */}
        <div className="w-100 mb-4">
          <Card className="border-0 shadow text-center mb-4 bg-white rounded-lg p-4 w-100">
            <h1 className="display-4 fw-bold mb-3">Find the Perfect Skill to Learn</h1>
            <p className="lead text-muted">
              Explore our community of skilled teachers and find the expertise you need.
            </p>
          </Card>
        </div>
        
        {/* Main Content Section - Full Width with Sidebar and Results */}
        <Row className="g-4 m-0 w-100">
          <Col lg={3} md={4} className="mb-4 px-0 pe-lg-3">
            {/* Sidebar with search filters */}
            <Card className="border-0 shadow-sm sticky-top w-100" style={{ top: '20px' }}>
              <Card.Header className="bg-primary text-white">
                <h4 className="mb-0 fs-5"><FaSearch className="me-2" />Refine Search</h4>
              </Card.Header>
              <Card.Body className="bg-white p-3">
                <SearchBar 
                  onSearch={handleSearch} 
                  initialParams={currentParams}
                  compact={true} 
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={9} md={8} className="mb-4 px-0 ps-lg-3">
            {!searchPerformed ? (
              <Card className="text-center p-3 p-md-5 border-0 shadow-sm bg-white rounded-lg w-100">
                <Card.Body>
                  <div className="p-2 p-md-4">
                    <img 
                      src="/api/placeholder/150/150" 
                      alt="Search illustration" 
                      className="mb-4 opacity-75" 
                    />
                    <h3>Use the search filters to find skills</h3>
                    <p className="text-muted">Adjust your search criteria to see matching results</p>
                    <Button 
                      variant="outline-primary" 
                      className="mt-3" 
                      onClick={() => handleSearch({query: '', skillLevel: ''})}
                    >
                      <FaSearch className="me-2" /> Browse All Skills
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm bg-white rounded-lg w-100">
                <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
                  <h4 className="mb-0 fs-5">Search Results</h4>
                  {searchResults.length > 0 && (
                    <span className="badge bg-primary">{searchResults.length} found</span>
                  )}
                </Card.Header>
                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-3 text-muted">Searching for skills...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="danger">
                      <Alert.Heading>Error</Alert.Heading>
                      <p>{error}</p>
                      <div className="d-flex justify-content-end">
                        <Button variant="outline-danger" onClick={handleRetry}>
                          Try Again
                        </Button>
                      </div>
                    </Alert>
                  ) : (
                    <SearchResults 
                      results={searchResults}
                      loading={loading}
                      error={error}
                    />
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </div>
      
      {/* Footer - Full Width */}
      <footer className="bg-dark text-white py-4 mt-auto w-100">
        <div className="px-4 px-md-5 w-100">
          <Row className="w-100 m-0">
            <Col md={6} className="px-0">
              <p className="mb-0">&copy; 2025 Skills Learning Platform. All rights reserved.</p>
            </Col>
            <Col md={6} className="px-0 text-md-end">
              <a href="#" className="text-white text-decoration-none me-3">Terms</a>
              <a href="#" className="text-white text-decoration-none me-3">Privacy</a>
              <a href="#" className="text-white text-decoration-none">Help</a>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;