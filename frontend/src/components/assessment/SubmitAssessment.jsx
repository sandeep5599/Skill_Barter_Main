import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../../services/socketService';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { 
  FileEarmarkPdf, 
  CloudUpload, 
  CalendarCheck, 
  InfoCircle, 
  ClockHistory,
  ExclamationTriangle,
  CheckCircle,
  FileEarmarkArrowDown
} from 'react-bootstrap-icons';

const SubmitAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answersPdf, setAnswersPdf] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/assessments/${assessmentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assessment: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.assessment) {
          setAssessment(data.assessment);
          
          // Check if the assessment is already submitted
          if (data.assessment.status === 'submitted' || data.assessment.status === 'evaluated') {
            setIsSubmitted(true);
          }
          
          // Calculate time remaining if due date exists
          if (data.assessment.dueDate) {
            const dueDate = new Date(data.assessment.dueDate);
            const now = new Date();
            const diffTime = dueDate - now;
            if (diffTime > 0) {
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              setTimeRemaining(`${diffDays} days, ${diffHours} hours`);
            } else {
              setTimeRemaining('Past due');
            }
          }
        } else {
          throw new Error('Assessment data not found');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    
    if (assessmentId) {
      fetchAssessmentData();
    }
  }, [assessmentId]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };
  
  const processFile = (file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }
    
    setAnswersPdf(file);
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!answersPdf) {
      setError('Please upload a PDF file with your answers');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    const formData = new FormData();
    formData.append('assessmentId', assessmentId);
    formData.append('answersPdf', answersPdf);
    
    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'X-Socket-ID': socket?.id || ''
      };

      const response = await axios.post('/api/assessments/submit', formData, { headers });
    
      if (response.data.success) {
        // Instead of redirecting to another page, update the UI to show submission successful
        setIsSubmitted(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <Loading message="Loading assessment details..." />;
  }
  
  if (!assessment) {
    return <Error message="Assessment not found" />;
  }
  
  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
          <div className="card-header bg-white p-4 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <FileEarmarkPdf className="text-primary fs-4" />
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">{assessment.title}</h4>
                  <p className="text-muted mb-0">
                    {isSubmitted ? 'Assessment submitted' : 'Submit your assessment answers'}
                  </p>
                </div>
              </div>
              
              {assessment.dueDate && !isSubmitted && (
                <div className={`d-flex align-items-center ${timeRemaining === 'Past due' ? 'text-danger' : 'text-warning'}`}>
                  <ClockHistory className="me-2" />
                  <div>
                    <p className="small mb-0">{timeRemaining === 'Past due' ? 'Past Due' : 'Time Remaining'}</p>
                    <p className={`fw-bold mb-0 ${timeRemaining === 'Past due' ? 'text-danger' : 'text-warning'}`}>
                      {timeRemaining}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card-body p-0">
            <div className="row g-0">
              {/* Left column - Assessment Information */}
              <div className="col-lg-4 border-end">
                <div className="p-4">
                  <h5 className="fw-bold mb-3 d-flex align-items-center">
                    <InfoCircle className="me-2 text-primary" />
                    Assessment Details
                  </h5>
                  
                  <div className="mb-4">
                    <p className="text-muted mb-1">Instructions</p>
                    <div className="p-3 bg-light rounded-3 mb-3">
                      <p className="mb-0">{assessment.description}</p>
                    </div>
                    
                    {assessment.dueDate && (
                      <div className="d-flex align-items-center mb-3">
                        <CalendarCheck className="me-2 text-muted" />
                        <div>
                          <p className="text-muted mb-0 small">Due Date:</p>
                          <p className="fw-medium mb-0">
                            {new Date(assessment.dueDate).toLocaleString(undefined, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="d-grid mt-4">
                      <a
                        href={assessment.questionsPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                      >
                        <FileEarmarkArrowDown className="me-2" />
                        <span>Download Questions PDF</span>
                      </a>
                    </div>
                  </div>
                  
                  {!isSubmitted && (
                    <div className="alert alert-info d-flex align-items-start p-3 rounded-3">
                      <InfoCircle className="me-2 mt-1 flex-shrink-0" />
                      <div className="small">
                        <p className="mb-2 fw-medium">Submission Guidelines:</p>
                        <ul className="ps-3 mb-0">
                          <li>Submit your answers as a single PDF file</li>
                          <li>Include your name on each page</li>
                          <li>Make sure your answers are clearly labeled</li>
                          <li>Maximum file size: 10MB</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right column - Upload form or Submission status */}
              <div className="col-lg-8">
                <div className="p-4">
                  {isSubmitted ? (
                    <div className="text-center py-5">
                      <div className="rounded-circle bg-success bg-opacity-10 p-4 mx-auto mb-4" style={{ width: 'fit-content' }}>
                        <CheckCircle className="text-success display-1" />
                      </div>
                      <h3 className="fw-bold text-success mb-3">Assessment Submitted Successfully!</h3>
                      <p className="text-muted mb-4">Your assessment has been received and is currently being reviewed.</p>
                      <div className="card border-0 bg-light p-4 w-75 mx-auto">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="text-muted">Status:</span>
                          <span className="fw-medium">Pending Evaluation</span>
                        </div>
                        {assessment.submittedAt && (
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Submitted on:</span>
                            <span className="fw-medium">
                              {new Date(assessment.submittedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <CloudUpload className="me-2 text-primary" />
                        Upload Your Submission
                      </h5>
                      
                      {error && (
                        <div className="alert alert-danger d-flex align-items-center mb-4 rounded-3">
                          <ExclamationTriangle className="me-2 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}
                      
                      <form onSubmit={handleSubmit}>
                        <div 
                          className={`upload-area border-2 border-dashed rounded-3 p-5 mb-4 text-center ${isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          {!answersPdf ? (
                            <div>
                              <div className="mb-3">
                                <FileEarmarkPdf className="display-3 text-muted" />
                              </div>
                              <h5 className="fw-bold mb-2">Drag & Drop Your PDF File Here</h5>
                              <p className="text-muted mb-4">or click below to browse files</p>
                              <div>
                                <label className="btn btn-primary rounded-pill px-4 py-2">
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    className="d-none"
                                    onChange={handleFileChange}
                                  />
                                  Browse Files
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="mb-3">
                                <CheckCircle className="display-3 text-success" />
                              </div>
                              <h5 className="fw-bold mb-2 text-success">File Ready for Submission</h5>
                              <div className="p-3 bg-light rounded-3 w-75 mx-auto">
                                <div className="d-flex align-items-center">
                                  <FileEarmarkPdf className="me-2 text-primary fs-4" />
                                  <div className="text-start">
                                    <p className="fw-medium mb-0 text-truncate">{fileName}</p>
                                    <p className="text-muted small mb-0">{fileSize}</p>
                                  </div>
                                  <button 
                                    type="button"
                                    className="btn btn-sm btn-outline-danger ms-auto rounded-circle"
                                    onClick={() => {
                                      setAnswersPdf(null);
                                      setFileName('');
                                      setFileSize(0);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                              <p className="text-muted mt-3 mb-0 small">
                                Click "Change File" to select a different file
                              </p>
                              <div className="mt-3">
                                <label className="btn btn-outline-primary rounded-pill">
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    className="d-none"
                                    onChange={handleFileChange}
                                  />
                                  Change File
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="d-flex justify-content-end mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary rounded-pill px-5 py-2 d-flex align-items-center"
                            disabled={submitting || !answersPdf}
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <CloudUpload className="me-2" />
                                Submit Assessment
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitAssessment;