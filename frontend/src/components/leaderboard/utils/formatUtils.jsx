// src/components/Leaderboard/utils/formatUtils.js

// Get user's initials for avatar
export const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get medal color based on rank
  export const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#6c757d'; // Default gray
  };
  
  // Get avatar background color based on rank
  export const getAvatarBgColor = (rank) => {
    if (rank === 1) return '#ffc107'; // Gold
    if (rank === 2) return '#adb5bd'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#e9ecef'; // Default
  };
  
  // Get avatar text color based on rank
  export const getAvatarTextColor = (rank) => {
    return rank <= 3 ? '#fff' : '#6c757d';
  };