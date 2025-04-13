import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, 
  Modal, Form, Spinner, Alert, OverlayTrigger, Tooltip,
  InputGroup
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  CalendarCheck, PersonFill, ClockFill, 
  CheckCircleFill, PencilFill, StarFill,
  Link45deg, FileEarmarkTextFill, InfoCircle,
  ArrowLeft, XCircle, CameraVideoFill,
  PatchCheckFill, ChatLeftTextFill ,  PlusLg
} from 'react-bootstrap-icons';

// Constants
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const STATUS_VARIANTS = {
  scheduled: 'warning',
  active: 'primary',
  completed: 'success',
  cancelled: 'danger'
};

// Notification function - send a notification for different session events
const sendNotification = async (eventType, sessionData, extraData = {}) => {
  try {
    const notificationMap = {
      SESSION_LINK_UPDATED: {
        title: "Meeting Link Updated",
        message: `The meeting link for your ${sessionData.session.skillName} session has been updated.`,
        recipientId: sessionData.isTeacher ? sessionData.session.studentId : sessionData.session.teacherId,
        type: "session_update",
        priority: "medium"
      },
      SESSION_COMPLETED: {
        title: "Session Completed",
        message: `Your session on ${sessionData.session.skillName} has been marked as completed.`,
        recipientId: sessionData.session.studentId,
        type: "session_status",
        priority: "high"
      },
      SESSION_CANCELLED: {
        title: "Session Cancelled",
        message: `Your ${sessionData.session.skillName} session has been cancelled.`,
        recipientId: sessionData.isTeacher ? sessionData.session.studentId : sessionData.session.teacherId,
        type: "session_status",
        priority: "high"
      },
      FEEDBACK_SUBMITTED: {
        title: "Feedback Received",
        message: `You received feedback for your ${sessionData.session.skillName} session.`,
        recipientId: sessionData.session.teacherId,
        type: "feedback",
        priority: "medium"
      },

      TEACHER_FEEDBACK_SUBMITTED: {
        title: "Feedback Received",
        message: `You received feedback for your ${sessionData.session.skillName} session from your teacher.`,
        recipientId: sessionData.session.studentId,
        type: "feedback",
        priority: "medium"
      },

      SESSION_JOINABLE: {
        title: "Session Ready to Join",
        message: `Your ${sessionData.session.skillName} session is starting soon. You can join now!`,
        recipientId: sessionData.isTeacher ? sessionData.session.studentId : sessionData.session.teacherId,
        type: "session_reminder",
        priority: "high"
      }
    };

    const notificationConfig = notificationMap[eventType];
    
    if (!notificationConfig) {
      console.error("Invalid notification event type:", eventType);
      return;
    }

    // Override message if provided
    if (extraData.message) {
      notificationConfig.message = extraData.message;
    }

    // Add additional data
    const notificationData = {
      ...notificationConfig,
      sessionId: sessionData.session._id,
      timestamp: new Date().toISOString(),
      metadata: {
        sessionTitle: sessionData.session.title || `${sessionData.session.skillName} Session`,
        ...extraData
      }
    };

    // Send notification to the API
    const response = await axios.post(
      `${BACKEND_URL}/api/notifications`, 
      notificationData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`${eventType} notification sent:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`Failed to send ${eventType} notification:`, err);
  }
};

const SessionDetails = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  
  // Session data state with default values
  const [sessionData, setSessionData] = useState({
    session: null,
    loading: true,
    error: null,
    isTeacher: false,
    isLearner: false,
    isUpcoming: false,
    isJoinable: false,
    timeRemaining: '',
  });
  
  // Modal states consolidated
  const [modals, setModals] = useState({
    showMeetingLinkModal: false,
  showFeedbackModal: false,
  showCompletionModal: false,
  showCancelModal: false,
  showResourcesModal: false,
  showTeacherFeedbackModal: false, // Add this for teacher feedback modal
  });
  
  // Form states consolidated
  const [formData, setFormData] = useState({
    meetingLink: '',
    rating: 5,
    reviewText: '',
    teacherNotes: '',
    cancellationReason: '',
    inlineEditingMeetingLink: false,
    teacherFeedback: '', // Add this for teacher feedback
  });
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update specific form field
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Toggle modal visibility
  const toggleModal = useCallback((modalName, isVisible) => {
    setModals(prev => ({ ...prev, [modalName]: isVisible }));
  }, []);
  
  // Toggle inline editing
  const toggleInlineEditing = useCallback((field, value) => {
    updateFormField('inlineEditingMeetingLink', value);
    
    // Reset to original value if cancelling
    if (!value) {
      updateFormField('meetingLink', sessionData.session?.meetingLink || '');
    }
  }, [updateFormField, sessionData.session]);
  
  // Fetch session details
  const fetchSessionDetails = useCallback(async () => {
    if (!sessionId || !user) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      console.log("session data: " , data.status);
     
      // Update session data and related state
      setSessionData(prev => ({
        ...prev,
        session: data,
        loading: false,
        isTeacher: user._id === (typeof data.teacherId === 'object' ? data.teacherId._id : data.teacherId),
        isLearner: user._id === data.studentId,
      }));
      

      // console.log(sessionData.isLearner , sessionData.isTeacher ,sessionData.session.studentId._id,sessionData.session.teacherId._id, currentUserId);

      // Update meeting link in form data
      setFormData(prev => ({
        ...prev,
        meetingLink: data.meetingLink || '',
      }));
      
    } catch (err) {
      console.error('Error fetching session details:', err);
      setSessionData(prev => ({
        ...prev,
        error: `Failed to load session details: ${err.message}`,
        loading: false,
      }));
      toast.error('Error loading session details');
    }
  }, [sessionId, user]);
  
  // Initial fetch
  useEffect(() => {
    fetchSessionDetails(); 
  }, [fetchSessionDetails]);
  
  // Update session status (timing, joinability)
  useEffect(() => {
    if (!sessionData.session) return;
    
    const updateSessionStatus = () => {
      const now = new Date();
      const sessionStart = new Date(sessionData.session.startTime);
      const sessionEnd = new Date(sessionData.session.endTime);
      
      // Calculate if session is upcoming
      const isUpcoming = sessionStart > now;
      
      // Calculate if session is joinable (10 min before to end time)
      const joinWindow = new Date(sessionStart);
      joinWindow.setMinutes(joinWindow.getMinutes() - 10);
      const isJoinable = now >= joinWindow && now <= sessionEnd && sessionData.session.status !== 'cancelled';
      
      // Send notification if session becomes joinable (check for state transition)
      if (isJoinable && !sessionData.isJoinable && sessionData.session.meetingLink) {
        sendNotification('SESSION_JOINABLE', sessionData);
      }
      
     // Calculate time remaining with proper status handling
let timeRemaining = '';

// First check explicit status values that override time calculations
if (sessionData.session.status === 'cancelled') {
  timeRemaining = 'Cancelled';
} else if (sessionData.session.status === 'completed') {
  // Explicitly check for completed status first, regardless of time
  timeRemaining = 'Completed';
} else if (sessionStart > now) {
  // Session hasn't started yet - show countdown
  const timeDiff = sessionStart - now;
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    timeRemaining = `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    timeRemaining = `${hours}h ${minutes}m remaining`;
  } else {
    timeRemaining = `${minutes}m remaining`;
  }
} else if (now <= sessionEnd) {
  // Session is currently happening
  timeRemaining = 'In progress';
} else {
  // Session has ended by time but wasn't explicitly marked as completed
  timeRemaining = 'Completed';
}

      setSessionData(prev => ({
        ...prev,
        isUpcoming,
        isJoinable,
        timeRemaining,
      }));
    };
    
    // Update initially and set interval
    updateSessionStatus();
    const interval = setInterval(updateSessionStatus, 30000); // Update every 30 seconds
    
    // Show feedback modal for students when session is completed
  if (
    sessionData.session && 
    !sessionData.loading && 
    sessionData.isLearner && 
    sessionData.session.status === 'completed' && 
    !sessionData.session.studentFeedback
  ) {
    toggleModal('showFeedbackModal', true);
  }

    return () => clearInterval(interval);
  }, [sessionData.session, sessionData.isJoinable]);
  
  // Add this effect to detect session status changes and show feedback modals accordingly
useEffect(() => {
  if (
    sessionData.session && 
    !sessionData.loading && 
    sessionData.session.status === 'completed'
  ) {
    // Show feedback modal for students when session is completed
    if (
      sessionData.isLearner && 
      !sessionData.session.studentFeedback &&
      !modals.showFeedbackModal
    ) {
      toggleModal('showFeedbackModal', true);
    }
    
    // Show feedback modal for teachers when session is completed
    if (
      sessionData.isTeacher && 
      !sessionData.session.teacherFeedback &&
      !modals.showTeacherFeedbackModal
    ) {
      toggleModal('showTeacherFeedbackModal', true);
    }
  }
}, [sessionData.session?.status, sessionData.loading, sessionData.isLearner, sessionData.isTeacher]);

  // API actions

const apiActions = useMemo(() => ({
  // Update meeting link
  updateMeetingLink: async (inline = false) => {
    if (!formData.meetingLink.trim()) {
      toast.warning('Please enter a valid meeting link');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/sessions/${sessionId}/meeting-link`,
        { meetingLink: formData.meetingLink },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200) {
        setSessionData(prev => ({
          ...prev,
          session: { ...prev.session, meetingLink: formData.meetingLink }
        }));
        
        // Send notification for meeting link update
        await sendNotification('SESSION_LINK_UPDATED', {
          ...sessionData,
          session: { ...sessionData.session, meetingLink: formData.meetingLink }
        });
        
        if (inline) {
          toggleInlineEditing('inlineEditingMeetingLink', false);
          toast.success('Meeting link saved');
        } else {
          toggleModal('showMeetingLinkModal', false);
          toast.success('Meeting link updated successfully');
        }
      }
    } catch (err) {
      console.error('Error updating meeting link:', err);
      toast.error(err.response?.data?.message || 'Failed to update meeting link');
    } finally {
      setIsSubmitting(false);
    }
  },
  // Complete session
  completeSession: async () => {
    setIsSubmitting(true);
    
    try {

      console.log('Attempting to complete session:', {
        sessionId,
        URL: `${BACKEND_URL}/api/sessions/${sessionId}/complete`,
        token: localStorage.getItem('token')
      });


      const response = await axios.put(
        `${BACKEND_URL}/api/sessions/${sessionId}/complete`,
        { notes: formData.teacherNotes },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

     
      
      if (response.status === 200) {
        const updatedSession = { 
          ...sessionData.session, 
          status: 'completed', 
          notes: formData.teacherNotes,
          updatedAt: new Date().toISOString()
        };


         // Update match status to completed
         const updatedMatch = await apiActions.updateMatchStatus(
          sessionData.session.matchId, 
          'completed'
        );
        
       
        
        setSessionData(prev => ({
          ...prev,
          session: updatedSession,
          match: updatedMatch
        }));
        
        // Send notification for session completion
        await sendNotification('SESSION_COMPLETED', {
          ...sessionData,
          session: updatedSession,
          match: updatedMatch
        }, {
          notes: formData.teacherNotes || "No notes provided."
        });
        
        toast.success('Session marked as completed');
        toggleModal('showCompletionModal', false);
        
        // Reset feedback form data
        setFormData(prev => ({
          ...prev,
          rating: 5,
          reviewText: ''
        }));

        // Show appropriate feedback modal after session completion
  // For teachers, show the teacher feedback modal
  if (sessionData.isTeacher) {
    setTimeout(() => {
      toggleModal('showTeacherFeedbackModal', true);
    }, 1000);
  } 
  // For learners, show the feedback modal
  else if (sessionData.isLearner) {
    setTimeout(() => {
      toggleModal('showFeedbackModal', true);
    }, 1000);
  }
      }
    } catch (err) {
      // console.error('Error completing session:', err);
      console.error('Full error details:', err);
      console.error('Error response:', err.response);
      console.error('Error request:', err.request);
      toast.error(err.response?.data?.message || 'Failed to mark session as completed');
    } finally {
      setIsSubmitting(false);
    }
  },
  // Submit feedback
  submitFeedback: async () => {
    // Check if feedback is already submitted
    if (isReviewSubmitted) {
      toast.info('You have already submitted feedback for this session.');
      return;
    }
  
    if (formData.rating < 1) {
      toast.warning('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Sending request to', `${BACKEND_URL}/api/reviews`);
  
      const response = await axios.post(
        `${BACKEND_URL}/api/reviews`,
        {
          sessionId,
          teacherId: typeof sessionData.session.teacherId === 'object' ? 
                     sessionData.session.teacherId._id : sessionData.session.teacherId,
          teacherName: sessionData.session.teacherName,
          skillId: typeof sessionData.session.skillId === 'object' ? 
                   sessionData.session.skillId._id : sessionData.session.skillId,
          rating: formData.rating,
          reviewText: formData.reviewText
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Response received:', response);
  
      if (response.status === 201) {
        // Mark review as submitted
        setIsReviewSubmitted(true);
  
        // Send notification for feedback submission
        await sendNotification('FEEDBACK_SUBMITTED', sessionData, {
          rating: formData.rating,
          reviewText: formData.reviewText || "No text review provided."
        });
        
        toast.success('Thank you for your feedback!');
        toggleModal('showFeedbackModal', false);
      }
    } catch (err) {
      // Handle specific error for duplicate submission
      if (err.response?.status === 409) {
        // 409 Conflict typically indicates a duplicate submission
        setIsReviewSubmitted(true);
        toast.info('Feedback has already been submitted for this session.');
        toggleModal('showFeedbackModal', false);
        return;
      }
  
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  },

  submitTeacherFeedback: async () => {
    if (!formData.teacherFeedback.trim()) {
      toast.warning('Please provide feedback for the student');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/reviews/${sessionId}/teacher-feedback`,
        {
          feedback: formData.teacherFeedback
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        setSessionData(prev => ({
          ...prev,
          session: { 
            ...prev.session, 
            teacherFeedback: formData.teacherFeedback,
            updatedAt: new Date().toISOString()
          }
        }));
        
        // Send notification for feedback submission
        await sendNotification('TEACHER_FEEDBACK_SUBMITTED', sessionData, {
          feedbackText: formData.teacherFeedback
        });
        
        toast.success('Thank you for your feedback!');
        toggleModal('showTeacherFeedbackModal', false);
      }
    } catch (err) {
      console.error('Error submitting teacher feedback:', err);
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  },
  // Cancel session
  // Cancel session - updated version
cancelSession: async () => {
  if (!formData.cancellationReason.trim()) {
    toast.warning('Please provide a reason for cancellation');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Determine recipient ID (the other person in the session)
    const recipientId = sessionData.isTeacher 
      ? sessionData.session.studentId 
      : sessionData.session.teacherId;
    
    // Send cancellation request with notification data
    const response = await axios.put(
      `${BACKEND_URL}/api/sessions/${sessionId}/cancel`,
      { 
        reason: formData.cancellationReason,
        message: formData.cancellationReason, // For notifications
        notificationType: 'session_cancelled', // To trigger notification
        recipientId: recipientId // Specify who gets the notification
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      const updatedSession = { 
        ...sessionData.session, 
        status: 'cancelled', 
        cancellationReason: formData.cancellationReason,
        updatedAt: new Date().toISOString()
      };
      
      setSessionData(prev => ({
        ...prev,
        session: updatedSession
      }));
      
      // Send notification for session cancellation
      await sendNotification('SESSION_CANCELLED', {
        ...sessionData,
        session: updatedSession
      }, {
        reason: formData.cancellationReason
      });
      
      toast.success('Session has been cancelled');
      toggleModal('showCancelModal', false);
    }
  } catch (err) {
    console.error('Error cancelling session:', err);
    toast.error(err.response?.data?.message || 'Failed to cancel session');
  } finally {
    setIsSubmitting(false);
  }
},

updateMatchStatus: async (matchId, status) => {
  setIsSubmitting(true);
  
  try {
    const response = await axios.put(
      `${BACKEND_URL}/api/matches/${matchId}/status`,
      { status },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      // Optional: Update local state if needed
      setSessionData(prev => ({
        ...prev,
        match: response.data.match
      }));
      
      // Send notification for match status update
      await sendNotification('MATCH_STATUS_UPDATED', {
        ...sessionData,
        match: response.data.match
      });
      
      toast.success(`Match status updated to ${status}`);
      return response.data.match;
    }
  } catch (err) {
    console.error('Error updating match status:', err);
    toast.error(err.response?.data?.message || 'Failed to update match status');
    throw err;
  } finally {
    setIsSubmitting(false);
  }
},


}), [sessionId, formData, toggleModal, toggleInlineEditing, sessionData]);

  /**
   * Retrieves the current user ID from localStorage
   * @returns {string|null} The user ID if found, null otherwise
   */
const getCurrentUserId = () => {
  try {
    // Get the user object from localStorage
    const userString = localStorage.getItem('user');
    
    // If user data exists, parse it and return the _id
    if (userString) {
      const userData = JSON.parse(userString);
      return userData._id || null;
    }
    
    // Return null if no user data found
    return null;
  } catch (error) {
    console.error('Error retrieving user ID from localStorage:', error);
    return null;
  }
};

  // Inside your component
const currentUserId = getCurrentUserId();

  // Helper functions
const helpers = useMemo(() => ({
  // Calculate session duration in minutes
  getSessionDuration: () => {
    if (!sessionData.session) return '0';
    
    const startTime = new Date(sessionData.session.startTime);
    const endTime = new Date(sessionData.session.endTime);
    const durationMs = endTime - startTime;
    return Math.round(durationMs / (1000 * 60));
  },
  
  // Format date and time
  formatDateTime: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  // Navigate back to dashboard
  returnToDashboard: () => {
    navigate('/dashboard');
  },
  
  // Get status display properties
  getStatusDisplay: () => {
    let statusText, statusVariant;
    
    if (sessionData.session.status === 'cancelled') {
      statusText = 'Cancelled';
      statusVariant = STATUS_VARIANTS.cancelled;
    } else if (sessionData.session.status === 'completed') {
      statusText = 'Completed';
      statusVariant = STATUS_VARIANTS.completed;
    } else if (sessionData.isJoinable) {
      statusText = 'Active';
      statusVariant = STATUS_VARIANTS.active;
    } else {
      statusText = 'Scheduled';
      statusVariant = STATUS_VARIANTS.scheduled;
    }
    
    return { statusText, statusVariant };
  },
  
  // Handle Enter key for inline editing
  handleInlineKeyDown: (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      apiActions.updateMeetingLink(true);
    } else if (e.key === 'Escape') {
      toggleInlineEditing('inlineEditingMeetingLink', false);
    }
  },
  
  // Validate URL
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}), [navigate, sessionData, apiActions, toggleInlineEditing]);
  
  // Render loading state
if (sessionData.loading) {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <p className="text-muted">Loading session details...</p>
      </div>
    </Container>
  );
}
  
  // Render error state
  if (sessionData.error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="shadow-sm">
          <Alert.Heading>Error Loading Session</Alert.Heading>
          <p>{sessionData.error}</p>
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={helpers.returnToDashboard} className="px-4">
            <ArrowLeft className="me-2" /> Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  // Render when session not found
  if (!sessionData.session) {
    return (
      <Container className="mt-5">
        <Alert variant="warning" className="shadow-sm">
          <Alert.Heading>Session Not Found</Alert.Heading>
          <p>We couldn't find the session you're looking for. It may have been deleted or you might not have permission to view it.</p>
        </Alert>
        <div className="text-center mt-4">
          <Button variant="primary" onClick={helpers.returnToDashboard} className="px-4">
            <ArrowLeft className="me-2" /> Return to Dashboard
          </Button>
        </div>
      </Container>
    );
  }
  
  // Get status display properties
  const { statusText, statusVariant } = helpers.getStatusDisplay();
//   console.log(sessionData);
//   console.log("Current time:", new Date());
//  console.log("Session end time:", new Date(sessionData.session.endTime));
// console.log("Is button disabled:", isSubmitting || new Date() < new Date(sessionData.session.endTime)); 
  

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button variant="primary" onClick={helpers.returnToDashboard} className="d-flex align-items-center">
            <ArrowLeft className="me-2" /> Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {/* Session Header */}
      <Card className="mb-4 shadow border-0 overflow-hidden">
        {/* Status bar */}
        <div className={`bg-${statusVariant} text-white px-4 py-2 d-flex justify-content-between align-items-center`}>
          <div className="d-flex align-items-center">
            {statusVariant === 'success' && <CheckCircleFill className="me-2" />}
            {statusVariant === 'primary' && <CameraVideoFill className="me-2" />}
            {statusVariant === 'warning' && <ClockFill className="me-2" />}
            {statusVariant === 'danger' && <XCircle className="me-2" />}
            <span className="fw-bold">{statusText}</span>
          </div>
          <span className="small">{sessionData.timeRemaining}</span>
        </div>
        <Card.Body className="p-4">
          <Row>
            <Col lg={8}>
              <h2 className="mb-3 fw-bold">
                {sessionData.session.title || `${sessionData.session.skillName || 'Skill'} Session`}
              </h2>
              
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                  <PersonFill className="text-primary" size={24} />
                </div>
                <div>
                  <small className="text-muted">Teacher</small>
                  <h5 className="mb-0 fw-bold">{sessionData.session.teacherName}</h5>
                </div>
              </div>
              
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                    <CalendarCheck className="text-primary" size={18} />
                  </div>
                  <div>
                    <small className="text-muted d-block">Date & Time</small>
                    <span className="fw-semibold">{helpers.formatDateTime(sessionData.session.startTime)}</span>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '36px', height: '36px' }}>
                    <ClockFill className="text-primary" size={18} />
                  </div>
                  <div>
                    <small className="text-muted d-block">Duration</small>
                    <span className="fw-semibold">{helpers.getSessionDuration()} minutes</span>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col lg={4} className="text-lg-end d-flex flex-column justify-content-center">
              {sessionData.session.status !== 'completed' && sessionData.session.status !== 'cancelled' && (
                <>
                  {sessionData.isJoinable && sessionData.session.meetingLink && helpers.isValidUrl(sessionData.session.meetingLink) ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="mb-3 py-3 px-4 shadow-sm"
                      href={sessionData.session.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <CameraVideoFill className="me-2" /> Join Session
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="mb-3 py-3 px-4"
                      disabled={!sessionData.isJoinable || !sessionData.session.meetingLink || !helpers.isValidUrl(sessionData.session.meetingLink)}
                    >
                      <CameraVideoFill className="me-2" />
                      {!sessionData.session.meetingLink ? 'No Meeting Link Yet' : (sessionData.isJoinable ? 'Join Session' : 'Not Joinable Yet')}
                    </Button>
                  )}
                  
                  {sessionData.isTeacher && (
                    <div className="d-flex gap-2 justify-content-lg-end flex-wrap">
                      <Button 
                        variant="primary" 
                        onClick={() => toggleModal('showMeetingLinkModal', true)}
                      >
                        <PencilFill className="me-1" /> 
                        {sessionData.session.meetingLink ? 'Update Link' : 'Add Meeting Link'}
                      </Button>
                      
                      {(sessionData.isJoinable || 
                        (sessionData.session.status !== 'completed' && sessionData.session.status !== 'cancelled' && 
                        new Date() > new Date(sessionData.session.startTime))) && (
                        <Button 
                          variant="success" 
                          onClick={() => toggleModal('showCompletionModal', true)}
                        >
                          <CheckCircleFill className="me-1" /> Complete Session
                        </Button>
                      )}
                      
                      {!sessionData.isJoinable && sessionData.isUpcoming && (
                        <Button 
                          variant="outline-danger" 
                          onClick={() => toggleModal('showCancelModal', true)}
                        >
                          <XCircle className="me-1" /> Cancel Session
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {sessionData.session.status === 'completed' && (
                <div className="bg-success-subtle p-3 rounded text-center">
                  <CheckCircleFill className="text-success mb-2" size={32} />
                  <h5 className="mb-1">Session Completed</h5>
                  <p className="mb-0 text-muted">
                    {helpers.formatDateTime(sessionData.session.updatedAt)}
                  </p>
                </div>
              )}
              
              {sessionData.session.status === 'cancelled' && (
                <div className="bg-danger-subtle p-3 rounded text-center">
                  <XCircle className="text-danger mb-2" size={32} />
                  <h5 className="mb-1">Session Cancelled</h5>
                  <p className="mb-0">{sessionData.session.cancellationReason || 'No reason provided'}</p>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Session Details */}
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <FileEarmarkTextFill className="me-2" /> Session Details
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Description</h6>
              <p className="mb-4">{sessionData.session.description || 'No description provided.'}</p>
              
              <h6 className="fw-bold mb-3 mt-4">Prerequisites</h6>
              <p className="mb-0">{sessionData.session.prerequisites || 'No prerequisites specified.'}</p>
              
              {sessionData.session.status === 'completed' && sessionData.session.notes && (
                <div className="mt-4 p-3 bg-success-subtle rounded border border-success-subtle">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <ChatLeftTextFill className="me-2 text-success" /> Session Notes
                  </h6>
                  <p className="mb-0">{sessionData.session.notes}</p>
                </div>
              )}
              
              {sessionData.session.status === 'cancelled' && sessionData.session.cancellationReason && (
                <div className="mt-4 p-3 bg-danger-subtle rounded border border-danger-subtle">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <InfoCircle className="me-2 text-danger" /> Cancellation Reason
                  </h6>
                  <p className="mb-0">{sessionData.session.cancellationReason}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-info text-white py-3">
              <h5 className="mb-0 d-flex align-items-center">
                <InfoCircle className="me-2" /> Quick Information
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="mb-3 pb-3 border-bottom">
                <small className="text-muted d-block mb-1">Skill Name</small>
                <h6 className="fw-bold">
                  {(sessionData.session.title || sessionData.session.skillName || 'Not specified').replace(/\s*session\s*/i, '')}
                </h6>
              </div>
              
              {sessionData.isLearner && (
                <div className="mb-3 pb-3 border-bottom">
                  <small className="text-muted d-block mb-1">Your Teacher</small>
                  <h6 className="fw-bold">{sessionData.session.teacherName}</h6>
                </div>
              )}
              


{sessionData.isTeacher && (
  <div className="mb-3 pb-3 border-bottom">
    <small className="text-muted d-block mb-1">Your Student</small>
    <h6 className="fw-bold">{sessionData.session.studentName}</h6>
  </div>
)}

<div className="mb-3 pb-3 border-bottom">
  <small className="text-muted d-block mb-1">Meeting Link</small>
  {formData.inlineEditingMeetingLink && sessionData.isTeacher ? (
    <InputGroup>
      <Form.Control
        type="url"
        value={formData.meetingLink}
        onChange={(e) => updateFormField('meetingLink', e.target.value)}
        placeholder="https://meet.google.com/..."
        onKeyDown={helpers.handleInlineKeyDown}
        autoFocus
      />
      <Button 
        variant="outline-primary" 
        onClick={() => apiActions.updateMeetingLink(true)}
        disabled={isSubmitting}
      >
        {isSubmitting ? <Spinner size="sm" /> : 'Save'}
      </Button>
      <Button 
        variant="outline-secondary" 
        onClick={() => toggleInlineEditing('inlineEditingMeetingLink', false)}
      >
        Cancel
      </Button>
    </InputGroup>
  ) : (
    <div className="d-flex align-items-center">
      {sessionData.session.meetingLink ? (
        <a 
          href={sessionData.session.meetingLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-truncate"
        >
          <Link45deg className="me-1" />
          {sessionData.session.meetingLink}
        </a>
      ) : (
        <span className="text-muted fst-italic">No meeting link provided</span>
      )}
      
      {sessionData.isTeacher && sessionData.session.status !== 'completed' && sessionData.session.status !== 'cancelled' && (
        <Button 
          variant="link" 
          size="sm" 
          className="ms-2 p-0" 
          onClick={() => toggleInlineEditing('inlineEditingMeetingLink', true)}
        >
          <PencilFill size={14} />
        </Button>
      )}
    </div>
  )}
</div>

<div className="mb-3">
  <small className="text-muted d-block mb-1">Session Status</small>
  <h6>
    <Badge bg={statusVariant} className="py-2 px-3">
      {statusText}
    </Badge>
    {sessionData.isJoinable && (
      <Badge bg="success" className="ms-2 py-2 px-3">Joinable</Badge>
    )}
  </h6>
</div>

{sessionData.session.status === 'completed' && (
  <>
    {/* For Students */}
    {sessionData.session.studentId._id && sessionData.session.studentId._id === currentUserId && !sessionData.session.studentFeedback && (
      <button 
        onClick={() => toggleModal('showFeedbackModal', true)}
        className="feedback-button"
      > 
        Provide Rating
      </button>
    )}
    
    {sessionData.session.studentId._id && sessionData.session.studentId._id === currentUserId && sessionData.session.studentFeedback && (
      <p className="feedback-status">
        You've already provided feedback
      </p>
    )}
    
    {/* For Teachers */}
    {sessionData.session.teacherId._id && sessionData.session.teacherId._id === currentUserId && !sessionData.session.teacherFeedback && (
      <button 
        onClick={() => toggleModal('showTeacherFeedbackModal', true)}
        className="feedback-button"
      >
        Provide Student Feedback
      </button>
    )}
    
    {sessionData.session.teacherId._id && sessionData.session.teacherId._id === currentUserId && sessionData.session.teacherFeedback && (
      <p className="feedback-status">
        You've provided feedback to the student
      </p>
    )}
    
    {/* Show teacher's feedback to student */}
    {sessionData.session.studentId._id && sessionData.session.studentId._id === currentUserId && sessionData.session.teacherFeedback && (
      <div className="teacher-feedback">
        <h4>Teacher's Feedback</h4>
        <p>{sessionData.session.teacherFeedback}</p>
      </div>
    )}
  </>
)}

</Card.Body>
</Card>
</Col>
</Row>

{/* Meeting Link Modal */}
<Modal 
  show={modals.showMeetingLinkModal} 
  onHide={() => toggleModal('showMeetingLinkModal', false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>
      {sessionData.session.meetingLink ? 'Update Meeting Link' : 'Add Meeting Link'}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Meeting Link</Form.Label>
        <Form.Control
          type="url"
          placeholder="https://meet.google.com/... or https://zoom.us/..."
          value={formData.meetingLink}
          onChange={(e) => updateFormField('meetingLink', e.target.value)}
          required
        />
        <Form.Text className="text-muted">
          Enter a valid meeting URL for Google Meet, Zoom, or another video conferencing service.
        </Form.Text>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => toggleModal('showMeetingLinkModal', false)}>
      Cancel
    </Button>
    <Button 
      variant="primary" 
      onClick={() => apiActions.updateMeetingLink()}
      disabled={isSubmitting || !formData.meetingLink.trim()}
    >
      {isSubmitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
      Save Meeting Link
    </Button>
  </Modal.Footer>
</Modal>

{/* Feedback Modal */}
<Modal 
  show={modals.showFeedbackModal} 
  onHide={() => toggleModal('showFeedbackModal', false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Provide Session Feedback</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-4 text-center">
        <Form.Label>How would you rate this session?</Form.Label>
        <div className="d-flex justify-content-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <h3 key={star} className="mx-2">
              <StarFill 
                className={`${formData.rating >= star ? 'text-warning' : 'text-muted'} cursor-pointer`}
                onClick={() => updateFormField('rating', star)}
              />
            </h3>
          ))}
        </div>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Share your experience (optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="What did you think about the session? Was it helpful?"
          value={formData.reviewText}
          onChange={(e) => updateFormField('reviewText', e.target.value)}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => toggleModal('showFeedbackModal', false)}>
      Cancel
    </Button>
    <Button 
      variant="primary" 
      onClick={apiActions.submitFeedback}
      disabled={isSubmitting || formData.rating < 1}
    >
      {isSubmitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
      Submit Rating
    </Button>
  </Modal.Footer>
</Modal>

{/* Completion Modal */}
<Modal 
  show={modals.showCompletionModal} 
  onHide={() => toggleModal('showCompletionModal', false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Complete Session</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>
      Are you sure you want to mark this session as completed? This action cannot be undone.
    </p>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Session Notes (optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Add any notes about what was covered in the session..."
          value={formData.teacherNotes}
          onChange={(e) => updateFormField('teacherNotes', e.target.value)}
        />
        <Form.Text className="text-muted">
          These notes will be visible to the student.
        </Form.Text>
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => toggleModal('showCompletionModal', false)}>
      Cancel
    </Button>
    <Button 
      variant="success" 
      onClick={apiActions.completeSession}
      disabled={isSubmitting}
    >
      {isSubmitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
      Mark as Completed
    </Button>
  </Modal.Footer>
</Modal>

{/* Cancellation Modal */}
<Modal 
  show={modals.showCancelModal} 
  onHide={() => toggleModal('showCancelModal', false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title className="text-danger">Cancel Session</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Alert variant="warning">
      <Alert.Heading>
        <InfoCircle className="me-2" /> Warning
      </Alert.Heading>
      <p>
        Cancelling a session may impact your reputation. Please provide a reason for cancellation.
      </p>
    </Alert>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Cancellation Reason</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Why are you cancelling this session?"
          value={formData.cancellationReason}
          onChange={(e) => updateFormField('cancellationReason', e.target.value)}
          required
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => toggleModal('showCancelModal', false)}>
      Keep Session
    </Button>
    <Button 
      variant="danger" 
      onClick={apiActions.cancelSession}
      disabled={isSubmitting || !formData.cancellationReason.trim()}
    >
      {isSubmitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
      Cancel Session
    </Button>
  </Modal.Footer>
</Modal>

{/* Resources Modal */}
<Modal 
  show={modals.showResourcesModal} 
  onHide={() => toggleModal('showResourcesModal', false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Session Resources</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {sessionData.session.resources?.length > 0 ? (
      <ul className="list-group">
        {sessionData.session.resources.map((resource, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1">{resource.title}</h6>
              <p className="mb-0 small text-muted">{resource.description}</p>
            </div>
            <Button 
              variant="link" 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View
            </Button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-center py-3 text-muted">
        No resources have been added to this session.
      </p>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => toggleModal('showResourcesModal', false)}>
      Close
    </Button>
    {sessionData.isTeacher && (
      <Button variant="primary" disabled>
        <PlusLg className="me-2" /> Add Resource
      </Button>
    )}
  </Modal.Footer>
</Modal>

{/* Teacher Feedback Modal */}
<Modal 
  show={modals.showTeacherFeedbackModal} 
  onHide={() => toggleModal('showTeacherFeedbackModal', false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Provide Feedback to Student</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Your Feedback for the Student</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="What feedback would you like to provide to the student about their performance, engagement, or areas for improvement?"
          value={formData.teacherFeedback}
          onChange={(e) => updateFormField('teacherFeedback', e.target.value)}
          required
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => toggleModal('showTeacherFeedbackModal', false)}>
      Cancel
    </Button>
    <Button 
      variant="primary" 
      onClick={apiActions.submitTeacherFeedback}
      disabled={isSubmitting || !formData.teacherFeedback.trim()}
    >
      {isSubmitting ? <Spinner size="sm" animation="border" className="me-2" /> : null}
      Submit Feedback
    </Button>
  </Modal.Footer>
</Modal>


</Container>
);
};

export default SessionDetails;


