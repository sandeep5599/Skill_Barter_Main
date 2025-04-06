import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileEarmarkPdf, Calendar, ArrowRight, CheckCircle, XCircle, ClockHistory, Eye } from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';

const LearnerSubmissionsList = ({ userId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, evaluated

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('/api/assessments/submissions/learner', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Fetched learner submissions:", data);
        
        if (data.success && Array.isArray(data.submissions)) {
          // Sort submissions by submittedAt date (most recent first)
          const sortedSubmissions = data.submissions.sort((a, b) => {
            return new Date(b.submittedAt) - new Date(a.submittedAt);
          });
          setSubmissions(sortedSubmissions);
        } else {
          setSubmissions([]);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load your submissions. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [userId]);

  const filterSubmissions = () => {
    if (filter === 'all') {
      return submissions;
    }
    return submissions.filter(sub => sub.status === filter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge bg-info">Pending Review</span>;
      case 'evaluated':
        return <span className="badge bg-success">Evaluated</span>;
      case 'late':
        return <span className="badge bg-warning text-dark">Submitted Late</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  const getScore = (submission) => {
    if (submission.status !== 'evaluated' || !submission.feedback) {
      return null;
    }
    
    if (submission.feedback.score !== undefined) {
      return (
        <div className="score-badge">
          <div className={`rounded-circle d-flex align-items-center justify-content-center ${submission.feedback.score >= 70 ? 'bg-success' : 'bg-warning'}`} 
               style={{ width: '48px', height: '48px' }}>
            <span className="text-white fw-bold">{submission.feedback.score}%</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const getCardAction = (submission) => {
    switch (submission.status) {
      case 'evaluated':
        return (
          <Link 
            to={`/assessment/${submission.assessmentId._id || submission.assessmentId}/results`}
            className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
          >
            <Eye className="me-2" />
            <span>View Feedback</span>
          </Link>
        );
      case 'submitted':
        return (
          <div className="d-flex align-items-center justify-content-center p-2 bg-light rounded-3">
            <ClockHistory className="text-info me-2" />
            <span className="fw-medium">Awaiting Evaluation</span>
          </div>
        );
      default:
        return (
          <Link 
            to={`/assessment/${submission.assessmentId._id || submission.assessmentId}/details`}
            className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
          >
            <span>View Details</span>
            <ArrowRight className="ms-2" />
          </Link>
        );
    }
  };

  if (loading) {
    return <Loading message="Loading your submissions..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <FileEarmarkPdf size={48} className="text-muted" />
        </div>
        <h5 className="fw-bold">No Submissions Found</h5>
        <p className="text-muted">You haven't submitted any assessments yet.</p>
        <Link to="/assessments" className="btn btn-primary rounded-pill mt-3">
          Browse Available Assessments
        </Link>
      </div>
    );
  }

  const filteredSubmissions = filterSubmissions();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">My Submissions ({submissions.length})</h5>
        <div className="d-flex">
          <div className="btn-group me-2">
            <button 
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn btn-sm ${filter === 'submitted' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('submitted')}
            >
              Pending
            </button>
            <button 
              className={`btn btn-sm ${filter === 'evaluated' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('evaluated')}
            >
              Evaluated
            </button>
          </div>
          <div className="dropdown">
            <button className="btn btn-outline-secondary dropdown-toggle rounded-pill btn-sm" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
              Sort By
            </button>
            <ul className="dropdown-menu" aria-labelledby="sortDropdown">
              <li><button className="dropdown-item">Most Recent</button></li>
              <li><button className="dropdown-item">Oldest First</button></li>
              <li><button className="dropdown-item">Status</button></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="row g-4">
        {filteredSubmissions.map(submission => {
          // Format submission date
          const submittedDate = submission.submittedAt ? new Date(submission.submittedAt) : null;
          const formattedSubmittedDate = submittedDate ? submittedDate.toLocaleDateString() : 'Unknown date';
          
          // Get assessment details
          const assessmentTitle = submission.assessmentId && typeof submission.assessmentId === 'object' 
            ? submission.assessmentId.title 
            : 'Assessment';
            
          const skillTitle = submission.assessmentId && 
                           typeof submission.assessmentId === 'object' && 
                           submission.assessmentId.skillId && 
                           typeof submission.assessmentId.skillId === 'object'
            ? submission.assessmentId.skillId.title
            : 'Skill Assessment';
          
          return (
            <div key={submission._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 position-relative">
                {getScore(submission)}
                
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`rounded-circle p-2 me-3 ${
                      submission.status === 'evaluated' ? 'bg-success bg-opacity-10' : 
                      submission.status === 'submitted' ? 'bg-info bg-opacity-10' : 
                      'bg-primary bg-opacity-10'
                    }`}>
                      {submission.status === 'evaluated' ? (
                        <CheckCircle className="text-success" />
                      ) : submission.status === 'submitted' ? (
                        <ClockHistory className="text-info" />
                      ) : (
                        <FileEarmarkPdf className="text-primary" />
                      )}
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{assessmentTitle}</h5>
                      <p className="text-muted mb-0 small">{skillTitle}</p>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <Calendar className="text-muted me-2" />
                      <span className="text-muted small">Submitted: {formattedSubmittedDate}</span>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                  
                  {submission.status === 'evaluated' && submission.feedback && (
                    <div className="mb-3">
                      <p className="text-muted mb-2 small">Feedback:</p>
                      <p className="mb-0 small">
                        {submission.feedback.comments ? 
                          (submission.feedback.comments.length > 100 ? 
                            `${submission.feedback.comments.substring(0, 100)}...` : 
                            submission.feedback.comments) : 
                          'No written feedback provided.'}
                      </p>
                    </div>
                  )}
                  
                  <div className="d-grid mt-3">
                    {getCardAction(submission)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearnerSubmissionsList;