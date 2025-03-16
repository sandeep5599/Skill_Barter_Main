import React from 'react';

const MatchStatusDisplay = ({ match }) => {
  // Display rejection reason if match is rejected
  if (match.status === 'rejected') {
    return (
      <div className="match-status rejected">
        <span className="status-label bg-red-100 text-red-800 px-2 py-1 rounded-md">Rejected</span>
        {match.rejectionReason && (
          <p className="rejection-reason mt-2 text-sm text-gray-700">
            <span className="font-medium">Reason:</span> {match.rejectionReason}
          </p>
        )}
      </div>
    );
  }
  
  // Display rescheduling info if there's a new proposal
  if (match.hasReschedulingProposal) {
    const teacherProposed = match.role === 'student';
    const proposerName = teacherProposed ? match.teacherName : match.requesterName;
    
    return (
      <div className="match-status rescheduled">
        <span className="status-label bg-blue-100 text-blue-800 px-2 py-1 rounded-md">Rescheduled</span>
        <p className="reschedule-message mt-2 text-sm text-gray-700">
          {proposerName} proposed a new time slot. Go to requests page to check out.
        </p>
        {match.latestMessage && (
          <p className="latest-message mt-1 text-xs text-gray-600 italic">
            "{match.latestMessage.message}"
          </p>
        )}
      </div>
    );
  }
  
  // Handle other statuses
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'accepted': 'bg-green-100 text-green-800',
    'completed': 'bg-purple-100 text-purple-800',
    'not_requested': 'bg-gray-100 text-gray-800'
  };
  
  const statusColor = statusColors[match.status] || 'bg-gray-100 text-gray-800';
  
  return (
    <div className="match-status">
      <span className={`status-label ${statusColor} px-2 py-1 rounded-md`}>
        {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
      </span>
      
      {match.selectedTimeSlot && (
        <p className="scheduled-time mt-2 text-sm text-gray-700">
          <span className="font-medium">Scheduled:</span> {new Date(match.selectedTimeSlot.startTime).toLocaleString()}
        </p>
      )}
      
      {match.latestMessage && (
        <p className="latest-message mt-1 text-xs text-gray-600 italic">
          "{match.latestMessage.message}"
        </p>
      )}
    </div>
  );
};

export default MatchStatusDisplay;