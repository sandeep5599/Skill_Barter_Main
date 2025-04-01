import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircleFill, 
  Calendar, 
  PeopleFill, 
  ArrowRight, 
  ClipboardPlus,
  PersonFill
} from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';

const CompletedSessionsList = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedSessions, setCompletedSessions] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [users, setUsers] = useState({});
  const [skills, setSkills] = useState({});
  const [activeTab, setActiveTab] = useState('sessions');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get sessions
        const sessionsResponse = await axios.get(`/api/sessions/user/${userId}`);
        const completed = sessionsResponse.data.sessions.filter(
          session => session.status === 'completed'
        );
        setCompletedSessions(completed);
        
        // Get matches
        const matchesResponse = await axios.get(`/api/matches/user/${userId}`);
        const accepted = matchesResponse.data.matches.filter(
          match => match.status === 'accepted' || match.status === 'completed'
        );
        setAcceptedMatches(accepted);
        
        // Collect all user and skill IDs
        const userIds = new Set();
        const skillIds = new Set();
        
        completed.forEach(session => {
          userIds.add(session.teacher);
          userIds.add(session.learner);
          if (session.skill) skillIds.add(session.skill);
        });
        
        accepted.forEach(match => {
          userIds.add(match.teacher);
          userIds.add(match.learner);
          if (match.skill) skillIds.add(match.skill);
        });
        
        // Fetch user data
        const usersMap = {};
        for (const id of userIds) {
          try {
            const userResponse = await axios.get(`/api/users/${id}`);
            usersMap[id] = userResponse.data.user;
          } catch (err) {
            console.error(`Error fetching user ${id}:`, err);
          }
        }
        setUsers(usersMap);
        
        // Fetch skill data
        const skillsMap = {};
        for (const id of skillIds) {
          try {
            const skillResponse = await axios.get(`/api/skills/${id}`);
            skillsMap[id] = skillResponse.data.skill;
          } catch (err) {
            console.error(`Error fetching skill ${id}:`, err);
          }
        }
        setSkills(skillsMap);
        
      } catch (err) {
        console.error('Error fetching sessions and matches:', err);
        setError('Failed to load sessions and matches data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleCreateAssessment = (item, type) => {
    // Navigate to create assessment page with selected session/match data
    navigate('/sessions/assessments/create-assessment', { 
      state: { 
        selectedItem: item,
        itemType: type 
      } 
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <Loading message="Loading completed sessions and matches..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Completed Learning Interactions</h5>
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions
          </button>
          <button 
            type="button" 
            className={`btn ${activeTab === 'matches' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('matches')}
          >
            Matches
          </button>
        </div>
      </div>

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <>
          {completedSessions.length === 0 ? (
            <div className="alert alert-info">
              You don't have any completed sessions yet. Once you complete a session, it will appear here.
            </div>
          ) : (
            <div className="row g-3">
              {completedSessions.map((session) => {
                const teacherUser = users[session.teacher] || {};
                const learnerUser = users[session.learner] || {};
                const skillInfo = skills[session.skill] || {};
                const isTeacher = userId === session.teacher;
                const otherUser = isTeacher ? learnerUser : teacherUser;
                
                return (
                  <div key={session._id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="badge bg-success">Completed Session</span>
                          <span className="text-muted small">
                            {formatDate(session.completedAt || session.updatedAt)}
                          </span>
                        </div>
                        
                        <h5 className="card-title fw-bold mb-3">
                          {skillInfo.title || 'Skill Session'}
                        </h5>
                        
                        <div className="d-flex align-items-center mb-2">
                          <PersonFill className="text-primary me-2" />
                          <span>
                            <span className="text-muted">
                              {isTeacher ? 'Learner' : 'Teacher'}:
                            </span>{' '}
                            <strong>
                              {otherUser.firstName} {otherUser.lastName}
                            </strong>
                          </span>
                        </div>
                        
                        <div className="d-flex align-items-center mb-3">
                          <Calendar className="text-primary me-2" />
                          <span>
                            <span className="text-muted">Duration:</span>{' '}
                            <strong>{session.duration || 60} minutes</strong>
                          </span>
                        </div>
                        
                        {session.feedback && (
                          <div className="alert alert-light p-2 mb-3 small">
                            <strong>Feedback:</strong> {session.feedback.slice(0, 60)}
                            {session.feedback.length > 60 ? '...' : ''}
                          </div>
                        )}
                        
                        <div className="d-grid">
                          <button 
                            className="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                            onClick={() => handleCreateAssessment(session, 'session')}
                          >
                            <ClipboardPlus className="me-2" />
                            Create Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <>
          {acceptedMatches.length === 0 ? (
            <div className="alert alert-info">
              You don't have any accepted or completed matches yet. Accepted matches will appear here.
            </div>
          ) : (
            <div className="row g-3">
              {acceptedMatches.map((match) => {
                const teacherUser = users[match.teacher] || {};
                const learnerUser = users[match.learner] || {};
                const skillInfo = skills[match.skill] || {};
                const isTeacher = userId === match.teacher;
                const otherUser = isTeacher ? learnerUser : teacherUser;
                
                return (
                  <div key={match._id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="badge bg-primary">
                            {match.status === 'completed' ? 'Completed Match' : 'Accepted Match'}
                          </span>
                          <span className="text-muted small">
                            {formatDate(match.updatedAt)}
                          </span>
                        </div>
                        
                        <h5 className="card-title fw-bold mb-3">
                          {skillInfo.title || 'Skill Match'}
                        </h5>
                        
                        <div className="d-flex align-items-center mb-2">
                          <PersonFill className="text-primary me-2" />
                          <span>
                            <span className="text-muted">
                              {isTeacher ? 'Learner' : 'Teacher'}:
                            </span>{' '}
                            <strong>
                              {otherUser.firstName} {otherUser.lastName}
                            </strong>
                          </span>
                        </div>
                        
                        {match.matchReason && (
                          <div className="alert alert-light p-2 mb-3 small">
                            <strong>Match reason:</strong> {match.matchReason.slice(0, 60)}
                            {match.matchReason.length > 60 ? '...' : ''}
                          </div>
                        )}
                        
                        <div className="d-grid">
                          <button 
                            className="btn btn-outline-primary d-flex align-items-center justify-content-center" 
                            onClick={() => handleCreateAssessment(match, 'match')}
                          >
                            <ClipboardPlus className="me-2" />
                            Create Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompletedSessionsList;