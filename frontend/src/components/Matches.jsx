import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Matches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get('/api/skills/matches', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMatches(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div>
      {matches.map(match => (
        <div key={match._id}>
          {/* Match details */}
        </div>
      ))}
    </div>
  );
}