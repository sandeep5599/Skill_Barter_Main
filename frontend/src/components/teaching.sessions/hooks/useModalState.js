import { useState, useCallback } from 'react';
import { formatDateTimeForInput, getDefaultTimeSlot } from '../../../utils/formatHelpers';

export default function useModalState() {
  const [modalState, setModalState] = useState({
    reschedule: false,
    sessionCreation: false,
    reject: false,
    feedback: false,
    completeSession: false
  });
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposedDateTime, setProposedDateTime] = useState('');
  const [proposedEndTime, setProposedEndTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [sessionDetails, setSessionDetails] = useState({
    title: '',
    description: '',
    meetingLink: '',
    prerequisites: '',
    notes: '',
    selectedTimeSlot: null
  });

  const toggleModal = useCallback((modalName, show, request = null) => {
    setModalState(prev => ({ ...prev, [modalName]: show }));
    
    if (request) {
      setSelectedRequest(request);
      
      if (modalName === 'reschedule') {
        // Set default proposed times
        if (request.proposedTimeSlots && request.proposedTimeSlots.length > 0) {
          const startTime = new Date(request.proposedTimeSlots[0].startTime);
          const endTime = new Date(request.proposedTimeSlots[0].endTime);
          
          setProposedDateTime(formatDateTimeForInput(startTime));
          setProposedEndTime(formatDateTimeForInput(endTime));
        } else {
          // Default to current time + 1 day
          const { startTime, endTime } = getDefaultTimeSlot();
          
          setProposedDateTime(formatDateTimeForInput(startTime));
          setProposedEndTime(formatDateTimeForInput(endTime));
        }
      } else if (modalName === 'sessionCreation') {
        // Set default values for session creation
        setSessionDetails({
          title: `${request.skillName || request.expertise || 'Tutoring'} Session`,
          description: '',
          meetingLink: '',
          prerequisites: '',
          notes: '',
          selectedTimeSlot: request.timeSlots && request.timeSlots.length > 0 
            ? request.timeSlots[0] 
            : null
        });
      } else if (modalName === 'reject') {
        setRejectionReason('');
      }
    }
  }, []);

  const handleSessionDetailsChange = useCallback((e) => {
    const { name, value } = e.target;
    setSessionDetails(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleTimeSlotSelect = useCallback((timeSlot) => {
    setSessionDetails(prev => ({
      ...prev,
      selectedTimeSlot: timeSlot
    }));
  }, []);

  return {
    modalState,
    selectedRequest,
    proposedDateTime,
    setProposedDateTime,
    proposedEndTime,
    setProposedEndTime,
    rejectionReason,
    setRejectionReason,
    sessionDetails,
    toggleModal,
    handleSessionDetailsChange,
    handleTimeSlotSelect
  };
}