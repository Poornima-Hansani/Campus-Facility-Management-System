import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Calendar as CalendarIcon, CheckCircle2, Circle, ChevronLeft, ChevronRight, Target, Plus } from "lucide-react";

const TaskDashboardPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dummy data combined with localStorage data
  const initialAcademicEvents = [
    { date: 15, month: new Date().getMonth(), year: new Date().getFullYear(), title: "Database Systems Midterm", type: "Exam", color: "bg-red-50 text-red-600", time: "10:00 AM" },
    { date: 18, month: new Date().getMonth(), year: new Date().getFullYear(), title: "Software Eng Project", type: "Assignment", color: "bg-blue-50 text-blue-600", time: "11:59 PM" },
    { date: 22, month: new Date().getMonth(), year: new Date().getFullYear(), title: "Math Quiz", type: "Exam", color: "bg-red-50 text-red-600", time: "02:00 PM" },
    { date: 25, month: new Date().getMonth(), year: new Date().getFullYear(), title: "UI/UX Case Study", type: "Assignment", color: "bg-blue-50 text-blue-600", time: "11:59 PM" }
  ];
  
  const [academicEvents, setAcademicEvents] = useState(initialAcademicEvents);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem('customAcademicEvents') || '[]');
    setAcademicEvents([...initialAcademicEvents, ...savedEvents]);
  }, []);

  const goals = [
    { id: 1, text: "Read Chapter 4 of Database Systems", completed: true },
    { id: 2, text: "Complete UI wireframes for assignment", completed: false },
    { id: 3, text: "Review Math lecture notes", completed: false },
    { id: 4, text: "Practice past exam questions", completed: false },
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto bg-slate-50 min-h-[calc(100vh-80px)] pb-20 shadow-xl border border-gray-100 rounded-3xl overflow-hidden relative mt-4">
        
        {/* Header */}
        <div className="p-6 bg-teal-50 rounded-b-3xl shadow-sm border-b border-teal-100 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <p className="text-teal-500 text-xs font-bold uppercase tracking-wider mb-1">Scholar Overview</p>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">Keep Pushing Forward! 🚀</h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                Success is the sum of small efforts. Stay focused, track your goals, and make today count.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <div className="flex-1 md:flex-none bg-teal-50 border border-teal-100 rounded-2xl px-8 py-4 text-center min-w-[120px]">
                  <p className="text-3xl font-bold text-teal-600">12</p>
                  <p className="text-xs uppercase tracking-wider font-bold text-teal-400 mt-1">Pending</p>
               </div>
               <div className="flex-1 md:flex-none bg-green-50 border border-green-100 rounded-2xl px-8 py-4 text-center min-w-[120px]">
                  <p className="text-3xl font-bold text-green-600">3.8</p>
                  <p className="text-xs uppercase tracking-wider font-bold text-green-400 mt-1">GPA</p>
               </div>
            </div>
          </div>
        </div>

        <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Today's Goals Section */}
          <div className="bg-teal-50 rounded-3xl p-5 shadow-sm border border-teal-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-2xl">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Today's Goals</h2>
                <p className="text-xs text-gray-400 font-medium">Your daily study checklist</p>
              </div>
            </div>

            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-100 group">
                  <button className={`mt-0.5 flex-shrink-0 ${goal.completed ? 'text-teal-500' : 'text-gray-300 group-hover:text-teal-400'}`}>
                    {goal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <span className={`text-sm ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Daily Progress</span>
                <span className="text-sm font-bold text-teal-500">25%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-teal-500 h-2 rounded-full w-1/4"></div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-teal-50 rounded-3xl p-5 shadow-sm border border-teal-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl">
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Tasks and Goals</h2>
                  <p className="text-xs text-gray-400 font-medium">Your upcoming schedule</p>
                </div>
              </div>
              <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
                <button onClick={prevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition text-gray-400"><ChevronLeft size={18} /></button>
                <button onClick={nextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition text-gray-400"><ChevronRight size={18} /></button>
              </div>
            </div>

            <p className="text-sm font-bold text-gray-600 mb-3 text-center">
               {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center font-bold text-gray-300 text-[10px]">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-10 rounded-xl border border-transparent bg-transparent"></div>
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const hasEvent = academicEvents.some(e => e.date === day && e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                
                return (
                  <div key={day} className={`h-10 rounded-xl flex items-center justify-center relative cursor-pointer transition-all ${isToday ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30 font-bold' : hasEvent ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-100'}`}>
                    <span className="text-sm">{day}</span>
                    {hasEvent && !isToday && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400"></span>}
                  </div>
                );
              })}
            </div>

            {/* Upcoming Event List */}
            <div className="mt-5 space-y-2">
               {academicEvents
                 .filter(e => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear() && e.date >= new Date().getDate())
                 .sort((a,b) => a.date - b.date)
                 .slice(0, 3)
                 .map((event, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl flex items-center gap-3 ${event.color} bg-opacity-50`}>
                     <div className="w-10 h-10 rounded-xl bg-white bg-opacity-60 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase opacity-60">Day</span>
                        <span className="text-sm font-bold">{event.date}</span>
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-sm text-gray-800">{event.title}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold opacity-80">{event.type}</p>
                     </div>
                     {event.time && <div className="text-xs font-bold opacity-80 bg-white/50 px-2 py-1 rounded-md">{event.time}</div>}
                  </div>
               ))}
            </div>
          </div>

        </div>

        {/* Floating Add Button */}
        <button 
          onClick={() => navigate('/study-goals')}
          className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-500 text-white rounded-full shadow-xl shadow-indigo-400/40 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </button>
      </div>
    </Layout>
  );
};

export default TaskDashboardPage;