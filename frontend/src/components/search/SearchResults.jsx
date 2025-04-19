import React from 'react';
import { Row, Col, Alert, Card, Badge } from 'react-bootstrap';
import { Search, SortDown } from 'react-bootstrap-icons';
import SkillCard from './SkillCard';

const SearchResults = ({ results, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Searching for skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4 shadow-sm border-0 rounded-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                 style={{ width: '100px', height: '100px' }}>
              <Search className="text-secondary" style={{ fontSize: '2.5rem' }} />
            </div>
          </div>
          <h4 className="mb-3">No matching skills found</h4>
          <p className="text-muted mb-0 px-lg-5">
            Try adjusting your search terms or filters to find what you're looking for
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="search-results-container">
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center p-3">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 fw-bold">Search Results</h5>
            <Badge 
              bg="primary" 
              className="ms-3 rounded-pill px-3 py-2"
              style={{ background: 'linear-gradient(to right, #3b82f6, #1e40af)' }}
            >
              {results.length} found
            </Badge>
          </div>
          <div className="d-flex align-items-center text-muted">
            <SortDown className="me-2" />
            <span className="d-none d-md-inline">Sorted by highest rating</span>
            <span className="d-inline d-md-none">Highest rated</span>
          </div>
        </Card.Header>
      </Card>
      
      <Row xs={1} md={2} className="g-4">
        {results.map((skill) => (
          <Col key={skill._id}>
            <SkillCard skill={skill} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SearchResults;