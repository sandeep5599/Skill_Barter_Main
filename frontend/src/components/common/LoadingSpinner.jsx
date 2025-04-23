import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="text-center my-5">
      <Spinner animation="border" role="status" />
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;