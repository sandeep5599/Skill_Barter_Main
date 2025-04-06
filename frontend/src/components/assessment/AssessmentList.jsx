import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileEarmarkPdf, Calendar, ArrowRight, PlusCircle, CheckCircle, ClockHistory } from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

const AssessmentList = ({ skillId, isSkillSharer }) => {
  const [assessments, setAssessments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch assessments
        const endpoint = skillId 
          ? `/api/skills/${skillId}/assessments` 
          : '/api/assessments';
        
        const assessmentResponse = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          cache: 'no-store'
        });
        
        if (!assessmentResponse.ok) {
          throw new Error(`Failed to fetch assessments: ${assessmentResponse.status}`);
        }
        
        const assessmentData = await assessmentResponse.json();
        // console.log("Fetched assessments:", assessmentData);
        
        let assessmentList = [];
        if (assessmentData.success && Array.isArray(assessmentData.assessments)) {
          assessmentList = assessmentData.assessments;
        } else if (Array.isArray(assessmentData)) {
          assessmentList = assessmentData;
        } else {
          console.error('Unexpected data format:', assessmentData);
          assessmentList = [];
        }
        
        setAssessments(assessmentList);
        
        // Fetch user's submissions for these assessments
        const submissionsResponse = await fetch('/api/assessments/submissions/learner', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          // console.log("Fetched submissions:", submissionsData);
          
          if (submissionsData.success && Array.isArray(submissionsData.submissions)) {
            setSubmissions(submissionsData.submissions);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load assessments. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [skillId]);

  // Helper function to find submission for an assessment
  const getSubmissionForAssessment = (assessmentId) => {
    return submissions.find(submission => {
      // Check if assessmentId is an object with _id or a string
      const submissionAssessmentId = typeof submission.assessmentId === 'object' 
        ? submission.assessmentId._id 
        : submission.assessmentId;
      
      return submissionAssessmentId === assessmentId;
    });
  };

  if (loading) {
    return <Loading message="Loading assessments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <FileEarmarkPdf size={48} className="text-muted" />
        </div>
        <h5 className="fw-bold">No Assessments Available</h5>
        <p className="text-muted">There are no assessments available for this skill yet.</p>
        {isSkillSharer && (
          <button 
            className="btn btn-primary rounded-pill mt-3"
            onClick={() => navigate(skillId ? `/skills/${skillId}/assessments/completed-sessions` : '/assessments/completed-sessions')}
          >
            <PlusCircle className="me-2" /> Create an Assessment
          </button>
        )}
      </div>
    );
  }

  // Helper function to get card action based on assessment status
  const getCardAction = (assessment) => {
    const submission = getSubmissionForAssessment(assessment._id);
    const status = submission?.status;
    
    switch (status) {
      case 'submitted':
        return (
          <div className="d-flex align-items-center justify-content-center p-2 bg-light rounded-3">
            <CheckCircle className="text-info me-2" />
            <span className="fw-medium">Pending Evaluation</span>
          </div>
        );
      case 'evaluated':
        return (
          <Link 
            to={`/assessment/${assessment._id}/results`}
            className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
          >
            <span>View Results</span>
            <ArrowRight className="ms-2" />
          </Link>
        );
      default:
        return (
          <Link 
            to={`/assessment/${assessment._id}/submit`}
            className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
          >
            <span>Start Assessment</span>
            <ArrowRight className="ms-2" />
          </Link>
        );
    }
  };

  // Helper function to get the status badge
  const getStatusBadge = (assessment) => {
    const submission = getSubmissionForAssessment(assessment._id);
    const status = submission?.status;
    const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;
    
    // If assessment is already submitted or evaluated
    if (status === 'submitted') {
      return <span className="badge bg-info">Pending Evaluation</span>;
    } else if (status === 'evaluated') {
      return <span className="badge bg-success">Completed</span>;
    } else if (status === 'late') {
      return <span className="badge bg-warning">Submitted Late</span>;
    }
    
    // For assessments not submitted yet, show deadline status
    if (dueDate) {
      const today = new Date();
      const diffTime = dueDate - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysRemaining <= 0) {
        return <span className="badge bg-danger">Due today</span>;
      } else if (daysRemaining <= 3) {
        return <span className="badge bg-warning text-dark">{daysRemaining} days remaining</span>;
      } else {
        return <span className="badge bg-success">{daysRemaining} days remaining</span>;
      }
    }
    
    return null;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Available Assessments ({assessments.length})</h5>
        <div className="dropdown">
          <button className="btn btn-outline-secondary dropdown-toggle rounded-pill btn-sm" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            Sort By
          </button>
          <ul className="dropdown-menu" aria-labelledby="sortDropdown">
            <li><button className="dropdown-item">Most Recent</button></li>
            <li><button className="dropdown-item">Due Date</button></li>
            <li><button className="dropdown-item">Title</button></li>
          </ul>
        </div>
      </div>
      
      <div className="row g-4">
        {assessments.map(assessment => {
          // Format due date
          const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;
          const formattedDueDate = dueDate ? dueDate.toLocaleDateString() : 'No deadline';
          const submission = getSubmissionForAssessment(assessment._id);
          
          return (
            <div key={assessment._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`rounded-circle p-2 me-3 ${submission ? 'bg-info bg-opacity-10' : 'bg-primary bg-opacity-10'}`}>
                      {submission ? (
                        <CheckCircle className={submission.status === 'evaluated' ? 'text-success' : 'text-info'} />
                      ) : (
                        <FileEarmarkPdf className="text-primary" />
                      )}
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{assessment.title}</h5>
                      <p className="text-muted mb-0 small">
                        {assessment.skillId && typeof assessment.skillId === 'object' 
                          ? assessment.skillId.title 
                          : 'Skill Assessment'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="mb-3">
                    {assessment.description || 'Complete this assessment to demonstrate your skills.'}
                  </p>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      {submission ? (
                        <>
                          <ClockHistory className="text-muted me-2" />
                          <span className="text-muted small">
                            {submission.submittedAt 
                              ? `Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}` 
                              : 'Submitted'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Calendar className="text-muted me-2" />
                          <span className="text-muted small">Due: {formattedDueDate}</span>
                        </>
                      )}
                    </div>
                    
                    {getStatusBadge(assessment)}
                  </div>
                  
                  <div className="d-grid">
                    {getCardAction(assessment)}
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

export default AssessmentList;