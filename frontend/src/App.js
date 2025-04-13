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
import SubmitAssessment from "./components/assessment/SubmitAssessment"; 
import GlobalStyles from "./styles/GlobalStyles";
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import AssessmentDashboard from "./components/assessment/AssessmentDashboard";
import Leaderboard from "./components/LeaderboardOld";
import SearchPage from "./pages/SearchPage";
import PasswordReset from "./components/PasswordReset";
import TeacherProfilePage from './pages/TeacherProfilePage';
import EvaluateSubmission from "./components/assessment/EvaluateSubmission";  

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
            <Route path="/assessments/*" element={<PrivateRoute><AssessmentDashboard /></PrivateRoute>} />
            <Route path="/assessment/:assessmentId/submit" element={<PrivateRoute><SubmitAssessment /></PrivateRoute>} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/forgot-password" element={<PasswordReset />} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/teacher/:teacherId" element={<TeacherProfilePage />} />
            // Route for the list of submissions to evaluate
            <Route path="/assessments/evaluate" element={<PrivateRoute><EvaluateSubmission /></PrivateRoute>} />
            // Route for evaluating a specific submission
            <Route path="/assessments/evaluate/:submissionId" element={<PrivateRoute><EvaluateSubmission /></PrivateRoute>} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
