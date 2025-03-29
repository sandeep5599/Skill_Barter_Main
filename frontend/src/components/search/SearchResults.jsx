// frontend/src/components/search/SearchResults.js
import React from 'react';
import { Row, Col, Alert, Card } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import SkillCard from './SkillCard';

const SearchResults = ({ results, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Searching for skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        Error: {error}
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center py-5">
          <div className="mb-3">
            <FaSearch className="text-muted" style={{ fontSize: '3rem' }} />
          </div>
          <h4>No matching skills or teachers found</h4>
          <p className="text-muted mb-0">
            Please explore other available options or try a different search term!
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="search-results-container">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Found {results.length} Results</h4>
          <div className="text-muted">
            Sorted by highest rating
          </div>
        </Card.Body>
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