import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentRoute from "./components/StudentRoute";
import { Home, Shield, LogIn, Wrench } from 'lucide-react';
import TaskDashboardPage from "./pages/TaskDashboardPage";
import LectureAvailabilityPage from "./pages/LectureAvailabilityPage";
import TimetablePage from "./pages/TimetablePage";
import AssignmentExamPage from "./pages/AssignmentExamPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import GpaTrackerPage from "./pages/GpaTrackerPage";
import ManagementDashboard from "./pages/ManagementDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ReportIssue from './pages/ReportIssue';
import ReportHistory from './pages/ReportHistory';
import StudentDashboard from './pages/StudentDashboard';
import ReportingDashboard from './pages/ReportingDashboard';
import ManagementLogin from './pages/ManagementLogin';
import StudentLogin from './pages/StudentLogin';
import LandingPage from './pages/LandingPage';
import AllIssues from './pages/AllIssues';
import StaffLogin from './pages/StaffLogin';
import StaffRegister from './pages/StaffRegister';
import StaffDashboard from './pages/StaffDashboard';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === '/') {
    return null;
  }
  
  const isStudentLoggedIn = localStorage.getItem('studentLoggedIn') === 'true';
  const isStaffLoggedIn = localStorage.getItem('staffLoggedIn') === 'true';
  
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

  const handleStudentClick = () => {
    if (isStudentLoggedIn) {
      navigate('/student');
    } else {
      navigate('/student-login');
    }
  };

  const handleStaffClick = () => {
    if (isStaffLoggedIn) {
      navigate('/staff/dashboard');
    } else {
      navigate('/staff');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentLoggedIn');
    localStorage.removeItem('studentId');
    localStorage.removeItem('staffLoggedIn');
    localStorage.removeItem('staffId');
    localStorage.removeItem('staffName');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center py-2">
            <img src="/logo.png" alt="UniManage Logo" className="h-20 w-auto" />
            <span className="ml-3 text-xl font-bold text-gray-900">UNIMANAGE</span>
          </Link>
          <div className="flex gap-4">
            <button onClick={handleStudentClick} className={linkClass('/student')}>
              <Home size={18} />
              <span className="hidden sm:inline">Student Portal</span>
            </button>
            <button onClick={handleStaffClick} className={linkClass('/staff')}>
              <Wrench size={18} />
              <span className="hidden sm:inline">Staff Portal</span>
            </button>
            <Link to="/management" className={linkClass('/management')}>
              <Shield size={18} />
              <span className="hidden sm:inline">Management</span>
            </Link>
            {(isStudentLoggedIn || isStaffLoggedIn) && (
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogIn size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

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
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/student" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><StudentDashboard /></main>
        } />
        <Route path="/student-login" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><StudentLogin /></main>
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
        
        <Route path="/management" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ManagementLogin /></main>
        } />
        <Route path="/management/dashboard" element={
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><ManagementDashboard /></main>
        } />
        <Route path="/management/issues" element={
          <AllIssues />
        } />
        <Route path="/management-dashboard" element={
          <ProtectedRoute role="admin">
            <ManagementDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/staff" element={<StaffLogin />} />
        <Route path="/staff/register" element={<StaffRegister />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        
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
