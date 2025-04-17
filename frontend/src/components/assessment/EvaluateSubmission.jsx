import React, { useState, useEffect } from 'react';
import { FileEarmarkPdf, XCircle, Download, Calendar, CheckCircleFill, Award, ClockHistory, Star, StarFill, PersonCheck, Trophy } from 'react-bootstrap-icons';
import Loading from '../common/Loading';

const FeedbackModal = ({ submissionId, onClose }) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPercentage, setIsPercentage] = useState(false);

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
          console.log('Submission data:', data.submission);
          
          // Determine if the marks are stored as percentage or absolute value
          // This is an assumption - you might need to adjust based on your backend logic
          const totalMarks = data.submission.assessmentId?.totalMarks || 100;
          setIsPercentage(data.submission.marks > totalMarks);
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

  // Get assessment totalMarks safely
  const getTotalMarks = () => {
    if (!submission || !submission.assessmentId) return 100;
    return typeof submission.assessmentId === 'object' && submission.assessmentId !== null
      ? submission.assessmentId.totalMarks || 100
      : 100;
  };

  // Calculate actual marks and percentage
  const calculateScore = () => {
    if (submission?.marks === undefined) return { actualMarks: 'N/A', percentage: 'N/A' };
    
    const totalMarks = getTotalMarks();
    
    // If marks are stored as percentage
    if (isPercentage) {
      const percentage = submission.marks;
      const actualMarks = (percentage / 100) * totalMarks;
      return {
        actualMarks: Math.round(actualMarks * 10) / 10, // Round to 1 decimal place
        percentage: Math.round(percentage * 10) / 10
      };
    } 
    // If marks are stored as absolute value
    else {
      const actualMarks = submission.marks;
      const percentage = (actualMarks / totalMarks) * 100;
      return {
        actualMarks: Math.round(actualMarks * 10) / 10,
        percentage: Math.round(percentage * 10) / 10
      };
    }
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { level: 5, text: 'Excellent', class: 'bg-success' };
    if (percentage >= 80) return { level: 4, text: 'Very Good', class: 'bg-success' };
    if (percentage >= 70) return { level: 3, text: 'Good', class: 'bg-primary' };
    if (percentage >= 60) return { level: 2, text: 'Satisfactory', class: 'bg-primary' };
    if (percentage >= 50) return { level: 1, text: 'Acceptable', class: 'bg-warning' };
    if (percentage >= 40) return { level: 1, text: 'Needs Improvement', class: 'bg-warning' };
    return { level: 0, text: 'Insufficient', class: 'bg-danger' };
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

  const score = calculateScore();
  const performance = getPerformanceLevel(score.percentage);
  const totalMarks = getTotalMarks();

  return (
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
        <div className="modal-header border-0 bg-primary bg-gradient text-white p-4">
          <div>
            <h5 className="modal-title fw-bold mb-1">{getAssessmentTitle()}</h5>
            <p className="mb-0 opacity-75 small">Assessment Feedback</p>
          </div>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        
        <div className="modal-body p-0">
          {/* Score Section */}
          <div className="bg-gradient bg-light p-4">
            <div className="row g-4 align-items-center">
              <div className="col-md-6">
                <div className="score-card shadow bg-white rounded-4 p-4 h-100 mx-auto" style={{maxWidth: '320px'}}>
                  <div className="text-center mb-4">
                    <h6 className="text-uppercase text-muted mb-3 small fw-bold">Your Score</h6>
                    
                    <div className="score-circle position-relative mx-auto mb-3">
                      <div className="position-relative" style={{width: '150px', height: '150px'}}>
                        {/* Background Circle */}
                        <svg width="150" height="150" viewBox="0 0 120 120">
                          <circle 
                            cx="60" cy="60" r="54" 
                            fill="none" 
                            stroke="#e9ecef"
                            strokeWidth="12"
                          />
                          {/* Foreground Circle - Score Indicator */}
                          <circle 
                            cx="60" cy="60" r="54" 
                            fill="none" 
                            stroke={performance.class.replace('bg-', 'var(--bs-')}
                            strokeWidth="12"
                            strokeDasharray={`${(score.percentage * 3.39)} ${(100 - score.percentage) * 3.39}`}
                            strokeDashoffset="0"
                            transform="rotate(-90 60 60)"
                            style={{transition: 'stroke-dasharray 1s ease-in-out'}}
                          />
                        </svg>
                        
                        {/* Score Text */}
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                          <h2 className="mb-0 fw-bold">{score.actualMarks}</h2>
                          <p className="mb-0 text-muted small">out of {totalMarks}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className={`badge ${performance.class} rounded-pill px-3 py-2`}>
                        {performance.text} ({score.percentage}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="rating-stars text-center">
                    {[...Array(5)].map((_, index) => (
                      index < performance.level ? 
                        <StarFill key={index} className="text-warning mx-1" size={22} /> : 
                        <Star key={index} className="text-secondary mx-1" size={22} />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="h-100">
                  <div className="bg-white rounded-4 shadow p-4 mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <Trophy size={22} className="text-primary" />
                      </div>
                      <div>
                        <small className="text-muted d-block">Performance</small>
                        <span className="fw-medium">{performance.text}</span>
                      </div>
                    </div>
                    
                    <div className="progress rounded-pill mb-4" style={{height: '8px'}}>
                      <div 
                        className={`progress-bar ${performance.class}`} 
                        role="progressbar" 
                        style={{width: `${score.percentage}%`}} 
                        aria-valuenow={score.percentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100">
                      </div>
                    </div>
                    
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="bg-light rounded-3 p-3 text-center">
                          <h5 className="mb-0 fw-bold">{score.actualMarks}/{totalMarks}</h5>
                          <small className="text-muted">Marks</small>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-light rounded-3 p-3 text-center">
                          <h5 className="mb-0 fw-bold">{score.percentage}%</h5>
                          <small className="text-muted">Percentage</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-4 shadow p-4">
                    <h6 className="fw-bold mb-3 small text-uppercase text-muted">Submission Details</h6>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <Calendar size={18} className="text-primary" />
                      </div>
                      <div>
                        <small className="text-muted d-block">Submitted On</small>
                        <span className="small fw-medium">{formatDate(submission.submittedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                        <PersonCheck size={18} className="text-success" />
                      </div>
                      <div>
                        <small className="text-muted d-block">Evaluated On</small>
                        <span className="small fw-medium">{formatDate(submission.evaluatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Description */}
          <div className="p-4 border-bottom">
            <h6 className="fw-bold d-flex align-items-center text-uppercase small mb-3 text-muted">
              <Award className="me-2 text-primary" />
              About This Assessment
            </h6>
            <div className="bg-light rounded-4 p-4">
              <p className="mb-0">{getAssessmentDescription() || 'No description available for this assessment.'}</p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="p-4 border-bottom">
            <h6 className="fw-bold mb-3 text-uppercase small text-muted">Instructor Feedback</h6>
            <div className="bg-light rounded-4 p-4">
              {submission.feedback ? (
                <div className="feedback-content">
                  <div className="border-start border-4 border-primary ps-3">
                    <p className="mb-0">{submission.feedback}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <ClockHistory size={24} className="text-warning" />
                  </div>
                  <p className="text-muted mb-0 fst-italic">No detailed feedback was provided for this assessment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submission Document */}
          <div className="p-4">
            <h6 className="fw-bold mb-3 text-uppercase small text-muted">Your Submission</h6>
            {submission.answersPdfUrl ? (
              <div className="card shadow-sm bg-white border-0 rounded-4 p-3 d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                    <FileEarmarkPdf className="text-danger" size={24} />
                  </div>
                  <div>
                    <span className="fw-medium d-block">Submission Document</span>
                    <small className="text-muted">View or download your submitted work</small>
                  </div>
                </div>
                <a 
                  href={submission.answersPdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center"
                >
                  <Download className="me-1" size={14} />
                  View PDF
                </a>
              </div>
            ) : (
              <div className="text-center py-4 bg-light rounded-4">
                <p className="text-muted mb-0 fst-italic">No submission document available</p>
              </div>
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