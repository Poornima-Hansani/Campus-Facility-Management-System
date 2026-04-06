import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentRoute from "./components/StudentRoute";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import LectureAvailabilityPage from "./pages/LectureAvailabilityPage";
import TimetablePage from "./pages/TimetablePage";
import AssignmentExamPage from "./pages/AssignmentExamPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import GpaTrackerPage from "./pages/GpaTrackerPage";
import ManagementDashboard from "./pages/ManagementDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ManagementLogin from "./pages/ManagementLogin";
import ReportingDashboard from "./pages/ReportingDashboard";

function HomeRedirect() {
  const { isAdmin } = useAuth();
  return (
    <Navigate
      to={isAdmin ? "/admin-dashboard" : "/dashboard"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/management-login" element={<ManagementLogin />} />
      <Route path="/home" element={<HomeRedirect />} />
      <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
      <Route path="/reporting-dashboard" element={<StudentRoute><ReportingDashboard /></StudentRoute>} />
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
      <Route path="/management/dashboard" element={<ManagementDashboard />} />
      <Route path="/lecturer" element={<TaskDashboardPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route
        path="/dashboard"
        element={
          <StudentRoute>
            <TaskDashboardPage />
          </StudentRoute>
        }
      />
      <Route
        path="/lecture-availability"
        element={
          <StudentRoute>
            <LectureAvailabilityPage />
          </StudentRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable"
        element={
          <ProtectedRoute role="admin">
            <TimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments-exams"
        element={
          <StudentRoute>
            <AssignmentExamPage />
          </StudentRoute>
        }
      />
      <Route
        path="/study-goals"
        element={
          <StudentRoute>
            <StudyGoalsPage />
          </StudentRoute>
        }
      />
      <Route
        path="/gpa-tracker"
        element={
          <StudentRoute>
            <GpaTrackerPage />
          </StudentRoute>
        }
      />
      <Route
        path="/help-requests"
        element={
          <StudentRoute>
            <HelpRequestPage />
          </StudentRoute>
        }
      />
      <Route
        path="/management-dashboard"
        element={
          <ProtectedRoute role="admin">
            <ManagementDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
