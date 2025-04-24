import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Save, 
  Search, 
  FileEarmark, 
  Clock,
  PersonCircle
} from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import ErrorComponent from '../common/Error';

const EvaluateSubmission = ({ skillId, userId }) => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [submission, setSubmission] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const [feedback, setFeedback] = useState(['', '', '', '', '']);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [filter, setFilter] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  // Fetch pending submissions for evaluation
  useEffect(() => {
    const fetchPendingSubmissions = async () => {
      try {
        setLoading(true);
        setError('');

        // If we're in list view mode (no submissionId), fetch the list of pending submissions
        if (!submissionId) {
          const url = skillId
            ? `/api/assessments/${skillId}/pending-submissions`
            : '/api/assessments/pending-submissions';

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

          console.log('Pending submissions:', data);

          if (data.success && data.submissions) {
            setPendingSubmissions(data.submissions);
          } else {
            setPendingSubmissions([]);
          }
        }
      } catch (err) {
        console.error('Error fetching pending submissions:', err);
        setError('Failed to load pending submissions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSubmissions();
  }, [skillId, submissionId]);

  // Fetch specific submission if submissionId is provided
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!submissionId) return;

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/assessments/submission/${submissionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch submission: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.submission) {
          setSubmission(data.submission);

          // Initialize scores and feedback if already evaluated
          if (data.submission.evaluation) {
            setScores(data.submission.evaluation.scores || [0, 0, 0, 0, 0]);
            setFeedback(data.submission.evaluation.feedback || ['', '', '', '', '']);
            setOverallFeedback(data.submission.evaluation.overallFeedback || '');
          } else {
            // Reset form if not evaluated
            setScores([0, 0, 0, 0, 0]);
            setFeedback(['', '', '', '', '']);
            setOverallFeedback('');
          }
        } else {
          throw new Error('Submission not found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load submission');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const handleScoreChange = (index, value) => {
    const newValue = Math.min(10, Math.max(0, parseInt(value) || 0));
    const newScores = [...scores];
    newScores[index] = newValue;
    setScores(newScores);
  };

  const handleFeedbackChange = (index, value) => {
    const newFeedback = [...feedback];
    newFeedback[index] = value;
    setFeedback(newFeedback);
  };

  const calculateTotalScore = () => {
    return scores.reduce((sum, score) => sum + score, 0);
  };

  const calculateAverageScore = () => {
    return calculateTotalScore() / 10;
  };

  const handleSubmitEvaluation = async () => {
    try {
      setSaving(true);
      setError('');

      const totalScore = calculateTotalScore();
      const averageScore = calculateAverageScore();

      // Updated endpoint and HTTP method to match backend route
      const response = await fetch(`/api/assessments/submission/${submissionId}/evaluate`, {
        method: 'PATCH', // Changed from POST to PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'x-socket-id': localStorage.getItem('socketId') || 'no-socket',
        },
        body: JSON.stringify({
          scores,
          feedback,
          overallFeedback,
          totalScore,
          averageScore
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit evaluation: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Navigate back to the submissions list
        if (skillId) {
          navigate(`/skills/${skillId}/assessments/evaluate`);
        } else {
          navigate('/assessments/evaluate');
        }
      } else {
        throw new Error(data.message || 'Failed to submit evaluation');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to submit evaluation');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSubmission = (submissionId) => {
    if (skillId) {
      navigate(`/skills/${skillId}/assessments/evaluate/${submissionId}`);
    } else {
      navigate(`/assessments/evaluate/${submissionId}`);
    }
  };

  const filteredSubmissions = pendingSubmissions.filter(sub => {
    const searchTerm = filter.toLowerCase();
    const learnerName = (sub.userId?.name || '').toLowerCase();
    const assessmentTitle = (sub.assessmentId?.title || '').toLowerCase();

    return learnerName.includes(searchTerm) || assessmentTitle.includes(searchTerm);
  });

  // Render the submission list view
  const renderSubmissionsList = () => {
    if (pendingSubmissions.length === 0) {
      return (
        <div className="text-center py-5">
          <div className="mb-3">
            <CheckCircle size={48} style={{ color: '#d1d5db' }} />
          </div>
          <h5 className="fw-bold">No Submissions to Evaluate</h5>
          <p className="text-muted">There are no pending submissions waiting for your evaluation.</p>
        </div>
      );
    }

    return (
      <div className="card border-0 shadow-sm" style={{ 
        borderRadius: '1rem',
        background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)'
      }}>
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" style={{ 
          borderRadius: '1rem 1rem 0 0',
          background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
          border: 'none',
          padding: '1.25rem'
        }}>
          <div className="d-flex align-items-center">
            <FileEarmark className="me-2" size={24} />
            <h5 className="mb-0 fw-bold">Submissions Awaiting Evaluation</h5>
          </div>
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white" style={{ borderRadius: '2rem 0 0 2rem' }}>
              <Search />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by learner or assessment"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ borderRadius: '0 2rem 2rem 0', border: 'none' }}
            />
          </div>
        </div>

        <div className="card-body p-0">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No submissions match your search.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Assessment</th>
                    <th>Learner</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission, index) => {
                    const submittedDate = new Date(submission.submittedAt);
                    const formattedDate = submittedDate.toLocaleDateString();
                    const formattedTime = submittedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={submission._id} style={{
                        transition: 'background-color 0.3s ease',
                        backgroundColor: index % 2 === 0 ? '#f8f9ff' : '#ffffff',
                      }}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ 
                              background: 'linear-gradient(135deg, #e6f0ff, #d1e2ff)',
                              width: '40px', 
                              height: '40px'
                            }}>
                              <FileEarmark className="text-primary" />
                            </div>
                            <div>
                              <p className="mb-0 fw-medium">{submission.assessmentId?.title || 'Assessment'}</p>
                              <p className="mb-0 small text-muted">{submission.assessmentId?.skillId?.title || 'Skill'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ 
                              background: 'linear-gradient(135deg, #e6f0ff, #d1e2ff)',
                              width: '40px', 
                              height: '40px'
                            }}>
                              <span className="text-primary fw-bold">{(submission.submittedBy.name || 'User').charAt(0)}</span>
                            </div>
                            <div>
                              <p className="mb-0 fw-medium">{submission.submittedBy.name || 'User'}</p>
                              <p className="mb-0 small text-muted">{submission.submittedBy.email || 'Email'}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ 
                              background: 'linear-gradient(135deg, #fff9e6, #ffe2d1)',
                              width: '40px', 
                              height: '40px'
                            }}>
                              <Clock className="text-warning" />
                            </div>
                            <div>
                              <p className="mb-0">{formattedDate}</p>
                              <p className="mb-0 small text-muted">{formattedTime}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ 
                            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                            color: '#fff',
                            borderRadius: '2rem',
                            padding: '0.5rem 1rem',
                            fontWeight: '600'
                          }}>Pending Review</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleSelectSubmission(submission._id)}
                            style={{ 
                              borderRadius: '2rem',
                              padding: '0.5rem 1.25rem',
                              fontWeight: '600',
                              boxShadow: '0 5px 15px rgba(67, 97, 238, 0.3)',
                              background: 'linear-gradient(90deg, #4361ee, #3f37c9)',
                              border: 'none'
                            }}
                          >
                            Evaluate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the evaluation form for a specific submission
  const renderEvaluationForm = () => {
    if (!submission) {
      return <ErrorComponent message="Submission not found" />;
    }

    return (
      <div className="card border-0 shadow-sm" 
        style={{ 
          borderRadius: '1rem',
          overflow: 'hidden',
          background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)'
        }}>
        <div className="card-header bg-white p-4 border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-outline-primary rounded-circle me-3"
                onClick={() => navigate(-1)}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e0e7ff',
                  background: 'linear-gradient(to right, #ffffff, #f5f7ff)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h4 className="mb-0 fw-bold">Evaluate Assessment Submission</h4>
                <p className="text-muted mb-0">
                  {submission.assessmentId?.title || 'Assessment'}
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <div className="me-4">
                <p className="small text-muted mb-0">Submitted by</p>
                <p className="fw-medium mb-0">
                  {submission.submittedBy.name || 'User'}
                </p>
              </div>
              <div>
                <p className="small text-muted mb-0">Submitted on</p>
                <p className="fw-medium mb-0">
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="row g-0">
            {/* Left column - PDF viewer */}
            <div className="col-lg-7 border-end">
              <div className="p-4">
                <h5 className="fw-bold mb-3">Student Submission</h5>

                <div className="mb-3" style={{ 
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}>
                  <iframe
                    src={submission.answersPdfUrl}
                    title="PDF Viewer"
                    style={{ height: '600px', width: '100%', border: 'none' }}
                  ></iframe>
                </div>

                <div className="d-grid mt-3">
                  <a
                    href={submission.answersPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                    style={{ 
                      borderRadius: '2rem',
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600',
                      border: '2px solid #e0e7ff',
                      background: 'linear-gradient(to right, #ffffff, #f5f7ff)'
                    }}
                  >
                    Open PDF in New Tab
                  </a>
                </div>
              </div>
            </div>

            {/* Right column - Evaluation form */}
            <div className="col-lg-5">
              <div className="p-4">
                <h5 className="fw-bold mb-4">Evaluation Form</h5>

                <div className="card mb-4 border-0 p-3" style={{
                  borderRadius: '1rem',
                  background: 'linear-gradient(to right bottom, #f0f4ff, #e6f0ff)',
                  boxShadow: '0 5px 15px rgba(79, 70, 229, 0.1)'
                }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Score:</span>
                    <span className="fw-bold">{calculateTotalScore()}/50</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Average Score (Will be added to user points):</span>
                    <span className="fw-bold">{calculateAverageScore().toFixed(1)}/5</span>
                  </div>
                </div>

                {/* Question scores input */}
                <form>
                  {[1, 2, 3, 4, 5].map((questionNum, index) => (
                    <div 
                      key={index} 
                      className="card mb-3 border-0 shadow-sm"
                      style={{
                        borderRadius: '1rem',
                        transition: 'all 0.3s ease',
                        transform: hoveredCard === `question-${index}` ? 'translateY(-3px)' : 'none',
                        boxShadow: hoveredCard === `question-${index}` ? '0 10px 20px rgba(79, 70, 229, 0.15)' : '0 5px 10px rgba(0, 0, 0, 0.03)'
                      }}
                      onMouseEnter={() => setHoveredCard(`question-${index}`)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="card-header bg-white py-3 px-3 d-flex justify-content-between align-items-center" style={{
                        borderRadius: '1rem 1rem 0 0',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                      }}>
                        <h6 className="mb-0 fw-bold" style={{ color: '#4361ee' }}>Question {questionNum}</h6>
                        <div className="input-group input-group-sm" style={{ width: '100px' }}>
                          <input
                            type="number"
                            className="form-control text-center"
                            min="0"
                            max="10"
                            value={scores[index]}
                            onChange={(e) => handleScoreChange(index, e.target.value)}
                            style={{
                              borderTopLeftRadius: '1rem',
                              borderBottomLeftRadius: '1rem',
                              fontWeight: '600'
                            }}
                          />
                          <span className="input-group-text" style={{
                            borderTopRightRadius: '1rem',
                            borderBottomRightRadius: '1rem',
                            background: 'linear-gradient(135deg, #4361ee, #3f37c9)',
                            color: 'white',
                            fontWeight: '600'
                          }}>/10</span>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <label className="form-label small text-muted">Feedback:</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Provide feedback for this question..."
                          value={feedback[index]}
                          onChange={(e) => handleFeedbackChange(index, e.target.value)}
                          style={{
                            borderRadius: '0.75rem',
                            border: '1px solid #e0e7ff',
                            transition: 'all 0.3s ease'
                          }}
                        ></textarea>
                      </div>
                    </div>
                  ))}

                  <div className="mb-4">
                    <label className="form-label fw-medium">Overall Feedback:</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Provide overall feedback for this assessment..."
                      value={overallFeedback}
                      onChange={(e) => setOverallFeedback(e.target.value)}
                      style={{
                        borderRadius: '0.75rem',
                        border: '1px solid #e0e7ff',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.03)',
                        transition: 'all 0.3s ease'
                      }}
                    ></textarea>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className="btn btn-primary d-flex align-items-center justify-content-center"
                      onClick={handleSubmitEvaluation}
                      disabled={saving}
                      style={{ 
                        borderRadius: '2rem',
                        padding: '0.75rem 1.5rem',
                        fontWeight: '600',
                        boxShadow: '0 8px 15px rgba(67, 97, 238, 0.3)',
                        background: 'linear-gradient(90deg, #4361ee, #3f37c9)',
                        border: 'none'
                      }}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving Evaluation...
                        </>
                      ) : (
                        <>
                          <Save className="me-2" />
                          Submit Evaluation
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate(-1)}
                      style={{ 
                        borderRadius: '2rem',
                        padding: '0.75rem 1.5rem',
                        fontWeight: '600',
                        border: '2px solid #e0e7ff',
                        background: 'linear-gradient(to right, #ffffff, #f5f7ff)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading message={submissionId ? "Loading submission..." : "Loading submissions..."} />;
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  // If we have a submissionId, show the evaluation form, otherwise show the list
  return (
    <div className="container-fluid">
      {submissionId ? renderEvaluationForm() : renderSubmissionsList()}
    </div>
  );
};

export default EvaluateSubmission;