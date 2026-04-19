import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Monitor, GraduationCap, Calendar, Clock, TrendingUp, MapPin, Bell } from 'lucide-react';

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

export default function StudentDashboard() {
  const studentId = localStorage.getItem('studentId') || 'Student';
  const studentName = localStorage.getItem('unifiedName') || 'Student';
  
  const studentYear = localStorage.getItem('year') || '1';
  const studentFaculty = localStorage.getItem('faculty') || 'Computing';
  const studentSpec = localStorage.getItem('specialization') || 'SE';
  const studentType = localStorage.getItem('scheduleType') || 'Weekday';

  const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState(studentType);
  const [dayFilter, setDayFilter] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchTimetable();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchTimetable();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchNotifications = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/timetable/notifications?userId=${studentId}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTimetable = timetable.filter(item => {
    if (dayFilter && item.day !== dayFilter) return false;
    return true;
  });

  const todaySessions = filteredTimetable.filter(item => item.day === getCurrentDay());
  const unreadCount = notifications.filter(n => !n.readBy?.includes(studentId)).length;

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            to="/study-booking"
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
              <BookOpen size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Study Area</h3>
            <p className="text-gray-500 text-sm mt-1">Book quiet study spaces</p>
          </Link>

          <Link 
            to="/lab-booking"
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group"
          >
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition-colors">
              <Monitor size={24} className="text-cyan-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Lab Booking</h3>
            <p className="text-gray-500 text-sm mt-1">Book lab computers</p>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-teal-600" />
              <h2 className="font-bold text-gray-900">My Timetable</h2>
            </div>
            <div className="flex gap-2">
              <select
                value={scheduleTypeFilter}
                onChange={(e) => {
                  setScheduleTypeFilter(e.target.value);
                  fetchTimetable();
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              >
                <option value="Weekday">Weekday</option>
                <option value="Weekend">Weekend</option>
              </select>
              <select
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              >
                <option value="">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading timetable...</div>
          ) : todaySessions.length > 0 ? (
            <div className="mb-4">
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Today's Lectures ({getCurrentDay()})
              </h3>
              <div className="space-y-2">
                {todaySessions
                  .sort((a, b) => convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime))
                  .map(session => (
                    <div key={session.id} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[60px]">
                          <div className="font-bold text-gray-900">{session.startTime}</div>
                          <div className="text-xs text-gray-500">{session.endTime}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{session.moduleCode} - {session.moduleName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <MapPin size={14} />
                            {session.venueName} | {session.lecturer}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {session.sessionType}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No lectures scheduled for today</div>
          )}

          {filteredTimetable.length > 0 && dayFilter ? (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">All {dayFilter} Sessions</h3>
              <div className="space-y-2">
                {filteredTimetable
                  .sort((a, b) => convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime))
                  .map(session => (
                    <div key={session.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[60px]">
                          <div className="font-bold text-gray-900">{session.startTime}</div>
                          <div className="text-xs text-gray-500">{session.endTime}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{session.moduleCode} - {session.moduleName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <MapPin size={14} />
                            {session.venueName}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {session.sessionType}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-teal-600" />
            <h2 className="font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              to="/reporting"
              className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Plus size={20} className="text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Report Issue</p>
                <p className="text-sm text-gray-500">Report campus facility problems</p>
              </div>
            </Link>

            <Link 
              to="/reporting/view"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Clock size={20} className="text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Track Reports</p>
                <p className="text-sm text-gray-500">View your submitted reports</p>
              </div>
            </Link>

            <Link 
              to="/study-booking"
              className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Calendar size={20} className="text-emerald-600" />
              <div>
                <p className="font-medium text-gray-900">Book Study Area</p>
                <p className="text-sm text-gray-500">Reserve quiet study zones</p>
              </div>
            </Link>

            <Link 
              to="/lab-booking"
              className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors"
            >
              <Monitor size={20} className="text-cyan-600" />
              <div>
                <p className="font-medium text-gray-900">Book Lab</p>
                <p className="text-sm text-gray-500">Reserve lab computers</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}