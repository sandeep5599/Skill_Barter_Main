import api from './api';

export const register = async (credentials) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

// export const login = async (credentials) => {
//   const response = await api.post('/auth/login', credentials);
//   return response.data;
// };

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    console.log("Login API Response:", response.data); // Debugging
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};
