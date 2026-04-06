import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogOut, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

type FreeTimeSlot = {
  day: string;
  from: string;
  to: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  priority?: string;
  isBookable?: boolean;
};

type StudyArea = {
  _id: string;
  name: string;
  location: string;
  type: string;
  capacity: number;
  operatingHours: string;
  features?: string[];
};

type Booking = {
  _id: string;
  studyArea?: {
    _id: string;
    name: string;
  };
  date: string;
  timeSlot: string;
  status: string;
};

type LabSlot = {
  labBookingId: string;
  labNumber: string;
  startTime: string;
  endTime: string;
  purpose?: string;
};

type LabBooking = {
  _id: string;
  labNumber: string;
  startTime: string;
  endTime: string;
  day: string;
  status: string;
  purpose?: string;
};

type GroupedSlots<T> = Record<string, T[]>;

export default function StudentDashboard() {
  const [_freeTimes, setFreeTimes] = useState<FreeTimeSlot[]>([]);
  const [_groupedFreeTimes, setGroupedFreeTimes] = useState<GroupedSlots<FreeTimeSlot>>({});
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [studyAreas, setStudyAreas] = useState<StudyArea[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [areasLoading, setAreasLoading] = useState(true);
  const [labSlotsLoading, setLabSlotsLoading] = useState(true);
  const [labBookingsLoading, setLabBookingsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedLabSlot, setSelectedLabSlot] = useState<LabSlot | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user?.name || 'Student';

  useEffect(() => {
    const fetchFreeTime = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/students/free-times/${user._id}`);
        const data = await res.json();
        
        setStudentIdentifier(data.studentIdentifier || '');
        setGroupedFreeTimes(data.freeTimeSlots || {});
        
        const flatFreeTimes: FreeTimeSlot[] = [];
        Object.entries(data.freeTimeSlots || {}).forEach(([day, slots]) => {
          (slots as FreeTimeSlot[]).forEach(slot => {
            flatFreeTimes.push({
              day: day,
              from: slot.startTime || slot.from,
              to: slot.endTime || slot.to,
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
      }
    };

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/student/${user._id}`);
        const data = await res.json();
        setBookings(data || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    const fetchAllBookings = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/bookings');
        const data = await res.json();
        setAllBookings(data || []);
      } catch (err) {
        console.error('Error fetching all bookings:', err);
        setAllBookings([]);
      }
    };

    const fetchStudyAreas = async () => {
      setAreasLoading(true);
      try {
        const res = await fetch('http://localhost:3000/api/study-areas');
        const data = await res.json();
        setStudyAreas(data || []);
      } catch (err) {
        console.error('Error fetching study areas:', err);
        setStudyAreas([]);
      } finally {
        setAreasLoading(false);
      }
    };

    const fetchLabSlots = async () => {
      setLabSlotsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/students/lab-slots/${user._id}`);
        const data = await res.json();
        
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
        const res = await fetch(`http://localhost:3000/api/students/lab-bookings/${user._id}`);
        const data = await res.json();
        
        setLabBookings(data.labBookings || {});
      } catch (err) {
        console.error('Error fetching lab bookings:', err);
        setLabBookings({});
      } finally {
        setLabBookingsLoading(false);
      }
    };

    if (user && user._id) {
      fetchFreeTime();
      fetchBookings();
      fetchAllBookings();
      fetchStudyAreas();
      fetchLabSlots();
      fetchLabBookings();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && user && user._id) {
        fetchBookings();
        fetchAllBookings();
        fetchStudyAreas();
        fetchLabSlots();
        fetchLabBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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

  const getDayIcon = (day: string) => {
    const dayIcons: Record<string, string> = {
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

  const getBookingCountForArea = (areaId: string) => {
    return allBookings.filter(booking => 
      booking.studyArea && booking.studyArea._id === areaId
    ).length;
  };

  const getRemainingCapacity = (areaId: string, totalCapacity: number) => {
    const bookingCount = getBookingCountForArea(areaId);
    return Math.max(0, totalCapacity - bookingCount);
  };

  const handleBookLabSlot = (labSlot: LabSlot) => {
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
      await fetch(`http://localhost:3000/api/students/book-lab/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labBookingId: selectedLabSlot.labBookingId,
          bookingDate: bookingDate,
          purpose: bookingPurpose
        })
      });

      setModalMessage('Lab slot booked successfully!');
      setModalType('success');
      setShowModal(true);
      setShowBookingModal(false);
      
      const [labSlotsRes, labBookingsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/students/lab-slots/${user._id}`),
        fetch(`http://localhost:3000/api/students/lab-bookings/${user._id}`)
      ]);
      
      const slotsData = await labSlotsRes.json();
      const bookingsData = await labBookingsRes.json();
      
      setGroupedLabSlots(slotsData.labSlots || {});
      setLabBookings(bookingsData.labBookings || {});
      
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Error booking lab slot:', error);
      setModalMessage('Failed to book lab slot. Please try again.');
      setModalType('error');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  const handleCancelLabBooking = async (bookingId: string) => {
    setModalMessage('Are you sure you want to cancel this lab booking?');
    setModalType('confirm');
    setShowModal(true);
    (window as any).currentLabBookingId = bookingId;
  };

  const confirmCancelLabBooking = async () => {
    setShowModal(false);
    try {
      const bookingId = (window as any).currentLabBookingId;
      await fetch(`http://localhost:3000/api/students/lab-bookings/${user._id}/${bookingId}`, {
        method: 'DELETE'
      });
      
      setModalMessage('Lab booking cancelled successfully!');
      setModalType('success');
      setShowModal(true);
      
      const [labSlotsRes, labBookingsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/students/lab-slots/${user._id}`),
        fetch(`http://localhost:3000/api/students/lab-bookings/${user._id}`)
      ]);
      
      const slotsData = await labSlotsRes.json();
      const bookingsData = await labBookingsRes.json();
      
      setGroupedLabSlots(slotsData.labSlots || {});
      setLabBookings(bookingsData.labBookings || {});
      
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Error cancelling lab booking:', error);
      setModalMessage('Failed to cancel lab booking. Please try again.');
      setModalType('error');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    }
  };

  const handleModalConfirm = () => {
    if (modalType === 'confirm' && (window as any).currentLabBookingId) {
      confirmCancelLabBooking();
    } else {
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6 p-6">
        
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                Welcome back, {userName}! ✨
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/reporting-dashboard"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <AlertCircle size={18} />
              Report Issue
            </Link>
            <button
              onClick={goToBooking}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <BookOpen size={18} />
              Book Study Area
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Lab Slots Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
            🔬 Available Lab Slots
            {studentIdentifier && (
              <span className="text-sm font-normal bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                {studentIdentifier}
              </span>
            )}
          </h2>

          {_labSlotsLoading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Loading lab slots...
            </div>
          ) : Object.keys(groupedLabSlots).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">🔬</div>
              <h3 className="font-semibold text-gray-700">No Lab Slots Available</h3>
              <p className="text-sm">There are currently no available lab slots for your schedule.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedLabSlots).map(([day, slots]) => (
                <div key={day} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getDayIcon(day)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{day}</h3>
                      <p className="text-xs text-gray-500">{slots.length} lab slot{slots.length !== 1 ? 's' : ''} available</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slots.map((slot, slotIndex) => (
                      <div key={`${day}-${slotIndex}`} className="bg-white rounded-lg p-4 border border-teal-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-teal-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                            {slot.labNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase">From</p>
                            <p className="font-semibold text-teal-600">🕐 {slot.startTime}</p>
                          </div>
                          <div className="w-8 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase">To</p>
                            <p className="font-semibold text-teal-700">🕑 {slot.endTime}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 text-center mb-2">💡 {slot.purpose || 'Lab Session'}</p>
                        <button
                          onClick={() => handleBookLabSlot(slot)}
                          className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
            📅 Your Lab Bookings
          </h2>

          {labBookingsLoading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Loading your lab bookings...
            </div>
          ) : Object.keys(labBookings).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-700">No Lab Bookings</h3>
              <p className="text-sm">You haven't booked any lab slots yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(labBookings).map(([date, dateBookings]) => (
                <div key={date} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold text-teal-700 mb-3">
                    📅 {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dateBookings.map((booking) => (
                      <div key={booking._id} className="bg-white rounded-lg p-3 border border-teal-100 relative">
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </div>
                        <p className="font-medium text-gray-800 text-sm">🔬 {booking.labNumber}</p>
                        <p className="text-xs text-gray-500">🕐 {booking.startTime} - {booking.endTime}</p>
                        <p className="text-xs text-gray-500">📋 {booking.day}</p>
                        {booking.purpose && <p className="text-xs text-gray-600 italic">💡 {booking.purpose}</p>}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleCancelLabBooking(booking._id)}
                            className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded text-xs font-medium transition-all"
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
            📚 Study Areas
          </h2>

          {areasLoading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Loading study areas...
            </div>
          ) : studyAreas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-700">No Study Areas Available</h3>
              <p className="text-sm">There are currently no study areas available for booking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyAreas.map((area) => {
                const bookingCount = getBookingCountForArea(area._id);
                const remainingCapacity = getRemainingCapacity(area._id, area.capacity);
                const isFullyBooked = remainingCapacity === 0;
                
                return (
                  <div key={area._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold ${
                      isFullyBooked 
                        ? 'bg-red-500 text-white' 
                        : remainingCapacity <= area.capacity * 0.2
                        ? 'bg-amber-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      {remainingCapacity}/{area.capacity} slots
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">📚 {area.name}</h3>
                    <div className="space-y-1 mb-3 text-sm text-gray-600">
                      <p className="flex items-center gap-1"><MapPin size={14} /> {area.location}</p>
                      <p className="flex items-center gap-1">🏷️ {area.type}</p>
                      <p className="flex items-center gap-1"><Clock size={14} /> {area.operatingHours}</p>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Occupancy</span>
                        <span>{Math.round((bookingCount / area.capacity) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isFullyBooked 
                              ? 'bg-red-500' 
                              : remainingCapacity <= area.capacity * 0.2
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${(bookingCount / area.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    {area.features && area.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {area.features.map((feature, index) => (
                          <span key={index} className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => goToBooking()}
                      disabled={isFullyBooked}
                      className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                        isFullyBooked
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-teal-500 hover:bg-teal-600 text-white'
                      }`}
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-teal-600 mb-4 flex items-center gap-2">
            📅 Your Study Area Bookings
          </h2>

          {bookingsLoading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Loading your bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-700">No Bookings Yet</h3>
              <p className="text-sm">You haven't made any study area bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">📚 {booking.studyArea?.name || 'Study Area'}</h4>
                    <p className="text-sm text-gray-500">{booking.date} • {booking.timeSlot}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle size={14} />
                      {booking.status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            {modalType === 'success' && (
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-gray-700">{modalMessage}</p>
              </div>
            )}
            {modalType === 'error' && (
              <div className="text-center">
                <div className="text-4xl mb-3">❌</div>
                <p className="text-gray-700">{modalMessage}</p>
              </div>
            )}
            {modalType === 'confirm' && (
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-gray-700 mb-4">{modalMessage}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalConfirm}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
            {modalType !== 'confirm' && (
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lab Booking Modal */}
      {showBookingModal && selectedLabSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Book Lab Slot</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lab Number</label>
                <p className="text-teal-600 font-semibold">{selectedLabSlot.labNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <p className="text-gray-600">{selectedLabSlot.startTime} - {selectedLabSlot.endTime}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose (optional)</label>
                <input
                  type="text"
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  placeholder="Enter purpose"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLabBooking}
                className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
