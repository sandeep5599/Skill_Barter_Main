
// File: components/leaderboard/utils/badgeUtils.js
import React from 'react';
import { Trophy, Fire, Gem, Award, Lightning, Book, People } from 'react-bootstrap-icons';

/**
 * Get badge level based on achievement type and value
 * @param {string} type - Badge type (streak, contributor, etc.)
 * @param {number} value - Achievement value (points, streak days, etc.)
 * @returns {object|null} Badge object with name, level, color, and icon
 */
export const getBadgeLevel = (type, value) => {
  switch (type) {
    case 'streak':
      if (value >= 100) {
        return {
          name: 'Streak',
          level: 3,
          color: 'gold',
          icon: <Fire />
        };
      } else if (value >= 30) {
        return {
          name: 'Streak',
          level: 2,
          color: 'silver',
          icon: <Fire />
        };
      } else if (value >= 7) {
        return {
          name: 'Streak',
          level: 1,
          color: 'bronze',
          icon: <Fire />
        };
      }
      return null;
      
    case 'contributor':
      if (value >= 1000) {
        return {
          name: 'Contributor',
          level: 3,
          color: 'gold',
          icon: <Trophy />
        };
      } else if (value >= 500) {
        return {
          name: 'Contributor',
          level: 2,
          color: 'silver',
          icon: <Trophy />
        };
      } else if (value >= 100) {
        return {
          name: 'Contributor',
          level: 1,
          color: 'bronze',
          icon: <Trophy />
        };
      }
      return null;
      
    case 'creator':
      if (value >= 50) {
        return {
          name: 'Creator',
          level: 3,
          color: 'gold',
          icon: <Book />
        };
      } else if (value >= 20) {
        return {
          name: 'Creator',
          level: 2,
          color: 'silver',
          icon: <Book />
        };
      } else if (value >= 5) {
        return {
          name: 'Creator',
          level: 1,
          color: 'bronze',
          icon: <Book />
        };
      }
      return null;
      
    case 'community':
      if (value >= 200) {
        return {
          name: 'Community',
          level: 3,
          color: 'gold',
          icon: <People />
        };
      } else if (value >= 100) {
        return {
          name: 'Community',
          level: 2,
          color: 'silver',
          icon: <People />
        };
      } else if (value >= 30) {
        return {
          name: 'Community',
          level: 1,
          color: 'bronze',
          icon: <People />
        };
      }
      return null;
      
    case 'champion':
      return {
        name: 'Champion',
        color: 'special',
        icon: <Award />
      };
      
    case 'mentor':
      return {
        name: 'Mentor',
        color: 'special',
        icon: <Gem />
      };
      
    case 'season':
      return {
        name: 'Season Winner',
        color: 'special',
        icon: <Lightning />
      };
      
    default:
      return null;
  }
};

/**
 * Get CSS class for badge color
 * @param {string} color - Badge color name
 * @returns {string} CSS class
 */
export const getBadgeColorClass = (color) => {
  switch (color) {
    case 'gold':
      return 'bg-warning text-dark';
    case 'silver':
      return 'bg-secondary text-white';
    case 'bronze':
      return 'bg-danger bg-opacity-75 text-white';
    case 'special':
      return 'bg-primary bg-gradient text-white';
    default:
      return 'bg-light text-dark';
  }
};

/**
 * Get all available badges
 * @returns {Array} List of all badge objects
 */
export const getAllBadges = () => {
  return [
    getBadgeLevel('streak', 7),
    getBadgeLevel('streak', 30),
    getBadgeLevel('streak', 100),
    getBadgeLevel('contributor', 100),
    getBadgeLevel('contributor', 500),
    getBadgeLevel('contributor', 1000),
    getBadgeLevel('creator', 5),
    getBadgeLevel('creator', 20),
    getBadgeLevel('creator', 50),
    getBadgeLevel('community', 30),
    getBadgeLevel('community', 100),
    getBadgeLevel('community', 200),
    getBadgeLevel('champion'),
    getBadgeLevel('mentor'),
    getBadgeLevel('season')
  ];
};

/**
 * Get badge description
 * @param {string} type - Badge type
 * @param {number} level - Badge level (1, 2, 3)
 * @returns {string} Badge description
 */
export const getBadgeDescription = (type, level) => {
  switch (type) {
    case 'streak':
      if (level === 3) return 'Maintained a 100+ day streak';
      if (level === 2) return 'Maintained a 30+ day streak';
      if (level === 1) return 'Maintained a 7+ day streak';
      return 'Log in daily to build your streak';
      
    case 'contributor':
      if (level === 3) return 'Earned 1000+ contribution points';
      if (level === 2) return 'Earned 500+ contribution points';
      if (level === 1) return 'Earned 100+ contribution points';
      return 'Earn points by participating in the community';
      
    case 'creator':
      if (level === 3) return 'Created 50+ pieces of content';
      if (level === 2) return 'Created 20+ pieces of content';
      if (level === 1) return 'Created 5+ pieces of content';
      return 'Create lessons, guides, or resources';
      
    case 'community':
      if (level === 3) return 'Helped 200+ community members';
      if (level === 2) return 'Helped 100+ community members';
      if (level === 1) return 'Helped 30+ community members';
      return 'Help others by answering questions';
      
    case 'champion':
      return 'Won a community challenge or competition';
      
    case 'mentor':
      return 'Recognized for exceptional mentorship';
      
    case 'season':
      return 'Seasonal event winner';
      
    default:
      return 'Complete achievements to earn badges';
  }
};