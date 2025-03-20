import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const getBadgeType = (points) => {
  if (points >= 100) return 'gold';
  if (points >= 50) return 'silver';
  if (points >= 25) return 'bronze';
  return 'beginner';
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/api/points/leaderboard');
        setLeaderboard(res.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="leaderboard">
      <h2>Top Players</h2>
      <div className="leaderboard-list">
        {leaderboard.map((entry, index) => (
          <div key={entry._id} className="leaderboard-item">
            <span className="rank">#{index + 1}</span>
            <img 
              src={entry.userId.avatar} 
              alt="User avatar" 
              className="avatar"
            />
            <span className="name">{entry.userId.name}</span>
            <span className="points">{entry.points} pts</span>
            <span className={`badge ${getBadgeType(entry.points)}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
