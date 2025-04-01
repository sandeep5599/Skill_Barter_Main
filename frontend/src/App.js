import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import LandingPage from "./components/LandingPage";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import MatchingInterface from "./components/MatchingInterface";
import ProfileManagement from "./components/ProfileManagement";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TeachingRequests from "./components/TeachingRequests";
import LearnerRequests from "./components/LearnerRequests";
import SessionDetails from "./components/SessionDetails";
import SessionsList from "./components/SessionsList";
import GlobalStyles from "./styles/GlobalStyles";
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import AssessmentDashboard from "./components/assessment/AssessmentDashboard";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <GlobalStyles />
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/match/learning" element={<PrivateRoute><MatchingInterface /></PrivateRoute>} />
            <Route path="/match/teaching-requests" element={<PrivateRoute><TeachingRequests /></PrivateRoute>} />
            <Route path="/match/learning-requests" element={<PrivateRoute><LearnerRequests /></PrivateRoute>} />
            <Route path="/sessions" element={<PrivateRoute><SessionsList /></PrivateRoute>} />
            <Route path="/sessions/:sessionId" element={<PrivateRoute><SessionDetails /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfileManagement /></PrivateRoute>} />
            <Route path="/assessments" element={<PrivateRoute><AssessmentDashboard /></PrivateRoute>} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
