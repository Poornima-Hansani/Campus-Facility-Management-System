import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StudentBooking = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const [freeTimes, setFreeTimes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  const goBackToDashboard = () => {
    window.location.href = '/student-dashboard';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ft, ar] = await Promise.all([
        api.get(`/api/students/free-time/${user._id}`),
        api.get('/api/study-areas')
      ]);

      setFreeTimes(ft.data.freeTime || []);
      setAreas(ar.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedArea || !selectedSlot) {
      setError('Please select both a study area and time slot');
      return;
    }

    try {
      await api.post('/api/bookings', {
        student: user._id,
        studyArea: selectedArea,
        day: selectedSlot.day,
        from: selectedSlot.from,
        to: selectedSlot.to,
        date: new Date().toISOString().split('T')[0],
      });

      setBookingSuccess(true);
      setError('');
      setSelectedArea('');
      setSelectedSlot(null);
      
      setTimeout(() => setBookingSuccess(false), 5000);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Booking failed. Please try again.');
      setBookingSuccess(false);
    }
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

  const getAreaIcon = (areaName) => {
    const icons = ['🏫', '📚', '🎓', '📖', '📝', '🔬', '💻', '🎨'];
    return icons[areaName.length % icons.length];
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '30px 20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{ 
              margin: 0,
              fontSize: '32px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📚 Book Study Area
            </h1>
            
            <button
              onClick={goBackToDashboard}
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(107, 114, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(107, 114, 128, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(107, 114, 128, 0.3)';
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
          <p style={{ 
            margin: '0 0 0 0',
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Reserve your preferred study area and time slot
          </p>
        </div>
      </div>

      {/* Success Message */}
      {bookingSuccess && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
          animation: 'slideInUp 0.5s ease-out'
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <span style={{ fontWeight: '600' }}>Booking successful! Your study area has been reserved.</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span style={{ fontWeight: '600' }}>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '60px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(6, 78, 59, 0.3)',
            borderTop: '4px solid #064e3b',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading available options...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Free Time Selection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#064e3b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⏰ Select Your Time Slot
            </h2>

            {freeTimes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280',
                background: 'rgba(6, 78, 59, 0.05)',
                borderRadius: '15px',
                border: '2px dashed rgba(6, 78, 59, 0.2)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.6 }}>📅</div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#374151' }}>
                  No Time Slots Available
                </h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Contact admin to set up your free time schedule
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {freeTimes.map((slot, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    style={{
                      padding: '15px',
                      borderRadius: '12px',
                      border: selectedSlot === slot 
                        ? '2px solid #064e3b' 
                        : '2px solid rgba(6, 78, 59, 0.2)',
                      background: selectedSlot === slot
                        ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.1) 0%, rgba(2, 44, 34, 0.1) 100%)'
                        : 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (selectedSlot !== slot) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(6, 78, 59, 0.15)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedSlot !== slot) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: selectedSlot === slot 
                        ? '3px solid #064e3b' 
                        : '2px solid rgba(6, 78, 59, 0.3)',
                      background: selectedSlot === slot 
                        ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' 
                        : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedSlot === slot && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      )}
                    </div>

                    <div style={{ fontSize: '24px' }}>
                      {getDayIcon(slot.day)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '16px',
                        color: selectedSlot === slot ? '#064e3b' : '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {slot.day}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>🕐 {slot.from}</span>
                        <span>→</span>
                        <span>🕑 {slot.to}</span>
                      </div>
                    </div>

                    {selectedSlot === slot && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        SELECTED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study Area Selection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ 
              margin: '0 0 20px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#064e3b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🏫 Select Study Area
            </h2>

            {areas.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280',
                background: 'rgba(6, 78, 59, 0.05)',
                borderRadius: '15px',
                border: '2px dashed rgba(6, 78, 59, 0.2)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.6 }}>🏫</div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#374151' }}>
                  No Study Areas Available
                </h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Contact admin to add study areas
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {areas.map((area) => (
                  <div
                    key={area._id}
                    onClick={() => setSelectedArea(area._id)}
                    style={{
                      padding: '15px',
                      borderRadius: '12px',
                      border: selectedArea === area._id 
                        ? '2px solid #064e3b' 
                        : '2px solid rgba(6, 78, 59, 0.2)',
                      background: selectedArea === area._id
                        ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.1) 0%, rgba(2, 44, 34, 0.1) 100%)'
                        : 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (selectedArea !== area._id) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(6, 78, 59, 0.15)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedArea !== area._id) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: selectedArea === area._id 
                        ? '3px solid #064e3b' 
                        : '2px solid rgba(6, 78, 59, 0.3)',
                      background: selectedArea === area._id 
                        ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' 
                        : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedArea === area._id && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      )}
                    </div>

                    <div style={{ fontSize: '24px' }}>
                      {getAreaIcon(area.name)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '16px',
                        color: selectedArea === area._id ? '#064e3b' : '#1f2937',
                        marginBottom: '4px'
                      }}>
                        {area.name}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>👥</span>
                        <span>{area.capacity} seats</span>
                        <span>•</span>
                        <span>📍 {area.location}</span>
                      </div>
                    </div>

                    {selectedArea === area._id && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        SELECTED
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Button */}
      {!loading && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={handleBook}
            disabled={!selectedArea || !selectedSlot}
            style={{
              background: selectedArea && selectedSlot
                ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
                : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: selectedArea && selectedSlot ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              boxShadow: selectedArea && selectedSlot
                ? '0 10px 30px rgba(6, 78, 59, 0.3)'
                : '0 5px 15px rgba(156, 163, 175, 0.2)',
              opacity: selectedArea && selectedSlot ? 1 : 0.7,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              if (selectedArea && selectedSlot) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 35px rgba(6, 78, 59, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedArea && selectedSlot) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(6, 78, 59, 0.3)';
              }
            }}
          >
            📚 Book Now
          </button>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentBooking;