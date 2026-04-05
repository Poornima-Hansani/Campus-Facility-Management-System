import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/admin.css';

const AdminDashboard = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar handleLogout={handleLogout} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminNavbar handleLogout={handleLogout} />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;