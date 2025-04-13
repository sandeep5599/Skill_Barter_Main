import React, { memo } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';

const LeaderboardFilters = memo(({
  category,
  setCategory,
  searchQuery,
  setSearchQuery,
  limit,
  setLimit,
  handleSearch
}) => {
  return (
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
  );
});

LeaderboardFilters.displayName = 'LeaderboardFilters';
export default LeaderboardFilters;
