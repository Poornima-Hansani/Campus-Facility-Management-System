import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Users, MapPin, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { studyAreaApi } from '../api/studyAreaApi';
import type { StudyArea, StudyAreaBooking, FreeTimeSlot } from '../api/studyAreaApi';

export default function StudyAreaBooking() {
  const [areas, setAreas] = useState<StudyArea[]>([]);
  const [bookings, setBookings] = useState<StudyAreaBooking[]>([]);
  const [selectedArea, setSelectedArea] = useState<StudyArea | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [freeTimeSlots, setFreeTimeSlots] = useState<FreeTimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<FreeTimeSlot | null>(null);
  const [purpose, setPurpose] = useState('');
  const [numberOfStudents, setNumberOfStudents] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [freeSlotsLoading, setFreeSlotsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'book' | 'my'>('book');

  // Get current user info from localStorage
  const userId = localStorage.getItem('unifiedUserId') || localStorage.getItem('studentId') || '';

  useEffect(() => {
    fetchAreas();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedDate && userId) {
      fetchFreeTimeSlots();
    }
  }, [selectedDate, userId]);

  const fetchAreas = async () => {
    try {
      const response = await studyAreaApi.getStudyAreas();
      if (response.success) {
        setAreas(response.data.studyAreas || []);
        if (response.data.studyAreas && response.data.studyAreas.length > 0) {
          setSelectedArea(response.data.studyAreas[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching study areas:', err);
      setMessage({ type: 'error', text: 'Failed to load study areas' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFreeTimeSlots = async () => {
    if (!userId || !selectedDate) return;
    
    setFreeSlotsLoading(true);
    try {
      const response = await studyAreaApi.getFreeTimeSlots(userId, selectedDate);
      if (response.success && response.data.freeSlots) {
        setFreeTimeSlots(response.data.freeSlots);
        setSelectedTimeSlot(null); // Reset selected time slot when date changes
      } else {
        setFreeTimeSlots([]);
        setMessage({ type: 'error', text: 'No free time slots available for this date' });
      }
    } catch (err) {
      console.error('Error fetching free time slots:', err);
      setFreeTimeSlots([]);
      setMessage({ type: 'error', text: 'Failed to load free time slots' });
    } finally {
      setFreeSlotsLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!userId) return;
    
    try {
      const response = await studyAreaApi.getUserBookings(userId, { status: 'confirmed' });
      if (response.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const handleBook = async () => {
    if (!selectedArea || !selectedDate || !selectedTimeSlot || !userId) {
      setMessage({ type: 'error', text: 'Please select study area, date, and time slot' });
      return;
    }

    setBookingLoading(true);
    setMessage(null);

    try {
      const response = await studyAreaApi.createBooking({
        userId,
        studyAreaId: selectedArea._id,
        date: selectedDate,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        purpose: purpose.trim() || undefined,
        numberOfStudents,
        notes: notes.trim() || undefined
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'Study area booked successfully!' });
        fetchMyBookings();
        // Reset form
        setSelectedTimeSlot(null);
        setPurpose('');
        setNumberOfStudents(1);
        setNotes('');
      } else {
        setMessage({ type: 'error', text: 'Failed to create booking' });
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to book. Please try again.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await studyAreaApi.cancelBooking(bookingId);
      setMessage({ type: 'success', text: 'Booking cancelled successfully' });
      fetchMyBookings();
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to cancel booking' });
    }
  };

  const isToday = (date: string) => {
    return date === new Date().toISOString().slice(0, 10);
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration);
    const minutes = (duration % 1) * 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/smart-booking" className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Area Booking</h1>
            <p className="text-gray-600">Book study areas during your free time slots</p>
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
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  Select Date
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {selectedDate && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Your Free Time Slots
                  </h3>
                  {freeSlotsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading your free time slots...</div>
                  ) : freeTimeSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={48} className="mx-auto text-gray-300 mb-3" />
                      <p>No free time slots available on this date</p>
                      <p className="text-sm text-gray-400 mt-1">You have classes during all available times</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {freeTimeSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedTimeSlot?.startTime === slot.startTime
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-medium text-gray-900">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {formatDuration(slot.duration)}
                              </span>
                            </div>
                            {selectedTimeSlot?.startTime === slot.startTime && (
                              <CheckCircle size={20} className="text-teal-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {slot.day}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTimeSlot && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Students
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={numberOfStudents}
                        onChange={(e) => setNumberOfStudents(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose (Optional)
                      </label>
                      <input
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g., Group study, Exam prep..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional notes..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Study Areas
                </h3>
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
                      </div>
                    </button>
                  ))}
                </div>

                {selectedArea && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900">{selectedArea.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedArea.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedArea.amenities.map((amenity, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!selectedArea || !selectedDate || !selectedTimeSlot || bookingLoading}
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
                <div key={booking._id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-gray-900">{booking.studyArea.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{booking.studyArea.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{booking.numberOfStudents} student{booking.numberOfStudents > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      {booking.purpose && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Purpose:</p>
                          <p className="text-sm text-gray-600">{booking.purpose}</p>
                        </div>
                      )}
                      
                      {booking.notes && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-700">Notes:</p>
                          <p className="text-sm text-blue-600">{booking.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {isToday(booking.date) && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium mb-2 inline-block">
                          Today
                        </span>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
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
