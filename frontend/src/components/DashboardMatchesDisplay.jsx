import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import MatchStatusDisplay from './MatchStatusDisplay';

const DashboardMatchesDisplay = ({ user }) => {
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    if (user && user._id) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const matchesResponse = await fetch(
        `${BACKEND_URL}/api/matches/user/${user._id}?status=accepted,pending,rejected`, 
        { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
        }
      );
      
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setRecentMatches(matchesData || []);
      } else {
        console.warn('Unable to fetch matches:', await matchesResponse.text());
        setRecentMatches([]);
      }
    } catch (matchError) {
      console.warn('Match fetch error:', matchError);
      setRecentMatches([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading matches...</div>;
  }

  if (!recentMatches || recentMatches.length === 0) {
    return <div className="text-gray-500 text-center py-4">No recent matches found</div>;
  }

  return (
    <div className="recent-matches">
      <h3 className="text-lg font-medium mb-3">Recent Match Requests</h3>
      <div className="space-y-3">
        {recentMatches.map(match => (
          <div key={match.id} className="match-card border rounded-lg p-3 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {match.role === 'student' 
                    ? `Learning ${match.expertise} from ${match.name}`
                    : `Teaching ${match.expertise} to ${match.name}`}
                </p>
              </div>
              
              <MatchStatusDisplay match={match} />
            </div>
            
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => window.location.href = `/matches/${match.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardMatchesDisplay;