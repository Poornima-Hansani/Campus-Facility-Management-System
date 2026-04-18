import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentRoute from "./components/StudentRoute";
import StaffRoute from "./components/StaffRoute";
import { Home, LogIn, UserPlus } from 'lucide-react';
import TaskDashboardPage from "./pages/TaskDashboardPage";
import LectureAvailabilityPage from "./pages/LectureAvailabilityPage";
import TimetablePage from "./pages/TimetablePage";
import AssignmentExamPage from "./pages/AssignmentExamPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import GpaTrackerPage from "./pages/GpaTrackerPage";
import ManagementDashboard from "./pages/ManagementDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UnifiedLoginPage from './pages/UnifiedLoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import ReportingDashboard from './pages/ReportingDashboard';
import ReportIssue from './pages/ReportIssue';
import ReportHistory from './pages/ReportHistory';
import AllIssues from './pages/AllIssues';
import StaffDashboard from './pages/StaffDashboard';
import LecturerDashboard from './pages/LecturerDashboard';
import TimetableBuilderPage from './pages/TimetableBuilderPage';
import TimetablePrintPage from './pages/TimetablePrintPage';
import StudyAreaBooking from './pages/StudyAreaBooking';
import LabBooking from "./pages/LabBooking";
import LabTimetableList from "./pages/LabTimetableList";
import LabTimetableView from "./pages/LabTimetableView";
import EnergyAlertsPage from "./pages/EnergyAlertsPage";

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === '/') {
    return null;
  }
  
  const isLoggedIn = !!localStorage.getItem('unifiedUserId');
  const role = localStorage.getItem('unifiedRole');
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive(path) 
        ? 'bg-[#004905] text-white shadow-md' 
        : 'text-gray-600 hover:bg-[#004905]/10 hover:text-[#004905]'
    }`;

  const handleLogout = () => {
    localStorage.clear(); // Clear all unified and legacy tokens
    navigate('/');
  };

  const getDashboardRoute = () => {
    switch (role) {
      case 'student': return '/student';
      case 'lecturer': return '/lecturer-dashboard';
      case 'management': return '/management-dashboard';
      case 'staff': return '/staff/dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center py-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="UniManage Logo" className="h-20 w-auto" />
            <span className="ml-3 text-xl font-bold text-gray-900">UNIMANAGE</span>
          </Link>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link to={getDashboardRoute()} className={linkClass(getDashboardRoute())}>
                  <Home size={18} />
                  <span className="hidden sm:inline">My Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className={linkClass('/login')}>
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-sm transition-colors">
                  <UserPlus size={18} className="sm:hidden" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<UnifiedLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* We keep the inner dashboards but remove the old unneeded logins */}
        <Route path="/student" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><StudentDashboard /></main>
        } />
        <Route path="/reporting" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ReportingDashboard /></main>
        } />
        <Route path="/reporting/add" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ReportIssue /></main>
        } />
        <Route path="/reporting/view" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ReportHistory /></main>
        } />
        <Route path="/study-booking" element={
          <StudentRoute>
            <StudyAreaBooking />
          </StudentRoute>
        } />
        <Route path="/lab-booking" element={
          <StudentRoute>
            <LabBooking />
          </StudentRoute>
        } />
        
        <Route path="/management/issues" element={
          <AllIssues />
        } />
        <Route path="/management-dashboard" element={
          <ManagementDashboard />
        } />
        
        <Route path="/staff/dashboard" element={
          <StaffRoute>
            <StaffDashboard />
          </StaffRoute>
        } />
        
        <Route path="/lecturer-dashboard" element={
          <ProtectedRoute role="lecturer">
            <LecturerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/timetable-builder" element={
          <ProtectedRoute role={["lecturer", "management"]}>
            <TimetableBuilderPage />
          </ProtectedRoute>
        } />
        
        <Route path="/timetable-print/:year/:semester/:batch/:specialization/:group" element={
          <ProtectedRoute role="lecturer">
            <TimetablePrintPage />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <StudentRoute>
            <TaskDashboardPage />
          </StudentRoute>
        } />
        <Route path="/lecture-availability" element={
          <StudentRoute>
            <LectureAvailabilityPage />
          </StudentRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/energy-alerts" element={
          <ProtectedRoute role="admin">
            <EnergyAlertsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/labtimetables" element={
          <ProtectedRoute role="admin">
            <LabTimetableList />
          </ProtectedRoute>
        } />
        <Route path="/admin/labtimetables/:lab" element={
          <ProtectedRoute role="admin">
            <LabTimetableView />
          </ProtectedRoute>
        } />
        <Route path="/timetable" element={
          <ProtectedRoute role="admin">
            <TimetablePage />
          </ProtectedRoute>
        } />
        <Route path="/assignments-exams" element={
          <StudentRoute>
            <AssignmentExamPage />
          </StudentRoute>
        } />
        <Route path="/study-goals" element={
          <StudentRoute>
            <StudyGoalsPage />
          </StudentRoute>
        } />
        <Route path="/gpa-tracker" element={
          <StudentRoute>
            <GpaTrackerPage />
          </StudentRoute>
        } />
        <Route path="/help-requests" element={
          <StudentRoute>
            <HelpRequestPage />
          </StudentRoute>
        } />
      </Routes>
    </>
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
