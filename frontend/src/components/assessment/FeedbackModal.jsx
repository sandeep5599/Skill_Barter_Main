import React, { useState, useEffect } from 'react';
import { FileEarmarkPdf, XCircle, Download, Calendar, CheckCircleFill, Award, ClockHistory, X } from 'react-bootstrap-icons';
import Loading from '../common/Loading';

const FeedbackModal = ({ submissionId, onClose }) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/assessments/submission/${submissionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch submission details: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.submission) {
          setSubmission(data.submission);
        } else {
          throw new Error('Failed to load submission details');
        }
      } catch (err) {
        console.error('Error fetching submission details:', err);
        setError(err.message || 'An error occurred while loading submission details');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get assessment title safely
  const getAssessmentTitle = () => {
    if (!submission || !submission.assessmentId) return 'Assessment';
    return typeof submission.assessmentId === 'object' && submission.assessmentId !== null
      ? submission.assessmentId.title || 'Assessment'
      : 'Assessment';
  };

  // Get assessment description safely
  const getAssessmentDescription = () => {
    if (!submission || !submission.assessmentId) return '';
    return typeof submission.assessmentId === 'object' && submission.assessmentId !== null
      ? submission.assessmentId.description || ''
      : '';
  };

  // Get total possible marks safely from the assessment
  const getTotalPossibleMarks = () => {
    if (!submission) return 100; // Default fallback
    
    // Try to get totalMarks from various possible locations in the data structure
    if (submission.totalMarks !== undefined) {
      return submission.totalMarks;
    }
    
    if (submission.assessmentId && typeof submission.assessmentId === 'object') {
      if (submission.assessmentId.totalMarks !== undefined) {
        return submission.assessmentId.totalMarks;
      }
      if (submission.assessmentId.maxMarks !== undefined) {
        return submission.assessmentId.maxMarks;
      }
    }
    
    // If maxMarks exists directly on submission
    if (submission.maxMarks !== undefined) {
      return submission.maxMarks;
    }
    
    return 100; // Default fallback if nothing else is available
  };

  if (loading) {
    return (
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 border-0 rounded-4 shadow">
          <Loading message="Loading assessment feedback..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 border-0 rounded-4 shadow">
          <div className="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold">Error</h5>
            <button 
              type="button" 
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center" 
              onClick={onClose}
              style={{width: '32px', height: '32px'}}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body text-center py-4">
            <div className="bg-danger bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
              <XCircle size={40} className="text-danger" />
            </div>
            <h5 className="fw-bold mb-3">Failed to Load Feedback</h5>
            <p className="text-muted mb-0">{error}</p>
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-4 border-0 rounded-4 shadow">
          <div className="modal-header border-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold">Not Found</h5>
            <button 
              type="button" 
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center" 
              onClick={onClose}
              style={{width: '32px', height: '32px'}}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body text-center py-4">
            <p className="mb-0">The submission details could not be found.</p>
          </div>
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const maxMarks = getTotalPossibleMarks();

  return (
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
        <div className="modal-header border-0 bg-primary bg-gradient text-white p-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="modal-title fw-bold mb-1">{getAssessmentTitle()}</h5>
            <p className="mb-0 opacity-75 small">Assessment Feedback</p>
          </div>
          <button 
            type="button" 
            className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" 
            onClick={onClose}
            style={{width: '36px', height: '36px'}}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body p-0">
          {/* Score Section */}
          <div className="bg-light p-4 text-center">
            <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
              <div>
                <div className="score-circle mx-auto mb-2 d-flex flex-column align-items-center justify-content-center shadow" 
                      style={{ 
                        width: '130px', 
                        height: '130px', 
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)',
                        color: 'white'
                      }}>
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <h2 className="mb-0 fw-bold">{submission.marks}</h2>
                    <small>Score</small>
                  </div>
                </div>
            
              </div>
              
              <div className="border-start ps-4 text-start d-none d-md-block">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-1">
                    <Calendar size={16} className="text-primary me-2" />
                    <span className="text-muted fw-medium small">Submitted:</span>
                  </div>
                  <p className="mb-0 ms-4 small">{formatDate(submission.submittedAt)}</p>
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <CheckCircleFill size={16} className="text-success me-2" />
                    <span className="text-muted fw-medium small">Evaluated:</span>
                  </div>
                  <p className="mb-0 ms-4 small">{formatDate(submission.evaluatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Date info for mobile */}
          <div className="d-md-none p-4 border-bottom">
            <div className="d-flex flex-wrap gap-3">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <Calendar size={16} className="text-primary me-2" />
                  <span className="text-muted fw-medium small">Submitted:</span>
                </div>
                <p className="mb-0 ms-4 small">{formatDate(submission.submittedAt)}</p>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <CheckCircleFill size={16} className="text-success me-2" />
                  <span className="text-muted fw-medium small">Evaluated:</span>
                </div>
                <p className="mb-0 ms-4 small">{formatDate(submission.evaluatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Assessment Description */}
          <div className="p-4 border-bottom">
            <h6 className="fw-bold d-flex align-items-center">
              <Award className="me-2 text-primary" />
              About This Assessment
            </h6>
            <p className="text-muted small mb-0">{getAssessmentDescription() || 'No description available for this assessment.'}</p>
          </div>

          {/* Feedback Section */}
          <div className="p-4 border-bottom">
            <h6 className="fw-bold d-flex align-items-center mb-3">
              <CheckCircleFill className="me-2 text-success" />
              Your Feedback
            </h6>
            <div className="bg-light rounded-3 p-4 border">
              {submission.feedback ? (
                <div className="feedback-content">
                  {submission.feedback.split('\n').map((paragraph, index) => (
                    <p key={index} className={index === submission.feedback.split('\n').length - 1 ? 'mb-0' : 'mb-3'}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0 fst-italic">No detailed feedback was provided for this assessment.</p>
              )}
            </div>
          </div>

          {/* Submission Document */}
          <div className="p-4">
            <h6 className="fw-bold d-flex align-items-center mb-3">
              <FileEarmarkPdf className="me-2 text-danger" />
              Your Submission
            </h6>
            {submission.answersPdfUrl ? (
              <div className="card bg-light border p-3 d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FileEarmarkPdf className="text-danger me-2" size={24} />
                  <span>Submitted Assessment Document</span>
                </div>
                <a 
                  href={submission.answersPdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary rounded-pill px-3"
                >
                  <Download className="me-1" size={16} />
                  View PDF
                </a>
              </div>
            ) : (
              <div className="alert alert-warning d-flex align-items-center mb-0" role="alert">
                <XCircle className="me-2" />
                <div>No submission document available</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer bg-light border-0 p-3">
          <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
          <button 
            type="button" 
            className="btn btn-primary rounded-pill px-4"
            onClick={() => {
              if (submission.answersPdfUrl) {
                window.open(submission.answersPdfUrl, '_blank');
              }
            }}
            disabled={!submission.answersPdfUrl}
          >
            <Download className="me-1" size={16} />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;