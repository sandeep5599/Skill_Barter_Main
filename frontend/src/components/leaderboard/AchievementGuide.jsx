// src/components/Leaderboard/AchievementGuide.jsx
import React, { useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Star, Trophy, Award, CheckCircle } from 'react-bootstrap-icons';
import { badges } from './utils/badgeUtils';

const AchievementGuide = () => {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  return (
    <Card className="achievement-guide border-0 shadow-sm mt-4 overflow-hidden">
      {/* Decorative top bar with gradient */}
      <div 
        className="w-100" 
        style={{ 
          height: '4px', 
          background: 'linear-gradient(to right, #fbbf24, #f59e0b, #d97706)'
        }}
      ></div>
      
      <Card.Header className="bg-white border-bottom py-3">
        <h5 className="mb-0 fw-bold d-flex align-items-center">
          <Star className="text-warning me-2" /> Achievement Guide
        </h5>
      </Card.Header>
      
      <Card.Body className="p-4">
        <Row className="g-4">
          {Object.entries(badges).map(([key, badge], idx) => (
            <Col md={3} sm={6} key={key}>
              <div 
                className={`badge-card h-100 d-flex flex-column ${hoveredBadge === key ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredBadge(key)}
                onMouseLeave={() => setHoveredBadge(null)}
              >
                <div className="text-center mb-3">
                  <div className="badge-icon-container mx-auto">
                    {React.cloneElement(badge.icon, { size: 28, className: 'badge-icon' })}
                  </div>
                </div>
                
                <h6 className="fw-bold mb-2 text-center badge-title">{badge.name}</h6>
                <p className="text-muted small mb-3 badge-description">{badge.description}</p>
                
                <div className="mt-auto badge-levels">
                  <div className="level-item d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <span className="level-badge bronze"></span>
                      <span className="ms-2 fw-medium">Bronze</span>
                    </div>
                    <span className="fw-semibold">{badge.levels[0].min}+</span>
                  </div>
                  
                  <div className="level-item d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <span className="level-badge silver"></span>
                      <span className="ms-2 fw-medium">Silver</span>
                    </div>
                    <span className="fw-semibold">{badge.levels[1].min}+</span>
                  </div>
                  
                  <div className="level-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="level-badge gold"></span>
                      <span className="ms-2 fw-medium">Gold</span>
                    </div>
                    <span className="fw-semibold">{badge.levels[2].min}+</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card.Body>
      
      <style jsx>{`
        .achievement-guide {
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .achievement-guide:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
        }
        
        .badge-card {
          background-color: #fff;
          border-radius: 10px;
          padding: 1.5rem;
          border: 1px solid rgba(0, 0, 0, 0.05);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .badge-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, #d97706, #fbbf24);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        
        .badge-card.hovered {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
          border-color: rgba(0, 0, 0, 0.08);
        }
        
        .badge-card.hovered::before {
          transform: scaleX(1);
        }
        
        .badge-icon-container {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(147, 197, 253, 0.3);
        }
        
        .badge-card.hovered .badge-icon-container {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          transform: scale(1.08);
        }
        
        .badge-icon {
          color: #3b82f6;
          transition: all 0.3s ease;
        }
        
        .badge-card.hovered .badge-icon {
          color: #d97706;
        }
        
        .badge-title {
          color: #1f2937;
          transition: all 0.3s ease;
          position: relative;
          display: inline-block;
          margin: 0 auto;
        }
        
        .badge-card.hovered .badge-title {
          color: #000;
        }
        
        .badge-description {
          transition: all 0.2s ease;
          color: #6b7280;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        
        .badge-card.hovered .badge-description {
          color: #4b5563;
        }
        
        .badge-levels {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }
        
        .level-item {
          padding: 0.3rem 0;
          transition: all 0.2s ease;
        }
        
        .level-badge {
          width: 16px;
          height: 16px;
          display: inline-block;
          border-radius: 50%;
        }
        
        .level-badge.bronze {
          background: linear-gradient(135deg, #cd7f32, #a0522d);
          box-shadow: 0 1px 3px rgba(160, 82, 45, 0.4);
        }
        
        .level-badge.silver {
          background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
          box-shadow: 0 1px 3px rgba(169, 169, 169, 0.4);
        }
        
        .level-badge.gold {
          background: linear-gradient(135deg, #ffd700, #ffa500);
          box-shadow: 0 1px 3px rgba(255, 165, 0, 0.4);
        }
        
        .badge-card.hovered .level-item {
          transform: translateX(3px);
        }
        
        @media (max-width: 768px) {
          .badge-card {
            padding: 1.25rem;
          }
          
          .badge-icon-container {
            width: 50px;
            height: 50px;
          }
        }
      `}</style>
    </Card>
  );
};

export default AchievementGuide;