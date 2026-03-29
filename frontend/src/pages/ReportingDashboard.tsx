import { Link } from 'react-router-dom';
import { PlusCircle, History, ArrowLeft } from 'lucide-react';

export default function ReportingDashboard() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Back button */}
      <Link to="/student" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Student Portal
      </Link>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Issue Reporting Dashboard
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your campus facility reports. You can submit new issues or track the status of ones you've already reported.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Report Link */}
        <Link 
          to="/reporting/add"
          className="group flex flex-col items-center text-center bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:border-emerald-200 transform hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <PlusCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
            Report New Issue
          </h2>
          <p className="text-gray-500">
            Submit a new facility issue (e.g. broken A/C, untidy washroom). Attach photos for faster resolution.
          </p>
        </Link>

        {/* View Reports Link */}
        <Link 
          to="/reporting/view"
          className="group flex flex-col items-center text-center bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:border-emerald-200 transform hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <History size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
            View My Reports
          </h2>
          <p className="text-gray-500">
            Check the status of issues you have previously reported. Rate the service once an issue is fixed.
          </p>
        </Link>
      </div>
    </div>
  );
}
