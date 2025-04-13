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

        if (!isSkillSharer) {
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

          const submissionsResponse = await fetch('/api/assessments/submissions/learner', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });

          if (submissionsResponse.ok) {
            const submissionsData = await submissionsResponse.json();

            if (submissionsData.success && Array.isArray(submissionsData.submissions)) {
              setSubmissions(submissionsData.submissions);
            }
          }
        } else {
          setAssessments([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load assessments. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skillId, isSkillSharer]);

  const getSubmissionForAssessment = (assessmentId) => {
    return submissions.find(submission => {
      // Check if submission.assessmentId exists
      if (!submission.assessmentId) {
        return false;
      }
      
      const submissionAssessmentId = typeof submission.assessmentId === 'object' && submission.assessmentId !== null
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

  if (isSkillSharer) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <FileEarmarkPdf size={48} className="text-muted" />
        </div>
        <h5 className="fw-bold">Assessment Management</h5>
        <p className="text-muted">As a skill sharer, you can create and manage assessments for your skills.</p>
        <button
          className="btn btn-primary rounded-pill mt-3"
          onClick={() => navigate(skillId ? `/skills/${skillId}/assessments/completed-sessions` : '/assessments/completed-sessions')}
        >
          <PlusCircle className="me-2" /> Manage Assessments
        </button>
      </div>
    );
  }

  const filteredAssessments = assessments.filter(assessment => {
    const submission = getSubmissionForAssessment(assessment._id);
    return !submission; // Only include assessments without submissions
  });

  if (filteredAssessments.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <FileEarmarkPdf size={48} className="text-muted" />
        </div>
        <h5 className="fw-bold">No Assessments Available</h5>
        <p className="text-muted">There are no assessments available for this skill yet.</p>
      </div>
    );
  }

  const getCardAction = (assessment) => {
    return (
      <Link
        to={`/assessment/${assessment._id}/submit`}
        className="btn btn-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
      >
        <span>Start Assessment</span>
        <ArrowRight className="ms-2" />
      </Link>
    );
  };

  const getStatusBadge = (assessment) => {
    const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;

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
        <h5 className="fw-bold mb-0">Available Assessments ({filteredAssessments.length})</h5>
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
        {filteredAssessments.map(assessment => {
          const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;
          const formattedDueDate = dueDate ? dueDate.toLocaleDateString() : 'No deadline';

          return (
            <div key={assessment._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-2 me-3 bg-primary bg-opacity-10">
                      <FileEarmarkPdf className="text-primary" />
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
                      <Calendar className="text-muted me-2" />
                      <span className="text-muted small">Due: {formattedDueDate}</span>
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