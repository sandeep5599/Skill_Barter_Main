// src/components/Leaderboard/LeaderboardHeader.jsx
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ArrowLeft, Trophy } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';

const LeaderboardHeader = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  
  // Trigger animation on component mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className={`leaderboard-header ${animate ? 'animate' : ''}`}>
      <div className="header-background"></div>
      <div className="header-content d-flex align-items-center justify-content-between">
        <Button 
          onClick={() => navigate('/dashboard')}
          className="back-button d-flex align-items-center"
        >
          <ArrowLeft className="me-2" /> Back to Dashboard
        </Button>
        
        <div className="title-container">
          <h1 className="leaderboard-title d-flex align-items-center">
            <Trophy className="trophy-icon me-2" size={32} /> 
            <span className="title-text">Leaderboard</span>
          </h1>
        </div>
        
        <div style={{ width: '120px' }}></div> 
      </div>

      {/* Custom styles for the header */}
      <style jsx>{`
        .leaderboard-header {
          position: relative;
          margin-bottom: 2rem;
          padding: 1.5rem;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .header-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #4f46e5, #3b82f6, #2563eb);
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          z-index: -1;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
        }
        
        .animate .header-background {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate .header-content {
          opacity: 1;
          transform: translateY(0);
        }
        
        .back-button {
          background: rgba(255, 255, 255, 0.2) !important;
          border: none !important;
          border-radius: 8px !important;
          color: white !important;
          font-weight: 500 !important;
          padding: 0.6rem 1.2rem !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
        }
        
        .back-button:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15) !important;
        }
        
        .leaderboard-title {
          color: white;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          margin-bottom: 0;
          font-size: 1.8rem;
        }
        
        .trophy-icon {
          color: #ffc107;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          animation: pulse 2s infinite ease-in-out;
        }
        
        .title-text {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          position: relative;
        }
        
        .title-text::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 3px;
          background-color: #ffc107;
          transition: width 0.8s ease 0.5s;
        }
        
        .animate .title-text::after {
          width: 100%;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @media (max-width: 768px) {
          .leaderboard-title {
            font-size: 1.5rem;
          }
          
          .back-button {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.9rem !important;
          }
          
          .trophy-icon {
            size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardHeader;