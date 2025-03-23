// services/requestService.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Fetch learner requests
export const fetchLearnerRequests = async (userId) => {
  const response = await fetch(`${BACKEND_URL}/api/matches?role=student`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${localStorage.getItem('token')}` 
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch requests: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Filter matches to include only relevant ones where the user is the student
  const learnerRequests = data.filter(match => 
    ['pending', 'rescheduled', 'accepted', 'rejected'].includes(match.status) &&
    match.requesterId === userId // Make sure user is the student
  );
  
  console.log('Fetched requests:', data);
  console.log('Filtered learner requests:', learnerRequests);
  
  return learnerRequests;
};

// Update request status - UPDATED to match your backend endpoint structure
export const updateRequestStatus = async (requestId, status, reason = null) => {
  try {
    // Using the correct endpoint format from your router
    const response = await fetch(`${BACKEND_URL}/api/matches/${requestId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ 
        status, 
        ...(reason && { rejectionReason: reason }) 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: errorData.message || `Failed to update status: ${response.statusText}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating request status:', error);
    return { success: false, message: error.message };
  }
};