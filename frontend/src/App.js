import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import MatchingInterface from './components/MatchingInterface';
import ProfileManagement from './components/ProfileManagement';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TeachingRequests from './components/TeachingRequests';

function App() {
  return (
    <AuthProvider>
     
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/match/learning" element={<MatchingInterface />} />
          <Route path="/match/teaching" element={<TeachingRequests />} />
          <Route path="/profile" element={<ProfileManagement />} />  
        </Routes>

    </AuthProvider>
  );
}

export default App;