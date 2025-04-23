// src/components/UI/UserAvatar.js
import React from 'react';
import { getInitials, getAvatarBgColor, getAvatarTextColor } from '../Leaderboard/utils/formatUtils';

const UserAvatar = ({ name, avatar, rank, size = 40 }) => {
  return (
    <div 
      className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        background: getAvatarBgColor(rank),
        color: getAvatarTextColor(rank),
        fontWeight: 'bold'
      }}
    >
      {avatar || getInitials(name)}
    </div>
  );
};

export default UserAvatar;