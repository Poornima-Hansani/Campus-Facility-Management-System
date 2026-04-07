import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin-dashboard', icon: '📊' },
    { id: 'users', label: 'Manage Users', path: '/admin-dashboard/users', icon: '👥' },
    { id: 'student-timetables', label: 'Student Timetables', path: '/admin-dashboard/student-timetables', icon: '🧑‍🎓' },
    { id: 'labs', label: 'Labs', path: '/admin-dashboard/labs', icon: '🔬' },

    // ✅ NEW STUDY AREA MENU
    { id: 'study-areas', label: 'Study Areas', path: '/admin-dashboard/study-areas', icon: '🏫' },

    // ✅ NEW BOOKING MANAGEMENT MENU
    { id: 'bookings', label: 'Bookings', path: '/admin-dashboard/bookings', icon: '📋' },
  ];

  const getActiveSection = () => {
    const path = location.pathname;

    if (path === '/admin-dashboard') return 'dashboard';

    const last = path.split('/').pop();
    return last || 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
        <p>Facility Management System</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div onClick={handleLogout} className="nav-item logout">
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;