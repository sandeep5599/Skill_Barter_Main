import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ClipboardCheck, 
  ListCheck,
  ArrowLeft,
  CheckCircle,
  Save,
  XCircle
} from 'react-bootstrap-icons';
import Loading from '../common/Loading';
import Error from '../common/Error';

const CreateSessionAssessment = ({ userId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    criteria: [{ criterion: '', weight: 10 }],
    relatedSession: '',
    relatedMatch: '',
    skillId: '',
    targetUserId: '',
    dueDate: ''
  });
  
  // State for dropdown selections
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState('');
  const [skills, setSkills] = useState({});
  const [users, setUsers] = useState({});

  useEffect(() => {
    // If we have state from navigation
    if (location.state?.selectedItem && location.state?.itemType) {
      setSelectedItem(location.state.selectedItem);
      setSelectedItemType(location.state.itemType);
      
      // Pre-fill form based on item type
      if (location.state.itemType === 'session') {
        const session = location.state.selectedItem;
        setFormData(prev => ({
          ...prev,
          relatedSession: session._id,
          skillId: session.skill,
          // Set the other user as the target
          targetUserId: userId === session.teacher ? session.learner : session.teacher,
          title: `Assessment for ${session.title || 'Session'}`,
          dueDate: getDefaultDueDate()
        }));
      } else if (location.state.itemType === 'match') {
        const match = location.state.selectedItem;
        setFormData(prev => ({
          ...prev,
          relatedMatch: match._id,
          skillId: match.skill,
          // Set the other user as the target
          targetUserId: userId === match.teacher ? match.learner : match.teacher,
          title: `Assessment for ${match.title || 'Match'}`,
          dueDate: getDefaultDueDate()
        }));
      }
    }
    
    fetchData();
  }, [location.state, userId]);
  
  // Helper function to get default due date (2 weeks from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch completed sessions
      const sessionsResponse = await axios.get(`/api/sessions/user/${userId}`);
      const completedSessions = sessionsResponse.data.sessions.filter(
        session => session.status === 'completed'
      );
      setSessions(completedSessions);
      
      // Fetch accepted matches
      const matchesResponse = await axios.get(`/api/matches/user/${userId}`);
      const acceptedMatches = matchesResponse.data.matches.filter(
        match => match.status === 'accepted' || match.status === 'completed'
      );
      setMatches(acceptedMatches);
      
      // Collect all user and skill IDs
      const userIds = new Set();
      const skillIds = new Set();
      
      completedSessions.forEach(session => {
        userIds.add(session.teacher);
        userIds.add(session.learner);
        if (session.skill) skillIds.add(session.skill);
      });
      
      acceptedMatches.forEach(match => {
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
      console.error('Error fetching data:', err);
      setError('Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    const updatedCriteria = [...formData.criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      criteria: updatedCriteria
    }));
  };

  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, { criterion: '', weight: 10 }]
    }));
  };

  const removeCriterion = (index) => {
    if (formData.criteria.length > 1) {
      const updatedCriteria = formData.criteria.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        criteria: updatedCriteria
      }));
    }
  };

  const handleSessionSelect = (e) => {
    const sessionId = e.target.value;
    if (!sessionId) {
      setSelectedItem(null);
      setSelectedItemType('');
      return;
    }
    
    const selectedSession = sessions.find(s => s._id === sessionId);
    setSelectedItem(selectedSession);
    setSelectedItemType('session');
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      relatedSession: sessionId,
      relatedMatch: '',
      skillId: selectedSession.skill,
      targetUserId: userId === selectedSession.teacher ? selectedSession.learner : selectedSession.teacher,
      title: `Assessment for ${skills[selectedSession.skill]?.title || 'Session'}`
    }));
  };

  const handleMatchSelect = (e) => {
    const matchId = e.target.value;
    if (!matchId) {
      setSelectedItem(null);
      setSelectedItemType('');
      return;
    }
    
    const selectedMatch = matches.find(m => m._id === matchId);
    setSelectedItem(selectedMatch);
    setSelectedItemType('match');
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      relatedMatch: matchId,
      relatedSession: '',
      skillId: selectedMatch.skill,
      targetUserId: userId === selectedMatch.teacher ? selectedMatch.learner : selectedMatch.teacher,
      title: `Assessment for ${skills[selectedMatch.skill]?.title || 'Match'}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.instructions || 
        (!formData.relatedSession && !formData.relatedMatch) || 
        !formData.skillId || !formData.targetUserId) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate criteria
    // Validate criteria
  const isValidCriteria = formData.criteria.every(c => c.criterion.trim() !== '' && c.weight > 0);
  if (!isValidCriteria) {
    setError('Each criterion must have a description and a positive weight');
    return;
  }
  
  // Ensure weights add up to 100
  const totalWeight = formData.criteria.reduce((sum, c) => sum + parseFloat(c.weight), 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    setError('Criteria weights must sum to 100');
    return;
  }
  
  try {
    setSubmitting(true);
    setError('');
    
    const payload = {
      ...formData,
      createdBy: userId,
      status: 'pending'
    };
    
    const response = await axios.post('/api/assessments', payload);
    
    setSuccessMessage('Assessment created successfully!');
    
    // Redirect after short delay
    setTimeout(() => {
      navigate(`/assessments/${response.data.assessment._id}`);
    }, 1500);
    
  } catch (err) {
    console.error('Error creating assessment:', err);
    setError(err.response?.data?.message || 'Failed to create assessment');
  } finally {
    setSubmitting(false);
  }
};

const handleCancel = () => {
  navigate(-1);
};

if (loading) {
  return <Loading message="Loading assessment data..." />;
}

return (
  <div className="container mx-auto p-4 max-w-3xl">
    <div className="flex items-center mb-6">
      <button 
        className="text-blue-600 flex items-center" 
        onClick={handleCancel}
      >
        <ArrowLeft className="mr-1" /> Back
      </button>
      <h1 className="text-2xl font-bold text-center flex-grow">Create Assessment</h1>
    </div>
    
    {error && (
      <Error message={error} onClose={() => setError('')} />
    )}
    
    {successMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
        <CheckCircle className="mr-2" />
        <span>{successMessage}</span>
      </div>
    )}
    
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ListCheck className="mr-2" /> Select What to Assess
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="sessionSelect" className="block text-gray-700 text-sm font-bold mb-2">
              From a Session
            </label>
            <select
              id="sessionSelect"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.relatedSession}
              onChange={handleSessionSelect}
              disabled={!!formData.relatedMatch}
            >
              <option value="">-- Select a Session --</option>
              {sessions.map(session => (
                <option key={session._id} value={session._id}>
                  {session.title || `Session with ${users[userId === session.teacher ? session.learner : session.teacher]?.name || 'User'}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="matchSelect" className="block text-gray-700 text-sm font-bold mb-2">
              From a Match
            </label>
            <select
              id="matchSelect"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.relatedMatch}
              onChange={handleMatchSelect}
              disabled={!!formData.relatedSession}
            >
              <option value="">-- Select a Match --</option>
              {matches.map(match => (
                <option key={match._id} value={match._id}>
                  {match.title || `Match with ${users[userId === match.teacher ? match.learner : match.teacher]?.name || 'User'}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {selectedItem && (
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm font-semibold">Selected {selectedItemType}:</p>
            <p className="text-sm">
              {selectedItem.title || `${selectedItemType} with ${users[formData.targetUserId]?.name || 'User'}`}
            </p>
            <p className="text-sm">
              Skill: {skills[formData.skillId]?.title || 'Unknown'}
            </p>
            <p className="text-sm">
              Assessing: {users[formData.targetUserId]?.name || 'Unknown User'}
            </p>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <ClipboardCheck className="mr-2" /> Assessment Details
        </h2>
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="instructions" className="block text-gray-700 text-sm font-bold mb-2">
            Instructions for Recipient*
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-gray-700 text-sm font-bold mb-2">
            Due Date*
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Assessment Criteria</h2>
        <p className="text-sm text-gray-600 mb-4">Criteria weights must sum to 100</p>
        
        {formData.criteria.map((criterion, index) => (
          <div key={index} className="flex gap-3 mb-4 items-start">
            <div className="flex-grow">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Criterion {index + 1}*
              </label>
              <textarea
                value={criterion.criterion}
                onChange={(e) => handleCriteriaChange(index, 'criterion', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Weight*
              </label>
              <input
                type="number"
                value={criterion.weight}
                onChange={(e) => handleCriteriaChange(index, 'weight', parseFloat(e.target.value) || 0)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="1"
                max="100"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => removeCriterion(index)}
              className="mt-8 p-1 text-red-500 hover:text-red-700"
              disabled={formData.criteria.length <= 1}
              title="Remove criterion"
            >
              <XCircle />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addCriterion}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Criterion
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          disabled={submitting}
        >
          {submitting ? (
            <>Submitting...</>
          ) : (
            <>
              <Save className="mr-2" /> Create Assessment
            </>
          )}
        </button>
      </div>
    </form>
  </div>
);
};

export default CreateSessionAssessment;