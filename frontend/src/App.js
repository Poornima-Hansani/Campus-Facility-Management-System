import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

import AdminDashboard from './pages/AdminDashboard';
import DashboardHome from './pages/admin/DashboardHome';
import ManageUsers from './pages/admin/ManageUsers';
import StudentTimetables from './pages/admin/StudentTimetables';
import EditTimetable from './pages/admin/EditTimetable';
import Labs from './pages/admin/Labs';
import BookingManagement from './pages/admin/BookingManagement';
import StudyAreas from './pages/admin/StudyAreas'; // 

import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/StudentDashboard';
import StudentBooking from './pages/StudentBooking';

import './App.css';

import LecturerDashboard from './pages/LecturerDashboard';
import LecturerDashboardHome from './pages/lecturer/DashboardHome';
import TimetableManagement from './pages/lecturer/TimetableManagement';

function App() {
  return (
    <Router>
      <Routes>

        {/* AUTH */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="timetables/:id" element={<EditTimetable />} />
          <Route path="student-timetables" element={<StudentTimetables />} />
          <Route path="labs" element={<Labs />} />
          <Route path="study-areas" element={<StudyAreas />} /> 
          <Route path="bookings" element={<BookingManagement />} /> 
        </Route>

        {/* LECTURER */}
        <Route
          path="/lecturer-dashboard"
          element={
            <ProtectedRoute role="lecturer">
              <LecturerDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<LecturerDashboardHome />} />
          <Route path="timetables" element={<TimetableManagement />} />
        </Route>

        {/* STUDENT */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-dashboard/booking"
          element={
            <ProtectedRoute role="student">
              <StudentBooking />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;