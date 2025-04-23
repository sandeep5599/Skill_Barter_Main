// Centralized date formatting utilities
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };
  
  export const formatDateTimeForInput = (date) => {
    if (!date || !(date instanceof Date)) {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    }
    return date.toISOString().slice(0, 16);
  };
  
  export const getDefaultTimeSlot = (addDays = 1, durationHours = 1) => {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + addDays);
    startTime.setHours(startTime.getHours(), 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + durationHours);
    
    return {
      startTime,
      endTime
    };
  };