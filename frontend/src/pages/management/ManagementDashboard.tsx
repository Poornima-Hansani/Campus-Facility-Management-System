import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { Activity, FileText, Users, Calendar, Mail } from "lucide-react";

export default function ManagementDashboard() {
  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <Activity className="text-green-600" size={24} />
          </div>
          Management Overview
        </h2>
        <p className="text-gray-500 text-sm mt-1">Select a section from sidebar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/management/facility" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
            <FileText className="text-red-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg">Facility Management</h3>
          <p className="text-sm text-gray-500 mt-1">Manage campus issues and escalations</p>
        </Link>

        <Link to="/management/issues" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4">
            <FileText className="text-yellow-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg">Issues List</h3>
          <p className="text-sm text-gray-500 mt-1">View and track all reported issues</p>
        </Link>

        <Link to="/management/staff" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg">Staff List</h3>
          <p className="text-sm text-gray-500 mt-1">Manage staff members and workloads</p>
        </Link>

        <Link to="/management/timetable" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg">Timetable & Lectures</h3>
          <p className="text-sm text-gray-500 mt-1">View module timetable and availability</p>
        </Link>

        <Link to="/management/emails" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <Mail className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-lg">Emails</h3>
          <p className="text-sm text-gray-500 mt-1">Record encouragement emails</p>
        </Link>
      </div>
    </Layout>
  );
}