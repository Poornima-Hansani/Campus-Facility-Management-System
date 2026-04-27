import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Monitor, GraduationCap, Calendar, Clock, TrendingUp, Users, MapPin, Bell, Book, AlertCircle, CheckCircle } from 'lucide-react';
import { studyAreaApi } from '../api/studyAreaApi';

type TimetableRow = {
  id: number;
  moduleCode: string;
  moduleName: string;
  sessionType: string;
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
  faculty: string;
  year: number;
  specialization: string;
  scheduleType: string;
};

type CampusNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  category: string;
  status?: string;
  location?: string;
  issueType?: string;
  moduleCode?: string;
  moduleName?: string;
  areaName?: string;
  areaLocation?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  readBy?: string[];
  read?: boolean;
  data?: any;
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getCurrentDay(): string {
  const now = new Date();
  return dayNames[now.getDay()];
}

function convertTo24Hour(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Category colors and icons
const categoryConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
  timetable: { color: 'text-blue-800', bgColor: 'bg-blue-50 border-blue-200', icon: Calendar },
  help: { color: 'text-purple-800', bgColor: 'bg-purple-50 border-purple-200', icon: GraduationCap },
  issue: { color: 'text-red-800', bgColor: 'bg-red-50 border-red-200', icon: AlertCircle },
  booking: { color: 'text-emerald-800', bgColor: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
  general: { color: 'text-yellow-800', bgColor: 'bg-yellow-50 border-yellow-200', icon: Bell }
};

export default function StudentDashboard() {
  const studentId = localStorage.getItem('studentId') || 'Student';
  const studentName = localStorage.getItem('unifiedName') || 'Student';
  const userId = localStorage.getItem('userId') || '';
   
  const studentYear = localStorage.getItem('year') || '1';
  const studentFaculty = localStorage.getItem('faculty') || 'Computing';
  const studentSpec = localStorage.getItem('specialization') || 'Software Engineering';
  const studentType = localStorage.getItem('scheduleType') || 'Weekday';

const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState(studentType);
  const [dayFilter, setDayFilter] = useState('');
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [todayBookings, setTodayBookings] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampusNotifications();
    if (userId) {
      fetchTodayBookings();
    }
    const interval = setInterval(() => {
      fetchTimetable();
      fetchCampusNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [scheduleTypeFilter]);

  const fetchTimetable = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const params = new URLSearchParams({
        year: studentYear,
        faculty: studentFaculty,
        specialization: studentSpec,
        scheduleType: scheduleTypeFilter
      });
      const res = await fetch(`${API_BASE}/api/timetable/student?${params}`);
      const data = await res.json();
      setTimetable(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampusNotifications = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/campus-notifications?studentId=${encodeURIComponent(studentId)}&specialization=${encodeURIComponent(studentSpec)}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayBookings = async () => {
    if (!userId) return;
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const response = await studyAreaApi.getUserBookings(userId, { 
        startDate: today,
        endDate: today,
        status: 'confirmed' 
      });
      if (response.success && response.data.bookings) {
        setTodayBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching today bookings:', err);
    }
  };
  
  // Filter notifications based on active filter
  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(n => n.category === activeFilter);
  
  // Calculate unread count based on notification type
  const unreadCount = notifications.filter(n => 
    !n.readBy?.includes(studentId) && !n.read
  ).length;
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6 animate-fadeIn p-6">
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 flex justify-between items-center transition-all duration-300 hover:shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {studentName}</h1>
            <p className="text-gray-500 text-sm">
              {studentId !== 'Student' && <span className="mr-2">ID: {studentId}</span>}
              Year {studentYear} | {studentFaculty} | {studentSpec} | {studentType}
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
              <Bell size={16} className="text-red-600" />
              <span className="text-sm font-medium text-red-700">{unreadCount} new</span>
            </div>
          )}
        </div>

        
        {/* Today's Bookings Section */}
        {todayBookings.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Today's Bookings</h2>
            </div>
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <div key={booking._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{booking.studyArea.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-blue-700">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {booking.startTime} - {booking.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {booking.studyArea.location}
                        </span>
                      </div>
                      {booking.purpose && (
                        <p className="text-sm text-blue-600 mt-2">Purpose: {booking.purpose}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full font-medium">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <Link 
            to="/dashboard"
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <GraduationCap size={24} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Academic Help</h3>
            <p className="text-gray-500 text-sm mt-1">Tasks, goals & study sessions</p>
          </Link>

          <Link 
            to="/smart-booking"
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
              <Calendar size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Smart Booking</h3>
            <p className="text-gray-500 text-sm mt-1">Book study areas and labs</p>
          </Link>

          <Link 
            to="/reporting"
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
              <Plus size={24} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Issue Reporting</h3>
            <p className="text-gray-500 text-sm mt-1">Report campus facility problems</p>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel: Timetable (Weekly Calendar) */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Calendar size={24} className="text-teal-600" />
                <h2 className="font-bold text-gray-900 text-xl">Weekly Timetable</h2>
              </div>
              <select
                value={scheduleTypeFilter}
                onChange={(e) => setScheduleTypeFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                Loading calendar...
              </div>
            ) : timetable.length === 0 ? (
              <div className="text-center py-16 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-600">No sessions scheduled for your modules.</p>
                <p className="text-sm mt-1">Management will notify you when the timetable is updated.</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex gap-4 min-w-[700px]">
                  {(scheduleTypeFilter === "Weekend" ? ["Saturday", "Sunday"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]).map(day => {
                    const daySessions = timetable.filter(s => s.day === day).sort((a, b) => convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime));
                    const isToday = getCurrentDay() === day;
                    
                    return (
                      <div key={day} className={`flex-1 min-w-[150px] rounded-xl overflow-hidden border ${isToday ? 'border-teal-500 shadow-md ring-1 ring-teal-500' : 'border-gray-200 shadow-sm'}`}>
                        <div className={`py-2 px-3 text-center font-bold border-b ${isToday ? 'bg-teal-500 text-white border-teal-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {day}
                          {isToday && <span className="block text-[10px] font-medium uppercase tracking-wider opacity-90">Today</span>}
                        </div>
                        <div className="p-3 space-y-3 bg-white min-h-[300px]">
                          {daySessions.length > 0 ? daySessions.map((session, idx) => (
                            <div key={session.id || idx} className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-lg p-3 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-default">
                              <div className="text-[11px] font-bold text-teal-800 mb-1.5 flex items-center justify-between border-b border-teal-100/50 pb-1.5">
                                <span>{session.startTime} - {session.endTime}</span>
                                <span className="bg-white/80 text-teal-700 px-1.5 py-0.5 rounded shadow-sm border border-teal-100">{session.sessionType}</span>
                              </div>
                              <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{session.moduleCode}</div>
                              <div className="text-[11px] text-gray-600 mb-2 line-clamp-2" title={session.moduleName}>{session.moduleName}</div>
                              
                              <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-teal-100/50">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                  <MapPin size={10} className="shrink-0 text-teal-500" />
                                  <span className="truncate">{session.venueName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                  <Users size={10} className="shrink-0 text-teal-500" />
                                  <span className="truncate">{session.lecturer}</span>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="h-full min-h-[100px] flex items-center justify-center text-gray-300">
                              <span className="text-sm italic">No Sessions</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Campus Notices */}
          <div className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-yellow-600" />
                <h2 className="font-bold text-gray-900">Campus Notices</h2>
              </div>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1 mb-4">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  activeFilter === 'all' 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFilter('timetable')}
                className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  activeFilter === 'timetable' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Calendar size={10} /> Timetable
              </button>
              <button 
                onClick={() => setActiveFilter('help')}
                className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  activeFilter === 'help' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                <GraduationCap size={10} /> Help
              </button>
              <button 
                onClick={() => setActiveFilter('issue')}
                className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  activeFilter === 'issue' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <AlertCircle size={10} /> Issues
              </button>
              <button 
                onClick={() => setActiveFilter('booking')}
                className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1 ${
                  activeFilter === 'booking' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle size={10} /> Bookings
              </button>
            </div>
            
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredNotifications.map((notice, index) => {
                  const config = categoryConfig[notice.category] || categoryConfig.general;
                  const Icon = config.icon;
                  const isUnread = !notice.readBy?.includes(studentId) && !notice.read;
                  
                  return (
                    <div 
                      key={notice._id || index} 
                      className={`${config.bgColor} border p-3 rounded-lg transition-all hover:shadow-sm ${isUnread ? 'ring-1 ring-offset-1 ring-gray-300' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`shrink-0 mt-0.5 ${config.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-semibold text-sm ${config.color}`}>
                              {notice.title || 'Notification'}
                            </h4>
                            {isUnread && (
                              <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs mt-1 text-gray-600 line-clamp-2">
                            {notice.message}
                          </p>
                          {/* Show additional info based on category */}
                          {notice.category === 'issue' && notice.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <MapPin size={10} />
                              <span>{notice.location}</span>
                              {notice.issueType && <span>• {notice.issueType}</span>}
                            </div>
                          )}
                          {notice.category === 'booking' && notice.areaName && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <MapPin size={10} />
                              <span>{notice.areaName}</span>
                              {notice.startTime && (
                                <span>• {notice.startTime} - {notice.endTime}</span>
                              )}
                            </div>
                          )}
                          {notice.category === 'help' && notice.moduleCode && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Book size={10} />
                              <span>{notice.moduleCode}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            {new Date(notice.createdAt).toLocaleDateString()} • {new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm">
                  {activeFilter === 'all' 
                    ? 'No new notices at the moment'
                    : `No ${activeFilter} notifications`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}