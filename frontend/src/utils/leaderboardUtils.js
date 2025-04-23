// Utility functions for leaderboard component

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getMedalColor = (rank) => {
  const colors = {
    1: { gradient: 'linear-gradient(135deg, #fbbf24, #d97706)', shadow: 'rgba(251, 191, 36, 0.3)' },
    2: { gradient: 'linear-gradient(135deg, #94a3b8, #64748b)', shadow: 'rgba(148, 163, 184, 0.3)' },
    3: { gradient: 'linear-gradient(135deg, #cd7f32, #b06000)', shadow: 'rgba(205, 127, 50, 0.3)' },
    default: { gradient: '#e2e8f0', shadow: 'rgba(226, 232, 240, 0.3)' }
  };
  return colors[rank] || colors.default;
};

export const getBadgeColorClass = (color) => {
  const classes = {
    gold: 'bg-warning text-dark',
    silver: 'bg-secondary text-white',
    bronze: 'bg-danger bg-opacity-75 text-white',
    default: 'bg-light text-dark'
  };
  return classes[color] || classes.default;
};
