import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Inbox, 
  CheckCircle, 
  XCircle, 
  FileEarmarkPdf, 
  PersonCircle, 
  ArrowRight, 
  Search,
  FilterCircle,
  SortDown,
  Check2All,
  Clock
} from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';

const SubmissionsList = ({ skillId }) => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'evaluated'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const url = skillId
          ? `/api/assessments/skill/${skillId}/submissions`
          : '/api/assessments/submissions';
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.submissions) {
          setSubmissions(data.submissions);
        } else {
          throw new Error('No submissions found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [skillId]);

  const handleEvaluate = (submissionId) => {
    navigate(`/assessment/submission/${submissionId}/evaluate`);
  };

  // Filter submissions based on status
  const getFilteredSubmissions = () => {
    let filtered = [...submissions];
    
    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter(submission => submission.status === 'submitted');
    } else if (filter === 'evaluated') {
      filtered = filtered.filter(submission => submission.status === 'evaluated');
    }
    
    // Apply search filter if there's a search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(submission => 
        (submission.userId?.name?.toLowerCase().includes(term)) ||
        (submission.assessmentId?.title?.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  };

  const filteredSubmissions = getFilteredSubmissions();

  // Get initials from name for avatar placeholder
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Generate a color based on name for avatar background
  const getAvatarColor = (name) => {
    if (!name) return '#6c757d';
    const charCode = name.charCodeAt(0);
    return `hsl(${(charCode * 70) % 360}, 70%, 65%)`;
  };

  if (loading) {
    return <Loading message="Loading submissions..." />;
  }

  if (error && submissions.length === 0) {
    return <Error message={error} />;
  }

  if (submissions.length === 0) {
    return (
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        <div className="card-body text-center py-5">
          <div className="mb-4">
            <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center" 
              style={{ 
                width: '80px', 
                height: '80px',
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
              }}>
              <Inbox size={40} className="text-primary" />
            </div>
          </div>
          <h4 className="fw-bold mb-2">No Submissions Found</h4>
          <p className="text-muted mb-4">There are no assessment submissions available for review at this time.</p>
          <button 
            className="btn btn-primary rounded-pill px-4 py-2"
            style={{ 
              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
            }}
            onClick={() => navigate('/assessments')}
          >
            Browse Assessments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
      {/* Header Section with Gradient Background */}
      <div className="position-relative p-4" style={{ 
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
          <div className="col-12 col-md-6">
            <h4 className="fw-bold mb-1">Assessment Submissions</h4>
            <p className="text-white-50 mb-0">Review and evaluate student work</p>
          </div>
          <div className="col-12 col-md-6 mt-3 mt-md-0">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
                <Check2All className="me-2 text-success" /> 
                <span className="fw-semibold">{submissions.filter(s => s.status === 'evaluated').length} Evaluated</span>
              </div>
              <div className="backdrop-blur-sm bg-white bg-opacity-10 rounded-pill px-3 py-2 shadow-sm">
                <Clock className="me-2 text-warning" /> 
                <span className="fw-semibold">{submissions.filter(s => s.status === 'submitted').length} Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="p-4 border-bottom bg-white">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-6">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-lg rounded-pill ps-5"
                placeholder="Search by student name or assessment title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0'
                }}
              />
              <Search className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '20px' }} size={18} />
            </div>
          </div>
          
          {/* Filter Buttons */}
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-md-end">
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-start-pill px-4`}
                  onClick={() => setFilter('all')}
                  style={{ 
                    boxShadow: filter === 'all' ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none',
                    background: filter === 'all' ? 'linear-gradient(to right, #3b82f6, #1e40af)' : 'white',
                    borderWidth: '1.5px'
                  }}
                >
                  <FilterCircle size={16} className="me-2" />
                  All
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'} px-4`}
                  onClick={() => setFilter('pending')}
                  style={{ 
                    boxShadow: filter === 'pending' ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none',
                    background: filter === 'pending' ? 'linear-gradient(to right, #f59e0b, #d97706)' : 'white',
                    borderWidth: '1.5px'
                  }}
                >
                  <Clock size={16} className="me-2" />
                  Pending
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'evaluated' ? 'btn-primary' : 'btn-outline-primary'} rounded-end-pill px-4`}
                  onClick={() => setFilter('evaluated')}
                  style={{ 
                    boxShadow: filter === 'evaluated' ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' : 'none',
                    background: filter === 'evaluated' ? 'linear-gradient(to right, #10b981, #047857)' : 'white',
                    borderWidth: '1.5px'
                  }}
                >
                  <Check2All size={16} className="me-2" />
                  Evaluated
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submissions List */}
      <div className="card-body p-0">
        {filteredSubmissions.length === 0 ? (
          <div className="p-5 text-center">
            <div className="mb-3">
              <div className="rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                style={{ 
                  width: '64px', 
                  height: '64px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
                }}>
                <Search size={28} className="text-primary" />
              </div>
            </div>
            <h5 className="fw-bold mb-2">No Results Found</h5>
            <p className="text-muted">No submissions match your current search criteria. Try adjusting your filters.</p>
            <button 
              className="btn btn-outline-primary rounded-pill mt-2"
              onClick={() => {setSearchTerm(''); setFilter('all');}}
              style={{ borderWidth: '1.5px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ 
                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <tr>
                  <th scope="col" className="fw-bold px-4 py-3">Student</th>
                  <th scope="col" className="fw-bold py-3">Assessment</th>
                  <th scope="col" className="fw-bold py-3">Submitted</th>
                  <th scope="col" className="fw-bold py-3">Status</th>
                  <th scope="col" className="fw-bold py-3">Score</th>
                  <th scope="col" className="fw-bold text-end px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => {
                  const submittedDate = new Date(submission.submittedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                  
                  return (
                    <tr key={submission._id} style={{
                      transition: 'all 0.2s ease-out',
                      background: submission.status === 'submitted' ? 'rgba(251, 191, 36, 0.05)' : 'white'
                    }} className="border-bottom">
                      {/* Student */}
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          {submission.userId?.avatar ? (
                            <img 
                              src={submission.userId.avatar} 
                              alt={submission.userId?.name} 
                              className="rounded-circle me-3"
                              width="48"
                              height="48"
                              style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                          ) : (
                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                              style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: getAvatarColor(submission.userId?.name),
                                color: 'white',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}>
                              <span className="fw-bold">{getInitials(submission.userId?.name)}</span>
                            </div>
                          )}
                          <div>
                            <div className="fw-semibold" style={{ color: '#0f172a', fontSize: '1.05rem' }}>
                              {submission.userId?.name || 'Unknown Student'}
                            </div>
                            <div className="text-muted small">{submission.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Assessment */}
                      <td className="py-3">
                        <div>
                          <div className="fw-semibold" style={{ color: '#1e40af' }}>{submission.assessmentId?.title || 'Assessment'}</div>
                          <div className="small text-muted">
                            {submission.assessmentId?.skillId?.name && 
                              <span className="badge rounded-pill" 
                                style={{ 
                                  background: 'rgba(59, 130, 246, 0.1)', 
                                  color: '#3b82f6',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                  padding: '0.4rem 0.8rem'
                                }}>
                                {submission.assessmentId?.skillId?.name}
                              </span>
                            }
                          </div>
                        </div>
                      </td>
                      
                      {/* Submitted date */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div className="me-2 rounded-circle d-flex align-items-center justify-content-center" 
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              background: 'rgba(59, 130, 246, 0.1)', 
                              color: '#3b82f6'
                            }}>
                            <Clock size={16} />
                          </div>
                          <div>
                            <div className="fw-medium">{submittedDate}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="py-3">
                        {submission.status === 'submitted' ? (
                          <div className="d-inline-block rounded-pill px-3 py-2" 
                            style={{ 
                              background: 'rgba(251, 191, 36, 0.1)', 
                              color: '#d97706'
                            }}>
                            <div className="d-flex align-items-center">
                              <Clock size={14} className="me-2" />
                              <span className="fw-semibold">Pending Review</span>
                            </div>
                          </div>
                        ) : (
                          <div className="d-inline-block rounded-pill px-3 py-2" 
                            style={{ 
                              background: 'rgba(16, 185, 129, 0.1)', 
                              color: '#047857'
                            }}>
                            <div className="d-flex align-items-center">
                              <CheckCircle size={14} className="me-2" />
                              <span className="fw-semibold">Evaluated</span>
                            </div>
                          </div>
                        )}
                      </td>
                      
                      {/* Score */}
                      <td className="py-3">
                        {submission.evaluation ? (
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                background: submission.evaluation.totalScore >= 40 ? 'linear-gradient(135deg, #10b981, #047857)' : 
                                          submission.evaluation.totalScore >= 25 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                                          'linear-gradient(135deg, #ef4444, #b91c1c)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                color: 'white'
                              }}>
                              <span className="fw-bold">{submission.evaluation.totalScore}</span>
                            </div>
                            <div className="small text-muted">/ 50</div>
                          </div>
                        ) : (
                          <span className="text-muted">Not graded</span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="text-end px-4 py-3">
                        {submission.status === 'submitted' ? (
                          <button
                            className="btn btn-primary rounded-pill px-4 py-2 d-inline-flex align-items-center"
                            onClick={() => handleEvaluate(submission._id)}
                            style={{ 
                              background: 'linear-gradient(to right, #3b82f6, #1e40af)',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            <CheckCircle size={16} className="me-2" />
                            Evaluate
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-primary rounded-pill px-4 py-2 d-inline-flex align-items-center"
                            onClick={() => handleEvaluate(submission._id)}
                            style={{ borderWidth: '1.5px' }}
                          >
                            <FileEarmarkPdf size={16} className="me-2" />
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Custom Animations */}
      <style>
        {`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        `}
      </style>
    </div>
  );
};

export default SubmissionsList;