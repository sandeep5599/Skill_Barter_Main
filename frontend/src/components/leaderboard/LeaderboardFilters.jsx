// src/components/Leaderboard/LeaderboardFilters.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Form, Button, InputGroup, Overlay, Tooltip } from 'react-bootstrap';
import { Search, Funnel, XCircleFill, ArrowClockwise } from 'react-bootstrap-icons';

const LeaderboardFilters = ({ 
  category, 
  setCategory, 
  searchQuery, 
  setSearchQuery, 
  limit, 
  setLimit, 
  handleSearch,
  setPage,
  loading = false,
  onReset = null
}) => {
  // State for form validation and animations
  const [validated, setValidated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasFilters, setHasFilters] = useState(false);
  
  // Track if any filters are applied
  useEffect(() => {
    setHasFilters(
      category !== 'all' || 
      searchQuery !== '' || 
      limit !== 10
    );
  }, [category, searchQuery, limit]);
  
  // Refs for tooltip positioning
  const searchButtonRef = useRef(null);
  
  // Handle form submission with validation
  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Simple validation - prevent searching with very short queries
    if (searchQuery.trim().length > 0 && searchQuery.trim().length < 2) {
      setValidated(true);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }
    
    setValidated(false);
    handleSearch(e);
  };
  
  // Handle reset filters
  const resetFilters = () => {
    setCategory('all');
    setSearchQuery('');
    setLimit(10);
    setPage(1);
    
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className={`leaderboard-filters ${isCollapsed ? 'collapsed' : ''} ${hasFilters ? 'has-filters' : ''}`}>
      <Form noValidate validated={validated} onSubmit={onSubmit}>
        <Row className="g-3 align-items-end">
          <Col lg={3} md={6}>
            <Form.Group>
              <Form.Label className="filter-label d-flex align-items-center">
                <Funnel size={14} className="me-2" />
                Category
              </Form.Label>
              <Form.Select 
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1); // Reset to first page when changing category
                }}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                <option value="teaching">Teaching</option>
                <option value="learning">Learning</option>
                <option value="engagement">Engagement</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col lg={5} md={6}>
            <Form.Group>
              <Form.Label className="filter-label d-flex align-items-center">
                <Search size={14} className="me-2" />
                Search Users
              </Form.Label>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  placeholder="Enter name or username" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={loading}
                  className="search-input"
                  isInvalid={validated && searchQuery.trim().length > 0 && searchQuery.trim().length < 2}
                />
                
                {searchQuery && (
                  <Button 
                    variant="outline-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="clear-button"
                    disabled={loading}
                    aria-label="Clear search"
                  >
                    <XCircleFill size={16} />
                  </Button>
                )}
                
                <Button 
                  ref={searchButtonRef}
                  variant="primary" 
                  type="submit" 
                  className="search-button"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <Search size={16} />
                  )}
                </Button>
                
                <Overlay 
                  target={searchButtonRef.current} 
                  show={showTooltip} 
                  placement="bottom"
                >
                  <Tooltip id="search-tooltip">
                    Search term must be at least 2 characters
                  </Tooltip>
                </Overlay>
              </InputGroup>
            </Form.Group>
          </Col>
          
          <Col lg={2} md={6}>
            <Form.Group>
              <Form.Label className="filter-label">Results Per Page</Form.Label>
              <Form.Select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1); // Reset to first page when changing limit
                }}
                disabled={loading}
                className="filter-select"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col lg={2} md={6} className="d-flex">
            {hasFilters && (
              <Button 
                variant="outline-secondary"
                onClick={resetFilters}
                className="reset-button ms-auto"
                disabled={loading}
              >
                <ArrowClockwise size={16} className="me-1" /> Reset
              </Button>
            )}
          </Col>
        </Row>
      </Form>
      
      {/* Add custom styles */}
      <style jsx>{`
        .leaderboard-filters {
          background: linear-gradient(to right, #f8fafc, #f1f5f9);
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .leaderboard-filters.has-filters {
          background: linear-gradient(to right, #eff6ff, #e0f2fe);
          border-left: 3px solid #3b82f6;
        }
        
        .leaderboard-filters:hover {
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        
        .filter-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.5rem;
        }
        
        .filter-select {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          padding: 0.5rem 0.75rem;
          transition: all 0.2s ease;
        }
        
        .filter-select:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-input {
          border-radius: 8px 0 0 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          padding: 0.5rem 0.75rem;
        }
        
        .search-input:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-button {
          border-radius: 0 8px 8px 0;
          padding: 0.5rem 1rem;
          background: linear-gradient(to right, #3b82f6, #2563eb);
          border: none;
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
          transition: all 0.2s ease;
        }
        
        .search-button:hover:not(:disabled) {
          background: linear-gradient(to right, #2563eb, #1d4ed8);
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(37, 99, 235, 0.3);
        }
        
        .clear-button {
          border: none;
          background: transparent;
          color: #9ca3af;
          transition: all 0.2s ease;
          z-index: 10;
        }
        
        .clear-button:hover:not(:disabled) {
          color: #6b7280;
          background: #f3f4f6;
        }
        
        .reset-button {
          padding: 0.5rem 1rem;
          height: 38px;
          border-radius: 8px;
          font-weight: 500;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        
        .reset-button:hover:not(:disabled) {
          background-color: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
        }
        
        /* Animation for filter appearance */
        @keyframes filterPulse {
          0% { background-color: #eff6ff; }
          50% { background-color: #dbeafe; }
          100% { background-color: #eff6ff; }
        }
        
        .has-filters {
          animation: filterPulse 2s ease-in-out 1;
        }
        
        @media (max-width: 992px) {
          .leaderboard-filters {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardFilters;