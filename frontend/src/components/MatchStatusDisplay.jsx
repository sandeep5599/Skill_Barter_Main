import React from 'react';

const statusColors = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'accepted': 'bg-green-100 text-green-800',
  'completed': 'bg-purple-100 text-purple-800',
  'not_requested': 'bg-gray-100 text-gray-800'
};

const MatchStatusDisplay = ({ match }) => {
  // Helper to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });
  };

  // Get the latest time slot if available
  const getLatestTimeSlot = () => {
    if (!match.timeSlots || match.timeSlots.length === 0) return null;
    return match.timeSlots[match.timeSlots.length - 1];
  };

  const latestTimeSlot = getLatestTimeSlot();

  if (match.status === 'rejected') {
    return (
      <div className="match-status-container">
        <div className="status-badge rejected">Rejected</div>
        {match.rejectionReason && (
          <div className="rejection-reason">
            <p>Reason: {match.rejectionReason}</p>
          </div>
        )}
      </div>
    );
  } 

  const statusColor = statusColors[match.status] || 'bg-gray-100 text-gray-800';
  
  if (match.status === 'pending' && match.isRescheduled) {
    return (
      <div className="match-status-container">
        <div className="status-badge rescheduled">Rescheduled</div>
        <div className="reschedule-message">
          <p>{match.teacherName} proposed a new time slot. Go to requests page to check out.</p>
          {latestTimeSlot && (
            <p className="time-slot-info">
              <span>Proposed time: </span>
              {formatDateTime(latestTimeSlot.startTime)} - {formatDateTime(latestTimeSlot.endTime)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="match-status-container">
      <div className={`status-badge ${match.status.toLowerCase()}`}>
        {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
      </div>
    </div>
  );
};

export default MatchStatusDisplay;