import React, { memo } from 'react';
import { Button } from 'react-bootstrap';

const Pagination = memo(({ page, totalPages, handlePageChange }) => {
  const pageNumbers = [];
  
  // Add first page and ellipsis if needed
  if (page > 3) {
    pageNumbers.push(1);
    if (page > 4) pageNumbers.push('...');
  }
  
  // Add page numbers around current page
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pageNumbers.push(i);
  }
  
  // Add ellipsis and last page if needed
  if (page < totalPages - 2) {
    if (page < totalPages - 3) pageNumbers.push('...');
    pageNumbers.push(totalPages);
  }
  
  return (
    <div className="d-flex justify-content-center align-items-center my-4">
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={() => handlePageChange(page - 1)} 
        disabled={page === 1}
        className="me-2"
      >
        <i className="bi bi-chevron-left"></i>
      </Button>
      
      {pageNumbers.map((num, index) => (
        <Button 
          key={index}
          variant={num === page ? "primary" : "outline-primary"}
          size="sm"
          className="mx-1"
          onClick={() => typeof num === 'number' && handlePageChange(num)}
          disabled={typeof num !== 'number'}
        >
          {num}
        </Button>
      ))}
      
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={() => handlePageChange(page + 1)} 
        disabled={page === totalPages}
        className="ms-2"
      >
        <i className="bi bi-chevron-right"></i>
      </Button>
    </div>
  );
});

Pagination.displayName = 'Pagination';
export default Pagination;