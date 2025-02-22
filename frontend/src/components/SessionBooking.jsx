import React, { useState } from 'react';
import axios from 'axios';

export default function SessionBooking({ teacherId, skillId }) {
  const [sessionData, setSessionData] = useState({
    scheduledTime: '',
    duration: 60
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/sessions', {
        ...sessionData,
        teacherId,
        skillId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Update UI
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}