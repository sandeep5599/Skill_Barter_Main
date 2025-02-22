import React, { useState } from 'react';
import axios from 'axios';

export default function SkillForm() {
  const [skill, setSkill] = useState({
    name: '',
    level: 'Beginner',
    type: 'teaching'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/skills', skill, {
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