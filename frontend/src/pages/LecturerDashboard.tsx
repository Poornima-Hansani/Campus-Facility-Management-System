import { Calendar, Users, BookOpen, Award, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { getLecturerLabAlerts, confirmLabAlert, type LabAlert } from "../api/labGapApi";

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const [labAlerts, setLabAlerts] = useState<LabAlert[]>([]);
  const lecturerId = localStorage.getItem("unifiedUserId") || localStorage.getItem("lecturerId") || '';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await getLecturerLabAlerts(lecturerId);
      setLabAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAlert = async (alertId: string) => {
    try {
      await confirmLabAlert(alertId);
      fetchAlerts(); // Refresh alerts
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Lecturer Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {localStorage.getItem('unifiedName') || 'Lecturer'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Office Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/timetable-builder')}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Manage Schedule</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Course Materials</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Student Attendance</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <Award className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Grade Assignments</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New assignment submitted</p>
                <p className="text-xs text-gray-500">CS101 - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Student meeting scheduled</p>
                <p className="text-xs text-gray-500">Tomorrow at 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Course material updated</p>
                <p className="text-xs text-gray-500">MATH201 - Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Free Time Alerts */}
      <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-yellow-800 mb-4">
          ⚠ Lab Free Time Alerts (Turn off AC & Lights)
        </h2>

        {labAlerts.map((a, i) => (
          <div key={i} className="mb-3 p-3 bg-white rounded border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  🏢 {a.labName} - {a.day}
                </p>
                <p className="text-sm text-gray-700">
                  Free from {a.start}:00 to {a.end}:00 ({a.duration} hours)
                </p>
                <p className="text-xs text-gray-500">
                  Week {a.weekNumber} - {a.year}
                </p>
              </div>
              <div className="ml-4">
                {!a.confirmed ? (
                  <button
                    onClick={() => handleConfirmAlert(a._id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Confirm Turn Off</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Confirmed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Preview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600 w-20">9:00 AM</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">CS101 - Lecture</p>
              <p className="text-xs text-gray-500">Room 301</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600 w-20">11:00 AM</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Office Hours</p>
              <p className="text-xs text-gray-500">Room 205</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600 w-20">2:00 PM</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">MATH201 - Tutorial</p>
              <p className="text-xs text-gray-500">Room 102</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
