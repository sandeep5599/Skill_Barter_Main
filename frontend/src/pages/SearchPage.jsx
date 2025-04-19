import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Card, Spinner, Toast } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import { ArrowLeft, Search, InfoCircle, MortarboardFill, BookFill } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();

  // Handle initial URL parameters when page loads
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialParams = {
      query: queryParams.get('query') || '',
      skillLevel: queryParams.get('skillLevel') || ''
    };
    
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
    <div className="min-vh-100 d-flex flex-column" style={{ background: '#f8fafc' }}>
      {/* Error Toast */}
      <Toast 
        onClose={() => setShowErrorToast(false)} 
        show={showErrorToast} 
        delay={5000} 
        autohide
        className="position-fixed top-0 end-0 m-4"
        style={{ zIndex: 1050 }}
      >
        <Toast.Header closeButton className="bg-danger text-white">
          <InfoCircle className="me-2" />
          <strong className="me-auto">Search Error</strong>
        </Toast.Header>
        <Toast.Body className="d-flex align-items-center">
          <span>{error}</span>
        </Toast.Body>
      </Toast>

      {/* Main Content */}
      <div className="flex-grow-1">
        <Container className="py-4 py-lg-5">
          {/* Navigation */}
          <div className="mb-4">
            <Button 
              variant="primary" 
              className="rounded-pill px-4 py-2 d-flex align-items-center shadow-sm" 
              onClick={() => navigate(backButtonTarget)}
            >
              <ArrowLeft className="me-2" />
              <span>{backButtonText}</span>
            </Button>
          </div>
          
          {/* Header */}
          <Card className="border-0 rounded-4 shadow mb-5 overflow-hidden">
            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              padding: '3rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative elements */}
              <div className="position-absolute" style={{ 
                top: '-5%', 
                right: '-5%', 
                width: '300px', 
                height: '300px', 
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%'
              }}></div>
              
              <div className="position-absolute" style={{ 
                bottom: '-10%', 
                left: '5%', 
                width: '200px', 
                height: '200px',  
                background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)',
                borderRadius: '50%'
              }}></div>
              
              <div className="text-center text-white position-relative">
                <h1 className="display-4 fw-bold mb-3">Find the Perfect Skills</h1>
                <p className="lead mb-0 mx-auto" style={{ maxWidth: '700px' }}>
                  Connect with teachers and fellow students to expand your knowledge and share your expertise
                </p>
              </div>
            </div>
          </Card>
          
          <Row className="g-4">
            {/* Sidebar */}
            <Col lg={3} md={4}>
              <div className="sticky-top" style={{ top: '20px' }}>
                <Card className="border-0 rounded-4 shadow-sm overflow-hidden mb-4">
                  <Card.Header className="bg-white py-3 px-4 border-bottom">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                      <Search className="me-2 text-primary" />
                      <span>Search Filters</span>
                    </h5>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <SearchBar 
                      onSearch={handleSearch} 
                      initialParams={currentParams}
                      compact={true} 
                    />
                  </Card.Body>
                </Card>
                
                {/* Quick links card */}
                <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
                  <Card.Header className="bg-white py-3 px-4 border-bottom">
                    <h5 className="mb-0 fw-bold">Quick Links</h5>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="p-3 border-bottom d-flex align-items-center" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/match/teaching-requests')}
                    >
                      <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '40px', 
                          height: '40px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6'
                        }}>
                        <MortarboardFill size={18} />
                      </div>
                      <div>
                        <div className="fw-semibold">Teaching</div>
                        <div className="text-muted small">Share your knowledge</div>
                      </div>
                    </div>
                    <div className="p-3 d-flex align-items-center" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/match/learning')}
                    >
                      <div className="me-3 rounded-circle d-flex align-items-center justify-content-center" 
                        style={{ 
                          width: '40px', 
                          height: '40px',
                          background: 'rgba(14, 165, 233, 0.1)',
                          color: '#0ea5e9'
                        }}>
                        <BookFill size={18} />
                      </div>
                      <div>
                        <div className="fw-semibold">Learning</div>
                        <div className="text-muted small">Find a teacher</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
            
            {/* Main Content Area */}
            <Col lg={9} md={8}>
              {!searchPerformed ? (
                <Card className="border-0 rounded-4 shadow-sm bg-white h-100">
                  <Card.Body className="d-flex flex-column align-items-center justify-content-center p-5">
                    <div className="text-center mb-4">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" 
                        style={{ width: '120px', height: '120px' }}>
                        <Search className="text-primary" style={{ fontSize: '3rem' }} />
                      </div>
                      <h3 className="fw-bold mb-3">Begin Your Skill Search</h3>
                      <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '500px' }}>
                        Use the search filters to discover skills or browse all available teachers and skills
                      </p>
                      <Button 
                        variant="primary" 
                        className="rounded-pill px-4 py-2" 
                        onClick={() => handleSearch({query: '', skillLevel: ''})}
                        style={{ 
                          background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                          border: 'none',
                          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <Search className="me-2" />
                        <span>Browse All Skills</span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <div>
                  {loading ? (
                    <Card className="border-0 rounded-4 shadow-sm bg-white">
                      <Card.Body className="text-center py-5">
                        <Spinner 
                          animation="border" 
                          variant="primary" 
                          style={{ width: '4rem', height: '4rem', borderWidth: '0.25rem' }}
                        />
                        <p className="mt-4 text-muted">Searching for matching skills...</p>
                      </Card.Body>
                    </Card>
                  ) : error ? (
                    <Alert 
                      variant="danger" 
                      className="rounded-4 shadow-sm border-0"
                    >
                      <Alert.Heading>Search Error</Alert.Heading>
                      <p>{error}</p>
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="outline-danger" 
                          onClick={handleRetry}
                          className="rounded-pill"
                        >
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
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Footer */}
      <footer className="py-4 mt-auto" style={{ background: '#0f172a' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-3 mb-md-0">
              <p className="mb-0 text-white">&copy; 2025 Skills Learning Platform. All rights reserved.</p>
            </Col>
            <Col md={6} className="text-md-end">
              <a href="#" className="text-decoration-none me-3" style={{ color: '#94a3b8' }}>Terms</a>
              <a href="#" className="text-decoration-none me-3" style={{ color: '#94a3b8' }}>Privacy</a>
              <a href="#" className="text-decoration-none" style={{ color: '#94a3b8' }}>Help</a>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default SearchPage;