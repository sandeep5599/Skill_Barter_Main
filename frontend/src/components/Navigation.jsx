import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';  // Use Link directly instead of LinkContainer
import { useAuth } from '../context/AuthContext';
// import NotificationBell from './NotificationBell';

// This is an alternative solution if the above approach doesn't work
const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Skill Barter</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/match/learning">Find Teachers</Nav.Link>
                <Nav.Link as={Link} to="/match/teaching">Teaching Requests</Nav.Link>
                <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <div className="d-flex align-items-center me-3">
                  {/* <NotificationBell /> */}
                </div>
                <span className="me-3">Welcome, {user?.name || 'User'}</span>
                <Button variant="outline-danger" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;