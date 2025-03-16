import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MatchStatusDisplay from './MatchStatusDisplay';

const MatchesList = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    if (!user || !user._id) return;

    try {
      setLoading(true);
      setError(null);
      
      const matchesResponse = await fetch(
        `${BACKEND_URL}/api/matches/user/${user._id}?status=accepted,pending,rejected`, 
        { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        }
      );
      
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setMatches(matchesData || []);
      } else {
        const errorText = await matchesResponse.text();
        console.warn('Unable to fetch matches:', errorText);
        setError('Failed to load matches');
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Error loading matches. Please try again.');
      toast.error('Error loading matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading matches...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-600">
        {error}
        <button 
          onClick={fetchMatches}
          className="ml-2 text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return <div className="text-center py-6 text-gray-500">No matches found</div>;
  }

  return (
    <div className="matches-list space-y-4">
      <h3 className="text-lg font-medium">Recent Matches</h3>
      
      {matches.map(match => (
        <div 
          key={match.id} 
          className="match-item border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-lg">
                {match.role === 'student' ? 'Teacher:' : 'Student:'} {match.name}
              </h4>
              <p className="text-sm text-gray-600">Skill: {match.expertise}</p>
            </div>
            
            <MatchStatusDisplay match={match} />
          </div>
          
          {match.timeSlots && match.timeSlots.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium">Proposed Times:</p>
              <ul className="text-xs text-gray-600 space-y-1 mt-1">
                {match.timeSlots.slice(0, 3).map((slot, idx) => (
                  <li key={idx}>
                    {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleTimeString()}
                  </li>
                ))}
                {match.timeSlots.length > 3 && (
                  <li className="italic">+{match.timeSlots.length - 3} more time slots</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500">
            Match created: {new Date(match.createdAt).toLocaleDateString()}
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button 
              onClick={() => window.location.href = `/matches/${match.id}`}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchesList;