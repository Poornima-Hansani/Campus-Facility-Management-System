import React from 'react';
import '../styles/admin.css';

const AdminNavbar = ({ handleLogout }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="admin-navbar">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Facility Management System</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="user-info">
          <p className="name">{user.name || 'Admin User'}</p>
          <p className="email">{user.email || 'admin@example.com'}</p>
        </div>

        <div className="user-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
