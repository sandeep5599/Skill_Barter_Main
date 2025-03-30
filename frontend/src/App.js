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
import SearchPage from './pages/SearchPage';
import TeacherProfilePage from './pages/TeacherProfilePage';
import FeatureUnavailable from './components/FeatureUnavailable';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <NotificationProvider>
          <GlobalStyles />
          <ToastContainer position="top-right" autoClose={5000} />
          <Routes>
            {/* Existing routes */}
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
            <Route path="/search" element={<SearchPage />} />
            <Route path="/teacher/:teacherId" element={<TeacherProfilePage />} />
            
            {/* New routes for upcoming features */}
            <Route path="/leaderboard" element={<PrivateRoute><FeatureUnavailable featureName="leaderboard" /></PrivateRoute>} />
            <Route path="/profile/assessment" element={<PrivateRoute><FeatureUnavailable featureName="assessment" /></PrivateRoute>} />
            
            {/* Premium features route */}
            <Route path="/premium/*" element={<PrivateRoute><FeatureUnavailable featureName="premium" /></PrivateRoute>} />
            
            {/* Generic "coming soon" route for any other undeveloped features */}
            <Route path="/coming-soon/*" element={<PrivateRoute><FeatureUnavailable /></PrivateRoute>} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;