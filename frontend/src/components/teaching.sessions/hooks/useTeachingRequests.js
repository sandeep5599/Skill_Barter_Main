import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/AuthContext';
import { 
  fetchTeachingRequests, 
  updateMatchStatus, 
  createSession,
  completeSession,
  updateSession,
  confirmSession
} from '../../../services/api.services';
import { getEffectiveStatus } from '../../../utils/statusHelpers';

export default function useTeachingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // API fetch function
  const loadTeachingRequests = useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError('');
    try {
      const teachingRequests = await fetchTeachingRequests(user._id);
      setRequests(teachingRequests);
    } catch (err) {
      const errorMessage = 'Failed to fetch teaching requests. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle Create Session
  const handleCreateSession = async (selectedRequest, sessionDetails) => {
    if (!sessionDetails.selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Determine the type of session action
      const effectiveStatus = getEffectiveStatus(selectedRequest);
      const isRescheduledSessionAccepted = effectiveStatus === 'reschedule_accepted';
      const isRegularReschedule = selectedRequest.status === 'rescheduled' && !isRescheduledSessionAccepted;
      
      // Check if the session exists and is completed
      const isCompletedSession = selectedRequest.status === 'completed';
              
      // First, update the match status
      await updateMatchStatus(selectedRequest._id || selectedRequest.id, {
        status: 'accepted',
        selectedTimeSlot: sessionDetails.selectedTimeSlot,
        message: isRescheduledSessionAccepted || isRegularReschedule ? 
          "The rescheduled time has been accepted" : 
          (sessionDetails.notes || sessionDetails.description),
        notificationType: isRescheduledSessionAccepted || isRegularReschedule ? 
          'rescheduled_session_accepted' : 
          'session_created'
      });
      
      let updatedSessionId;
      
      // If the session is completed, always create a new session
      if (isCompletedSession) {
        // Create a new session instead of updating the completed one
        const sessionResponse = await createSession({
          matchId: selectedRequest._id || selectedRequest.id,
          selectedTimeSlot: sessionDetails.selectedTimeSlot,
          title: sessionDetails.title,
          description: sessionDetails.description,
          meetingLink: sessionDetails.meetingLink,
          prerequisites: sessionDetails.prerequisites,
          notes: sessionDetails.notes,
          notificationType: 'session_created'
        });
        
        updatedSessionId = sessionResponse.session && (sessionResponse.session._id || sessionResponse.session.id);
        
        if (!updatedSessionId) {
          console.error('No session ID returned from API:', sessionResponse);
          toast.warning('Session created but ID not returned. Refreshing data...');
        } else {
          toast.success('Follow-up session created successfully!');
        }
      } 
      // Handle non-completed sessions as before
      else if ((isRescheduledSessionAccepted || isRegularReschedule) && selectedRequest.sessionId) {
        // Update existing session with new time
        const updateResponse = await updateSession(selectedRequest.sessionId, {
          selectedTimeSlot: sessionDetails.selectedTimeSlot,
          title: sessionDetails.title,
          description: sessionDetails.description,
          meetingLink: sessionDetails.meetingLink,
          prerequisites: sessionDetails.prerequisites,
          notes: sessionDetails.notes,
          notificationType: 'reschedule_accepted'
        });
        
        updatedSessionId = selectedRequest.sessionId;
        toast.success('Rescheduled session accepted!');
      } else {
        // Create a new session
        const sessionResponse = await createSession({
          matchId: selectedRequest._id || selectedRequest.id,
          selectedTimeSlot: sessionDetails.selectedTimeSlot,
          title: sessionDetails.title,
          description: sessionDetails.description,
          meetingLink: sessionDetails.meetingLink,
          prerequisites: sessionDetails.prerequisites,
          notes: sessionDetails.notes,
          notificationType: 'session_created'
        });
        
        // Extract the session ID from the response
        updatedSessionId = sessionResponse.session && (sessionResponse.session._id || sessionResponse.session.id);
        
        if (!updatedSessionId) {
          console.error('No session ID returned from API:', sessionResponse);
          toast.warning('Session created but ID not returned. Refreshing data...');
        } else {
          toast.success('Session created successfully!');
        }
      }
      
      // Update the requests array with the new session ID if we have one
      if (updatedSessionId) {
        setRequests(prevRequests => {
          return prevRequests.map(req => 
            (req._id === selectedRequest._id || req.id === selectedRequest.id) 
              ? { ...req, sessionId: updatedSessionId } 
              : req
          );
        });
      }
      
      await loadTeachingRequests();
      return true;
    } catch (error) {
      setError('Failed to create session: ' + (error.message || 'Unknown error'));
      toast.error('Failed to create session');
      console.error('Session creation error:', error);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (selectedRequest, rejectionReason) => {
    try {
      setProcessing(true);
      await updateMatchStatus(selectedRequest._id || selectedRequest.id, {
        status: 'rejected',
        rejectionReason: rejectionReason,
        message: rejectionReason, // Also send as message for notifications
        notificationType: 'match_rejected', // Add this to trigger a notification
        recipientId: selectedRequest.studentId // Add this to specify who gets the notification
      });

      toast.info('Request rejected');
      await loadTeachingRequests();
      return true;
    } catch (error) {
      setError('Failed to reject request');
      toast.error('Failed to reject request');
      console.error(error);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleReschedule = async (selectedRequest, startTime, endTime) => {
    if (!startTime || !endTime) {
      toast.error('Please select both start and end times');
      return false;
    }

    try {
      setProcessing(true);
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (startDate >= endDate) {
        toast.error('End time must be after start time');
        return false;
      }

      await updateMatchStatus(selectedRequest._id || selectedRequest.id, {
        status: 'rescheduled',
        selectedTimeSlot: {
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        },
        message: "I've proposed a new time for our session.",
        notificationType: 'match_rescheduled', // Add this to trigger a notification
        recipientId: selectedRequest.studentId, // Add this to specify who gets the notification
        rescheduleInitiator: 'teacher' // Mark that teacher initiated this reschedule
      });

      toast.success('Request rescheduled successfully!');
      await loadTeachingRequests();
      return true;
    } catch (error) {
      setError('Failed to reschedule request');
      toast.error('Failed to reschedule request');
      console.error(error);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      setProcessing(true);
      
      await completeSession(sessionId);
      
      toast.success('Session marked as completed.');
      await loadTeachingRequests();
      return true;
    } catch (error) {
      setError('Failed to complete session: ' + error.message);
      toast.error('Failed to mark session as completed');
      console.error(error);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmRescheduled = async (sessionId, selectedTimeSlot) => {
    try {
      setProcessing(true);
      
      await confirmSession(sessionId, {
        status: 'accepted',
        message: "I've accepted the rescheduled time",
        selectedTimeSlot: selectedTimeSlot,
      });
      
      toast.success('Rescheduled session confirmed!');
      await loadTeachingRequests();
      return true;
    } catch (error) {
      setError('Failed to confirm session: ' + error.message);
      toast.error('Failed to confirm session');
      console.error(error);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user && user._id) {
      loadTeachingRequests();
    }
    
    // Set up polling to check for new requests periodically
    const intervalId = setInterval(loadTeachingRequests, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [loadTeachingRequests, user]);

  return {
    requests,
    loading,
    error,
    processing,
    setError,
    loadTeachingRequests,
    handleCreateSession,
    handleReject,
    handleReschedule,
    handleCompleteSession,
    handleConfirmRescheduled
  };
}