import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const Labs = () => {
  const [labData, setLabData] = useState({});
  const [freeTimeData, setFreeTimeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLecturer, setFilterLecturer] = useState('all');
  const [showFreeTime, setShowFreeTime] = useState(false);
  
  useEffect(() => {
    fetchLabUsage();
  }, []);

  const fetchLabUsage = async () => {
    try {
      console.log('🔄 Starting fetchLabUsage...');
      
      // Get occupied timetables
      const timetablesRes = await api.get('/api/labs/timetable');
      const timetables = timetablesRes.data;
      console.log('📊 Timetables response:', timetables);
      console.log('📊 Timetables count:', timetables.length);

      // Get free time schedules
      const freeTimeRes = await api.get('/api/lab-free-time');
      const freeTimeSchedules = freeTimeRes.data;
      console.log('📊 Free time schedules response:', freeTimeSchedules);

      const map = {};
      const freeTimeMap = {};

      // Process occupied timetables
      timetables.forEach(timetable => {
        if (timetable && timetable.slots) {
          map[timetable.labNumber] = timetable.slots.map(slot => {
            let lecturerName = 'N/A';
            
            if (typeof slot.lecturer === 'string') {
              // Handle stringified object format: "@{_id=...; name=lecturer1; email=lecturer1@sliit.lk}"
              if (slot.lecturer.includes('@{')) {
                const match = slot.lecturer.match(/name=([^;]+)/);
                lecturerName = match ? match[1] : 'N/A';
              } else {
                lecturerName = slot.lecturer;
              }
            } else if (slot.lecturer && slot.lecturer.name) {
              lecturerName = slot.lecturer.name;
            }
            
            return {
              day: slot.day,
              start: slot.startTime,
              end: slot.endTime,
              title: slot.title,
              lecturer: lecturerName,
              type: 'occupied'
            };
          });
          console.log(`✅ Mapped ${timetable.labNumber} with ${timetable.slots.length} occupied slots`);
        } else {
          console.log(`⚠️ No slots data for ${timetable.labNumber}`);
          map[timetable.labNumber] = [];
        }
      });

      // Process free time schedules
      freeTimeSchedules.forEach(schedule => {
        if (schedule && schedule.freeTimeSlots) {
          freeTimeMap[schedule.labNumber] = schedule.freeTimeSlots.map(slot => ({
            day: slot.day,
            start: slot.startTime,
            end: slot.endTime,
            title: slot.reason || 'Available',
            lecturer: 'Free Time',
            type: 'free',
            priority: slot.priority,
            isBookable: slot.isBookable
          }));
          console.log(`✅ Mapped ${schedule.labNumber} with ${schedule.freeTimeSlots.length} free slots`);
        } else {
          console.log(`⚠️ No free time data for ${schedule.labNumber}`);
          freeTimeMap[schedule.labNumber] = [];
        }
      });

      console.log('🎯 Final labData map:', map);
      console.log('🎯 Final freeTimeData map:', freeTimeMap);
      setLabData(map);
      setFreeTimeData(freeTimeMap);
    } catch (err) {
      console.error('❌ Error in fetchLabUsage:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = Object.entries(labData).filter(([lab, slots]) => {
    console.log(`🔍 Filtering lab: ${lab}, slots count: ${slots ? slots.length : 0}`);
    
    // Get current data based on toggle
    const currentData = showFreeTime ? freeTimeData : labData;
    const currentSlots = currentData[lab] || [];
    
    const matchesSearch = searchTerm === '' || 
      lab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentSlots.some(slot => 
        slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (slot.lecturer && slot.lecturer.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    const matchesLecturer = filterLecturer === 'all' || 
      currentSlots.some(slot => {
        let lecturerName = 'N/A';
        
        if (typeof slot.lecturer === 'string') {
          // Handle stringified object format: "@{_id=...; name=lecturer1; email=lecturer1@sliit.lk}"
          if (slot.lecturer.includes('@{')) {
            const match = slot.lecturer.match(/name=([^;]+)/);
            lecturerName = match ? match[1] : 'N/A';
          } else {
            lecturerName = slot.lecturer;
          }
        } else if (slot.lecturer && slot.lecturer.name) {
          lecturerName = slot.lecturer.name;
        }
        
        console.log(`  🔍 Checking slot lecturer: ${lecturerName} vs filter: ${filterLecturer}`);
        return lecturerName === filterLecturer;
      });
    
    const result = matchesSearch && matchesLecturer;
    console.log(`🎯 Lab ${lab} passes filters: ${result}`);
    
    return result;
  });

  const getAllLecturers = () => {
    const lecturers = new Set();
    const currentData = showFreeTime ? freeTimeData : labData;
    Object.values(currentData).forEach(slots => {
      slots.forEach(slot => {
        if (slot.lecturer !== 'N/A' && slot.lecturer !== 'Free Time') {
          lecturers.add(slot.lecturer);
        }
      });
    });
    return Array.from(lecturers);
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
          <p className="loading-text">Loading lab data...</p>
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
      <div className="labs-container">
        {/* Header */}
        <div className="labs-header">
          <div className="header-content">
            <div className="header-icon">🧪</div>
            <div className="header-text">
              <h1>Lab Management</h1>
              <p>Monitor and manage laboratory usage</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder={`Search labs, ${showFreeTime ? 'free time slots' : 'batches'}, or lecturers...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
          
          <div className="filters">
            <button
              onClick={() => setShowFreeTime(!showFreeTime)}
              className={`toggle-button ${showFreeTime ? 'free-time-active' : 'occupied-active'}`}
            >
              {showFreeTime ? '🕒 Free Time' : '📚 Occupied'}
            </button>
            
            <select 
              value={filterLecturer} 
              onChange={(e) => setFilterLecturer(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Lecturers</option>
              {getAllLecturers().map(lecturer => (
                <option key={lecturer} value={lecturer}>{lecturer}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Labs Grid */}
        <div className="labs-grid">
          {(() => {
            console.log('🔍 Rendering debug - filteredLabs:', filteredLabs);
            console.log('🔍 Rendering debug - labData:', labData);
            console.log('🔍 Rendering debug - Object.keys(labData):', Object.keys(labData));
            console.log('🔍 Rendering debug - searchTerm:', searchTerm);
            console.log('🔍 Rendering debug - filterLecturer:', filterLecturer);
            
            if (filteredLabs.length === 0) {
              console.log('❌ RENDERING: No labs found - showing empty state');
              return (
                <div className="empty-state">
                  <div className="empty-icon">🧪</div>
                  <h3>No labs found</h3>
                  <p>Try adjusting your search or filters</p>
                </div>
              );
            }
            
            console.log(`✅ RENDERING: ${filteredLabs.length} labs`);
            return filteredLabs.map(([lab, slots], index) => {
              // Get current data based on toggle
              const currentData = showFreeTime ? freeTimeData : labData;
              const currentSlots = currentData[lab] || [];
              
              return (
                <div 
                  key={lab} 
                  className="lab-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`lab-header ${showFreeTime ? 'free-time-header' : 'occupied-header'}`}>
                    <div className="lab-info">
                      <h3 className="lab-number">Lab {lab}</h3>
                      <div className="lab-stats">
                        <span className="stat-item">
                          <span className="stat-icon">{showFreeTime ? '🕒' : '📅'}</span>
                          {currentSlots.length} {showFreeTime ? 'free slots' : 'sessions'}
                        </span>
                      </div>
                    </div>
                    <div className="lab-icon">{showFreeTime ? '⏰' : '🔬'}</div>
                  </div>

                  <div className="lab-content">
                    <div className="sessions-list">
                      {currentSlots.map((session, sessionIndex) => (
                        <div 
                          key={sessionIndex} 
                          className={`session-item ${showFreeTime ? 'free-time-session' : 'occupied-session'}`}
                          style={{ animationDelay: `${sessionIndex * 0.05}s` }}
                        >
                          <div className="session-header">
                            <div className="session-time">
                              <span className="time-icon">{showFreeTime ? '⏰' : '🕐'}</span>
                              {session.start} - {session.end}
                            </div>
                            <div className="session-day">{session.day}</div>
                          </div>
                          
                          <div className="session-details">
                            <div className="session-batch">
                              <span className="batch-icon">{showFreeTime ? '✅' : '📚'}</span>
                              {session.title}
                            </div>
                            <div className="session-lecturer">
                              <span className="lecturer-icon">{showFreeTime ? '🕒' : '👨‍🏫'}</span>
                              {session.lecturer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
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
        .labs-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        
        /* Header */
        .labs-header {
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

        .toggle-button {
          padding: 10px 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.9);
          color: #1a202c;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .toggle-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .toggle-button.occupied-active {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          border-color: #064e3b;
        }

        .toggle-button.free-time-active {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border-color: #059669;
        }

        /* Labs Grid */
        .labs-grid {
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

        /* Lab Cards */
        .lab-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: flipIn 0.8s ease-out;
          animation-fill-mode: both;
          animation-delay: var(--animation-delay, 0s);
          transition: all 0.3s ease;
        }

        .lab-card:hover {
          transform: translateY(-8px) rotateX(5deg);
          box-shadow: 0 25px 50px rgba(16, 185, 129, 0.2);
        }

        .lab-header {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lab-header.free-time-header {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        .lab-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lab-number {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .lab-stats {
          display: flex;
          gap: 10px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          opacity: 0.9;
        }

        .stat-icon {
          font-size: 16px;
        }

        .lab-icon {
          font-size: 32px;
          animation: bounce 2s infinite;
        }

        .lab-content {
          padding: 25px;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-item {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          animation: slideInRight 0.5s ease-out;
          animation-fill-mode: both;
          animation-delay: calc(var(--animation-delay, 0s) + 0.1s);
        }

        .session-item:hover {
          transform: translateY(-3px) rotate(1deg);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15);
          background: rgba(255, 255, 255, 0.95);
          border-color: #064e3b;
        }

        .session-item.free-time-session {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .session-item.free-time-session:hover {
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
          background: rgba(16, 185, 129, 0.15);
          border-color: #059669;
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }

        .session-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #064e3b;
        }

        .time-icon {
          font-size: 16px;
        }

        .session-day {
          background: rgba(4, 120, 87, 0.1);
          color: #064e3b;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .session-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .session-batch {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-weight: 500;
        }

        .batch-icon {
          font-size: 14px;
        }

        .session-lecturer {
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

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes flipIn {
          from {
            opacity: 0;
            transform: perspective(400px) rotateY(90deg);
          }
          to {
            opacity: 1;
            transform: perspective(400px) rotateY(0deg);
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
          .labs-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
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

          .labs-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .lab-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .session-details {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default Labs;