import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentRoute from "./components/StudentRoute";
import StaffRoute from "./components/StaffRoute";
import Navigation from "./components/Navigation";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import LectureAvailabilityPage from "./pages/LectureAvailabilityPage";
import AssignmentExamPage from "./pages/AssignmentExamPage";
import StudyGoalsPage from "./pages/StudyGoalsPage";
import HelpRequestPage from "./pages/HelpRequestPage";
import GpaTrackerPage from "./pages/GpaTrackerPage";
import AdminDashboard from "./pages/AdminDashboard";
import UnifiedLoginPage from './pages/UnifiedLoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import ReportingDashboard from './pages/ReportingDashboard';
import ReportIssue from './pages/ReportIssue';
import ReportHistory from './pages/ReportHistory';
import MyResultsPage from "./pages/MyResultsPage";
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
import SmartBookingHubPage from "./pages/SmartBookingHubPage";

// Management pages
import ManagementDashboard from "./pages/management/ManagementDashboard";
import FacilityPage from "./pages/management/FacilityPage";
import TimetablePage from "./pages/management/TimetablePage";
import StaffPage from "./pages/management/StaffPage";
import EmailsPage from "./pages/management/EmailsPage";
import LecturerListPage from "./pages/management/LecturerListPage";
import MeetingsPage from "./pages/management/MeetingsPage";

import AddLectureNotesPage from "./pages/lecturer/AddLectureNotesPage";
import QRAttendancePage from "./pages/lecturer/QRAttendancePage";
import LecturerMeetingsPage from "./pages/lecturer/LecturerMeetingsPage";
import LectureNotesPage from "./pages/Student/LectureNotesPage";
import AttendanceScanPage from "./pages/Student/AttendanceScanPage";

function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<UnifiedLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* We keep the inner dashboards but remove the old unneeded logins */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/reporting" element={<ReportingDashboard />} />
        <Route path="/reporting/add" element={<ReportIssue />} />
        <Route path="/reporting/view" element={<ReportHistory />} />
        <Route path="/study-booking" element={
          <StudentRoute>
            <StudyAreaBooking />
          </StudentRoute>
        } />
        <Route path="/lab-booking" element={
          <StudentRoute>
            <LabBooking />
</StudentRoute>
        }
        />
        
        <Route path="/management/facility" element={
          <ProtectedRoute role="management">
            <FacilityPage />
          </ProtectedRoute>
        } />
        <Route path="/management/timetable" element={
          <ProtectedRoute role="management">
            <TimetablePage />
          </ProtectedRoute>
        } />
        <Route path="/management/staff" element={
          <ProtectedRoute role="management">
            <StaffPage />
          </ProtectedRoute>
        } />
        <Route path="/management/lecturers" element={
          <ProtectedRoute role="management">
            <LecturerListPage />
          </ProtectedRoute>
        } />
        <Route path="/management/meetings" element={
          <ProtectedRoute role="management">
            <MeetingsPage />
          </ProtectedRoute>
        } />
        <Route path="/management/emails" element={
          <ProtectedRoute role="management">
            <EmailsPage />
          </ProtectedRoute>
        } />
        <Route path="/management/issues" element={
          <AllIssues />
        } />
        <Route path="/management-dashboard" element={
          <ProtectedRoute role="management">
            <ManagementDashboard />
          </ProtectedRoute>
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
        
        <Route path="/lecturer/notes" element={
          <ProtectedRoute role="lecturer">
            <AddLectureNotesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/lecturer/attendance" element={
          <ProtectedRoute role="lecturer">
            <QRAttendancePage />
          </ProtectedRoute>
        } />
        
        <Route path="/lecturer/meetings" element={
          <ProtectedRoute role="lecturer">
            <LecturerMeetingsPage />
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
        <Route path="/smart-booking" element={
          <StudentRoute>
            <SmartBookingHubPage />
          </StudentRoute>
        } />
        <Route path="/admin-dashboard" element={
          <AdminDashboard />
        } />
        <Route path="/admin-dashboard-protected" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/energy-alerts" element={
          <ProtectedRoute role={["admin", "management"]}>
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
        <Route path="/my-results" element={
          <StudentRoute>
            <MyResultsPage />
          </StudentRoute>
        } />
        <Route path="/study-goals" element={
          <StudentRoute>
            <StudyGoalsPage />
          </StudentRoute>
        } />
        <Route path="/lecture-notes" element={
          <StudentRoute>
            <LectureNotesPage />
          </StudentRoute>
        } />
        <Route path="/attendance" element={
          <AttendanceScanPage />
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
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
