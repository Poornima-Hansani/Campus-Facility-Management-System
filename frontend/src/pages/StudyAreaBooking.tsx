import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Users, MapPin, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

type StudyArea = {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  description: string;
  amenities: string[];
  bookings?: number;
  availableSeats?: number;
};

type Booking = {
  _id: string;
  areaName: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function StudyAreaBooking() {
  const [areas, setAreas] = useState<StudyArea[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedArea, setSelectedArea] = useState<StudyArea | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'book' | 'my'>('book');

  const studentId = localStorage.getItem('studentId') || 'ST' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const studentName = localStorage.getItem('unifiedName') || '';

  useEffect(() => {
    fetchAreas();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedArea && selectedDate) {
      fetchAreaDetails(selectedArea._id);
    }
  }, [selectedArea, selectedDate]);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/study-areas`);
      const data = await res.json();
      setAreas(data);
      if (data.length > 0) setSelectedArea(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaDetails = async (areaId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/study-areas/${areaId}?date=${selectedDate}`);
      const data = await res.json();
      setAreas(prev => prev.map(a => a._id === areaId ? data : a));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/study-bookings?studentId=${studentId}`);
      const data = await res.json();
      setBookings(data.filter((b: Booking) => b.status === 'Confirmed'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const d = new Date(date);
    setSelectedDay(DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const handleBook = async () => {
    if (!selectedArea || !selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Please select date and time' });
      return;
    }

    setBookingLoading(true);
    setMessage(null);

    try {
      const startTime = selectedTime;
      const endHour = parseInt(selectedTime.split(':')[0]) + duration;
      const endTime = `${String(endHour).padStart(2, '0')}:00`;

      const res = await fetch(`${API_BASE}/api/booking/study-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          areaId: selectedArea._id,
          areaName: selectedArea.name,
          day: selectedDay,
          date: selectedDate,
          startTime,
          endTime,
          purpose: purpose || 'Study'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Booking failed' });
      } else {
        setMessage({ type: 'success', text: 'Study area booked successfully!' });
        fetchMyBookings();
        fetchAreaDetails(selectedArea._id);
        setSelectedTime('');
        setPurpose('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to book. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await fetch(`${API_BASE}/api/booking/study-bookings/${bookingId}`, { method: 'DELETE' });
      fetchMyBookings();
      setMessage({ type: 'success', text: 'Booking cancelled' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel booking' });
    }
  };

  const isToday = (date: string) => {
    return date === new Date().toISOString().slice(0, 10);
  };

  const getEndTime = (start: string) => {
    const [h, m] = start.split(':').map(Number);
    const endH = h + duration;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Area Booking</h1>
            <p className="text-gray-600">Book quiet study spaces on campus</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'book'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Book Study Area
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading study areas...</div>
        ) : activeTab === 'book' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Date</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Time</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {TIME_SLOTS.map(time => {
                    const isPast = selectedDate === getMinDate() && parseInt(time.split(':')[0]) <= new Date().getHours();
                    return (
                      <button
                        key={time}
                        disabled={isPast}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? 'bg-teal-600 text-white'
                            : isPast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-700 hover:bg-teal-50'
                        }`}
                      >
                        {time}
                        {selectedTime !== time && (
                          <span className="block text-xs opacity-60">-{duration}h</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-2">Duration</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(h => (
                      <button
                        key={h}
                        onClick={() => setDuration(h)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          duration === h
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-teal-50'
                        }`}
                      >
                        {h} hour{h > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedTime && (
                  <p className="mt-3 text-sm text-gray-600">
                    Booking: {selectedTime} - {getEndTime(selectedTime)} ({selectedDay})
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Purpose (Optional)</h3>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Group study, Exam prep..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Study Areas</h3>
                <div className="space-y-3">
                  {areas.map(area => (
                    <button
                      key={area._id}
                      onClick={() => setSelectedArea(area)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                        selectedArea?._id === area._id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900">{area.name}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {area.location}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users size={14} /> {area.capacity}
                        </span>
                        {area.availableSeats !== undefined && (
                          <span className={`font-medium ${area.availableSeats > 10 ? 'text-green-600' : area.availableSeats > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {area.availableSeats} available
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedArea && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900">{selectedArea.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedArea.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedArea.amenities.map((a, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!selectedArea || !selectedDate || !selectedTime || bookingLoading}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {bookingLoading ? 'Booking...' : 'Book Study Area'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                <p className="text-gray-500 mt-1">Book a study area to get started</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Book Now
                </button>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.areaName}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    {booking.purpose && (
                      <p className="text-sm text-gray-500 mt-1">Purpose: {booking.purpose}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isToday(booking.date) && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                        Today
                      </span>
                    )}
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
