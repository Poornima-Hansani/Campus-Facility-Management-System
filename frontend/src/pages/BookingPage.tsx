import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, CheckCircle2, X, ArrowLeft, Info, Loader2 } from 'lucide-react';

type Facility = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  available: boolean;
};

type Booking = {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'cancelled';
};

const facilities: Facility[] = [
  { id: '1', name: 'Lab A', type: 'Laboratory', capacity: 30, location: 'Engineering Building, Floor 2', available: true },
  { id: '2', name: 'Seminar Room B', type: 'Meeting Room', capacity: 20, location: 'Business School, Floor 1', available: true },
  { id: '3', name: 'Lecture Hall L101', type: 'Lecture Hall', capacity: 100, location: 'Main Building, Floor 3', available: false },
  { id: '4', name: 'Study Room 1', type: 'Study Room', capacity: 8, location: 'Library, Floor 1', available: true },
  { id: '5', name: 'Computer Lab C', type: 'Computer Lab', capacity: 40, location: 'IT Building, Floor 1', available: true },
  { id: '6', name: 'Conference Room', type: 'Meeting Room', capacity: 15, location: 'Admin Building, Floor 2', available: true },
];

const timeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([
    { id: '1', facilityId: '1', facilityName: 'Lab A', date: '2026-03-31', timeSlot: '02:00 PM - 04:00 PM', status: 'confirmed' },
    { id: '2', facilityId: '4', facilityName: 'Study Room 1', date: '2026-04-01', timeSlot: '10:00 AM - 12:00 PM', status: 'pending' },
  ]);

  const handleBooking = () => {
    if (!selectedFacility || !selectedDate || !selectedTime) return;
    
    setIsBooking(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: Date.now().toString(),
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        date: selectedDate,
        timeSlot: selectedTime,
        status: 'confirmed',
      };
      setMyBookings([...myBookings, newBooking]);
      setIsBooking(false);
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedFacility(null);
        setSelectedDate('');
        setSelectedTime('');
      }, 2000);
    }, 1000);
  };

  const cancelBooking = (id: string) => {
    setMyBookings(myBookings.filter(b => b.id !== id));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-600' },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="relative min-h-screen bg-gray-50 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>
        <div className="absolute bottom-0 left-40 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-4000"></div>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-center transition-all duration-300 hover:shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Book a Facility</h1>
            <p className="text-gray-500 text-sm">
              Reserve rooms, labs, and study spaces
            </p>
          </div>
          <button 
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Booking Guidelines</p>
            <p className="text-blue-600 mt-1">
              Bookings can be made up to 7 days in advance. Maximum booking duration is 2 hours. 
              Please cancel at least 1 hour before if you can't attend.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Facility Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            <h3 className="font-semibold text-gray-700 mb-4">Available Facilities</h3>
            <div className="space-y-3">
              {facilities.map((facility) => (
                <div 
                  key={facility.id}
                  onClick={() => facility.available && setSelectedFacility(facility)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    selectedFacility?.id === facility.id 
                      ? 'border-green-500 bg-green-50' 
                      : facility.available 
                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm' 
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-800">{facility.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{facility.type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      facility.available ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {facility.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {facility.capacity} seats
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {facility.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
              <h3 className="font-semibold text-gray-700 mb-4">Make a Booking</h3>
              
              {selectedFacility ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-sm text-green-600 font-medium">Selected Facility</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">{selectedFacility.name}</p>
                    <p className="text-sm text-gray-500">{selectedFacility.location}</p>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Select Date
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        min={getMinDate()}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2 text-sm">
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                            selectedTime === slot
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || isBooking}
                    className="w-full py-3 rounded-xl text-white font-bold bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Booking...
                      </>
                    ) : bookingSuccess ? (
                      <>
                        <CheckCircle2 size={20} />
                        Booking Confirmed!
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Select a facility to make a booking</p>
                </div>
              )}
            </div>

            {/* My Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
              <h3 className="font-semibold text-gray-700 mb-4">My Bookings</h3>
              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((booking) => {
                    const badge = getStatusBadge(booking.status);
                    return (
                      <div key={booking.id} className="flex justify-between items-start bg-gray-50 p-4 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-800">{booking.facilityName}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {booking.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {booking.timeSlot}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {booking.status}
                          </span>
                          {booking.status !== 'cancelled' && (
                            <button 
                              onClick={() => cancelBooking(booking.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
