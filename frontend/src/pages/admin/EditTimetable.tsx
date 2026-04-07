import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const EditTimetable = () => {
  const { id } = useParams();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState('modern'); // 'modern', 'professional', 'minimal', 'corporate'

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const res = await api.get(`/api/timetables/${id}`);
      setTimetable(res.data);
    } catch (err) {
      console.error('Error loading timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (dayIndex, slotIndex, field, value) => {
    const updated = { ...timetable };
    updated.days[dayIndex].slots[slotIndex][field] = value;
    setTimetable(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/timetables/${id}`, timetable);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving timetable:', err);
      alert('Error saving timetable. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: theme === 'modern' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                  theme === 'professional' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' :
                  theme === 'minimal' ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' :
                  theme === 'corporate' ? 'linear-gradient(135deg, #64748b 0%, #374151 100%)' :
                  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading timetable...</p>
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
      background: theme === 'modern' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                theme === 'professional' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' :
                theme === 'minimal' ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' :
                theme === 'corporate' ? 'linear-gradient(135deg, #64748b 0%, #374151 100%)' :
                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
      <div className="edit-container">
        {/* Theme Switcher */}
        <div className="theme-switcher">
          <span className="theme-label">Theme:</span>
          <div className="theme-options">
            <button 
              className={`theme-btn ${theme === 'modern' ? 'active' : ''}`}
              onClick={() => setTheme('modern')}
            >
              Modern
            </button>
            <button 
              className={`theme-btn ${theme === 'professional' ? 'active' : ''}`}
              onClick={() => setTheme('professional')}
            >
              Professional
            </button>
            <button 
              className={`theme-btn ${theme === 'minimal' ? 'active' : ''}`}
              onClick={() => setTheme('minimal')}
            >
              Minimal
            </button>
            <button 
              className={`theme-btn ${theme === 'corporate' ? 'active' : ''}`}
              onClick={() => setTheme('corporate')}
            >
              Corporate
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="edit-header">
          <div className="header-content">
            <div className="header-icon">✏️</div>
            <div className="header-text">
              <h1>Edit Timetable</h1>
              <p>{timetable.title}</p>
            </div>
          </div>
          <div className="header-decoration"></div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <span>Timetable updated successfully!</span>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <div className="edit-form">
          {timetable.days.map((day, dIndex) => (
            <div key={dIndex} className="day-section">
              <div className="day-header">
                <div className="day-info">
                  <h3 className="day-name">{day.day}</h3>
                  <span className="slot-count">{day.slots.length} slots</span>
                </div>
                <div className="day-icon">📅</div>
              </div>

              <div className="slots-grid">
                {day.slots.map((slot, sIndex) => (
                  <div key={sIndex} className="slot-card">
                    <div className="slot-header">
                      <span className="slot-number">Slot {sIndex + 1}</span>
                    </div>
                    
                    <div className="slot-fields">
                      <div className="time-inputs">
                        <div className="time-input-group">
                          <label className="input-label">Start Time</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleChange(dIndex, sIndex, 'startTime', e.target.value)
                            }
                            className="time-input"
                          />
                        </div>
                        
                        <div className="time-separator">-</div>
                        
                        <div className="time-input-group">
                          <label className="input-label">End Time</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleChange(dIndex, sIndex, 'endTime', e.target.value)
                            }
                            className="time-input"
                          />
                        </div>
                      </div>

                      <div className="info-inputs">
                        <div className="input-group">
                          <label className="input-label">Lab Number</label>
                          <input
                            type="text"
                            value={slot.labNumber}
                            onChange={(e) =>
                              handleChange(dIndex, sIndex, 'labNumber', e.target.value)
                            }
                            placeholder="Lab"
                            className="info-input"
                          />
                        </div>

                        <div className="input-group">
                          <label className="input-label">Lecturer</label>
                          <input
                            type="text"
                            value={slot.lecturer?.name || ''}
                            onChange={(e) =>
                              handleChange(dIndex, sIndex, 'lecturer', e.target.value)
                            }
                            placeholder="Lecturer"
                            className="info-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="save-section">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="save-btn"
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="save-icon">💾</span>
                Save Changes
              </>
            )}
          </button>
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
        .edit-container {
          max-width: 1200px;
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
        .edit-header {
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
          background: ${theme === 'modern' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                     theme === 'professional' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' :
                     theme === 'minimal' ? 'linear-gradient(135deg, #374151 0%, #6b7280 100%)' :
                     theme === 'corporate' ? 'linear-gradient(135deg, #64748b 0%, #374151 100%)' :
                     'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .header-text p {
          margin: 5px 0 0 0;
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }

        .header-decoration {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: ${theme === 'modern' ? 'linear-gradient(45deg, #10b981, #059669, #047857)' :
                     theme === 'professional' ? 'linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa)' :
                     theme === 'minimal' ? 'linear-gradient(45deg, #374151, #6b7280, #9ca3af)' :
                     theme === 'corporate' ? 'linear-gradient(45deg, #64748b, #374151, #1f2937)' :
                     'linear-gradient(45deg, #10b981, #059669, #047857)'};
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

        /* Edit Form */
        .edit-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInUp 0.7s ease-out;
        }

        .day-section {
          margin-bottom: 40px;
          animation: slideInLeft 0.6s ease-out;
          animation-fill-mode: both;
          animation-delay: calc(var(--day-index, 0) * 0.1s);
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: ${theme === 'modern' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                     theme === 'professional' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' :
                     theme === 'minimal' ? 'linear-gradient(135deg, #374151 0%, #6b7280 100%)' :
                     theme === 'corporate' ? 'linear-gradient(135deg, #64748b 0%, #374151 100%)' :
                     'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
          color: white;
          padding: 20px;
          border-radius: 15px;
          margin-bottom: 20px;
        }

        .day-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .day-name {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .slot-count {
          font-size: 14px;
          opacity: 0.9;
        }

        .day-icon {
          font-size: 32px;
          animation: bounce 2s infinite;
        }

        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .slot-card {
          background: rgba(255, 255, 255, 0.8);
          border: 2px solid #e5e7eb;
          border-radius: 15px;
          padding: 20px;
          transition: all 0.3s ease;
          animation: fadeInScale 0.5s ease-out;
          animation-fill-mode: both;
          animation-delay: calc(var(--slot-index, 0) * 0.05s);
        }

        .slot-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border-color: ${theme === 'modern' ? '#10b981' :
                         theme === 'professional' ? '#1e40af' :
                         theme === 'minimal' ? '#374151' :
                         theme === 'corporate' ? '#64748b' :
                         '#10b981'};
        }

        .slot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .slot-number {
          font-weight: 600;
          color: ${theme === 'modern' ? '#10b981' :
                     theme === 'professional' ? '#1e40af' :
                     theme === 'minimal' ? '#374151' :
                     theme === 'corporate' ? '#64748b' :
                     '#10b981'};
        }

        .slot-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .time-inputs {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .time-input-group {
          flex: 1;
        }

        .input-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .time-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .time-input:focus {
          outline: none;
          border-color: ${theme === 'modern' ? '#10b981' :
                         theme === 'professional' ? '#1e40af' :
                         theme === 'minimal' ? '#374151' :
                         theme === 'corporate' ? '#64748b' :
                         '#10b981'};
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          transform: translateY(-1px);
        }

        .time-separator {
          font-size: 18px;
          font-weight: 600;
          color: #6b7280;
        }

        .info-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .info-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .info-input:focus {
          outline: none;
          border-color: ${theme === 'modern' ? '#10b981' :
                         theme === 'professional' ? '#1e40af' :
                         theme === 'minimal' ? '#374151' :
                         theme === 'corporate' ? '#64748b' :
                         '#10b981'};
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          transform: translateY(-1px);
        }

        /* Save Section */
        .save-section {
          text-align: center;
          animation: slideInUp 0.9s ease-out;
        }

        .save-btn {
          background: ${theme === 'modern' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                     theme === 'professional' ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' :
                     theme === 'minimal' ? 'linear-gradient(135deg, #374151 0%, #6b7280 100%)' :
                     theme === 'corporate' ? 'linear-gradient(135deg, #64748b 0%, #374151 100%)' :
                     'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .save-icon {
          font-size: 18px;
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
          .edit-container {
            padding: 15px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }

          .theme-options {
            flex-wrap: wrap;
          }

          .slots-grid {
            grid-template-columns: 1fr;
          }

          .time-inputs {
            flex-direction: column;
            gap: 10px;
          }

          .info-inputs {
            grid-template-columns: 1fr;
          }

          .day-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EditTimetable;