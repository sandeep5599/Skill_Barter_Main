import React from 'react';
import { Nav } from 'react-bootstrap';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <Nav variant="tabs" className="mb-4 border-0">
      <Nav.Item>
        <Nav.Link 
          className={`fw-bold ${activeTab === 'overview' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
          onClick={() => setActiveTab('overview')}
          active={activeTab === 'overview'}
        >
          Overview
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          className={`fw-bold ${activeTab === 'sessions' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
          onClick={() => setActiveTab('sessions')}
          active={activeTab === 'sessions'}
        >
          Sessions
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          className={`fw-bold ${activeTab === 'matches' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
          onClick={() => setActiveTab('matches')}
          active={activeTab === 'matches'}
        >
          Matches
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link 
          className={`fw-bold ${activeTab === 'skills' ? 'text-primary border-primary border-bottom-0' : 'text-muted'}`}
          onClick={() => setActiveTab('skills')}
          active={activeTab === 'skills'}
        >
          Skills
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default TabNavigation;