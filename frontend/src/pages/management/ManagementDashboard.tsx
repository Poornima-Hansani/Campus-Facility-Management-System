import { useState } from "react";
import Layout from "../../components/Layout";
import { Users, GraduationCap, BookOpen, Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

// Mock Data
const MOCK_STATS = {
  activeStaff: 124,
  activeStudents: 3450,
  activeLectures: 42
};

const LECTURER_PERFORMANCE = [
  { name: 'Dr. Smith', rating: 4.8, lectures: 12 },
  { name: 'Prof. Johnson', rating: 4.5, lectures: 15 },
  { name: 'Dr. Lee', rating: 4.9, lectures: 10 },
  { name: 'Dr. Patel', rating: 4.3, lectures: 8 },
  { name: 'Prof. Davis', rating: 4.7, lectures: 14 }
];

const STAFF_PERFORMANCE = [
  { month: 'Jan', tasksResolved: 45, avgResponseTime: 20 },
  { month: 'Feb', tasksResolved: 52, avgResponseTime: 18 },
  { month: 'Mar', tasksResolved: 48, avgResponseTime: 19 },
  { month: 'Apr', tasksResolved: 61, avgResponseTime: 15 },
  { month: 'May', tasksResolved: 55, avgResponseTime: 17 }
];

const MEETINGS = [
  { id: 1, title: "Department Head Sync", date: new Date().toISOString().split('T')[0], time: "10:00 AM", location: "Main Boardroom" },
  { id: 2, title: "Budget Review", date: new Date().toISOString().split('T')[0], time: "02:00 PM", location: "Room 402" },
  { id: 3, title: "Facility Maintenance Meeting", date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: "09:00 AM", location: "Virtual" }
];

export default function ManagementDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Helper to get meetings for a specific day
  const getMeetingsForDay = (day: number) => {
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return MEETINGS.filter(m => m.date === dateStr);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-10">
        
        {/* Left Column: Welcome & Calendar */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Welcome Panel */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4">Empowering Excellence, Every Day.</h1>
              <p className="text-teal-100 max-w-lg leading-relaxed text-lg font-medium italic">"Great leaders inspire greatness in others. Your dedication drives our campus forward."</p>
            </div>
            {/* Decorative background circles */}
            <div className="absolute -right-10 -top-20 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
            <div className="absolute right-40 -bottom-20 w-64 h-64 bg-teal-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          </div>

          {/* Calendar Panel */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meeting Calendar</h2>
                <p className="text-sm text-gray-500 mt-1">Upcoming management meetings and events</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-100">
                <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg hover:shadow-sm transition"><ChevronLeft size={20} className="text-gray-600" /></button>
                <span className="font-bold text-gray-800 min-w-[130px] text-center">{monthName} {year}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg hover:shadow-sm transition"><ChevronRight size={20} className="text-gray-600" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 py-3 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-white min-h-[110px] p-2"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                const dayMeetings = getMeetingsForDay(day);

                return (
                  <div key={day} className={`bg-white min-h-[110px] p-2 transition hover:bg-gray-50 relative border-t border-gray-100 ${isToday ? 'bg-teal-50/30' : ''}`}>
                    <span className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-full mb-1 ${isToday ? 'bg-teal-600 text-white font-bold shadow-md' : 'text-gray-700 font-medium'}`}>
                      {day}
                    </span>
                    <div className="space-y-1.5 mt-1">
                      {dayMeetings.map((meeting, idx) => (
                        <div key={idx} className="text-xs bg-teal-100/80 text-teal-800 px-2 py-1.5 rounded-md truncate cursor-help border border-teal-200/50 font-medium" title={`${meeting.title} at ${meeting.time}`}>
                          {meeting.time} {meeting.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Upcoming List View */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-teal-600" />
                Upcoming in Next 7 Days
              </h3>
              <div className="space-y-3">
                {MEETINGS.slice(0, 3).map((meeting, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl border border-gray-100 transition group">
                    <div className="bg-teal-50 text-teal-700 p-3 rounded-xl flex flex-col items-center justify-center min-w-[65px] border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <span className="text-xs font-bold uppercase">{new Date(meeting.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold leading-none mt-0.5">{new Date(meeting.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md"><Clock size={12} /> {meeting.time}</span>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md"><MapPin size={12} /> {meeting.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Performance */}
        <div className="space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition group overflow-hidden relative">
              <div className="bg-blue-50 p-4 rounded-2xl group-hover:bg-blue-600 transition-colors z-10">
                <Users size={28} className="text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div className="z-10">
                <p className="text-sm text-gray-500 font-semibold mb-1">Total Active Staff</p>
                <h3 className="text-3xl font-bold text-gray-900">{MOCK_STATS.activeStaff}</h3>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition group overflow-hidden relative">
              <div className="bg-indigo-50 p-4 rounded-2xl group-hover:bg-indigo-600 transition-colors z-10">
                <GraduationCap size={28} className="text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <div className="z-10">
                <p className="text-sm text-gray-500 font-semibold mb-1">Total Active Students</p>
                <h3 className="text-3xl font-bold text-gray-900">{MOCK_STATS.activeStudents.toLocaleString()}</h3>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition group overflow-hidden relative">
              <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-orange-600 transition-colors z-10">
                <BookOpen size={28} className="text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <div className="z-10">
                <p className="text-sm text-gray-500 font-semibold mb-1">Total Active Lectures</p>
                <h3 className="text-3xl font-bold text-gray-900">{MOCK_STATS.activeLectures}</h3>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
            </div>
          </div>

          {/* Lecturer Performance */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
            <h3 className="font-bold text-xl text-gray-900 mb-1">Lecturer Performance</h3>
            <p className="text-sm text-gray-500 mb-8">Top rated lecturers this semester</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LECTURER_PERFORMANCE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} domain={[0, 5]} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Bar dataKey="rating" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff Performance */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
            <h3 className="font-bold text-xl text-gray-900 mb-1">Staff Performance</h3>
            <p className="text-sm text-gray-500 mb-8">Tasks resolved vs Response time trend</p>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={STAFF_PERFORMANCE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" name="Tasks Resolved" dataKey="tasksResolved" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} />
                  <Line yAxisId="right" type="monotone" name="Avg Response (m)" dataKey="avgResponseTime" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}