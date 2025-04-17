import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Import icons
import {
  Calendar,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Clock,
  ChatDots,
  ArrowClockwise,
  ExclamationTriangle,
  Star,
  PersonCircle
} from 'react-bootstrap-icons';

// Import components
import Loading from '../common/Loading';
import Error from '../common/Error';

const SessionManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch session details if sessionId is available
        if (sessionId) {
          const response = await axios.get(`/api/sessions/${sessionId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });
          
          if (response.data && response.data.session) {
            setSession(response.data.session);
            
            // Check if current user is the teacher
            const sessionTeacherId = typeof response.data.session.teacherId === 'object' 
              ? response.data.session.teacherId._id 
              : response.data.session.teacherId;
            
            const currentUserId = user?._id?.$oid || user?._id;
            setIsTeacher(sessionTeacherId === currentUserId);
            
            // Set meeting link if it exists
            if (response.data.session.meetingLink) {
              setMeetingLink(response.data.session.meetingLink);
            }
          }
        } else {
          // If no sessionId, fetch all user sessions
          const userSessions = await axios.get(`/api/sessions/user/${user._id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          });
          
          if (userSessions.data && userSessions.data.sessions && userSessions.data.sessions.length > 0) {
            // You could set these to state if you want to display a list
            console.log("User sessions:", userSessions.data.sessions);
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session information. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchSession();
    }
  }, [sessionId, user?._id]);

  // Function to handle session confirmation
  const handleConfirmSession = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(`/api/sessions/${sessionId}/confirm`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.data && response.data.success) {
        // Update session status in state
        setSession(prev => ({
          ...prev,
          status: 'confirmed'
        }));
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error confirming session:', err);
      setSubmitError('Failed to confirm session. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle session completion
  const handleCompleteSession = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(`/api/sessions/${sessionId}/complete`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.data && response.data.success) {
        // Update session status in state
        setSession(prev => ({
          ...prev,
          status: 'completed'
        }));
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error completing session:', err);
      setSubmitError('Failed to mark session as completed. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle session cancellation
  const handleCancelSession = async () => {
    if (!window.confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(`/api/sessions/${sessionId}/cancel`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.data && response.data.success) {
        // Update session status in state
        setSession(prev => ({
          ...prev,
          status: 'cancelled'
        }));
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error cancelling session:', err);
      setSubmitError('Failed to cancel session. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle updating meeting link
  const handleUpdateMeetingLink = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(`/api/sessions/${sessionId}/meeting-link`, 
        { meetingLink },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Update session in state
        setSession(prev => ({
          ...prev,
          meetingLink
        }));
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error updating meeting link:', err);
      setSubmitError('Failed to update meeting link. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      setSubmitError('Please enter feedback before submitting.');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // For teacher feedback
      if (isTeacher) {
        const response = await axios.post(`/api/sessions/${sessionId}/teacher-feedback`, 
          { feedback },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
        
        if (response.data && response.data.success) {
          setFeedback('');
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 3000);
        }
      } else {
        // For learner feedback
        const response = await axios.post(`/api/sessions/${sessionId}/feedback`, 
          { feedback },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }
        );
        
        if (response.data && response.data.success) {
          setFeedback('');
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 3000);
        }
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setSubmitError('Failed to submit feedback. Please try again.');
      setTimeout(() => setSubmitError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading session information..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!session) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <ExclamationTriangle size={48} className="text-warning mb-3" />
          <h4 className="fw-bold">Session Not Found</h4>
          <p className="text-muted">The session you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            className="btn btn-primary rounded-pill mt-3"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Format date and time
  const sessionDate = session.startTime ? new Date(session.startTime) : 
                      session.date ? new Date(session.date) : new Date();
  const formattedDate = sessionDate.toLocaleDateString();
  const formattedTime = sessionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  // Calculate duration
  let duration = 'N/A';
  if (session.duration) {
    duration = `${session.duration} minutes`;
  } else if (session.startTime && session.endTime) {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    if (!isNaN(startTime) && !isNaN(endTime)) {
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
      duration = `${durationMinutes} minutes`;
    }
  }
  
  // Get session title
  const sessionTitle = session.title || 
                      (session.skillDetails && session.skillDetails.title) || 
                      (session.skillId && typeof session.skillId === 'object' && session.skillId.title) ||
                      'Skill Session';
  
  // Get other party's name (teacher or student)
  const otherPartyName = isTeacher ? 
                        (session.studentName || 
                         (session.learnerDetails && session.learnerDetails.name) ||
                         (session.studentId && typeof session.studentId === 'object' && session.studentId.name) ||
                         'Student') :
                        (session.teacherName || 
                         (session.teacherDetails && session.teacherDetails.name) ||
                         (session.teacherId && typeof session.teacherId === 'object' && session.teacherId.name) ||
                         'Teacher');

  // Determine status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Main Session Information */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="fw-bold mb-0">Session Details</h4>
                <span className={`badge ${getStatusBadgeColor(session.status)}`}>
                  {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <Calendar className="text-primary" size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">{sessionTitle}</h5>
                  <p className="text-muted mb-0">
                    {formattedDate} at {formattedTime} ({duration})
                  </p>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                      <PersonCircle className="text-info" />
                    </div>
                    <div>
                      <p className="text-muted mb-0 small">
                        {isTeacher ? 'Student' : 'Teacher'}
                      </p>
                      <p className="fw-medium mb-0">{otherPartyName}</p>
                    </div>
                  </div>
                </div>
                
                {session.meetingLink && (
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                        <LinkIcon className="text-success" />
                      </div>
                      <div>
                        <p className="text-muted mb-0 small">Meeting Link</p>
                        <a 
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-break link-primary"
                        >
                          {session.meetingLink}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Session description */}
              {session.description && (
                <div className="mb-4">
                  <h6 className="fw-bold">Description</h6>
                  <p className="mb-0">{session.description}</p>
                </div>
              )}
              
              {/* Session notes */}
              {session.notes && (
                <div className="mb-4">
                  <h6 className="fw-bold">Session Notes</h6>
                  <p className="mb-0">{session.notes}</p>
                </div>
              )}
              
              {/* Action buttons based on session status and user role */}
              {session.status !== 'cancelled' && (
                <div className="d-flex flex-wrap gap-3 mt-4">
                  {isTeacher && session.status === 'scheduled' && (
                    <button 
                      className="btn btn-primary rounded-pill"
                      onClick={handleConfirmSession}
                    >
                      <CheckCircle className="me-2" /> Confirm Session
                    </button>
                  )}
                  
                  {isTeacher && (session.status === 'confirmed' || session.status === 'scheduled') && (
                    <button 
                      className="btn btn-success rounded-pill"
                      onClick={handleCompleteSession}
                    >
                      <CheckCircle className="me-2" /> Mark as Completed
                    </button>
                  )}
                  
                  {(session.status === 'scheduled' || session.status === 'confirmed') && (
                    <button 
                      className="btn btn-outline-danger rounded-pill"
                      onClick={handleCancelSession}
                    >
                      <XCircle className="me-2" /> Cancel Session
                    </button>
                  )}
                  
                  {session.status === 'completed' && (
                    <button 
                      className="btn btn-primary rounded-pill"
                      onClick={() => navigate(`/skills/${session.skillId}/assessments/create-session`)}
                    >
                      <CheckCircle className="me-2" /> Create Assessment
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Feedback section if session is completed */}
          {session.status === 'completed' && (
            <div className="card shadow-sm border-0 rounded-3">
              <div className="card-header bg-white border-0 py-3">
                <h4 className="fw-bold mb-0">Session Feedback</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitFeedback}>
                  <div className="mb-3">
                    <label htmlFor="feedback" className="form-label fw-medium">
                      {isTeacher ? 'Provide feedback for the student' : 'Share your experience with the teacher'}
                    </label>
                    <textarea
                      className="form-control"
                      id="feedback"
                      rows="4"
                      placeholder="Your feedback is valuable..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill"
                      disabled={loading}
                    >
                      <Star className="me-2" /> Submit Feedback
                    </button>
                  </div>
                </form>
                
                {/* Display existing feedback */}
                {session.feedback && session.feedback.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold">Previous Feedback</h6>
                    {session.feedback.map((item, index) => (
                      <div key={index} className="card border-0 bg-light rounded-3 p-3 mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <PersonCircle className="me-2 text-primary" />
                          <span className="fw-medium">
                            {item.submittedBy === session.teacherId ? 'Teacher' : 'Student'}
                          </span>
                          <span className="text-muted small ms-auto">
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mb-0">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar for additional options */}
        <div className="col-lg-4">
          {/* Meeting link card for confirmed/scheduled sessions */}
          {isTeacher && (session.status === 'confirmed' || session.status === 'scheduled') && (
            <div className="card shadow-sm border-0 rounded-3 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="fw-bold mb-0">Meeting Details</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleUpdateMeetingLink}>
                  <div className="mb-3">
                    <label htmlFor="meetingLink" className="form-label fw-medium">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="meetingLink"
                      placeholder="https://zoom.us/j/123456789"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                    <div className="form-text">
                      Paste a Zoom, Google Meet, or other video call link
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill"
                      disabled={loading}
                    >
                      <LinkIcon className="me-2" /> Update Meeting Link
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Status card */}
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">Session Status</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className={`rounded-circle ${getStatusBadgeColor(session.status)} bg-opacity-10 p-2 me-3`}>
                  {session.status === 'completed' ? (
                    <CheckCircle className={`text-${session.status === 'completed' ? 'success' : 'warning'}`} />
                  ) : session.status === 'cancelled' ? (
                    <XCircle className="text-danger" />
                  ) : (
                    <Clock className={`text-${session.status === 'confirmed' ? 'info' : 'warning'}`} />
                  )}
                </div>
                <div>
                  <p className="fw-medium mb-0">
                    {session.status?.charAt(0).toUpperCase() + session.status?.slice(1)}
                  </p>
                  <p className="text-muted mb-0 small">
                    {session.status === 'completed' 
                      ? 'Session has been completed successfully' 
                      : session.status === 'confirmed'
                      ? 'Session is confirmed and scheduled'
                      : session.status === 'cancelled'
                      ? 'Session has been cancelled'
                      : 'Session is scheduled but not yet confirmed'}
                  </p>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                  <Calendar className="text-primary" />
                </div>
                <div>
                  <p className="fw-medium mb-0">{formattedDate}</p>
                  <p className="text-muted mb-0 small">Session Date</p>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                  <Clock className="text-info" />
                </div>
                <div>
                  <p className="fw-medium mb-0">{formattedTime}</p>
                  <p className="text-muted mb-0 small">Start Time</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action links */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center"
                  onClick={() => navigate(`/skills/${session.skillId || ''}/assessments`)}
                >
                  <CheckCircle className="me-2" /> View Assessments
                </button>
                
                <button 
                  className="btn btn-outline-secondary rounded-pill py-2 d-flex align-items-center justify-content-center"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowClockwise className="me-2" /> Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success/Error messages */}
      {submitSuccess && (
        <div className="alert alert-success alert-dismissible fade show position-fixed bottom-0 end-0 m-3" role="alert">
          <strong>Success!</strong> Your action was completed successfully.
          <button type="button" className="btn-close" onClick={() => setSubmitSuccess(false)}></button>
        </div>
      )}
      
      {submitError && (
        <div className="alert alert-danger alert-dismissible fade show position-fixed bottom-0 end-0 m-3" role="alert">
          <strong>Error!</strong> {submitError}
          <button type="button" className="btn-close" onClick={() => setSubmitError('')}></button>
        </div>
      )}
    </div>
  );
};

export default SessionManagement;