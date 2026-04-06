import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LecturerSidebar from '../components/LecturerSidebar';
import DashboardHome from './lecturer/DashboardHome';
import TimetableManagement from './lecturer/TimetableManagement';

const LecturerDashboard = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="lecturer-dashboard">
      <LecturerSidebar handleLogout={handleLogout} />
      <div className="lecturer-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="timetables" element={<TimetableManagement />} />
          <Route path="*" element={<Navigate to="/lecturer-dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default LecturerDashboard;
