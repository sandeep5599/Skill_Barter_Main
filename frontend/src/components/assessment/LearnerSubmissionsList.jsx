import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileEarmarkPdf, Calendar, ArrowRight, CheckCircle, XCircle, 
  ClockHistory, Eye, SortDown, Filter, Search, 
  BoxArrowUpRight, Lightning, FileEarmark
} from 'react-bootstrap-icons';
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
        return (
          <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1" 
               style={{ background: 'linear-gradient(to right, #0ea5e9, #0284c7)', color: 'white' }}>
            <ClockHistory size={12} />
            <span>Pending Review</span>
          </div>
        );
      case 'evaluated':
        return (
          <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1" 
               style={{ background: 'linear-gradient(to right, #10b981, #047857)', color: 'white' }}>
            <CheckCircle size={12} />
            <span>Evaluated</span>
          </div>
        );
      case 'late':
        return (
          <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1" 
               style={{ background: 'linear-gradient(to right, #f59e0b, #d97706)', color: 'white' }}>
            <Lightning size={12} />
            <span>Submitted Late</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1" 
               style={{ background: 'linear-gradient(to right, #ef4444, #b91c1c)', color: 'white' }}>
            <XCircle size={12} />
            <span>Rejected</span>
          </div>
        );
      default:
        return (
          <div className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-1" 
               style={{ background: 'linear-gradient(to right, #64748b, #475569)', color: 'white' }}>
            <FileEarmark size={12} />
            <span>Unknown</span>
          </div>
        );
    }
  };

  // Modified function to not show score badges
  const getScore = (submission) => {
    // Return null for all submissions to remove the score badge
    return null;
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
            className="btn btn-primary rounded-pill py-2 px-4 d-flex align-items-center justify-content-center shadow-sm gap-2"
            style={{ 
              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Eye size={18} />
            <span className="fw-semibold">View Feedback</span>
          </button>
        );
      case 'submitted':
        return (
          <div className="d-flex align-items-center justify-content-center p-3 rounded-3 gap-2"
               style={{ 
                 background: 'rgba(14, 165, 233, 0.1)',
                 border: '1px solid rgba(14, 165, 233, 0.2)' 
               }}>
            <ClockHistory className="text-info" size={18} />
            <span className="fw-medium">Awaiting Evaluation</span>
          </div>
        );
      default:
        return (
          <Link 
            to={`/assessment/${assessmentId}/details`}
            className="btn btn-outline-primary rounded-pill py-2 px-4 d-flex align-items-center justify-content-center gap-2"
            style={{
              borderColor: '#3b82f6',
              color: '#1e40af',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="fw-semibold">View Details</span>
            <ArrowRight size={18} />
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
          <div className="bg-light rounded-circle mx-auto d-flex align-items-center justify-content-center" 
               style={{ 
                 width: '80px', 
                 height: '80px',
                 background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                 boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
               }}>
            <FileEarmarkPdf size={40} style={{ color: '#0284c7' }} />
          </div>
        </div>
        <h4 className="fw-bold mb-3">No Submissions Found</h4>
        <p className="text-muted mb-4">You haven't submitted any assessments yet.</p>
        <Link 
          to="/assessments" 
          className="btn btn-primary rounded-pill py-2 px-4 shadow-sm d-inline-flex align-items-center gap-2"
          style={{ 
            background: 'linear-gradient(to right, #3b82f6, #1e40af)',
            border: 'none',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Lightning size={16} />
          <span className="fw-semibold">Browse Available Assessments</span>
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
      {/* Hero Section with Background Gradient */}
      <div className="position-relative mb-4 p-4 rounded-4" 
           style={{ 
             background: 'linear-gradient(135deg, #0b1437 0%, #1a237e 100%)',
             color: 'white',
             overflow: 'hidden'
           }}>
        {/* Decorative Elements */}
        <div className="position-absolute" style={{ 
          top: '-20px', 
          right: '-20px', 
          width: '200px', 
          height: '200px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div className="position-absolute" style={{ 
          bottom: '-40px', 
          left: '10%', 
          width: '180px', 
          height: '180px',  
          background: 'radial-gradient(circle, rgba(64,115,255,0.2) 0%, rgba(64,115,255,0) 70%)',
          borderRadius: '50%'
        }}></div>
        
        <div className="row align-items-center">
          <div className="col-md-7">
            <h2 className="mb-1 fw-bold" style={{ letterSpacing: '-0.5px' }}>
              My Submissions
            </h2>
            <p className="text-white-50 mb-0">
              Track your progress and review assessment results
            </p>
          </div>
          <div className="col-md-5 mt-3 mt-md-0">
            <div className="position-relative">
              <input 
                type="text" 
                className="form-control bg-white bg-opacity-10 border-0 rounded-pill py-2 ps-4 pe-5 text-white" 
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ backdropFilter: 'blur(10px)' }}
              />
              <Search className="position-absolute end-0 top-50 translate-middle-y me-3 text-white-50" />
            </div>
          </div>
        </div>
        
        <div className="d-flex flex-wrap align-items-center mt-4 gap-2">
        <button 
  className={`btn ${filter === 'all' ? 'btn-light text-primary' : 'btn-outline-light'} rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2 text-nowrap overflow-visible`}
  onClick={() => setFilter('all')}
>
  <FileEarmark size={16} />
  <span className="d-inline-block">All ({submissionCounts.all})</span>
</button>
          <button 
            className={`btn ${filter === 'submitted' ? 'btn-info text-white' : 'btn-outline-light'} rounded-pill px-4 py-2 d-flex align-items-center gap-2`}
            onClick={() => setFilter('submitted')}
            style={filter === 'submitted' ? { 
              background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
              border: 'none' 
            } : {}}
          >
            <ClockHistory size={16} />
            <span>Pending ({submissionCounts.submitted})</span>
          </button>
          <button 
            className={`btn ${filter === 'evaluated' ? 'btn-success text-white' : 'btn-outline-light'} rounded-pill px-4 py-2 d-flex align-items-center gap-2`}
            onClick={() => setFilter('evaluated')}
            style={filter === 'evaluated' ? { 
              background: 'linear-gradient(to right, #10b981, #047857)',
              border: 'none' 
            } : {}}
          >
            <CheckCircle size={16} />
            <span>Evaluated ({submissionCounts.evaluated})</span>
          </button>
        </div>
      </div>
      
      {/* Sorting Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 rounded-3" 
           style={{ background: '#f8fafc', border: '1px solid rgba(203, 213, 225, 0.5)' }}>
        <div className="d-flex align-items-center gap-2">
          <Filter size={18} className="text-primary" />
          <span className="fw-semibold">Filter & Sort</span>
        </div>
        <div className="dropdown">
          <button 
            className="btn btn-outline-secondary bg-white rounded-pill d-flex align-items-center gap-2 px-4" 
            type="button" 
            id="sortDropdown" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            style={{ borderColor: '#cbd5e1' }}
          >
            <SortDown size={18} className="text-primary" />
            <span>Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Status'}</span>
          </button>
          <ul className="dropdown-menu shadow border-0 rounded-3" aria-labelledby="sortDropdown">
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
      
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-4 my-4 rounded-4" style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
          <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
               style={{ 
                 width: '64px', 
                 height: '64px',
                 background: 'rgba(100, 116, 139, 0.1)'
               }}>
            <Filter size={24} className="text-primary" />
          </div>
          <h6 className="fw-bold mb-2">No matching submissions</h6>
          <p className="text-muted mb-3">Try changing your search or filter settings</p>
          <button 
            onClick={() => {
              setFilter('all');
              setSearchTerm('');
              setSortBy('newest');
            }}
            className="btn btn-outline-primary rounded-pill px-4 py-2 d-flex align-items-center mx-auto gap-2"
            style={{ width: 'fit-content' }}
          >
            <span>Reset Filters</span>
            <ArrowRight size={16} />
          </button>
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
            
            // Determine card style based on status
            const cardStyle = {
              borderTop: submission.status === 'evaluated' ? '4px solid #10b981' : 
                        submission.status === 'submitted' ? '4px solid #0ea5e9' : 
                        submission.status === 'late' ? '4px solid #f59e0b' :
                        submission.status === 'rejected' ? '4px solid #ef4444' :
                        '4px solid #3b82f6'
            };
            
            // Status icon background 
            const iconBgStyle = {
              background: submission.status === 'evaluated' ? 'rgba(16, 185, 129, 0.1)' :
                          submission.status === 'submitted' ? 'rgba(14, 165, 233, 0.1)' :
                          submission.status === 'late' ? 'rgba(245, 158, 11, 0.1)' :
                          submission.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                          'rgba(59, 130, 246, 0.1)'
            };
            
            // Status icon color
            const iconColorStyle = {
              color: submission.status === 'evaluated' ? '#10b981' :
                     submission.status === 'submitted' ? '#0ea5e9' :
                     submission.status === 'late' ? '#f59e0b' :
                     submission.status === 'rejected' ? '#ef4444' :
                     '#3b82f6'
            };
            
            return (
              <div key={submission._id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all hover-lift"
                     style={{
                       transition: 'all 0.3s ease',
                       ...cardStyle
                     }}>
                  
                  {/* Score badge is removed by modifying getScore function */}
                  {getScore(submission)}
                  
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3 rounded-circle p-3 d-flex align-items-center justify-content-center"
                           style={iconBgStyle}>
                        {submission.status === 'evaluated' ? (
                          <CheckCircle style={iconColorStyle} size={24} />
                        ) : submission.status === 'submitted' ? (
                          <ClockHistory style={iconColorStyle} size={24} />
                        ) : submission.status === 'late' ? (
                          <Lightning style={iconColorStyle} size={24} />
                        ) : submission.status === 'rejected' ? (
                          <XCircle style={iconColorStyle} size={24} />
                        ) : (
                          <FileEarmarkPdf style={iconColorStyle} size={24} />
                        )}
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold" style={{ color: '#0f172a' }}>{assessmentTitle}</h5>
                        <p className="text-muted mb-0 small">{skillTitle}</p>
                      </div>
                    </div>
                    
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                      <div className="d-flex align-items-center backdrop-blur-sm bg-light rounded-pill px-3 py-2">
                        <Calendar className="text-primary me-2" size={16} />
                        <span className="text-muted small">{formattedSubmittedDate}</span>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    {submission.status === 'evaluated' && submission.feedback && (
                      <div className="mb-3 p-3 rounded-3" 
                           style={{ 
                             background: 'rgba(16, 185, 129, 0.1)',
                             border: '1px solid rgba(16, 185, 129, 0.2)'
                           }}>
                        <p className="mb-1 small fw-semibold" style={{ color: '#047857' }}>Feedback:</p>
                        <p className="mb-0 small">
                          {submission.feedback.length > 120 ? 
                            `${submission.feedback.substring(0, 120)}...` : 
                            submission.feedback || 'No written feedback provided.'}
                        </p>
                      </div>
                    )}
                    
                    <div className="d-grid mt-4">
                      {getCardAction(submission)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <FeedbackModal submissionId={selectedSubmissionId} onClose={closeFeedbackModal} />
        </div>
      )}
      
      {/* Custom CSS for transitions and hover effects */}
      <style>
        {`
          .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
          }
          
          .transition-all {
            transition: all 0.3s ease;
          }
          
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
          
          @media (max-width: 768px) {
            .submission-list-container {
              padding: 1rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LearnerSubmissionsList;