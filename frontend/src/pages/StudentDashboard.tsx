import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StudentDashboard = () => {
  const [freeTimes, setFreeTimes] = useState([]);
  const [groupedFreeTimes, setGroupedFreeTimes] = useState({});
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [studyAreas, setStudyAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [areasLoading, setAreasLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // success, error, or confirm
  
  // Lab booking states
  const [labSlots, setLabSlots] = useState({});
  const [groupedLabSlots, setGroupedLabSlots] = useState({});
  const [labBookings, setLabBookings] = useState({});
  const [labSlotsLoading, setLabSlotsLoading] = useState(true);
  const [labBookingsLoading, setLabBookingsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedLabSlot, setSelectedLabSlot] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFreeTime = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/students/free-times/${user._id}`);
        const data = res.data;
        
        setStudentIdentifier(data.studentIdentifier || '');
        setGroupedFreeTimes(data.freeTimeSlots || {});
        
        // Convert grouped slots back to flat array for compatibility with existing UI
        const flatFreeTimes = [];
        Object.entries(data.freeTimeSlots || {}).forEach(([day, slots]) => {
          slots.forEach(slot => {
            flatFreeTimes.push({
              day: day,
              from: slot.startTime,
              to: slot.endTime,
              reason: slot.reason,
              priority: slot.priority,
              isBookable: slot.isBookable
            });
          });
        });
        
        setFreeTimes(flatFreeTimes);
      } catch (err) {
        console.error('Error fetching free time:', err);
        setFreeTimes([]);
        setGroupedFreeTimes({});
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await api.get(`/api/bookings/student/${user._id}`);
        setBookings(res.data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    const fetchAllBookings = async () => {
      try {
        console.log('Fetching all bookings...');
        const res = await api.get('/api/bookings');
        console.log('All bookings response:', res.data);
        setAllBookings(res.data || []);
      } catch (err) {
        console.error('Error fetching all bookings:', err);
        setAllBookings([]);
      }
    };

    const fetchStudyAreas = async () => {
      setAreasLoading(true);
      try {
        const res = await api.get('/api/study-areas');
        setStudyAreas(res.data || []);
      } catch (err) {
        console.error('Error fetching study areas:', err);
        setStudyAreas([]);
      } finally {
        setAreasLoading(false);
      }
    };

    // Lab booking functions
    const fetchLabSlots = async () => {
      setLabSlotsLoading(true);
      try {
        const res = await api.get(`/api/students/lab-slots/${user._id}`);
        const data = res.data;
        
        setGroupedLabSlots(data.labSlots || {});
        setLabSlots(data.labSlots || {});
      } catch (err) {
        console.error('Error fetching lab slots:', err);
        setLabSlots({});
        setGroupedLabSlots({});
      } finally {
        setLabSlotsLoading(false);
      }
    };

    const fetchLabBookings = async () => {
      setLabBookingsLoading(true);
      try {
        const res = await api.get(`/api/students/lab-bookings/${user._id}`);
        const data = res.data;
        
        setLabBookings(data.labBookings || {});
      } catch (err) {
        console.error('Error fetching lab bookings:', err);
        setLabBookings({});
      } finally {
        setLabBookingsLoading(false);
      }
    };

    // Initial fetch
    if (user && user._id) {
      fetchFreeTime();
      fetchBookings();
      fetchAllBookings();
      fetchStudyAreas();
      fetchLabSlots();
      fetchLabBookings();
    }

    // Refresh data when window gains focus (returning from booking page)
    const handleVisibilityChange = () => {
      if (!document.hidden && user && user._id) {
        console.log('Window gained focus, refreshing data...');
        fetchBookings();
        fetchAllBookings();
        fetchStudyAreas();
        fetchLabSlots();
        fetchLabBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user._id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const goToBooking = () => {
    window.location.href = '/student-dashboard/booking';
  };

  const getDayIcon = (day) => {
    const dayIcons = {
      'Monday': '📅',
      'Tuesday': '📆',
      'Wednesday': '📋',
      'Thursday': '📝',
      'Friday': '🗓️',
      'Saturday': '🎯',
      'Sunday': '🌟'
    };
    return dayIcons[day] || '📅';
  };

  const formatTime = (time) => {
    return time;
  };

  const handleDeleteBooking = async (bookingId) => {
    setModalMessage('Are you sure you want to cancel this booking? This action cannot be undone.');
    setModalType('confirm');
    setShowModal(true);
    
    // Store booking ID for confirmation
    window.currentBookingId = bookingId;
  };

  const confirmDeleteBooking = async () => {
    setShowModal(false);
    try {
      const bookingId = window.currentBookingId;
      await api.delete(`/api/bookings/${bookingId}`);
      setBookings(bookings.filter(b => b._id !== bookingId));
      
      // Refresh all bookings and study areas to update counts
      try {
        const [allBookingsRes, studyAreasRes] = await Promise.all([
          api.get('/api/bookings'),
          api.get('/api/study-areas')
        ]);
        setAllBookings(allBookingsRes.data || []);
        setStudyAreas(studyAreasRes.data || []);
      } catch (refreshErr) {
        console.error('Error refreshing data after deletion:', refreshErr);
      }
      
      setModalMessage('Booking cancelled successfully! The study area slot is now available.');
      setModalType('success');
      setShowModal(true);
      
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setModalMessage('Failed to cancel booking. Please try again.');
      setModalType('error');
      setShowModal(true);
      
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  const getBookingCountForArea = (areaId) => {
    console.log('All bookings:', allBookings);
    console.log('Looking for areaId:', areaId);
    const count = allBookings.filter(booking => {
      console.log('Checking booking:', booking);
      return booking.studyArea && booking.studyArea._id === areaId;
    }).length;
    console.log('Count for area:', count);
    return count;
  };

  const getRemainingCapacity = (areaId, totalCapacity) => {
    const bookingCount = getBookingCountForArea(areaId);
    return Math.max(0, totalCapacity - bookingCount);
  };

  // Lab booking handler functions
  const handleBookLabSlot = (labSlot) => {
    setSelectedLabSlot(labSlot);
    setBookingDate('');
    setBookingPurpose('');
    setShowBookingModal(true);
  };

  const handleConfirmLabBooking = async () => {
    if (!selectedLabSlot || !bookingDate) {
      setModalMessage('Please select a date for the lab booking.');
      setModalType('error');
      setShowModal(true);
      return;
    }

    try {
      const response = await api.post(`/api/students/book-lab/${user._id}`, {
        labBookingId: selectedLabSlot.labBookingId,
        bookingDate: bookingDate,
        purpose: bookingPurpose
      });

      setModalMessage('Lab slot booked successfully!');
      setModalType('success');
      setShowModal(true);
      setShowBookingModal(false);
      
      // Refresh lab slots and bookings
      const [labSlotsRes, labBookingsRes] = await Promise.all([
        api.get(`/api/students/lab-slots/${user._id}`),
        api.get(`/api/students/lab-bookings/${user._id}`)
      ]);
      
      setGroupedLabSlots(labSlotsRes.data.labSlots || {});
      setLabBookings(labBookingsRes.data.labBookings || {});
      
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Error booking lab slot:', error);
      setModalMessage(error.response?.data?.message || 'Failed to book lab slot. Please try again.');
      setModalType('error');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  const handleCancelLabBooking = async (bookingId) => {
    setModalMessage('Are you sure you want to cancel this lab booking?');
    setModalType('confirm');
    setShowModal(true);
    window.currentLabBookingId = bookingId;
  };

  const confirmCancelLabBooking = async () => {
    setShowModal(false);
    try {
      const bookingId = window.currentLabBookingId;
      await api.delete(`/api/students/lab-bookings/${user._id}/${bookingId}`);
      
      setModalMessage('Lab booking cancelled successfully!');
      setModalType('success');
      setShowModal(true);
      
      // Refresh lab bookings and slots
      const [labSlotsRes, labBookingsRes] = await Promise.all([
        api.get(`/api/students/lab-slots/${user._id}`),
        api.get(`/api/students/lab-bookings/${user._id}`)
      ]);
      
      setGroupedLabSlots(labSlotsRes.data.labSlots || {});
      setLabBookings(labBookingsRes.data.labBookings || {});
      
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Error cancelling lab booking:', error);
      setModalMessage('Failed to cancel lab booking. Please try again.');
      setModalType('error');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  // Update modal confirmation handler to handle lab bookings
  const handleModalConfirm = () => {
    if (modalType === 'confirm' && window.currentLabBookingId) {
      confirmCancelLabBooking();
    } else if (modalType === 'confirm' && window.currentBookingId) {
      confirmDeleteBooking();
    } else {
      setShowModal(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(240, 147, 251, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite'
        }}></div>
      </div>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 10,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideDown 0.6s ease-out'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
          }}>
            👤
          </div>
          <div>
            <h1 style={{ 
              margin: 0,
              fontSize: '32px',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
              Student Dashboard
            </h1>
            <p style={{ 
              margin: '4px 0 0 0',
              color: '#64748b',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              Welcome back, {user?.name || 'Student'}! ✨
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={goToBooking}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.3)';
            }}
          >
            <span style={{
              position: 'relative',
              zIndex: 1
            }}>
              📚 Book Study Area
            </span>
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              transition: 'left 0.6s'
            }}></div>
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.05)';
              e.target.style.boxShadow = '0 15px 35px rgba(239, 68, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
            }}
          >
            <span style={{
              position: 'relative',
              zIndex: 1
            }}>
              🚪 Logout
            </span>
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
              transition: 'left 0.6s'
            }}></div>
          </button>
        </div>
      </div>

      {/* Lab Slots Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '35px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>
        
        <h2 style={{
          margin: '0 0 25px 0',
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          🔬 Available Lab Slots
          {studentIdentifier && (
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              WebkitTextFillColor: 'white',
              WebkitBackgroundClip: 'unset',
              backgroundClip: 'unset'
            }}>
              {studentIdentifier}
            </span>
          )}
        </h2>

        {labSlotsLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#64748b',
            fontSize: '16px'
          }}>
            Loading lab slots...
          </div>
        ) : Object.keys(groupedLabSlots).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              🔬
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#475569'
            }}>
              No Lab Slots Available
            </h3>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#64748b'
            }}>
              There are currently no available lab slots for your schedule.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '25px'
          }}>
            {Object.entries(groupedLabSlots).map(([day, slots]) => (
              <div key={day} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '25px',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                transition: 'all 0.3s ease'
              }}>
                {/* Day Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    fontSize: '28px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {getDayIcon(day)}
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      {day}
                    </h3>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {slots.length} lab slot{slots.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                {/* Lab Slots for this Day */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '15px'
                }}>
                  {slots.map((slot, slotIndex) => (
                    <div
                      key={`${day}-${slotIndex}`}
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '15px',
                        padding: '20px',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(59, 130, 246, 0.1)';
                      }}
                    >
                      {/* Lab Number Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        boxShadow: '0 3px 10px rgba(59, 130, 246, 0.3)'
                      }}>
                        {slot.labNumber}
                      </div>

                      {/* Time Display */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            marginBottom: '3px'
                          }}>
                            From
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#3b82f6'
                          }}>
                            🕐 {formatTime(slot.startTime)}
                          </div>
                        </div>
                        
                        <div style={{
                          width: '30px',
                          height: '2px',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
                          margin: '0 10px',
                          borderRadius: '2px'
                        }}></div>
                        
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            marginBottom: '3px'
                          }}>
                            To
                          </div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1d4ed8'
                          }}>
                            🕑 {formatTime(slot.endTime)}
                          </div>
                        </div>
                      </div>

                      {/* Purpose */}
                      <div style={{
                        padding: '8px 12px',
                        background: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#374151',
                        textAlign: 'center',
                        fontWeight: '500',
                        marginBottom: '12px'
                      }}>
                        💡 {slot.purpose || 'Lab Session'}
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => handleBookLabSlot(slot)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 16px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        📅 Book This Slot
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Bookings Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '35px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>
        
        <h2 style={{
          margin: '0 0 25px 0',
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📅 Your Lab Bookings
        </h2>

        {labBookingsLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#64748b',
            fontSize: '16px'
          }}>
            Loading your lab bookings...
          </div>
        ) : Object.keys(labBookings).length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📅
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#475569'
            }}>
              No Lab Bookings
            </h3>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#64748b'
            }}>
              You haven't booked any lab slots yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            {Object.entries(labBookings).map(([date, bookings]) => (
              <div key={date} style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid rgba(16, 185, 129, 0.1)'
              }}>
                <h4 style={{
                  margin: '0 0 15px 0',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#059669'
                }}>
                  📅 {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '15px'
                }}>
                  {bookings.map((booking) => (
                    <div key={booking._id} style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '12px',
                      padding: '15px',
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: booking.status === 'confirmed' 
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {booking.status}
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        🔬 {booking.labNumber}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        🕐 {booking.startTime} - {booking.endTime}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '8px'
                      }}>
                        📋 {booking.day}
                      </div>
                      
                      {booking.purpose && (
                        <div style={{
                          fontSize: '12px',
                          color: '#374151',
                          fontStyle: 'italic',
                          marginBottom: '10px'
                        }}>
                          💡 {booking.purpose}
                        </div>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelLabBooking(booking._id)}
                          style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          ❌ Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Areas Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '35px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>
        
        <h2 style={{
          margin: '0 0 25px 0',
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📚 Study Areas
        </h2>

        {areasLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#64748b',
            fontSize: '16px'
          }}>
            Loading study areas...
          </div>
        ) : studyAreas.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📚
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#475569'
            }}>
              No Study Areas Available
            </h3>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#64748b'
            }}>
              There are currently no study areas available for booking.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {studyAreas.map((area) => {
              const bookingCount = getBookingCountForArea(area._id);
              const remainingCapacity = getRemainingCapacity(area._id, area.capacity);
              const isFullyBooked = remainingCapacity === 0;
              
              return (
                <div
                  key={area._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '25px',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(245, 158, 11, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(245, 158, 11, 0.1)';
                  }}
                >
                  {/* Capacity Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: isFullyBooked 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : remainingCapacity <= area.capacity * 0.2
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
                  }}>
                    {remainingCapacity}/{area.capacity} slots
                  </div>

                  {/* Study Area Name */}
                  <h3 style={{
                    margin: '0 0 15px 0',
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    📚 {area.name}
                  </h3>

                  {/* Study Area Details */}
                  <div style={{
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📍 {area.location}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      🏷️ {area.type}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      ⏰ {area.operatingHours}
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div style={{
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '5px'
                    }}>
                      <span>Occupancy</span>
                      <span>{Math.round((bookingCount / area.capacity) * 100)}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(bookingCount / area.capacity) * 100}%`,
                        height: '100%',
                        background: isFullyBooked 
                          ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                          : remainingCapacity <= area.capacity * 0.2
                          ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>

                  {/* Features */}
                  {area.features && area.features.length > 0 && (
                    <div style={{
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Features:
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        {area.features.map((feature, index) => (
                          <span
                            key={index}
                            style={{
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: '#d97706',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={() => goToBooking()}
                    disabled={isFullyBooked}
                    style={{
                      width: '100%',
                      background: isFullyBooked
                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 20px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: isFullyBooked ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isFullyBooked
                        ? 'none'
                        : '0 6px 16px rgba(245, 158, 11, 0.3)',
                      opacity: isFullyBooked ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!isFullyBooked) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isFullyBooked) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.3)';
                      }
                    }}
                  >
                    {isFullyBooked ? '🔒 Fully Booked' : '📚 Book This Area'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Your Bookings Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '25px',
        padding: '35px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>
        
        <h2 style={{
          margin: '0 0 25px 0',
          fontSize: '28px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          📅 Your Study Area Bookings
        </h2>

        {bookingsLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#64748b',
            fontSize: '16px'
          }}>
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📅
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#475569'
            }}>
              No Bookings Yet
            </h3>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: '#64748b'
            }}>
              You haven't made any study area bookings yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {bookings.map((booking) => (
              <div
                key={booking._id}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  padding: '20px',
                  border: '1px solid rgba(139, 92, 246, 0.15)',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(139, 92, 246, 0.1)';
                }}
              >
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)'
                }}>
                  {booking.status || 'Confirmed'}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      📚 {booking.studyArea?.name || 'Study Area'}
                    </h4>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      📍 {booking.studyArea?.location || 'Location'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      🕐 {booking.startTime} - {booking.endTime}
                    </div>
                  </div>
                  
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      📅 {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280'
                    }}>
                      👥 {booking.participants || 1} participant{booking.participants !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {booking.purpose && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(139, 92, 246, 0.05)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#374151',
                    fontStyle: 'italic',
                    marginBottom: '15px'
                  }}>
                    💡 {booking.purpose}
                  </div>
                )}

                <button
                  onClick={() => handleDeleteBooking(booking._id)}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  ❌ Cancel Booking
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Booking Modal */}
      {showBookingModal && selectedLabSlot && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            animation: 'slideInUp 0.3s ease-out'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              📅 Book Lab Slot
            </h3>
            
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#3b82f6',
                marginBottom: '8px'
              }}>
                🔬 {selectedLabSlot.labNumber}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '4px'
              }}>
                📅 {selectedLabSlot.day}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280'
              }}>
                🕐 {selectedLabSlot.startTime} - {selectedLabSlot.endTime}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                📅 Booking Date
              </label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                💡 Purpose (Optional)
              </label>
              <textarea
                value={bookingPurpose}
                onChange={(e) => setBookingPurpose(e.target.value)}
                placeholder="What do you need this lab slot for?"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                }}
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f3f4f6';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLabBooking}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                📅 Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            animation: 'slideInUp 0.3s ease-out',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              {modalType === 'success' ? '✅' : modalType === 'error' ? '❌' : '⚠️'}
            </div>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              {modalType === 'success' ? 'Success!' : modalType === 'error' ? 'Error' : 'Confirm Action'}
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '15px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              {modalMessage}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              {modalType === 'confirm' && (
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f3f4f6';
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={modalType === 'confirm' ? handleModalConfirm : () => setShowModal(false)}
                style={{
                  background: modalType === 'success' 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : modalType === 'error'
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: modalType === 'success' 
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : modalType === 'error'
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = modalType === 'success' 
                    ? '0 6px 16px rgba(16, 185, 129, 0.4)'
                    : modalType === 'error'
                    ? '0 6px 16px rgba(239, 68, 68, 0.4)'
                    : '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = modalType === 'success' 
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : modalType === 'error'
                    ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                {modalType === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
