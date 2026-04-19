import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Calendar, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

type Lab = {
  name: string;
  type: string;
  capacity: number;
  seatsAvailable?: number;
  matchingSlot?: { start: string; end: string };
  moduleCode?: string;
  moduleName?: string;
};

type FreeSlot = {
  start: string;
  end: string;
};

type LabSession = {
  moduleCode: string;
  moduleName: string;
  day: string;
  startTime: string;
  endTime: string;
  lecturer: string;
};

type Booking = {
  _id: string;
  labName: string;
  moduleCode: string;
  moduleName: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  seatsNeeded: number;
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function LabBooking() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedDate, setSelectedDate] = useState('');
  const [studentFreeSlots, setStudentFreeSlots] = useState<FreeSlot[]>([]);
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [labSchedule, setLabSchedule] = useState<{ sessions: LabSession[]; freeSlots: FreeSlot[] } | null>(null);
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [moduleCode, setModuleCode] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [seatsNeeded, setSeatsNeeded] = useState(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'book' | 'schedule' | 'my'>('book');

  const studentId = localStorage.getItem('studentId') || 'ST' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const studentName = localStorage.getItem('unifiedName') || '';

  useEffect(() => {
    fetchLabs();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchStudentFreeSlots();
    }
  }, [selectedDate, selectedDay]);

  useEffect(() => {
    if (studentFreeSlots.length > 0 && selectedTime) {
      fetchAvailableLabs();
    }
  }, [studentFreeSlots, selectedTime, selectedDay, selectedDate]);

  useEffect(() => {
    if (selectedLab && selectedDay) {
      fetchLabSchedule();
    }
  }, [selectedLab, selectedDay]);

  const fetchLabs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/labs`);
      const data = await res.json();
      setLabs(data);
      if (data.length > 0) setSelectedLab(data[0].name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentFreeSlots = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/student/free-slots?studentId=${studentId}&day=${selectedDay}`);
      const data = await res.json();
      setStudentFreeSlots(data.freeSlots || []);
    } catch (err) {
      console.error(err);
      setStudentFreeSlots([]);
    }
  };

  const fetchAvailableLabs = async () => {
    try {
      const startTime = selectedTime;
      const endHour = parseInt(selectedTime.split(':')[0]) + duration;
      const endTime = `${String(endHour).padStart(2, '0')}:00`;

      const res = await fetch(`${API_BASE}/api/booking/labs/available?day=${selectedDay}&date=${selectedDate}&startTime=${startTime}&endTime=${endTime}&moduleCode=${moduleCode}&moduleName=${moduleName}`);
      const data = await res.json();
      setAvailableLabs(data.availableLabs || []);
    } catch (err) {
      console.error(err);
      setAvailableLabs([]);
    }
  };

  const fetchLabSchedule = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/labs/${encodeURIComponent(selectedLab)}/schedule?day=${selectedDay}`);
      const data = await res.json();
      setLabSchedule({ sessions: data.sessions || [], freeSlots: data.freeSlots || [] });
    } catch (err) {
      console.error(err);
      setLabSchedule(null);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/lab-bookings?studentId=${studentId}`);
      const data = await res.json();
      setBookings(data.filter((b: Booking) => b.status !== 'Cancelled'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const d = new Date(date);
    setSelectedDay(DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]);
  };

  const getMinDate = () => new Date().toISOString().slice(0, 10);

  const getEndTime = (start: string) => {
    const [h, m] = start.split(':').map(Number);
    const endH = h + duration;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const handleBook = async (lab: Lab) => {
    setBookingLoading(true);
    setMessage(null);

    try {
      const startTime = selectedTime;
      const endTime = getEndTime(selectedTime);

      const res = await fetch(`${API_BASE}/api/booking/lab-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          labId: lab.name,
          labName: lab.name,
          moduleCode: moduleCode || '',
          moduleName: moduleName || '',
          day: selectedDay,
          date: selectedDate,
          startTime,
          endTime,
          purpose: 'Lab Work',
          seatsNeeded
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Booking failed' });
      } else {
        setMessage({ type: 'success', text: `Lab ${lab.name} booked successfully!` });
        fetchMyBookings();
        fetchAvailableLabs();
        setSelectedTime('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to book. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await fetch(`${API_BASE}/api/booking/lab-bookings/${bookingId}`, { method: 'DELETE' });
      fetchMyBookings();
      setMessage({ type: 'success', text: 'Booking cancelled' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel booking' });
    }
  };

  const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);
  const isPastTime = (time: string) => selectedDate === getMinDate() && parseInt(time.split(':')[0]) <= new Date().getHours();

  const hasOverlap = (start: string) => {
    const slotStart = parseInt(start.split(':')[0]);
    const slotEnd = slotStart + duration;
    return studentFreeSlots.some(slot => {
      const sStart = parseInt(slot.start.split(':')[0]);
      const sEnd = parseInt(slot.end.split(':')[0]);
      return slotStart >= sStart && slotEnd <= sEnd;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Booking</h1>
            <p className="text-gray-600">Book lab computers and equipment</p>
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
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Lab Schedule
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'my' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Bookings ({bookings.length})
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
          <div className="text-center py-12 text-gray-500">Loading labs...</div>
        ) : activeTab === 'book' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Date & Day</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={getMinDate()}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Your Free Slots ({selectedDay})</h3>
                <p className="text-sm text-gray-500 mb-4">Times when you have no classes</p>
                {studentFreeSlots.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {studentFreeSlots.map((slot, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {slot.start} - {slot.end}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No free slots found for {selectedDay}</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Time Slot</h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {TIME_SLOTS.map(time => {
                    const available = hasOverlap(time);
                    const past = isPastTime(time);
                    return (
                      <button
                        key={time}
                        disabled={past || !available}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? 'bg-indigo-600 text-white'
                            : past
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : available
                            ? 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                            : 'bg-red-50 text-red-400 cursor-not-allowed'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3].map(h => (
                    <button
                      key={h}
                      onClick={() => setDuration(h)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        duration === h ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                {selectedTime && (
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-700 text-sm">
                    Booking: {selectedTime} - {getEndTime(selectedTime)} ({selectedDay})
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Module Details (Optional)</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={moduleCode}
                    onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
                    placeholder="Module Code (e.g. IT3040)"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    placeholder="Module Name"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-2">Seats Needed</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setSeatsNeeded(n)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          seatsNeeded === n ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Available Labs</h3>
                {selectedTime && studentFreeSlots.length > 0 ? (
                  availableLabs.length > 0 ? (
                    <div className="space-y-3">
                      {availableLabs.map((lab, i) => (
                        <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{lab.name}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Users size={14} /> {lab.seatsAvailable} seats available
                              </p>
                              {lab.matchingSlot && (
                                <p className="text-xs text-green-600 mt-1">
                                  Free: {lab.matchingSlot.start} - {lab.matchingSlot.end}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleBook(lab)}
                              disabled={bookingLoading || lab.seatsAvailable === 0}
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Monitor size={32} className="mx-auto text-gray-300 mb-2" />
                      <p>No labs available for selected time</p>
                      <p className="text-sm mt-1">Try different time slot</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                    <p>Select a time slot to see available labs</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'schedule' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Lab</h3>
                <select
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {labs.map(lab => (
                    <option key={lab.name} value={lab.name}>{lab.name}</option>
                  ))}
                </select>
                <div className="mt-4">
                  <label className="block text-sm text-gray-600 mb-2">Day</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {labSchedule ? (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">{selectedLab} - {selectedDay}</h3>
                  
                  {labSchedule.sessions.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      <h4 className="text-sm font-medium text-gray-600">Scheduled Sessions</h4>
                      {labSchedule.sessions.map((s, i) => (
                        <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{s.moduleCode} - {s.moduleName}</p>
                              <p className="text-sm text-gray-600">{s.startTime} - {s.endTime}</p>
                              <p className="text-xs text-gray-500">Lecturer: {s.lecturer}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">No scheduled sessions for {selectedDay}</p>
                  )}

                  {labSchedule.freeSlots.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Available Time Slots</h4>
                      <div className="flex flex-wrap gap-2">
                        {labSchedule.freeSlots.map((slot, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {slot.start} - {slot.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                  Select a lab and day to view schedule
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.length === 0 ? (
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
              bookings.map(booking => (
                <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{booking.labName}</h4>
                    {booking.moduleCode && (
                      <p className="text-sm text-gray-600">{booking.moduleCode} - {booking.moduleName}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {booking.startTime} - {booking.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {booking.seatsNeeded} seat{booking.seatsNeeded > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {booking.status === 'Pending' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full font-medium">
                        Pending
                      </span>
                    )}
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
