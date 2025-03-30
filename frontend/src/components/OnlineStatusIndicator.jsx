import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';

const OnlineStatusIndicator = ({ isOnline, lastActive }) => {
  // Format time since last active
  const formatLastActive = () => {
    if (!lastActive) return 'Never online';
    
    try {
      return formatDistanceToNow(new Date(lastActive), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };
  
  return (
    <div className="flex items-center">
      <div 
        className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} 
        title={isOnline ? 'Online' : 'Offline'}
      />
      <span className="text-sm text-gray-600">
        {isOnline ? 'Online' : `Last seen ${formatLastActive()}`}
      </span>
    </div>
  );
};

OnlineStatusIndicator.propTypes = {
  isOnline: PropTypes.bool,
  lastActive: PropTypes.string // ISO date string
};

OnlineStatusIndicator.defaultProps = {
  isOnline: false,
  lastActive: null
};

export default OnlineStatusIndicator;