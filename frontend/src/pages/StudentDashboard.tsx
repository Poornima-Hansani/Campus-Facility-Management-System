import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Monitor, GraduationCap, Calendar, Clock, TrendingUp } from 'lucide-react';

export default function StudentDashboard() {
  const studentId = localStorage.getItem('studentId') || 'Student';
  const studentName = localStorage.getItem('unifiedName') || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetch('http://localhost:3000/api/management/weekly-summary'),
          fetch('http://localhost:3000/api/management/dashboard')
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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
              Manage your academic activities
            </p>
          </div>
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
