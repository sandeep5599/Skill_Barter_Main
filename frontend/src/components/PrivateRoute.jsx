import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const PrivateRoute = ({ children }) => {
  const { user, isValidating } = useAuth();

  // Show a loading spinner while validating
  if (isValidating) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner 
          animation="border" 
          role="status" 
          variant="primary"
          style={{ width: '3rem', height: '3rem' }}
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Redirect to login if no user is found
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;