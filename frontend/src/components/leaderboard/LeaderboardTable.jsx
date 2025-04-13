import React, { memo } from 'react';
import { Table, ProgressBar, Badge, Button } from 'react-bootstrap';
import { Award, Trophy, Fire, GeoAlt, ChevronUp, ChevronDown } from 'react-bootstrap-icons';
import { getInitials, getMedalColor } from './utils/formatUtils';
import { getBadgeLevel, getBadgeColorClass } from './utils/badgeUtils';

const LeaderboardTable = memo(({ 
  leaderboardData, 
  userRank, 
  handleSort, 
  sortBy, 
  sortDirection,
  navigate
}) => {
  // Get sort icon
  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 table-borderless">
        <thead className="bg-light">
          <tr>
            <th className="text-center" style={{ width: '80px' }}>Rank</th>
            <th>User</th>
            <th 
              className="cursor-pointer" 
              onClick={() => handleSort('points')}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                Points {getSortIcon('points')}
              </div>
            </th>
            <th 
              className="cursor-pointer" 
              onClick={() => handleSort('streak')}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                Streak {getSortIcon('streak')}
              </div>
            </th>
            <th>Badges</th>
            <th className="text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user) => {
            // Calculate badges for this user
            const userBadges = [
              user.streak >= 3 ? getBadgeLevel('streak', user.streak) : null,
              user.points >= 50 ? getBadgeLevel('contributor', user.points) : null
            ].filter(Boolean);
            
            return (
              <tr key={user.userId} className={user.rank === userRank ? 'bg-primary bg-opacity-10' : ''}>
                <td className="text-center align-middle">
                  <div className="position-relative">
                    {user.rank <= 3 ? (
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle mx-auto" 
                        style={{ 
                          width: '35px', 
                          height: '35px', 
                          backgroundColor: getMedalColor(user.rank),
                          color: user.rank === 1 ? '#000' : '#fff'
                        }}
                      >
                        <Trophy size={16} />
                      </div>
                    ) : (
                      <span className="fw-bold text-muted">#{user.rank}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div 
                      className="me-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        background: user.rank === 1 ? '#ffc107' : 
                                  user.rank === 2 ? '#adb5bd' :
                                  user.rank === 3 ? '#cd7f32' : 
                                  '#e9ecef',
                        color: user.rank <= 3 ? '#fff' : '#6c757d',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.avatar ? user.avatar : getInitials(user.name)}
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold">{user.name}</h6>
                      <div className="small text-muted">
                        <GeoAlt size={12} className="me-1" />
                        {user.country || 'Not specified'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="d-flex align-items-center">
                    <Award className="text-warning me-2" size={16} />
                    <span className="fw-bold">{user.points}</span>
                  </div>
                  <ProgressBar 
                    now={Math.min(100, (user.points / 300) * 100)} 
                    variant="primary" 
                    className="mt-1" 
                    style={{ height: '5px' }} 
                  />
                </td>
                <td className="align-middle">
                  <div className="d-flex align-items-center">
                    <Fire className={user.streak > 0 ? "text-danger me-2" : "text-muted me-2"} size={16} />
                    <span className="fw-bold">{user.streak} days</span>
                  </div>
                </td>
                <td className="align-middle">
                  <div className="d-flex flex-wrap gap-1">
                    {userBadges.length === 0 ? (
                      <span className="text-muted small">No badges yet</span>
                    ) : (
                      userBadges.map((badge, badgeIdx) => (
                        <Badge 
                          key={badgeIdx} 
                          className={`${getBadgeColorClass(badge.color)}`}
                        >
                          {badge.icon} {badge.level && `L${badge.level}`}
                        </Badge>
                      ))
                    )}
                  </div>
                </td>
                <td className="text-center align-middle">
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="rounded-pill"
                    onClick={() => navigate(`/profile/${user.userId}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
});

LeaderboardTable.displayName = 'LeaderboardTable';
export default LeaderboardTable;