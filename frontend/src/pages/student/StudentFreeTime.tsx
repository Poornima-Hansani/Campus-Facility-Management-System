import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentFreeTime = () => {
  const [studentFreeTime, setStudentFreeTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    fetchStudentFreeTime();
  }, [selectedStudent]);

  const fetchStudentFreeTime = async () => {
    try {
      setLoading(true);
      if (selectedStudent) {
        const response = await axios.get(`/api/student-free-time/${selectedStudent}/grouped`);
        setStudentFreeTime(response.data);
      } else {
        const response = await axios.get('/api/student-free-time/');
        setStudentFreeTime(response.data);
      }
    } catch (error) {
      console.error('Error fetching student free time:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading student free time...</div>
      </div>
    );
  }

  return (
    <div className="student-free-time-container">
      <div className="header">
        <h2>🕒 Student Free Time</h2>
        <div className="controls">
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="student-select"
          >
            <option value="">All Students</option>
            <option value="1S1_weekday_Faculty of Computing_1.1">Y1 S1 WE 1.1</option>
            <option value="2S2_weekend_Faculty of Computing_2.2">Y2 S2 WE 2.2</option>
            <option value="1S1_weekend_Faculty of Computing_1.1">Y1 S1 WE 1.1</option>
            <option value="1S1_weekday_Faculty of Computing_1.2">Y1 S1 WE 1.2</option>
            <option value="2S1_weekday_Faculty of Computing_2.1">Y2 S1 WE 2.1</option>
            <option value="1S1_weekend_Faculty of Computing_1.2">Y1 S1 WE 1.2</option>
          </select>
          <button onClick={fetchStudentFreeTime} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="content">
        {selectedStudent && studentFreeTime ? (
          <div className="student-schedule">
            <h3>👤 {selectedStudent}</h3>
            <div className="schedule-grid">
              {Object.entries(studentFreeTime.freeTimeSlots).map(([day, slots]) => (
                <div key={day} className="day-card">
                  <h4>{day}</h4>
                  <div className="slots-list">
                    {slots.map((slot, index) => (
                      <div key={index} className="free-time-slot">
                        <span className="time-range">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        <span className="reason">{slot.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="summary">
              <p><strong>Total Free Slots:</strong> {studentFreeTime.totalFreeSlots}</p>
              <p><strong>Last Updated:</strong> {new Date(studentFreeTime.lastUpdated).toLocaleString()}</p>
            </div>
          </div>
        ) : studentFreeTime && Array.isArray(studentFreeTime) ? (
          <div className="all-students">
            <h3>📊 All Students Free Time</h3>
            <div className="students-grid">
              {studentFreeTime.map((student) => (
                <div key={student.studentIdentifier} className="student-card">
                  <h4>👤 {student.studentIdentifier}</h4>
                  <p><strong>Free Slots:</strong> {student.freeTimeSlots.length}</p>
                  <div className="slots-summary">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                      const daySlots = student.freeTimeSlots.filter(slot => slot.day === day);
                      return (
                        <span key={day} className="day-summary">
                          {day.slice(0, 3)}: {daySlots.length}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-data">
            <h3>📅 No Free Time Data</h3>
            <p>Select a student or refresh to load free time data.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .student-free-time-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .header h2 {
          margin: 0;
          font-size: 24px;
        }

        .controls {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .student-select {
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          min-width: 200px;
        }

        .refresh-btn {
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .student-schedule {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .student-schedule h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .day-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .day-card h4 {
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 16px;
        }

        .free-time-slot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .time-range {
          font-weight: bold;
          color: #155724;
        }

        .reason {
          font-size: 12px;
          color: #6c757d;
        }

        .summary {
          margin-top: 20px;
          padding: 15px;
          background: #e7f3ff;
          border-radius: 8px;
          border: 1px solid #b3d9ff;
        }

        .all-students {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .student-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .student-card h4 {
          margin: 0 0 10px 0;
          color: #495057;
          font-size: 14px;
        }

        .slots-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .day-summary {
          background: #007bff;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .loading-spinner {
          font-size: 18px;
          color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default StudentFreeTime;
