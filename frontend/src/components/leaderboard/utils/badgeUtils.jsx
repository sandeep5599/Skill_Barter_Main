// src/components/Leaderboard/utils/badgeUtils.js
import React from 'react';
import { PersonFill, Lightning, Fire, Star } from 'react-bootstrap-icons';

// Achievement badges configuration
export const badges = {
  teacher: {
    name: 'Teaching Master',
    icon: <PersonFill className="text-primary" />,
    description: 'Completed 10+ teaching sessions',
    levels: [
      { min: 1, color: 'bronze' },
      { min: 5, color: 'silver' },
      { min: 10, color: 'gold' },
    ]
  },
  learner: {
    name: 'Knowledge Seeker',
    icon: <Lightning className="text-warning" />,
    description: 'Completed 10+ learning sessions',
    levels: [
      { min: 1, color: 'bronze' },
      { min: 5, color: 'silver' },
      { min: 10, color: 'gold' },
    ]
  },
  streak: {
    name: 'Consistency King',
    icon: <Fire className="text-danger" />,
    description: 'Maintained a login streak',
    levels: [
      { min: 3, color: 'bronze' },
      { min: 7, color: 'silver' },
      { min: 14, color: 'gold' },
    ]
  },
  contributor: {
    name: 'Top Contributor',
    icon: <Star className="text-warning" />,
    description: 'Earned points through platform contributions',
    levels: [
      { min: 50, color: 'bronze' },
      { min: 100, color: 'silver' },
      { min: 250, color: 'gold' },
    ]
  }
};

// Get user badge level
export const getBadgeLevel = (type, value) => {
  const badgeConfig = badges[type];
  if (!badgeConfig) return null;
  
  // Find the highest level the user qualifies for
  for (let i = badgeConfig.levels.length - 1; i >= 0; i--) {
    if (value >= badgeConfig.levels[i].min) {
      return {
        ...badgeConfig,
        level: i + 1,
        color: badgeConfig.levels[i].color
      };
    }
  }
  
  return null;
};

// Get badge color class
export const getBadgeColorClass = (color) => {
  switch (color) {
    case 'gold': return 'bg-warning text-dark';
    case 'silver': return 'bg-secondary text-white';
    case 'bronze': return 'bg-danger bg-opacity-75 text-white';
    default: return 'bg-light text-dark';
  }
};

// Calculate user badges based on user data
export const calculateUserBadges = (userData) => {
  if (!userData) return [];
  
  // Check for each badge type if user qualifies
  const userBadges = [
    userData.streak >= 3 ? getBadgeLevel('streak', userData.streak) : null,
    userData.points >= 50 ? getBadgeLevel('contributor', userData.points) : null,
    // Add other badge checks here as needed
  ].filter(Boolean); // Remove null values
  
  return userBadges;
};

// Export as default for backward compatibility
export default {
  badges,
  getBadgeLevel,
  getBadgeColorClass,
  calculateUserBadges
};