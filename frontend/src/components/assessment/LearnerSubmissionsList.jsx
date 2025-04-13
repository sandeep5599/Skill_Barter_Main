import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileEarmarkPdf, Calendar, ArrowRight, CheckCircle, XCircle, ClockHistory, Eye, SortDown, Filter, Search } from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';
import FeedbackModal from './FeedbackModal';

const LearnerSubmissionsList = ({ userId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

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
        
        if (data.success && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
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

  const filterAndSortSubmissions = () => {
    let filtered = [...submissions];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(sub => sub.status === filter);
    }
    
    // Apply search filter if provided
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => {
        const title = sub.assessmentId && typeof sub.assessmentId === 'object' 
          ? (sub.assessmentId.title || '').toLowerCase() 
          : '';
        return title.includes(term);
      });
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'newest':
        default:
          return new Date(b.submittedAt) - new Date(a.submittedAt);
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="badge rounded-pill bg-info text-white px-3 py-2">Pending Review</span>;
      case 'evaluated':
        return <span className="badge rounded-pill bg-success text-white px-3 py-2">Evaluated</span>;
      case 'late':
        return <span className="badge rounded-pill bg-warning text-dark px-3 py-2">Submitted Late</span>;
      case 'rejected':
        return <span className="badge rounded-pill bg-danger text-white px-3 py-2">Rejected</span>;
      default:
        return <span className="badge rounded-pill bg-secondary text-white px-3 py-2">Unknown</span>;
    }
  };

  const getScore = (submission) => {
    if (submission.status !== 'evaluated' || submission.marks === undefined) {
      return null;
    }
    
    return (
      <div className="score-badge position-absolute top-0 end-0 m-3 shadow-sm">
        <div 
          className={`rounded-circle d-flex align-items-center justify-content-center ${getScoreColorClass(submission.marks)}`} 
          style={{ width: '52px', height: '52px' }}
        >
          <span className="text-white fw-bold">{submission.marks}%</span>
        </div>
      </div>
    );
  };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 70) return 'bg-primary';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const getAssessmentId = (submission) => {
    if (!submission.assessmentId) return 'unknown';
    
    return typeof submission.assessmentId === 'object' && submission.assessmentId !== null 
      ? submission.assessmentId._id || 'unknown'
      : submission.assessmentId;
  };

  const openFeedbackModal = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setShowModal(true);
  };

  const closeFeedbackModal = () => {
    setShowModal(false);
    setSelectedSubmissionId(null);
  };

  const getCardAction = (submission) => {
    const assessmentId = getAssessmentId(submission);
    
    switch (submission.status) {
      case 'evaluated':
        return (
          <button 
            onClick={() => openFeedbackModal(submission._id)}
            className="btn btn-primary rounded-pill py-2 px-4 d-flex align-items-center justify-content-center shadow-sm"
          >
            <Eye className="me-2" size={18} />
            <span>View Feedback</span>
          </button>
        );
      case 'submitted':
        return (
          <div className="d-flex align-items-center justify-content-center p-3 bg-light rounded-3 border">
            <ClockHistory className="text-info me-2" />
            <span className="fw-medium">Awaiting Evaluation</span>
          </div>
        );
      default:
        return (
          <Link 
            to={`/assessment/${assessmentId}/details`}
            className="btn btn-outline-primary rounded-pill py-2 px-4 d-flex align-items-center justify-content-center"
          >
            <span>View Details</span>
            <ArrowRight className="ms-2" size={18} />
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
      <div className="text-center py-5 my-5">
        <div className="mb-4">
          <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
            <FileEarmarkPdf size={40} className="text-primary opacity-75" />
          </div>
        </div>
        <h4 className="fw-bold mb-3">No Submissions Found</h4>
        <p className="text-muted mb-4">You haven't submitted any assessments yet.</p>
        <Link to="/assessments" className="btn btn-primary rounded-pill py-2 px-4 shadow-sm">
          Browse Available Assessments
        </Link>
      </div>
    );
  }

  const filteredSubmissions = filterAndSortSubmissions();
  const submissionCounts = {
    all: submissions.length,
    submitted: submissions.filter(s => s.status === 'submitted').length,
    evaluated: submissions.filter(s => s.status === 'evaluated').length
  };

  return (
    <div className="submission-list-container">
      <div className="mb-4">
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <h4 className="fw-bold mb-0">My Submissions</h4>
            <p className="text-muted mb-0">
              Track your progress and assessment results
            </p>
          </div>
          <div className="col-md-6">
            <div className="position-relative">
              <input 
                type="text" 
                className="form-control bg-light border-0 rounded-pill py-2 ps-4 pe-5" 
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 bg-light p-3 rounded-3 mb-4">
          <div className="d-flex flex-wrap gap-2">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary bg-white'} rounded-pill px-4`}
              onClick={() => setFilter('all')}
            >
              All ({submissionCounts.all})
            </button>
            <button 
              className={`btn ${filter === 'submitted' ? 'btn-primary' : 'btn-outline-secondary bg-white'} rounded-pill px-4`}
              onClick={() => setFilter('submitted')}
            >
              Pending ({submissionCounts.submitted})
            </button>
            <button 
              className={`btn ${filter === 'evaluated' ? 'btn-primary' : 'btn-outline-secondary bg-white'} rounded-pill px-4`}
              onClick={() => setFilter('evaluated')}
            >
              Evaluated ({submissionCounts.evaluated})
            </button>
          </div>
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary bg-white rounded-pill d-flex align-items-center gap-2 px-4" 
              type="button" 
              id="sortDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <SortDown size={18} />
              <span>Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Status'}</span>
            </button>
            <ul className="dropdown-menu shadow border-0" aria-labelledby="sortDropdown">
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => setSortBy('newest')}
                >
                  Most Recent
                </button>
              </li>
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'oldest' ? 'active' : ''}`}
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest First
                </button>
              </li>
              <li>
                <button 
                  className={`dropdown-item ${sortBy === 'status' ? 'active' : ''}`}
                  onClick={() => setSortBy('status')}
                >
                  By Status
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-4 my-4 bg-light rounded-3">
          <Filter size={24} className="text-muted mb-2" />
          <h6 className="mb-1">No matching submissions</h6>
          <p className="text-muted mb-0 small">Try changing your search or filter settings</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredSubmissions.map(submission => {
            // Format submission date
            const submittedDate = submission.submittedAt ? new Date(submission.submittedAt) : null;
            const formattedSubmittedDate = submittedDate ? submittedDate.toLocaleDateString(undefined, {
              year: 'numeric', 
              month: 'short', 
              day: 'numeric'
            }) : 'Unknown date';
            
            // Get assessment details safely
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
                <div className="card h-100 border-0 shadow-sm rounded-4 position-relative overflow-hidden">
                  {/* Status indicator strip on top */}
                  <div className={`status-strip position-absolute top-0 start-0 end-0 ${
                    submission.status === 'evaluated' ? 'bg-success' : 
                    submission.status === 'submitted' ? 'bg-info' : 
                    'bg-primary'
                  }`} style={{ height: '4px' }}></div>
                  
                  {/* Score badge */}
                  {getScore(submission)}
                  
                  <div className="card-body p-4 pt-5">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`rounded-circle p-2 me-3 ${
                        submission.status === 'evaluated' ? 'bg-success bg-opacity-10' : 
                        submission.status === 'submitted' ? 'bg-info bg-opacity-10' : 
                        'bg-primary bg-opacity-10'
                      }`}>
                        {submission.status === 'evaluated' ? (
                          <CheckCircle className="text-success" size={20} />
                        ) : submission.status === 'submitted' ? (
                          <ClockHistory className="text-info" size={20} />
                        ) : (
                          <FileEarmarkPdf className="text-primary" size={20} />
                        )}
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold">{assessmentTitle}</h5>
                        <p className="text-muted mb-0 small">{skillTitle}</p>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <Calendar className="text-muted me-2" size={16} />
                        <span className="text-muted small">{formattedSubmittedDate}</span>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    {submission.status === 'evaluated' && submission.feedback && (
                      <div className="mb-3 px-3 py-2 bg-light rounded-3">
                        <p className="text-muted mb-1 small fw-medium">Feedback:</p>
                        <p className="mb-0 small">
                          {submission.feedback.length > 120 ? 
                            `${submission.feedback.substring(0, 120)}...` : 
                            submission.feedback || 'No written feedback provided.'}
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
      )}

      {/* Modal Component */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <FeedbackModal submissionId={selectedSubmissionId} onClose={closeFeedbackModal} />
        </div>
      )}
    </div>
  );
};

export default LearnerSubmissionsList;