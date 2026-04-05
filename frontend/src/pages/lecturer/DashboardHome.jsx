import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalTimetables: 0,
    todaySlots: 0,
    upcomingSlots: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch basic stats - you can expand this based on your API
        const timetablesRes = await api.get('/api/timetables');
        setStats({
          totalTimetables: timetablesRes.data.length,
          todaySlots: 0, // You can calculate this based on current date
          upcomingSlots: 0 // You can calculate this based on future dates
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="lecturer-dashboard-home">
      <div className="dashboard-header">
        <h1>Lecturer Dashboard</h1>
        <p>Welcome back! Here's your overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{stats.totalTimetables}</h3>
            <p>Total Timetables</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.todaySlots}</h3>
            <p>Today's Slots</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔜</div>
          <div className="stat-info">
            <h3>{stats.upcomingSlots}</h3>
            <p>Upcoming Slots</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <a href="/lecturer-dashboard/timetables" className="action-btn primary">
              <span className="btn-icon">➕</span>
              Create New Timetable
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lecturer-dashboard-home {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          margin: 0 0 10px 0;
          color: #1a202c;
          font-size: 32px;
        }

        .dashboard-header p {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
          border-radius: 12px;
        }

        .stat-info h3 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #1a202c;
        }

        .stat-info p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .dashboard-actions {
          margin-top: 30px;
        }

        .action-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .action-card h3 {
          margin: 0 0 16px 0;
          color: #1a202c;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .action-btn.primary {
          background: #064e3b;
          color: white;
        }

        .action-btn.primary:hover {
          background: #022c22;
          transform: translateY(-1px);
        }

        .btn-icon {
          font-size: 16px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #064e3b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
