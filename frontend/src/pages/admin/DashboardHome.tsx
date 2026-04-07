import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [theme, setTheme] = useState('professional'); // 'modern', 'professional', 'minimal', 'corporate'

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/users');
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    const fetchTimetables = async () => {
      try {
        const res = await api.get('/api/timetables');
        setTimetables(res.data);
      } catch (err) {
        console.error('Failed to load timetables:', err);
      }
    };

    const fetchBookingData = async () => {
      try {
        const res = await api.get('/api/bookings');
        const bookings = res.data || [];
        
        // Process real booking data to group by day
        const dayStats = {};
        const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        // Initialize all days with 0 bookings
        daysOfWeek.forEach(day => {
          dayStats[day] = 0;
        });
        
        // Count bookings by day
        bookings.forEach(booking => {
          let dayKey = '';
          switch(booking.day) {
            case 'Monday': dayKey = 'Mon'; break;
            case 'Tuesday': dayKey = 'Tue'; break;
            case 'Wednesday': dayKey = 'Wed'; break;
            case 'Thursday': dayKey = 'Thu'; break;
            case 'Friday': dayKey = 'Fri'; break;
            case 'Saturday': dayKey = 'Sat'; break;
            case 'Sunday': dayKey = 'Sun'; break;
          }
          if (dayKey && dayStats[dayKey] !== undefined) {
            dayStats[dayKey]++;
          }
        });
        
        // Convert to chart format
        const chartData = daysOfWeek.map(day => ({
          day: day,
          bookings: dayStats[day]
        }));
        
        setBookingData(chartData);
      } catch (err) {
        console.error('Failed to load booking data:', err);
        // Fallback to empty data instead of mock data
        setBookingData([
          { day: 'Mon', bookings: 0 },
          { day: 'Tue', bookings: 0 },
          { day: 'Wed', bookings: 0 },
          { day: 'Thu', bookings: 0 },
          { day: 'Fri', bookings: 0 },
          { day: 'Sat', bookings: 0 },
          { day: 'Sun', bookings: 0 }
        ]);
      }
    };

    fetchUsers();
    fetchTimetables();
    fetchBookingData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
        <style jsx>{`
          .loading-container {
            text-align: center;
            animation: fadeInUp 0.8s ease-out;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          .loading-text {
            color: white;
            font-size: 18px;
            font-weight: 600;
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
        </div>
        <style jsx>{`
          .error-container {
            text-align: center;
            animation: fadeInUp 0.8s ease-out;
          }
          
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
            animation: shake 0.5s ease-in-out;
          }
          
          .error-title {
            color: white;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 10px 0;
          }
          
          .error-message {
            color: rgba(255, 255, 255, 0.8);
            font-size: 16px;
            margin: 0;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      {/* Main Container */}
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-icon">📊</div>
            <div className="header-text">
              <h1>Analytics Dashboard</h1>
              <p>Real-time facility insights</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card total-users" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
          
          <div className="stat-card students" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-number">{users.filter(u => u.role === 'student').length}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
          
          <div className="stat-card lecturers" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-info">
              <div className="stat-number">{users.filter(u => u.role === 'lecturer').length}</div>
              <div className="stat-label">Lecturers</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
          
          <div className="stat-card timetables" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-number">{timetables.length}</div>
              <div className="stat-label">Timetables</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content">
          {/* Chart Section */}
          <div className="chart-section" style={{ animationDelay: '0.5s' }}>
            <div className="section-header">
              <div className="section-icon">📈</div>
              <h2>Weekly Trend</h2>
            </div>
            <div className="chart-container">
              <svg width="100%" height="100%" viewBox="0 0 400 250">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 40" fill="none" stroke="rgba(5, 150, 105, 0.1)" strokeWidth="1"/>
                  </pattern>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#064e3b" stopOpacity="0.8"/>
                    <stop offset="50%" stopColor="#022c22" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#065f46" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
                
                {/* Animated line */}
                <polyline
                  points={bookingData.map((day, index) => 
                    `${50 + index * 50},${200 - (day.bookings / Math.max(...bookingData.map(d => d.bookings))) * 150}`
                  ).join(' ')}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ 
                    filter: 'drop-shadow(0 4px 20px rgba(5, 150, 105, 0.4))',
                    animation: 'drawLine 3s ease-in-out forwards',
                    strokeDasharray: 1000,
                    strokeDashoffset: 1000
                  }}
                />
                
                {/* Animated points with bounce effect */}
                {bookingData.map((day, index) => (
                  <g key={`point-${index}`}>
                    <circle
                      cx={50 + index * 50}
                      cy={200 - (day.bookings / Math.max(...bookingData.map(d => d.bookings))) * 150}
                      r="6"
                      fill="#064e3b"
                      stroke="white"
                      strokeWidth="3"
                      style={{ 
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 4px 20px rgba(5, 150, 105, 0.4))',
                        animation: `bouncePoint ${0.6 + index * 0.1}s ease-out forwards`,
                        transform: 'scale(0)',
                      }}
                      title={`${day.day}: ${day.bookings} bookings`}
                    />
                    {/* Pulsing circle effect */}
                    <circle
                      cx={50 + index * 50}
                      cy={200 - (day.bookings / Math.max(...bookingData.map(d => d.bookings))) * 150}
                      r="6"
                      fill="none"
                      stroke="#064e3b"
                      strokeWidth="2"
                      style={{ 
                        animation: `pulseRing ${1.1 + index * 0.1}s ease-in-out infinite`,
                        opacity: '0.6'
                      }}
                    />
                    <text
                      x={50 + index * 50}
                      y={225}
                      fontSize="12"
                      textAnchor="middle"
                      fill="#022c22"
                      fontWeight="600"
                      style={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        animation: `slideInUp ${1.3 + index * 0.15}s ease-out forwards`,
                        opacity: '0',
                        transform: 'translateY(10px)',
                        transformOrigin: `${50 + index * 50}px ${225}px`
                      }}
                    >
                      {day.day}
                    </text>
                    <text
                      x={50 + index * 50}
                      y={250}
                      fontSize="10"
                      textAnchor="middle"
                      fill="#064e3b"
                      fontWeight="700"
                      style={{ 
                        animation: `zoomIn ${1.7 + index * 0.15}s ease-out forwards`,
                        opacity: '0',
                        transform: 'scale(0)',
                        transformOrigin: `${50 + index * 50}px ${250}px`
                      }}
                    >
                      {day.bookings}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions" style={{ animationDelay: '0.6s' }}>
            <div className="section-header">
              <div className="section-icon">⚡</div>
              <h2>Quick Actions</h2>
            </div>
            
            <div className="actions-grid">
              <div 
                className="action-card labs"
                onClick={() => navigate('/admin-dashboard/labs')}
              >
                <div className="action-icon">🔬</div>
                <div className="action-content">
                  <h3>Labs</h3>
                  <p>Manage laboratories</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div 
                className="action-card study-areas"
                onClick={() => navigate('/admin-dashboard/study-areas')}
              >
                <div className="action-icon">🏫</div>
                <div className="action-content">
                  <h3>Study Areas</h3>
                  <p>Manage facilities</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div 
                className="action-card timetables"
                onClick={() => navigate('/admin-dashboard/student-timetables')}
              >
                <div className="action-icon">📅</div>
                <div className="action-content">
                  <h3>Timetables</h3>
                  <p>View schedules</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div 
                className="action-card users"
                onClick={() => navigate('/admin-dashboard/manage-users')}
              >
                <div className="action-icon">👥</div>
                <div className="action-content">
                  <h3>Users</h3>
                  <p>Manage accounts</p>
                </div>
                <div className="action-arrow">→</div>
              </div>

              <div 
                className="action-card bookings"
                onClick={() => navigate('/admin-dashboard/bookings')}
              >
                <div className="action-icon">📋</div>
                <div className="action-content">
                  <h3>Bookings</h3>
                  <p>View all bookings</p>
                </div>
                <div className="action-arrow">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Styles */}
      <style jsx>{`
        /* Background Animations */
        .bg-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 60px;
          height: 60px;
          top: 70%;
          left: 80%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          top: 40%;
          left: 60%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 40px;
          height: 40px;
          top: 20%;
          left: 70%;
          animation-delay: 6s;
        }

        .shape-5 {
          width: 70px;
          height: 70px;
          top: 80%;
          left: 20%;
          animation-delay: 8s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-30px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(0) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translateY(30px) rotate(270deg) scale(1.05);
          }
        }

        /* Main Container */
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        /* Theme Switcher */
        .theme-switcher {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 15px 20px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.5s ease-out;
        }

        .theme-label {
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .theme-options {
          display: flex;
          gap: 10px;
        }

        .theme-btn {
          padding: 8px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .theme-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
        }

        /* Header */
        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          animation: slideInDown 0.6s ease-out;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon {
          font-size: 48px;
          animation: bounce 2s infinite;
        }

        .header-text h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          background: ${theme === 'modern' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' :
                     theme === 'professional' ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' :
                     theme === 'minimal' ? 'linear-gradient(135deg, #047857 0%, #059669 100%)' :
                     theme === 'corporate' ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' :
                     'linear-gradient(135deg, #059669 0%, #047857 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .header-text p {
          margin: 5px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .header-decoration {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: ${theme === 'modern' ? 'linear-gradient(45deg, #059669, #047857, #065f46)' :
                     theme === 'professional' ? 'linear-gradient(45deg, #064e3b, #022c22, #064e3b)' :
                     theme === 'minimal' ? 'linear-gradient(45deg, #047857, #059669, #10b981)' :
                     theme === 'corporate' ? 'linear-gradient(45deg, #064e3b, #022c22, #064e3b)' :
                     'linear-gradient(45deg, #059669, #047857, #065f46)'};
          border-radius: 20px;
          z-index: -1;
          animation: shimmer 3s infinite;
        }

        /* Stats Overview */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
          animation: slideInUp 0.8s ease-out;
          animation-fill-mode: both;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card.total-users {
          border-left: 4px solid ${theme === 'modern' ? '#059669' :
                                   theme === 'professional' ? '#064e3b' :
                                   theme === 'minimal' ? '#047857' :
                                   theme === 'corporate' ? '#064e3b' :
                                   '#059669'};
        }

        .stat-card.students {
          border-left: 4px solid #10b981;
        }

        .stat-card.lecturers {
          border-left: 4px solid #3b82f6;
        }

        .stat-card.timetables {
          border-left: 4px solid #8b5cf6;
        }

        .stat-icon {
          font-size: 32px;
          margin-bottom: 15px;
          animation: bounce 2s infinite;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 60px;
          height: 60px;
          background: ${theme === 'modern' ? 'rgba(5, 150, 105, 0.1)' :
                     theme === 'professional' ? 'rgba(6, 78, 59, 0.1)' :
                     theme === 'minimal' ? 'rgba(4, 120, 87, 0.1)' :
                     theme === 'corporate' ? 'rgba(6, 78, 59, 0.1)' :
                     'rgba(5, 150, 105, 0.1)'};
          border-radius: 0 20px 0 60px;
          animation: slideInRight 1s ease-out;
        }

        /* Main Content */
        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        /* Chart Section */
        .chart-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.8s ease-out;
          animation-fill-mode: both;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
        }

        .section-icon {
          font-size: 24px;
          animation: bounce 2s infinite;
        }

        .section-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: ${theme === 'modern' ? '#059669' :
                     theme === 'professional' ? '#064e3b' :
                     theme === 'minimal' ? '#047857' :
                     theme === 'corporate' ? '#064e3b' :
                     '#059669'};
        }

        .chart-container {
          height: 250px;
          position: relative;
        }

        /* Quick Actions */
        .quick-actions {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.8s ease-out;
          animation-fill-mode: both;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 15px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }

        .action-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .action-card.labs:hover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        .action-card.study-areas:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .action-card.timetables:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .action-card.users:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .action-card.bookings:hover {
          border-color: #0891b2;
          background: rgba(8, 145, 178, 0.05);
        }

        .action-icon {
          font-size: 28px;
          animation: bounce 2s infinite;
        }

        .action-content {
          flex: 1;
        }

        .action-content h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: 700;
          color: #1a202c;
        }

        .action-content p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .action-arrow {
          font-size: 20px;
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .action-card:hover .action-arrow {
          transform: translateX(5px);
          color: ${theme === 'modern' ? '#059669' :
                     theme === 'professional' ? '#064e3b' :
                     theme === 'minimal' ? '#047857' :
                     theme === 'corporate' ? '#064e3b' :
                     '#059669'};
        }

        /* Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-15px) scale(1.1);
          }
          60% {
            transform: translateY(-7px) scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(0deg);
          }
          50% {
            transform: translateX(0%) rotate(180deg);
          }
          100% {
            transform: translateX(100%) rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes bouncePoint {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          75% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
        }

        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes drawLine {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .main-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .stats-overview {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }

          .actions-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 20px;
          }

          .chart-section,
          .quick-actions {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHome;
