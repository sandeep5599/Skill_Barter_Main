// src/components/Leaderboard/UserStatsCard.js
import React, { useMemo } from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { Trophy, Fire, Award, StarFill, Lightning, CheckCircleFill } from 'react-bootstrap-icons';
import { getBadgeColorClass } from './utils/badgeUtils';
import { getInitials } from './utils/formatUtils';

const UserStatsCard = ({ userRank, userDetails, userBadges }) => {
  // Move hooks before any conditional returns to ensure they always run in the same order
  // Calculate user level based on points (similar to what we saw in UserWelcomeCard)
  const userLevel = useMemo(() => 
    Math.floor(((userDetails?.points) || 0) / 100) + 1,
    [userDetails?.points]
  );
  
  // Generate a gradient based on user level
  const levelGradient = useMemo(() => {
    const hue = (userLevel * 20) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 80%, 50%), hsl(${(hue + 40) % 360}, 80%, 40%))`;
  }, [userLevel]);
  
  // Calculate progress to next level
  const levelProgress = useMemo(() => 
    ((userDetails?.points) || 0) % 100,
    [userDetails?.points]
  );

  // Early return after all hooks are called
  if (!userRank || !userDetails) return null;
  
  // Get percentile description
  const getPercentileDescription = (percentile) => {
    if (percentile <= 1) return "Elite";
    if (percentile <= 5) return "Master";
    if (percentile <= 10) return "Expert";
    if (percentile <= 25) return "Advanced";
    if (percentile <= 50) return "Intermediate";
    return "Rising Star";
  };
  
  return (
    <Card className="mb-4 border-0 shadow-sm overflow-hidden">
      {/* Decorative top bar with gradient */}
      <div 
        className="w-100" 
        style={{ 
          height: '6px', 
          background: 'linear-gradient(to right, #3b82f6, #4f46e5, #8b5cf6)'
        }}
      ></div>
      
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col lg={5} md={6} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center">
              <div className="position-relative me-4">
                {/* User Avatar with gradient background */}
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center text-white"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    background: levelGradient,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    fontSize: '1.75rem'
                  }}
                >
                  <span className="fw-bold">{getInitials(localStorage.getItem('userName') || 'You')}</span>
                </div>
                
                {/* Rank Badge */}
                <div 
                  className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    boxShadow: '0 3px 6px rgba(37, 99, 235, 0.3)',
                    border: '2px solid white'
                  }}
                >
                  <Trophy className="text-white" size={16} />
                </div>
              </div>
              
              <div>
                <h4 className="mb-1 fw-bold">{localStorage.getItem('userName') || 'You'}</h4>
                <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                  <Badge
                    className="px-3 py-2 fw-normal"
                    style={{ 
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    Rank #{userRank}
                  </Badge>
                  <Badge
                    className="px-3 py-2 fw-normal d-flex align-items-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    <Award size={14} className="me-1" /> 
                    Top {userDetails.percentile || '0'}%
                  </Badge>
                </div>
                <div className="text-muted small">
                  {getPercentileDescription(userDetails.percentile || 100)} Contributor
                </div>
              </div>
            </div>
          </Col>
          
          <Col lg={7} md={6}>
            <Row className="g-3">
              <Col md={6} xs={6}>
                <div 
                  className="p-3 rounded h-100"
                  style={{
                    background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(186, 230, 253, 0.5)'
                  }}
                >
                  <div className="small text-muted mb-1">Points & Level</div>
                  <div className="d-flex align-items-center mb-2">
                    <div className="fs-3 fw-bold me-2 text-primary">{userDetails.points || 0}</div>
                    <Badge
                      className="px-2 py-1 fw-normal"
                      style={{ 
                        background: levelGradient,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      Level {userLevel}
                    </Badge>
                  </div>
                  <div className="d-flex align-items-center mb-1">
                    <div className="me-auto small text-muted">Progress to Level {userLevel + 1}</div>
                    <div className="small fw-bold text-primary">{levelProgress}%</div>
                  </div>
                  <ProgressBar
                    now={levelProgress}
                    style={{ 
                      height: '6px',
                      background: '#e0e7ff'
                    }}
                    className="mb-1"
                  />
                  <div className="d-flex align-items-center mt-2">
                    {[...Array(Math.min(userLevel, 5))].map((_, i) => (
                      <StarFill key={i} size={14} className="me-1 text-warning" />
                    ))}
                    {userLevel > 5 && <span className="ms-1 small text-muted">+{userLevel - 5}</span>}
                  </div>
                </div>
              </Col>
              
              <Col md={6} xs={6}>
                <div 
                  className="p-3 rounded h-100"
                  style={{
                    background: 'linear-gradient(to right, #fff7ed, #ffedd5)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(254, 215, 170, 0.5)'
                  }}
                >
                  <div className="small text-muted mb-1">Current Streak</div>
                  <div className="d-flex align-items-center mb-2">
                    <Fire className="text-danger me-2" size={24} />
                    <div className="fs-3 fw-bold">{userDetails.streak || 0} <span className="fs-6 fw-normal text-muted">days</span></div>
                  </div>
                  
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="small text-muted">Streak Status</div>
                    <Badge
                      className="px-2 py-1 fw-normal"
                      style={{ 
                        background: (userDetails.streak || 0) >= 7 
                          ? 'linear-gradient(135deg, #f87171, #ef4444)'
                          : 'linear-gradient(135deg, #fcd34d, #f59e0b)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {(userDetails.streak || 0) >= 30 ? 'Expert' : 
                       (userDetails.streak || 0) >= 14 ? 'Impressive' :
                       (userDetails.streak || 0) >= 7 ? 'Solid' : 'Building'}
                    </Badge>
                  </div>
                  
                  <ProgressBar
                    now={Math.min((userDetails.streak || 0) * 3.33, 100)}
                    style={{ 
                      height: '6px',
                      background: '#fee2e2'
                    }}
                    variant="danger"
                    className="mb-2"
                  />
                  
                  <div className="small d-flex align-items-center">
                    <Lightning size={12} className="text-warning me-1" />
                    {(userDetails.streak || 0) >= 30 ? 'Master level streak!' : 
                     (userDetails.streak || 0) >= 7 ? `${30 - (userDetails.streak || 0)} days to master level` : 
                     'Keep going for rewards!'}
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        
        {/* Badges Section with improved styling */}
        {userBadges && userBadges.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="m-0 d-flex align-items-center">
                <CheckCircleFill size={16} className="me-2 text-primary" />
                Your Badges
              </h6>
              <Badge 
                bg="light" 
                className="text-primary fw-normal px-3 py-2"
                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              >
                {userBadges.length} Total
              </Badge>
            </div>
            
            <div className="d-flex flex-wrap gap-2">
              {userBadges.map((badge, idx) => {
                // Get appropriate background gradient based on badge color
                const badgeGradient = 
                  badge.color === 'gold' ? 'linear-gradient(135deg, #ffd700, #ffa500)' :
                  badge.color === 'silver' ? 'linear-gradient(135deg, #c0c0c0, #a9a9a9)' :
                  badge.color === 'bronze' ? 'linear-gradient(135deg, #cd7f32, #a0522d)' :
                  badge.color === 'blue' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                  badge.color === 'green' ? 'linear-gradient(135deg, #10b981, #059669)' :
                  'linear-gradient(135deg, #8b5cf6, #6d28d9)';
                
                return (
                  <Badge 
                    key={idx}
                    className="px-3 py-2 d-flex align-items-center"
                    style={{ 
                      background: badgeGradient,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span className="me-1">{badge.icon}</span> 
                    {badge.name} 
                    {badge.level && <span className="ms-1 fw-normal">Lvl {badge.level}</span>}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </Card.Body>
      
      {/* Add subtle animation effect for hover states */}
      <style jsx>{`
        .card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        
        @media (max-width: 768px) {
          .card:hover {
            transform: none;
          }
        }
      `}</style>
    </Card>
  );
};

export default UserStatsCard;