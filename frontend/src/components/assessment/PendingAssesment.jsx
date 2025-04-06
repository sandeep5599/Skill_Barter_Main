import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FileEarmarkPdf, 
  Clock, 
  PersonCircle,
  CheckCircle
} from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';

const PendingAssessments = () => {
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingAssessments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/assessments/pending-evaluation', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          setPendingAssessments(response.data.assessments);
        } else {
          throw new Error('Failed to fetch pending assessments');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load pending assessments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingAssessments();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading message="Loading pending assessments..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-white p-4 border-bottom">
            <h4 className="mb-0 fw-bold">Pending Assessments</h4>
            <p className="text-muted mb-0">Assessments waiting for your evaluation</p>
          </div>
          
          <div className="card-body p-0">
            {pendingAssessments.length === 0 ? (
              <div className="p-5 text-center">
                <CheckCircle className="display-4 text-success mb-3" />
                <h5 className="fw-bold">No Pending Assessments</h5>
                <p className="text-muted">All assessments have been evaluated.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Assessment</th>
                      <th>Student</th>
                      <th>Submitted</th>
                      <th>Skill</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAssessments.map((assessment) => (
                      <tr key={assessment._id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                              <FileEarmarkPdf className="text-primary" />
                            </div>
                            <div>
                              <p className="fw-medium mb-0">{assessment.title}</p>
                              <small className="text-muted">{assessment.description.substring(0, 60)}...</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <PersonCircle className="text-secondary me-2" />
                            <span>{assessment.studentName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Clock className="text-muted me-2" />
                            <span>{formatDate(assessment.submittedAt)}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">{assessment.skillName}</span>
                        </td>
                        <td className="text-end pe-4">
                          <Link 
                            to={`/skills/${assessment.skillId}/assessments/${assessment._id}/evaluate`}
                            className="btn btn-primary btn-sm rounded-pill"
                          >
                            Evaluate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingAssessments;