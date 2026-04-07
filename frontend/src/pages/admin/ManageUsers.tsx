import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState('');
  const [messageModalType, setMessageModalType] = useState(''); // success, error, confirm
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  
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

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    setPendingDeleteId(id);
    setMessageModalContent('Are you sure you want to delete this user? This action cannot be undone.');
    setMessageModalType('confirm');
    setShowMessageModal(true);
  };

  const confirmDelete = async () => {
    setShowMessageModal(false);
    try {
      await api.delete(`/api/users/${pendingDeleteId}`);
      setUsers(users.filter(u => u._id !== pendingDeleteId));
      setMessageModalContent('User deleted successfully!');
      setMessageModalType('success');
      setShowMessageModal(true);
      setTimeout(() => setShowMessageModal(false), 3000);
    } catch (err) {
      setMessageModalContent('Delete failed: ' + (err.response?.data?.message || err.message));
      setMessageModalType('error');
      setShowMessageModal(true);
      setTimeout(() => setShowMessageModal(false), 3000);
    }
    setPendingDeleteId(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
    setEditSuccess('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditSuccess('');
    
    try {
      const response = await api.put(`/api/users/${editingUser._id}`, editingUser);
      setUsers(users.map(u => u._id === editingUser._id ? response.data : u));
      setEditSuccess('User updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditSuccess('');
      }, 2000);
    } catch (err) {
      setEditSuccess('Update failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setEditLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.faculty && user.faculty.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getUserStats = () => {
    const total = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const lecturers = users.filter(u => u.role === 'lecturer').length;
    const admins = users.filter(u => u.role === 'admin').length;
    return { total, students, lecturers, admins };
  };

  const stats = getUserStats();

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
          <p className="loading-text">Loading users...</p>
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
      <div className="manage-users-container">
        {/* Header */}
        <div className="users-header">
          <div className="header-content">
            <div className="header-icon">👥</div>
            <div className="header-text">
              <h1>User Management</h1>
              <p>Manage and monitor system users</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total-users" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          
          <div className="stat-card students" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon">🎓</div>
            <div className="stat-content">
              <div className="stat-number">{stats.students}</div>
              <div className="stat-label">Students</div>
            </div>
          </div>
          
          <div className="stat-card lecturers" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-content">
              <div className="stat-number">{stats.lecturers}</div>
              <div className="stat-label">Lecturers</div>
            </div>
          </div>
          
          <div className="stat-card admins" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon">👑</div>
            <div className="stat-content">
              <div className="stat-number">{stats.admins}</div>
              <div className="stat-label">Admins</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users by name, email, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
          
          <div className="filters">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users ({stats.total})</option>
              <option value="student">Students ({stats.students})</option>
              <option value="lecturer">Lecturers ({stats.lecturers})</option>
              <option value="admin">Admins ({stats.admins})</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="users-grid">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <div 
                key={user._id} 
                className="user-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="user-header">
                  <div className="user-avatar">
                    <div className="avatar-circle">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={`role-indicator ${user.role}`}></div>
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <div className="user-role-badge">
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="user-details">
                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <span className="detail-text">{user.email}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-icon">🏫</span>
                    <span className="detail-text">{user.faculty || 'Not specified'}</span>
                  </div>
                  
                  {user.year && (
                    <div className="detail-item">
                      <span className="detail-icon">📚</span>
                      <span className="detail-text">Year {user.year}, Sem {user.semester}</span>
                    </div>
                  )}
                  
                  {user.contactNumber && (
                    <div className="detail-item">
                      <span className="detail-icon">📱</span>
                      <span className="detail-text">{user.contactNumber}</span>
                    </div>
                  )}
                </div>

                <div className="user-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(user)}
                  >
                    <span className="edit-icon">✏️</span>
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(user._id)}
                  >
                    <span className="delete-icon">🗑️</span>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
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
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
          }
          50% {
            transform: translateY(0) rotate(180deg);
          }
          75% {
            transform: translateY(20px) rotate(270deg);
          }
        }

        /* Main Container */
        .manage-users-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        
        /* Header */
        .users-header {
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
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
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
          background: linear-gradient(45deg, #064e3b, #022c22, #064e3b);
          border-radius: 20px;
          z-index: -1;
          animation: shimmer 3s infinite;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.8s ease-out;
          animation-fill-mode: both;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card.total-users {
          border-left: 4px solid #064e3b;
        }

        .stat-card.students {
          border-left: 4px solid #059669;
        }

        .stat-card.lecturers {
          border-left: 4px solid #1d4ed8;
        }

        .stat-card.admins {
          border-left: 4px solid #d97706;
        }

        .stat-icon {
          font-size: 32px;
          animation: bounce 2s infinite;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Search and Filters */
        .search-filters-section {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          align-items: center;
          flex-wrap: wrap;
          animation: slideInUp 0.7s ease-out;
        }

        .search-bar {
          display: flex;
          align-items: center;
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 15px 50px 15px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.9);
          color: #1a202c;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #064e3b;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }

        .search-icon {
          position: absolute;
          right: 20px;
          font-size: 20px;
          color: #6b7280;
          animation: pulse 2s ease-in-out infinite;
        }

        .filters {
          display: flex;
          gap: 15px;
        }

        .filter-select {
          padding: 10px 15px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.9);
          color: #1a202c;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:hover {
          border-color: #064e3b;
          transform: translateY(-1px);
        }

        /* Users Grid */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
          animation: slideInUp 0.9s ease-out;
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          animation: fadeInScale 0.8s ease-out;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.6;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          font-size: 24px;
          color: #1a202c;
        }

        .empty-state p {
          margin: 0;
          font-size: 16px;
          opacity: 0.8;
        }

        /* User Cards */
        .user-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: zoomIn 0.8s ease-out;
          animation-fill-mode: both;
          animation-delay: var(--animation-delay, 0s);
          transition: all 0.3s ease;
        }

        .user-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .user-avatar {
          position: relative;
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
        }

        .role-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
        }

        .role-indicator.student {
          background: #10b981;
        }

        .role-indicator.lecturer {
          background: #3b82f6;
        }

        .role-indicator.admin {
          background: #f59e0b;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1a202c;
        }

        .user-role-badge {
          display: flex;
          align-items: center;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-badge.student {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .role-badge.lecturer {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .role-badge.admin {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #6b7280;
        }

        .detail-icon {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }

        .detail-text {
          flex: 1;
        }

        .user-actions {
          display: flex;
          gap: 10px;
        }

        .edit-btn {
          flex: 1;
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .edit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .delete-btn {
          flex: 1;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .edit-icon, .delete-icon {
          font-size: 14px;
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

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .manage-users-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }

          .search-filters-section {
            flex-direction: column;
            gap: 15px;
          }

          .search-bar {
            min-width: 100%;
          }

          .filters {
            width: 100%;
          }

          .filter-select {
            width: 100%;
          }

          .users-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .user-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .user-actions {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideInUp 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '25px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#064e3b'
              }}>
                ✏️ Edit User
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            {editSuccess && (
              <div style={{
                background: editSuccess.includes('successfully') ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {editSuccess}
              </div>
            )}

            <form onSubmit={handleUpdateUser}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingUser.name || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Role
                </label>
                <select
                  name="role"
                  value={editingUser.role || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  required
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editingUser.role === 'student' && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Faculty
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      value={editingUser.faculty || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Year
                    </label>
                    <input
                      type="text"
                      name="year"
                      value={editingUser.year || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Semester
                    </label>
                    <input
                      type="text"
                      name="semester"
                      value={editingUser.semester || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Group
                    </label>
                    <input
                      type="text"
                      name="group"
                      value={editingUser.group || ''}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={editingUser.contactNumber || ''}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: editLoading ? '#9ca3af' : '#064e3b',
                    color: 'white',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {editLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideInUp 0.3s ease-out'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {messageModalType === 'confirm' && '⚠️'}
              {messageModalType === 'success' && '✅'}
              {messageModalType === 'error' && '❌'}
            </div>
            <p style={{
              margin: '0 0 25px 0',
              fontSize: '16px',
              color: '#374151',
              lineHeight: '1.5',
              textAlign: 'center'
            }}>
              {messageModalContent}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              {messageModalType === 'confirm' && (
                <>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Confirm Delete
                  </button>
                </>
              )}
              {(messageModalType === 'success' || messageModalType === 'error') && (
                <button
                  onClick={() => setShowMessageModal(false)}
                  style={{
                    background: messageModalType === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
