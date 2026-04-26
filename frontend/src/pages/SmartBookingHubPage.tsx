import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, BookOpen, ChevronRight, CalendarClock, ChevronLeft, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import Topbar from '../components/Topbar';
import { studyAreaApi } from '../api/studyAreaApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type CalendarEvent = {
  id: string;
  date: number;
  month: number;
  year: number;
  title: string;
  type: 'Lab' | 'Study Area';
  time: string;
  location: string;
};

const SmartBookingHubPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allBookings, setAllBookings] = useState<CalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const studentId = localStorage.getItem('unifiedUserId') || localStorage.getItem('studentId') || '';

  useEffect(() => {
    if (studentId) {
      fetchAllBookings();
    }
  }, [studentId]);

  const fetchAllBookings = async () => {
    try {
      const events: CalendarEvent[] = [];

      // Fetch Study Area Bookings
      const studyResponse = await studyAreaApi.getUserBookings(studentId, { status: 'confirmed' });
      if (studyResponse.success && studyResponse.data.bookings) {
        studyResponse.data.bookings.forEach((b: any) => {
          const d = new Date(b.date);
          events.push({
            id: b._id,
            date: d.getDate(),
            month: d.getMonth(),
            year: d.getFullYear(),
            title: b.studyArea?.name || 'Study Area',
            type: 'Study Area',
            time: `${formatTime(b.startTime)} - ${formatTime(b.endTime)}`,
            location: b.studyArea?.location || 'Campus Library',
          });
        });
      }

      // Fetch Lab Bookings
      const labResponse = await fetch(`${API_BASE}/api/lab-booking/my-bookings?studentId=${studentId}`);
      if (labResponse.ok) {
        const labData = await labResponse.json();
        labData.forEach((b: any) => {
          if (b.status === 'Confirmed') {
            const d = new Date(b.date);
            events.push({
              id: b._id,
              date: d.getDate(),
              month: d.getMonth(),
              year: d.getFullYear(),
              title: b.labName,
              type: 'Lab',
              time: `${formatTime(b.startTime)} - ${formatTime(b.endTime)}`,
              location: 'Computer Lab',
            });
          }
        });
      }

      setAllBookings(events);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const formatTime = (timeStr: any) => {
    if (typeof timeStr === 'number') {
       return `${String(timeStr).padStart(2, '0')}:00`;
    }
    return timeStr;
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(day);
    const eventsForDay = allBookings.filter(e => e.date === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());
    setSelectedDayEvents(eventsForDay);
  };

  return (
    <div className="app-layout bg-slate-50">
      <div className="main-area flex-1 w-full flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 w-full flex justify-center items-center">
          <div className="w-full max-w-7xl bg-slate-50 min-h-[calc(100vh-120px)] shadow-xl border border-gray-100 rounded-3xl overflow-hidden relative flex flex-col">
        
        {/* Booking Options Grid */}
        <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
          
          {/* Study Area Booking Card */}
          <div 
            onClick={() => navigate('/study-booking')}
            className="bg-teal-50 rounded-3xl p-8 shadow-sm border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-teal-700 transition-colors">Study Area Booking</h2>
            <p className="text-gray-500 mb-8 flex-1">
              Find a quiet spot to focus. Reserve a desk in the library or common study areas for individual or group study sessions.
            </p>
            <div className="flex items-center text-teal-600 font-bold group-hover:text-teal-700">
              Book a Space <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Lab Booking Card */}
          <div 
            onClick={() => navigate('/lab-booking')}
            className="bg-teal-50 rounded-3xl p-8 shadow-sm border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Monitor size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-teal-700 transition-colors">Lab Booking</h2>
            <p className="text-gray-500 mb-8 flex-1">
              Reserve high-performance computers in specialized labs for your programming, design, and technical assignments.
            </p>
            <div className="flex items-center text-teal-600 font-bold group-hover:text-teal-700">
              Book a PC <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Calendar Section */}
        <div className="px-6 md:px-12 max-w-7xl mx-auto mt-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Calendar */}
            <div className="lg:col-span-2 bg-teal-50 rounded-3xl p-6 shadow-sm border border-teal-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Your Upcoming Bookings</h2>
                    <p className="text-sm text-gray-500 font-medium">Study areas & Labs schedule</p>
                  </div>
                </div>
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
                  <button onClick={prevMonth} className="p-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition text-gray-500"><ChevronLeft size={20} /></button>
                  <button onClick={nextMonth} className="p-2 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition text-gray-500"><ChevronRight size={20} /></button>
                </div>
              </div>

              <p className="text-lg font-bold text-teal-800 mb-4 text-center">
                 {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div key={i} className="text-center font-bold text-teal-600 text-xs uppercase tracking-wider">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-20 rounded-xl border border-transparent bg-transparent"></div>
                ))}
                
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const dayEvents = allBookings.filter(e => e.date === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());
                  const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                  const isSelected = selectedDate === day;
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => handleDayClick(day)}
                      className={`relative h-20 rounded-xl border flex flex-col items-center justify-start pt-2 cursor-pointer transition-all hover:border-teal-400 hover:shadow-md
                        ${isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 
                          isToday ? 'bg-white border-teal-300 shadow-sm' : 'bg-white border-gray-100'}
                      `}
                    >
                      <span className={`text-sm font-bold ${isSelected ? 'text-white' : isToday ? 'text-teal-600' : 'text-gray-600'}`}>{day}</span>
                      
                      <div className="flex flex-wrap justify-center gap-1 mt-2 px-1">
                        {dayEvents.map((evt, i) => i < 3 && (
                          <div key={i} className={`w-2 h-2 rounded-full ${evt.type === 'Lab' ? 'bg-indigo-400' : 'bg-emerald-400'}`} title={evt.title}></div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                {selectedDate 
                  ? `${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDate}, ${currentDate.getFullYear()}` 
                  : 'Select a day'}
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {!selectedDate ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <CalendarClock size={48} className="mb-4 opacity-20" />
                    <p>Click on a highlighted day in the calendar to view your bookings.</p>
                  </div>
                ) : selectedDayEvents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <p>No bookings for this date.</p>
                  </div>
                ) : (
                  selectedDayEvents.map((evt, i) => (
                    <div key={i} className={`p-4 rounded-2xl border-l-4 ${evt.type === 'Lab' ? 'border-l-indigo-500 bg-indigo-50' : 'border-l-emerald-500 bg-emerald-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${evt.type === 'Lab' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {evt.type}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Clock size={12} /> {evt.time}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900">{evt.title}</h4>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin size={14} className="text-gray-400"/> {evt.location}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>

        </div>
        </main>
      </div>
    </div>
  );
};

export default SmartBookingHubPage;
