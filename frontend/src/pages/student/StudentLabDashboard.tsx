import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentLabDashboard = () => {
  const [availableBookings, setAvailableBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedLab, setSelectedLab] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAvailableBookings();
    fetchConfirmedBookings();
  }, [selectedStudent, selectedLab]);

  const fetchAvailableBookings = async () => {
    try {
      setLoading(true);
      let url = '/api/lab-booking/available';
      
      if (selectedStudent) {
        url += `/student/${selectedStudent}`;
      }
      if (selectedLab) {
        url += `/lab/${selectedLab}`;
      }

      const response = await axios.get(url);
      setAvailableBookings(response.data);
    } catch (error) {
      console.error('Error fetching available bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedBookings = async () => {
    try {
      if (selectedStudent) {
        const response = await axios.get(`/api/lab-booking/booked/student/${selectedStudent}`);
        setConfirmedBookings(response.data);
      }
    } catch (error) {
      console.error('Error fetching confirmed bookings:', error);
    }
  };

  const bookLab = async (booking) => {
    try {
      const response = await axios.post('/api/lab-booking/book', {
        ...booking,
        bookingDate: new Date()
      });
      
      // Remove from available and add to confirmed
      setAvailableBookings(prev => prev.filter(b => b._id !== booking._id));
      setConfirmedBookings(prev => [...prev, response.data.booking]);
      
      alert('Lab booked successfully!');
    } catch (error) {
      console.error('Error booking lab:', error);
      alert('Error booking lab: ' + error.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.delete(`/api/lab-booking/cancel/${bookingId}`);
      
      // Remove from confirmed bookings
      setConfirmedBookings(prev => prev.filter(b => b._id !== bookingId));
      
      alert('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking: ' + error.message);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const filteredBookings = availableBookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'weekend') return ['Saturday', 'Sunday'].includes(booking.day);
    return booking.day === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading lab bookings...</div>
      </div>
    );
  }

  return (
    <div className="student-lab-dashboard">
      <div className="header">
        <h2>🏢 Student Lab Booking Dashboard</h2>
        <div className="controls">
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="student-select"
          >
            <option value="">All Students</option>
            <option value="1S1_weekend_Faculty of Computing_1.1">Y1 S1 WE 1.1</option>
            <option value="2S2_weekend_Faculty of Computing_2.2">Y2 S2 WE 2.2</option>
            <option value="1S1_weekday_Faculty of Computing_1.1">Y1 S1 WE 1.1</option>
            <option value="1S1_weekday_Faculty of Computing_1.2">Y1 S1 WE 1.2</option>
            <option value="2S1_weekday_Faculty of Computing_2.1">Y2 S1 WE 2.1</option>
          </select>
          
          <select 
            value={selectedLab} 
            onChange={(e) => setSelectedLab(e.target.value)}
            className="lab-select"
          >
            <option value="">All Labs</option>
            <option value="F306">Lab F306</option>
            <option value="F305">Lab F305</option>
            <option value="F001">Lab F001</option>
            <option value="F002">Lab F002</option>
          </select>

          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Days</option>
            <option value="weekend">Weekend Only</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          <button onClick={fetchAvailableBookings} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="content">
        <div className="available-bookings">
          <h3>🕒 Available Lab Bookings</h3>
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card available">
                <div className="booking-header">
                  <h4>🏢 {booking.labNumber}</h4>
                  <span className="day">{booking.day}</span>
                </div>
                <div className="booking-details">
                  <div className="time-range">
                    <span className="time">{formatTime(booking.startTime)}</span>
                    <span className="separator">-</span>
                    <span className="time">{formatTime(booking.endTime)}</span>
                    <span className="duration">({booking.duration}h)</span>
                  </div>
                  <div className="student-id">
                    👤 {booking.studentIdentifier}
                  </div>
                  <button 
                    onClick={() => bookLab(booking)}
                    className="book-btn"
                  >
                    📅 Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="confirmed-bookings">
          <h3>✅ Your Confirmed Bookings</h3>
          <div className="bookings-list">
            {confirmedBookings.map((booking) => (
              <div key={booking._id} className="booking-card confirmed">
                <div className="booking-header">
                  <h4>🏢 {booking.labNumber}</h4>
                  <span className="day">{booking.day}</span>
                  <span className="date">{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="booking-details">
                  <div className="time-range">
                    <span className="time">{formatTime(booking.startTime)}</span>
                    <span className="separator">-</span>
                    <span className="time">{formatTime(booking.endTime)}</span>
                  </div>
                  <div className="purpose">
                    📝 {booking.purpose}
                  </div>
                  <div className="status">
                    Status: <span className="confirmed">{booking.status}</span>
                  </div>
                  <button 
                    onClick={() => cancelBooking(booking._id)}
                    className="cancel-btn"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            ))}
            {confirmedBookings.length === 0 && (
              <div className="no-bookings">
                <p>📅 No confirmed bookings yet.</p>
                <p>Available lab slots are shown on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .student-lab-dashboard {
          padding: 20px;
          max-width: 1400px;
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
          flex-wrap: wrap;
        }

        .student-select, .lab-select, .filter-select {
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          min-width: 150px;
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

        .content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .available-bookings, .confirmed-bookings {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .available-bookings h3, .confirmed-bookings h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 20px;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .booking-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .booking-card.available {
          border-left: 4px solid #28a745;
        }

        .booking-card.confirmed {
          border-left: 4px solid #28a745;
          background: #e8f5e8;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .booking-header h4 {
          margin: 0;
          color: #495057;
          font-size: 16px;
        }

        .booking-header .day {
          background: #007bff;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .booking-header .date {
          font-size: 12px;
          color: #6c757d;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: bold;
        }

        .time {
          color: #28a745;
        }

        .separator {
          color: #6c757d;
        }

        .duration {
          color: #6c757d;
          font-size: 12px;
        }

        .student-id {
          font-size: 12px;
          color: #6c757d;
        }

        .purpose {
          font-size: 14px;
          color: #495057;
        }

        .status {
          font-size: 12px;
        }

        .status .confirmed {
          color: #28a745;
          font-weight: bold;
        }

        .book-btn {
          padding: 8px 16px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .book-btn:hover {
          background: #218838;
        }

        .cancel-btn {
          padding: 6px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .cancel-btn:hover {
          background: #c82333;
        }

        .no-bookings {
          text-align: center;
          padding: 40px;
          color: #6c757d;
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

export default StudentLabDashboard;
