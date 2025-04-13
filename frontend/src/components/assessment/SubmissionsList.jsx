import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Inbox, CheckCircle, XCircle, FileEarmarkPdf, PersonCircle, ArrowRight, Search } from 'react-bootstrap-icons';
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

  if (loading) {
    return <Loading message="Loading submissions..." />;
  }

  if (error && submissions.length === 0) {
    return <Error message={error} />;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <Inbox size={48} className="text-muted" />
        </div>
        <h5 className="fw-bold">No Submissions Found</h5>
        <p className="text-muted">There are no assessment submissions available for review.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Assessment Submissions</h5>
        
        <div className="d-flex gap-3">
          {/* Search input */}
          <div className="position-relative">
            <input
              type="text"
              className="form-control rounded-pill ps-4 pe-4"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px' }}
            />
            <Search className="position-absolute top-50 translate-middle-y ms-2" style={{ left: '8px' }} />
          </div>
          
          {/* Filter buttons */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} rounded-start-pill`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`btn ${filter === 'evaluated' ? 'btn-primary' : 'btn-outline-primary'} rounded-end-pill`}
              onClick={() => setFilter('evaluated')}
            >
              Evaluated
            </button>
          </div>
        </div>
      </div>
      
      {filteredSubmissions.length === 0 ? (
        <div className="alert alert-info">
          No submissions match your current filters. Try adjusting your search criteria.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Assessment</th>
                <th scope="col">Submitted</th>
                <th scope="col">Status</th>
                <th scope="col">Score</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission) => {
                const submittedDate = new Date(submission.submittedAt).toLocaleDateString();
                const evaluatedDate = submission.evaluation?.evaluatedAt 
                  ? new Date(submission.evaluation.evaluatedAt).toLocaleDateString()
                  : null;
                  
                return (
                  <tr key={submission._id}>
                    {/* Student */}
                    <td>
                      <div className="d-flex align-items-center">
                        {submission.userId?.avatar ? (
                          <img 
                            src={submission.userId.avatar} 
                            alt={submission.userId?.name} 
                            className="rounded-circle me-2"
                            width="32"
                            height="32"
                          />
                        ) : (
                          <PersonCircle size={32} className="text-secondary me-2" />
                        )}
                        <div>
                          <div className="fw-medium">{submission.userId?.name || 'Unknown'}</div>
                          <div className="small text-muted">{submission.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Assessment */}
                    <td>
                      <div className="fw-medium">{submission.assessmentId?.title || 'Assessment'}</div>
                    </td>
                    
                    {/* Submitted date */}
                    <td>
                      <div>{submittedDate}</div>
                    </td>
                    
                    {/* Status */}
                    <td>
                      {submission.status === 'submitted' ? (
                        <span className="badge bg-warning text-dark">Pending Review</span>
                      ) : (
                        <span className="badge bg-success">Evaluated</span>
                      )}
                    </td>
                    
                    {/* Score */}
                    <td>
                      {submission.evaluation ? (
                        <div className="fw-bold">{submission.evaluation.totalScore}/50</div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    
                    {/* Actions */}
                    <td>
                      {submission.status === 'submitted' ? (
                        <button
                          className="btn btn-primary btn-sm rounded-pill d-flex align-items-center"
                          onClick={() => handleEvaluate(submission._id)}
                        >
                          <CheckCircle size={14} className="me-1" />
                          Evaluate
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill d-flex align-items-center"
                          onClick={() => handleEvaluate(submission._id)}
                        >
                          <FileEarmarkPdf size={14} className="me-1" />
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
  );
};

export default SubmissionsList;