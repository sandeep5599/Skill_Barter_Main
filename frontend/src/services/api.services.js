// src/services/api.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Helper function to handle API errors
const handleApiError = async (response) => {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || `API Error: ${response.statusText}`);
};

// Authentication header
const getAuthHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

// Fetch teaching requests
export const fetchTeachingRequests = async (userId) => {
  if (!userId) return [];
  
  const response = await fetch(`${BACKEND_URL}/api/matches?role=teacher`, {
    method: 'GET',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return data.filter(match => 
    ['pending', 'rescheduled', 'accepted', 'rejected'].includes(match.status) &&
    match.teacherId === userId
  );
};

// Fetch learning requests
export const fetchLearningRequests = async (userId) => {
  if (!userId) return [];
  
  const response = await fetch(`${BACKEND_URL}/api/matches?role=student`, {
    method: 'GET',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  const data = await response.json();
  return data.filter(match => 
    ['pending', 'rescheduled', 'accepted', 'rejected'].includes(match.status) &&
    match.studentId === userId
  );
};

// Update match status
export const updateMatchStatus = async (matchId, updateData) => {
  const response = await fetch(`${BACKEND_URL}/api/matches/${matchId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Create a session
export const createSession = async (sessionData) => {
  const response = await fetch(`${BACKEND_URL}/api/sessions`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(sessionData)
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Mark session as completed
export const completeSession = async (sessionId) => {
  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/complete`, {
    method: 'PUT',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Submit teacher feedback (no rating)
export const submitTeacherFeedback = async (sessionId, feedback) => {
  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/teacher-feedback`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ feedback })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Submit student feedback with rating
export const submitStudentFeedback = async (sessionId, rating, feedback) => {
  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/student-feedback`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ rating, feedback })
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Fetch session details
export const fetchSessionDetails = async (sessionId) => {
  const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
    method: 'GET',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Fetch all sessions for a user
export const fetchUserSessions = async (role) => {
  const response = await fetch(`${BACKEND_URL}/api/sessions?role=${role}`, {
    method: 'GET',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return await response.json();
};

// Add this to your api.services.js file
export const confirmSession = async (sessionId, confirmationData) => {
  const response = await fetch(`/api/sessions/${sessionId}/confirm`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(confirmationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm session');
  }
  
  return response.json();
};

// Add this to your api.services.js
export const updateSession = async (sessionId, sessionData) => {
  const response = await fetch(`/api/sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sessionData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update session');
  }
  
  return response.json();
};