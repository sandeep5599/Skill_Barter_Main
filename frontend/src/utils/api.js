// src/utils/api.js
import { BACKEND_URL } from '../components/profile/shared/constants';

export const fetchUserProfile = async (userId, token) => {
  try {
    // First, fetch skills
    const skillsResponse = await fetch(`${BACKEND_URL}/api/skills/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!skillsResponse.ok) throw new Error('Failed to fetch skills');
    const skillsData = await skillsResponse.json();

    // Then, fetch user details
    const userResponse = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!userResponse.ok) throw new Error('Failed to fetch user profile');
    const userData = await userResponse.json();

    return {
      teachingSkills: skillsData.teachingSkills || [], 
      learningSkills: skillsData.learningSkills || [],
      name: userData.name || '',
      email: userData.email || '',
      country: userData.country || '',
      hasSecurityQuestions: userData.securityQuestions && userData.securityQuestions.length > 0,
      joinedDate: userData.createdAt || new Date(),
      matchesCompleted: userData.matchesCompleted || 0,
      securityQuestions: userData.securityQuestions || []
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const addSkill = async (skillData, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(skillData),
    });

    if (!response.ok) throw new Error('Failed to add skill');
    return await response.json();
  } catch (error) {
    console.error('Error adding skill:', error);
    throw error;
  }
};

export const removeSkill = async (skillId, token) => {
  try {
    // First, delete the skill
    const deleteSkillResponse = await fetch(`${BACKEND_URL}/api/skills/${skillId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!deleteSkillResponse.ok) throw new Error('Failed to delete skill');

    // Then, delete any matches associated with this skill
    const deleteMatchesResponse = await fetch(`${BACKEND_URL}/api/matches/by-skill/${skillId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!deleteMatchesResponse.ok) throw new Error('Failed to delete associated matches');
    
    return true;
  } catch (error) {
    console.error('Error removing skill:', error);
    throw error;
  }
};

export const updateProfile = async (profileData, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile/update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updateSecurityQuestions = async (securityQuestions, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile/security-questions`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ securityQuestions }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update security questions');
    }

    return data;
  } catch (error) {
    console.error('Error updating security questions:', error);
    throw error;
  }
};