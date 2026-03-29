import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Info } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-emerald-900 tracking-tight sm:text-5xl">
          Student Portal
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          Welcome to UniManage. Access services to keep our campus clean, safe, and functional.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Issue Reporting Card */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden group">
          <div className="p-8">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-300">
              <AlertTriangle className="text-emerald-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Facility Issue Reporting</h3>
            <p className="text-gray-600 mb-6">
              Notice a broken A/C, water leak, or cleanliness issue? Report it here and track its resolution progress.
            </p>
            <Link 
              to="/reporting" 
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm active:scale-[0.98]"
            >
              Open Reporting Dashboard
            </Link>
          </div>
        </div>

        {/* Placeholder for future features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-75">
          <div className="p-8">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
              <ClipboardList className="text-gray-500" size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Other Services</h3>
            <p className="text-gray-500 mb-6">
              More campus services will be added here soon, including room bookings and event registrations.
            </p>
            <button 
              disabled
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-200 text-base font-medium rounded-xl text-gray-400 bg-gray-50 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex gap-4 items-start">
        <Info className="text-emerald-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="text-lg font-bold text-emerald-900">Need Immediate Help?</h4>
          <p className="text-emerald-800 mt-1">
            For emergencies (e.g., major flooding, fire hazards), please contact the Campus Security hotline at <span className="font-bold">011-234-5678</span> immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
