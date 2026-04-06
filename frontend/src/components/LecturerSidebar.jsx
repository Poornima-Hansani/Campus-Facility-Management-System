import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LecturerSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/lecturer-dashboard', icon: '📊' },
    { id: 'timetables', label: 'Manage Timetables', path: '/lecturer-dashboard/timetables', icon: '📅' },
  ];

  const getActiveSection = () => {
    const path = location.pathname;

    if (path === '/lecturer-dashboard') return 'dashboard';

    const last = path.split('/').pop();
    return last || 'dashboard';
  };

  const activeSection = getActiveSection();

  return (
    <div className="lecturer-sidebar">
      <div className="sidebar-header">
        <h3>Lecturer Panel</h3>
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

      <style jsx>{`
        .lecturer-sidebar {
          width: 250px;
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          color: white;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          padding: 30px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 700;
        }

        .sidebar-header p {
          margin: 0;
          font-size: 12px;
          opacity: 0.8;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-left-color: #10b981;
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          border-left-color: #10b981;
        }

        .nav-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-item.logout {
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          margin: 0 20px;
        }

        .nav-item.logout:hover {
          background: rgba(239, 68, 68, 0.2);
          border-left-color: transparent;
        }

        @media (max-width: 768px) {
          .lecturer-sidebar {
            width: 200px;
          }
          
          .sidebar-header {
            padding: 20px 15px;
          }
          
          .nav-item {
            padding: 12px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default LecturerSidebar;
