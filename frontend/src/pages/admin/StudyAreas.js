import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const StudyAreas = () => {
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState({
    name: '',
    capacity: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchAreas = async () => {
    try {
      const res = await api.get('/api/study-areas');
      setAreas(res.data);
    } catch (err) {
      console.error('Error fetching study areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/study-areas', form);
      setForm({ name: '', capacity: '', location: '' });
      fetchAreas();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding study area:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/study-areas/${id}`);
      fetchAreas();
    } catch (err) {
      console.error('Error deleting study area:', err);
    }
  };

  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="loading-text">Loading study areas...</p>
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
      </div>

      {/* Main Container */}
      <div className="study-areas-container">
        {/* Header */}
        <div className="study-areas-header">
          <div className="header-content">
            <div className="header-icon">📚</div>
            <div className="header-text">
              <h1>Study Areas Management</h1>
              <p>Create and manage study spaces for students</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span>Study area added successfully!</span>
            </div>
          </div>
        )}

        {/* Add Form */}
        <div className="add-form-section">
          <div className="form-header">
            <div className="form-title">
              <span className="form-icon">➕</span>
              <h2>Add New Study Area</h2>
            </div>
          </div>
          
          <form onSubmit={handleAdd} className="study-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Study Area Name</label>
                <input
                  name="name"
                  placeholder="e.g., Main Library, Study Room A"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input
                  name="capacity"
                  placeholder="Number of students"
                  type="number"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  name="location"
                  placeholder="e.g., Building A, Floor 2"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <button type="submit" className="submit-btn">
              <span className="btn-icon">📚</span>
              Add Study Area
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search study areas by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>

        {/* Study Areas Grid */}
        <div className="areas-grid">
          {filteredAreas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No study areas found</h3>
              <p>Try adjusting your search or add a new study area</p>
            </div>
          ) : (
            filteredAreas.map((area, index) => (
              <div 
                key={area._id} 
                className="area-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="area-header">
                  <div className="area-info">
                    <h3 className="area-name">{area.name}</h3>
                    <div className="area-meta">
                      <span className="capacity-badge">
                        <span className="capacity-icon">👥</span>
                        {area.capacity} seats
                      </span>
                    </div>
                  </div>
                  <div className="area-icon">🏫</div>
                </div>

                <div className="area-content">
                  <div className="location-info">
                    <span className="location-icon">📍</span>
                    <span className="location-text">{area.location}</span>
                  </div>
                  
                  <div className="area-actions">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(area._id)}
                    >
                      <span className="delete-icon">🗑️</span>
                      Delete
                    </button>
                  </div>
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
        .study-areas-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
          animation: slideInUp 0.8s ease-out;
        }

        /* Header */
        .study-areas-header {
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
          background: linear-gradient(45deg, #064e3b, #022c22, #022c22);
          border-radius: 20px;
          z-index: -1;
          animation: shimmer 3s infinite;
        }

        /* Success Message */
        .success-message {
          margin-bottom: 20px;
          animation: slideInUp 0.5s ease-out;
        }

        .success-content {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 15px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          font-weight: 600;
        }

        .success-icon {
          font-size: 20px;
          animation: checkmark 0.5s ease-out;
        }

        /* Add Form */
        .add-form-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.7s ease-out;
        }

        .form-header {
          margin-bottom: 25px;
        }

        .form-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .form-icon {
          font-size: 24px;
          animation: bounce 2s infinite;
        }

        .form-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #064e3b;
        }

        .study-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .form-input:focus {
          outline: none;
          border-color: #064e3b;
          box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.1);
          transform: translateY(-1px);
        }

        .submit-btn {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          align-self: flex-start;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .btn-icon {
          font-size: 18px;
        }

        /* Search Section */
        .search-section {
          margin-bottom: 30px;
          animation: slideInUp 0.8s ease-out;
        }

        .search-bar {
          display: flex;
          align-items: center;
          position: relative;
          max-width: 500px;
          margin: 0 auto;
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
          box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.1);
          transform: translateY(-1px);
        }

        .search-icon {
          position: absolute;
          right: 20px;
          font-size: 20px;
          color: #6b7280;
          animation: pulse 2s ease-in-out infinite;
        }

        /* Areas Grid */
        .areas-grid {
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

        /* Area Cards */
        .area-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          animation: rotateIn 0.8s ease-out;
          animation-fill-mode: both;
          animation-delay: var(--animation-delay, 0s);
          transition: all 0.3s ease;
        }

        .area-card:hover {
          transform: translateY(-5px) rotateZ(2deg);
          box-shadow: 0 20px 40px rgba(6, 78, 59, 0.2);
        }

        .area-header {
          background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .area-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .area-name {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .area-meta {
          display: flex;
          gap: 10px;
        }

        .capacity-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          opacity: 0.9;
        }

        .capacity-icon {
          font-size: 16px;
        }

        .area-icon {
          font-size: 32px;
          animation: bounce 2s infinite;
        }

        .area-content {
          padding: 25px;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 12px 16px;
          background: rgba(4, 120, 87, 0.1);
          border-radius: 10px;
          color: #064e3b;
          font-weight: 500;
        }

        .location-icon {
          font-size: 18px;
        }

        .location-text {
          font-size: 14px;
        }

        .area-actions {
          display: flex;
          justify-content: flex-end;
        }

        .delete-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        }

        .delete-icon {
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

        @keyframes rotateIn {
          from {
            opacity: 0;
            transform: rotate(-180deg) scale(0.5);
          }
          to {
            opacity: 1;
            transform: rotate(0deg) scale(1);
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

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(0deg);
          }
          50% {
            transform: scale(1.2) rotate(180deg);
          }
          100% {
            transform: scale(1) rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .study-areas-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .search-bar {
            max-width: 100%;
          }

          .areas-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .area-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .location-info {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StudyAreas;