import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const BookingManagement = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [studyAreas, setStudyAreas] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [bookingsResponse, usersResponse, studyAreasResponse] = await Promise.all([
          api.get('/api/bookings'),
          api.get('/api/users'),
          api.get('/api/study-areas')
        ]);
        const bookingsData = bookingsResponse.data || [];
        const usersData = usersResponse.data || [];
        const studyAreasData = studyAreasResponse.data || [];
        console.log('=== FRONTEND DEBUG ===');
        console.log('Bookings received:', bookingsData.length);
        console.log('Users received:', usersData.length);
        console.log('Study areas received:', studyAreasData.length);
        if (bookingsData.length > 0) {
          console.log('Sample booking:', bookingsData[0]);
        }
        setBookings(bookingsData);
        setUsers(usersData);
        setStudyAreas(studyAreasData);
      } catch (error) {
        console.error('Failed to load data from database:', error);
        setBookings([]);
        setUsers([]);
        setStudyAreas([]);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const filterBookings = useCallback(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const userName = booking.student && typeof booking.student === 'object' 
          ? booking.student.name 
          : '';
        const userEmail = booking.student && typeof booking.student === 'object' 
          ? booking.student.email 
          : '';
        const areaName = booking.studyArea && typeof booking.studyArea === 'object' 
          ? booking.studyArea.name 
          : '';
        
        return (
          userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.day.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.purpose && booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Area filter
    if (filterArea !== 'all') {
      filtered = filtered.filter(booking => {
        return booking.studyArea && typeof booking.studyArea === 'object' 
          ? booking.studyArea._id === filterArea
          : false;
      });
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(booking => booking.date === filterDate);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, filterArea, filterDate]);

  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  const getUserName = (booking) => {
    if (booking.student && typeof booking.student === 'object') {
      return booking.student.name || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getUserEmail = (booking) => {
    if (booking.student && typeof booking.student === 'object') {
      return booking.student.email || 'unknown@university.edu';
    }
    return 'unknown@university.edu';
  };

  const getAreaName = (booking) => {
    if (booking.studyArea && typeof booking.studyArea === 'object') {
      return booking.studyArea.name || 'Unknown Area';
    }
    return 'Unknown Area';
  };

  const getAreaDetails = (booking) => {
    if (booking.studyArea && typeof booking.studyArea === 'object') {
      return {
        capacity: booking.studyArea.capacity || 0,
        location: booking.studyArea.location || 'unknown'
      };
    }
    return { capacity: 0, location: 'unknown' };
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/api/bookings/${bookingId}`);
        setBookings(bookings.filter(b => b._id !== bookingId));
        setSuccessMessage('Booking deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

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
          <p className="loading-text">Loading bookings...</p>
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
      <div className="booking-container">
        {/* Header */}
        <div className="header">
          <h2>📋 Booking Management</h2>
          <p>Manage all facility bookings</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card total-users">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
          
          <div className="stat-card students">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <div className="stat-number">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
          
          <div className="stat-card lecturers">
            <div className="stat-icon">🏫</div>
            <div className="stat-info">
              <div className="stat-number">{studyAreas.length}</div>
              <div className="stat-label">Study Areas</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
          
          <div className="stat-card timetables">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <div className="stat-number">{filteredBookings.length}</div>
              <div className="stat-label">Filtered Results</div>
            </div>
            <div className="stat-decoration"></div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="filter-group">
            <select
              className="filter-select"
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
            >
              <option value="all">All Areas</option>
              {studyAreas.map(area => (
                <option key={area._id} value={area._id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <input
              type="date"
              className="filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {/* Table Header */}
        <div className="table-header">
          <h2>Bookings ({filteredBookings.length})</h2>
        </div>

        {/* Bookings Table */}
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Study Area</th>
                <th>Day</th>
                <th>Time</th>
                <th>Date</th>
                <th>Purpose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {getUserName(booking).charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{getUserName(booking)}</div>
                        <div className="user-email">{getUserEmail(booking)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="area-cell">
                      <div className="area-name">{getAreaName(booking)}</div>
                      <div className="area-details">
                        {getAreaDetails(booking).location} • 
                        Capacity: {getAreaDetails(booking).capacity}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="day-badge">{booking.day}</span>
                  </td>
                  <td>
                    <div className="time-cell">
                      <span className="time-from">{booking.from}</span>
                      <span className="time-separator">-</span>
                      <span className="time-to">{booking.to}</span>
                    </div>
                  </td>
                  <td>
                    <span className="date-badge">{booking.date}</span>
                  </td>
                  <td>
                    <div className="purpose-cell">
                      {booking.purpose || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(booking)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteBooking(booking._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Booking Details Modal */}
        {showDetails && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📋 Booking Details</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowDetails(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h4>👤 User Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{getUserName(selectedBooking)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{getUserEmail(selectedBooking)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>🏫 Study Area Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Area:</span>
                      <span className="detail-value">{getAreaName(selectedBooking)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{getAreaDetails(selectedBooking).location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">{getAreaDetails(selectedBooking).capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>📅 Booking Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Day:</span>
                      <span className="detail-value">{selectedBooking.day}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{selectedBooking.from} - {selectedBooking.to}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{selectedBooking.date}</span>
                    </div>
                    <div className="detail-item full-width">
                      <span className="detail-label">Purpose:</span>
                      <span className="detail-value">{selectedBooking.purpose || 'N/A'}</span>
                    </div>
                    {selectedBooking.notes && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{selectedBooking.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={() => {
                    handleDeleteBooking(selectedBooking._id);
                    setShowDetails(false);
                  }}
                  className="modal-btn delete-btn"
                >
                  Delete Booking
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="modal-btn close-modal-btn"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
        .booking-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        /* Header */
        .header {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          padding: 25px 30px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 30px;
        }

        .header h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header p {
          margin: 5px 0 0 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
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
          border-left: 4px solid #064e3b;
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
          background: rgba(4, 120, 87, 0.1);
          border-radius: 0 20px 0 60px;
          animation: slideInRight 1s ease-out;
        }

        /* Success Message */
        .success-message {
          background: #10b981;
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-weight: 600;
          text-align: center;
          animation: slideInUp 0.3s ease-out;
        }

        /* Filters */
        .filters-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
        }

        .filter-group {
          flex: 1;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 10px 15px;
        }

        .search-icon {
          color: #6b7280;
          margin-right: 10px;
          font-size: 16px;
        }

        .search-input {
          border: none;
          outline: none;
          background: transparent;
          color: #1a202c;
          font-size: 14px;
          width: 200px;
        }

        .search-input::placeholder {
          color: #6b7280;
        }

        .search-input:focus {
          outline: none;
          border-color: #064e3b;
        }

        .filter-select,
        .filter-input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 10px 12px;
          color: #1a202c;
          font-size: 14px;
          font-weight: 500;
        }

        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: #064e3b;
        }

        /* Table */
        .table-header {
          margin-bottom: 20px;
        }

        .table-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #10b981;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bookings-table th {
          background: rgba(4, 120, 87, 0.1);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .bookings-table td {
          padding: 15px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #374151;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.02);
        }

        .bookings-table tbody tr {
          transition: all 0.3s ease;
        }

        .bookings-table tbody tr:hover {
          background: rgba(4, 120, 87, 0.05);
          transform: scale(1.01);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #064e3b, #022c22);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 20px rgba(4, 120, 87, 0.3);
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          color: #10b981;
          margin-bottom: 2px;
        }

        .user-email {
          font-size: 12px;
          color: #10b981;
        }

        .area-cell {
          display: flex;
          flex-direction: column;
        }

        .area-name {
          font-weight: 600;
          color: #10b981;
          margin-bottom: 2px;
        }

        .area-details {
          font-size: 12px;
          color: #10b981;
        }

        .day-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .time-cell {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .time-from {
          font-weight: 600;
          color: #10b981;
        }

        .time-separator {
          color: #10b981;
        }

        .time-to {
          font-weight: 600;
          color: #10b981;
        }

        .date-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .purpose-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #10b981;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          gap: 8px;
        }

        .action-btn {
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border: 1px solid transparent;
        }

        .view-btn {
          background: rgba(4, 120, 87, 0.1);
          color: #064e3b;
          border: 1px solid #064e3b;
        }

        .view-btn:hover {
          background: #064e3b;
          color: white;
          transform: translateY(-2px);
        }

        .delete-btn {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border: 1px solid #dc2626;
        }

        .delete-btn:hover {
          background: #dc2626;
          color: white;
          transform: translateY(-2px);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 0;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: slideInUp 0.3s ease-out;
        }

        .modal-header {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          padding: 20px 30px;
          border-radius: 15px 15px 0 0;
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.3s ease;
        }

        .modal-body {
          padding: 30px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: 25px;
        }

        .detail-section h4 {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 600;
          color: #064e3b;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .detail-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 12px;
        }

        .detail-value {
          color: #1a202c;
          font-weight: 500;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 20px 30px;
        }

        .modal-btn {
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          border: 1px solid transparent;
        }

        .modal-btn.delete-btn {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border: 1px solid #dc2626;
        }

        .modal-btn.delete-btn:hover {
          background: #dc2626;
          color: white;
          transform: translateY(-2px);
        }

        .close-modal-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.3s ease;
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .booking-container {
            padding: 15px;
          }

          .stats-overview {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .filters-section {
            flex-direction: column;
          }

          .filter-group {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .booking-container {
            padding: 10px;
          }

          .stats-overview {
            grid-template-columns: 1fr;
          }

          .table-wrapper {
            overflow-x: scroll;
          }

          .bookings-table {
            min-width: 600px;
          }

          .modal-content {
            padding: 20px;
            margin: 20px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BookingManagement;
