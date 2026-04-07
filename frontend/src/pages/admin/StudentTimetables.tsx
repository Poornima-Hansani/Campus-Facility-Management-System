import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const StudentTimetables = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');

  useEffect(() => {
    loadTimetables();
  }, []);

  const loadTimetables = async () => {
    try {
      const res = await api.get('/api/timetables');
      setTimetables(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTimetable = async (id) => {
    if (!window.confirm('Delete this timetable?')) return;
    
    // Add delete animation
    const element = document.getElementById(`timetable-${id}`);
    if (element) {
      element.style.animation = 'fadeOutScale 0.5s ease-out';
      setTimeout(() => {
        api.delete(`/api/timetables/${id}`);
        loadTimetables();
      }, 500);
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/admin-dashboard/timetables/${id}`;
  };

  const filteredTimetables = timetables.filter(tt => {
    const matchesSearch = searchTerm === '' || 
      tt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tt.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFaculty = filterFaculty === 'all' || tt.faculty === filterFaculty;
    const matchesYear = filterYear === 'all' || tt.year === parseInt(filterYear);
    const matchesSemester = filterSemester === 'all' || tt.semester === parseInt(filterSemester);
    
    return matchesSearch && matchesFaculty && matchesYear && matchesSemester;
  });

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
          <p className="loading-text">Loading timetables...</p>
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
      <div className="modern-container">
        {/* Header */}
        <div className="modern-header">
          <div className="header-content">
            <div className="header-icon">📚</div>
            <div className="header-text">
              <h1>Student Timetables</h1>
              <p>Manage and view all class schedules</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search timetables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
          
          <div className="filters">
            <select 
              value={filterFaculty} 
              onChange={(e) => setFilterFaculty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Faculties</option>
              <option value="Faculty of Computing">Faculty of Computing</option>
              <option value="Faculty of Engineering">Faculty of Engineering</option>
              <option value="Faculty of Business">Faculty of Business</option>
            </select>
            
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
            
            <select 
              value={filterSemester} 
              onChange={(e) => setFilterSemester(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        {/* Timetables Grid */}
        <div className="timetables-grid">
          {filteredTimetables.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No timetables found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTimetables.map((tt, index) => (
              <div 
                key={tt._id} 
                id={`timetable-${tt._id}`}
                className="timetable-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <h3>{tt.title}</h3>
                    <div className="card-meta">
                      <span className="meta-item">
                        <span className="meta-icon">🏫</span>
                        {tt.faculty}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📖</span>
                        Year {tt.year}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📚</span>
                        Semester {tt.semester}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => handleEdit(tt._id)}
                      className="action-btn edit-btn"
                    >
                      <span className="btn-icon">✏️</span>
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteTimetable(tt._id)}
                      className="action-btn delete-btn"
                    >
                      <span className="btn-icon">🗑️</span>
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  {tt.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="day-section">
                      <div className="day-header">
                        <div className="day-name">{day.day}</div>
                        <div className="day-badge">
                          {day.slots.length} {day.slots.length === 1 ? 'slot' : 'slots'}
                        </div>
                      </div>
                      
                      <div className="slots-container">
                        {day.slots.map((slot, slotIndex) => (
                          <div 
                            key={slotIndex} 
                            className="slot-item"
                            style={{ animationDelay: `${slotIndex * 0.05}s` }}
                          >
                            <div className="slot-time">
                              <span className="time-icon">⏰</span>
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="slot-details">
                              <div className="slot-lab">
                                <span className="lab-icon">🔬</span>
                                Lab {slot.labNumber}
                              </div>
                              <div className="slot-lecturer">
                                <span className="lecturer-icon">👨‍🏫</span>
                                {slot.lecturer?.name || 'Not assigned'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
        .modern-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        /* Header */
        .modern-header {
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

        /* Search and Filters */
        .search-filters-section {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.7s ease-out;
        }

        .search-bar {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          position: relative;
        }

        .search-input {
          flex: 1;
          padding: 15px 50px 15px 20px;
          border: 2px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.9);
          color: #1a202c;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #064e3b;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 15px;
          border: 2px solid rgba(16, 185, 129, 0.2);
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

        /* Timetables Grid */
        .timetables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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

        /* Timetable Cards */
        .timetable-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: fadeInScale 0.6s ease-out;
          animation-fill-mode: both;
          animation-delay: var(--animation-delay, 0s);
          transition: all 0.3s ease;
        }

        .timetable-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .card-title h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          opacity: 0.9;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-icon {
          font-size: 16px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          padding: 10px 15px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .edit-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-icon {
          font-size: 14px;
        }

        /* Card Content */
        .card-content {
          padding: 25px;
        }

        .day-section {
          margin-bottom: 20px;
          animation: slideInLeft 0.6s ease-out;
          animation-fill-mode: both;
          animation-delay: calc(var(--animation-delay, 0s) + 0.2s);
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(16, 185, 129, 0.1);
          padding: 12px 15px;
          border-radius: 10px;
          margin-bottom: 15px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .day-name {
          font-weight: 600;
          color: #064e3b;
          font-size: 16px;
        }

        .day-badge {
          background: rgba(16, 185, 129, 0.2);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .slots-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .slot-item {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          animation: slideInUp 0.5s ease-out;
          animation-fill-mode: both;
          animation-delay: calc(var(--animation-delay, 0s) + 0.1s);
        }

        .slot-item:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.1);
          background: rgba(255, 255, 255, 0.95);
        }

        .slot-time {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 600;
          color: #064e3b;
        }

        .time-icon {
          font-size: 16px;
        }

        .slot-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .slot-lab {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #059669;
          font-weight: 500;
        }

        .lab-icon {
          font-size: 14px;
        }

        .slot-lecturer {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 14px;
        }

        .lecturer-icon {
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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        @keyframes fadeOutScale {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.8);
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
          .modern-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .filters {
            flex-direction: column;
            gap: 10px;
          }

          .filter-select {
            width: 100%;
          }

          .timetables-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .card-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .card-actions {
            justify-content: center;
          }

          .slot-details {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentTimetables;