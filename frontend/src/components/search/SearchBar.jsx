// frontend/src/components/search/SearchBar.js
import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Row, Col } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, initialParams = { query: '', skillLevel: '' }, compact = false }) => {
  const [searchParams, setSearchParams] = useState(initialParams);
  const navigate = useNavigate();

  // Update searchParams when initialParams change
  useEffect(() => {
    setSearchParams(initialParams);
  }, [initialParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Call onSearch callback
    onSearch(searchParams);
    
    // Update URL
    const queryParams = new URLSearchParams();
    if (searchParams.query) queryParams.append('query', searchParams.query);
    if (searchParams.skillLevel) queryParams.append('skillLevel', searchParams.skillLevel);
    
    navigate(`/search?${queryParams.toString()}`, { replace: true });
  };

  return (
    <div className={`search-bar-container ${compact ? 'py-2' : 'py-4'} px-3 bg-light rounded shadow-sm`}>
      {!compact && (
        <h3 className="text-primary mb-3">Find Skills to Learn</h3>
      )}
      
      <Form onSubmit={handleSubmit}>
        {compact ? (
          <>
            <Form.Group className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by skill or teacher..."
                  name="query"
                  value={searchParams.query}
                  onChange={handleChange}
                />
              </InputGroup>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Skill Level</Form.Label>
              <Form.Select
                name="skillLevel"
                value={searchParams.skillLevel}
                onChange={handleChange}
                aria-label="Skill Level"
              >
                <option value="">All Skill Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </Form.Select>
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100"
            >
              Search
            </Button>
          </>
        ) : (
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by skill or teacher name..."
                  name="query"
                  value={searchParams.query}
                  onChange={handleChange}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                name="skillLevel"
                value={searchParams.skillLevel}
                onChange={handleChange}
                aria-label="Skill Level"
              >
                <option value="">All Skill Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100"
              >
                Search
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};

export default SearchBar;