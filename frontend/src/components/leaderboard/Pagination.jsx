// src/components/Leaderboard/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

const Pagination = ({ page, totalPages, handlePageChange }) => {
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
      <div className="pagination-container bg-dark bg-opacity-10 p-2 rounded-pill d-flex align-items-center shadow-sm">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="btn btn-dark btn-sm rounded-circle d-flex justify-content-center align-items-center me-2"
          style={{ width: '32px', height: '32px', transition: 'all 0.2s ease' }}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </button>
        
        <div className="pagination-numbers d-flex">
          {pageNumbers.map((num, index) => (
            <React.Fragment key={index}>
              {typeof num === 'number' ? (
                <button
                  onClick={() => handlePageChange(num)}
                  className={`btn btn-sm mx-1 rounded-circle d-flex justify-content-center align-items-center ${
                    page === num ? 'btn-primary shadow-sm pulse-animation' : 'btn-outline-secondary'
                  }`}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    border: page === num ? 'none' : '1px solid #dee2e6',
                    transition: 'all 0.3s ease',
                    transform: page === num ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {num}
                </button>
              ) : (
                <span className="d-flex align-items-center px-1 text-secondary">
                  {num}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="btn btn-dark btn-sm rounded-circle d-flex justify-content-center align-items-center ms-2"
          style={{ width: '32px', height: '32px', transition: 'all 0.2s ease' }}
          aria-label="Next page"
        >
          <ChevronRight />
        </button>
      </div>
      
      <div className="pages-info ms-3 text-secondary small">
        <span className="fw-bold">{page}</span> of <span>{totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;