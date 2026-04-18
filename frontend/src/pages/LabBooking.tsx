import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Calendar, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type Lab = {
  labName: string;
  days: {
    Monday?: Array<{ start: number; end: number }>;
    Tuesday?: Array<{ start: number; end: number }>;
    Wednesday?: Array<{ start: number; end: number }>;
    Thursday?: Array<{ start: number; end: number }>;
    Friday?: Array<{ start: number; end: number }>;
    Saturday?: Array<{ start: number; end: number }>;
    Sunday?: Array<{ start: number; end: number }>;
  };
};

type SlotAvailability = {
  seatsAvailable: number;
  totalCapacity: number;
  isAvailable: boolean;
};

type Booking = {
  _id: string;
  studentId: string;
  studentName: string;
  labName: string;
  day: string;
  date: string;
  startTime: number;
  endTime: number;
  status: string;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function LabBooking() {
  const [allowedLabs, setAllowedLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<{ start: number; end: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: number; end: number }>>([]);
  const [slotAvailability, setSlotAvailability] = useState<SlotAvailability | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'book' | 'my'>('book');

  const studentId = localStorage.getItem('unifiedUserId') || '';

  useEffect(() => {
    if (studentId) {
      fetchAllowedLabs();
      fetchMyBookings();
    }
  }, [studentId]);

  useEffect(() => {
    if (selectedLab && allowedLabs.length > 0) {
      const lab = allowedLabs.find(l => l.labName === selectedLab);
      if (lab) {
        const days = Object.keys(lab.days).filter(day => 
          lab.days[day as keyof typeof lab.days] && 
          lab.days[day as keyof typeof lab.days]!.length > 0
        );
        setAvailableDays(days);
        setSelectedDay('');
        setSelectedTime(null);
      }
    }
  }, [selectedLab, allowedLabs]);

  useEffect(() => {
    if (selectedDay && selectedLab) {
      const lab = allowedLabs.find(l => l.labName === selectedLab);
      if (lab && lab.days[selectedDay as keyof typeof lab.days]) {
        setAvailableSlots(lab.days[selectedDay as keyof typeof lab.days]!);
        setSelectedTime(null);
      }
    }
  }, [selectedDay, selectedLab, allowedLabs]);

  const fetchAllowedLabs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lab-booking/allowed-slots?studentId=${studentId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch allowed labs');
      }
      
      setAllowedLabs(data);
      if (data.length > 0) {
        setSelectedLab(data[0].labName);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lab-booking/my-bookings?studentId=${studentId}`);
      const data = await res.json();
      setMyBookings(data);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const checkSlotAvailability = async () => {
    if (!selectedLab || !selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Please select lab, date, and time slot' });
      return;
    }

    setCheckingAvailability(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/lab-booking/slot-availability?labName=${encodeURIComponent(selectedLab)}&date=${selectedDate}&start=${selectedTime.start}&end=${selectedTime.end}`
      );
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to check availability');
      }
      
      setSlotAvailability(data);
      
      if (!data.isAvailable) {
        setMessage({ type: 'error', text: 'No seats available for this time slot' });
      } else {
        setMessage({ type: 'success', text: `${data.seatsAvailable} seats available` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBook = async () => {
    if (!selectedLab || !selectedDay || !selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Please complete all selections' });
      return;
    }

    if (!slotAvailability?.isAvailable) {
      setMessage({ type: 'error', text: 'Please check availability first' });
      return;
    }

    setBookingLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/lab-booking/book-lab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          labName: selectedLab,
          day: selectedDay,
          date: selectedDate,
          start: selectedTime.start,
          end: selectedTime.end
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      setMessage({ type: 'success', text: 'Lab booked successfully!' });
      fetchMyBookings();
      
      // Reset form
      setSelectedTime(null);
      setSelectedDate('');
      setSlotAvailability(null);
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/lab-booking/cancel-booking/${bookingId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to cancel booking');
      }

      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      fetchMyBookings();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to cancel booking' });
    }
  };

  const formatTime = (hour: number) => {
    return `${String(hour).padStart(2, '0')}:00`;
  };

  const getMinDate = () => new Date().toISOString().slice(0, 10);

  const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/student" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Booking</h1>
            <p className="text-gray-600">Book lab computers based on your academic schedule</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'book' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Book Lab
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'my' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Bookings ({myBookings.length})
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            message.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> :
             message.type === 'info' ? <AlertCircle size={20} /> : <XCircle size={20} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading your available labs...</div>
        ) : activeTab === 'book' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1: Select Lab */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Step 1: Select Lab</h3>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {allowedLabs.map((lab, i) => (
                    <option key={i} value={lab.labName}>{lab.labName}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Day */}
              {selectedLab && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Step 2: Select Day</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {availableDays.map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          selectedDay === day
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Time Slot */}
              {selectedDay && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Step 3: Select Time Slot</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableSlots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(slot)}
                        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                          selectedTime?.start === slot.start && selectedTime?.end === slot.end
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                        }`}
                      >
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Select Date */}
              {selectedTime && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Step 4: Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-700">
                        {selectedLab} - {selectedDay}, {selectedDate}<br/>
                        {formatTime(selectedTime.start)} - {formatTime(selectedTime.end)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Check Availability Button */}
              {selectedDate && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <button
                    onClick={checkSlotAvailability}
                    disabled={checkingAvailability}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {checkingAvailability ? 'Checking...' : 'Check Availability'}
                  </button>
                </div>
              )}

              {/* Book Button */}
              {slotAvailability?.isAvailable && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">
                      {slotAvailability.seatsAvailable} seats available out of {slotAvailability.totalCapacity}
                    </p>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {bookingLoading ? 'Booking...' : 'Book Lab'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Lab</p>
                    <p className="font-medium">{selectedLab || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Day</p>
                    <p className="font-medium">{selectedDay || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium">
                      {selectedTime ? `${formatTime(selectedTime.start)} - ${formatTime(selectedTime.end)}` : 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">{selectedDate || 'Not selected'}</p>
                  </div>
                  {slotAvailability && (
                    <div>
                      <p className="text-sm text-gray-600">Availability</p>
                      <p className={`font-medium ${slotAvailability.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {slotAvailability.isAvailable 
                          ? `${slotAvailability.seatsAvailable} seats available`
                          : 'No seats available'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Monitor size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No lab bookings yet</h3>
                <p className="text-gray-500 mt-1">Book a lab to get started</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Book Now
                </button>
              </div>
            ) : (
              myBookings.map(booking => (
                <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.labName}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                      <span>{booking.day}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {booking.status === 'Confirmed' && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                        Confirmed
                      </span>
                    )}
                    {isToday(booking.date) && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
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