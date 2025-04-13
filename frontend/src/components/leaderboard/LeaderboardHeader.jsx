import React, { memo } from 'react';
import { Badge, Button, Dropdown } from 'react-bootstrap';
import { Award, Filter } from 'react-bootstrap-icons';

const LeaderboardHeader = memo(({ 
  isScrolledDown, 
  showFilters, 
  setShowFilters, 
  timeFrame, 
  setTimeFrame 
}) => {
  return (
    <div 
      className={`position-sticky top-0 bg-white z-3 px-4 py-3 d-flex align-items-center justify-content-between border-bottom transition-all ${isScrolledDown ? 'shadow-sm' : ''}`} 
      style={{ zIndex: 1000 }}
    >
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
  );
});

LeaderboardHeader.displayName = 'LeaderboardHeader';
export default LeaderboardHeader;