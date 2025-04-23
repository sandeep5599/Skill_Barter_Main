// Status-related utility functions
export const getEffectiveStatus = (request) => {
    // Check if request exists
    if (!request) {
      return 'pending';
    }
    
    // If the request has a special flag for reschedule response
    if (request.rescheduleResponse) {
      return request.rescheduleResponse === 'accepted' 
        ? 'reschedule_accepted' 
        : 'reschedule_rejected';
    }
    
    // If the request is rescheduled and was initiated by the teacher
    if (request.status === 'rescheduled' && request.rescheduleInitiator === 'teacher') {
      return 'awaiting_response';
    }
    
    // Default to the request's status
    return request.status || 'pending';
  };
  
  export const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      accepted: 'success',
      completed: 'info',
      rejected: 'danger',
      rescheduled: 'primary',
      'awaiting_response': 'secondary',
      'reschedule_rejected': 'danger',
      'reschedule_accepted': 'success',
      default: 'secondary'
    };
    
    return variants[status] || variants.default;
  };
  
  export const getStatusDisplayText = (status) => {
    const displayText = {
      pending: 'Pending',
      accepted: 'Accepted',
      completed: 'Completed',
      rejected: 'Rejected',
      rescheduled: 'Rescheduled',
      'awaiting_response': 'Awaiting Response',
      'reschedule_rejected': 'Reschedule Rejected',
      'reschedule_accepted': 'Reschedule Accepted',
    };
  
    return displayText[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };