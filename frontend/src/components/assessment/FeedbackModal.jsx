import React, { useState, useEffect } from 'react';
import { FileEarmarkPdf, XCircle, Download, Calendar, CheckCircleFill, Award, ClockHistory } from 'react-bootstrap-icons';
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

  const getPerformanceLabel = (score) => {
    if (score >= 90) return { text: 'Excellent', class: 'bg-success' };
    if (score >= 80) return { text: 'Very Good', class: 'bg-success' };
    if (score >= 70) return { text: 'Good', class: 'bg-primary' };
    if (score >= 60) return { text: 'Satisfactory', class: 'bg-primary' };
    if (score >= 50) return { text: 'Acceptable', class: 'bg-warning' };
    if (score >= 40) return { text: 'Needs Improvement', class: 'bg-warning' };
    return { text: 'Insufficient', class: 'bg-danger' };
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
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Error</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
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
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold">Not Found</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
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

  const performanceInfo = getPerformanceLabel(submission.marks || 0);

  return (
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
        <div className="modal-header border-0 bg-primary text-white p-4">
          <div>
            <h5 className="modal-title fw-bold mb-1">{getAssessmentTitle()}</h5>
            <p className="mb-0 opacity-75 small">Assessment Feedback</p>
          </div>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        
        <div className="modal-body p-0">
          {/* Score Section */}
          <div className="bg-light p-4 text-center">
            <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
              <div>
                <div className="score-circle mx-auto mb-2 d-flex align-items-center justify-content-center shadow-sm" 
                      style={{ 
                        width: '110px', 
                        height: '110px', 
                        borderRadius: '50%', 
                        background: performanceInfo.class.replace('bg-', 'var(--bs-'),
                        color: 'white'
                      }}>
                  <div>
                    <h3 className="mb-0 fw-bold">{submission.marks !== undefined ? `${submission.marks}%` : 'N/A'}</h3>
                    <small>Score</small>
                  </div>
                </div>
                {submission.marks !== undefined && (
                  <span className={`badge ${performanceInfo.class} rounded-pill px-3 py-2`}>
                    {performanceInfo.text}
                  </span>
                )}
              </div>
              
              <div className="border-start ps-4 text-start d-none d-md-block">
                <div className="mb-2">
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
            <h6 className="fw-bold mb-3">Your Feedback</h6>
            <div className="bg-light rounded-3 p-4">
              {submission.feedback ? (
                <p className="mb-0">{submission.feedback}</p>
              ) : (
                <p className="text-muted mb-0 fst-italic">No detailed feedback was provided for this assessment.</p>
              )}
            </div>
          </div>

          {/* Submission Document */}
          <div className="p-4">
            <h6 className="fw-bold mb-3">Your Submission</h6>
            {submission.answersPdfUrl ? (
              <div className="card bg-light border-0 p-3 d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <FileEarmarkPdf className="text-danger me-2" size={24} />
                  <span>Submission Document</span>
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
              <p className="text-muted mb-0 fst-italic">No submission document available</p>
            )}
          </div>
        </div>
        
        <div className="modal-footer bg-light border-0 p-3">
          <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;