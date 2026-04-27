import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getWeeklyConfirmationReport, type WeeklyReport } from "../api/adminLabAlertsApi";
import { getStudentTimetables, type StudentTimetable } from "../api/studentTimetablesApi";
import { MapPin } from "lucide-react";
import "../styles/print.css";
import "../styles/adminDashboard.css";
import "../styles/timetablePresentation.css";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport[]>([]);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>();
  const [selectedYear, setSelectedYear] = useState<number>();
  const [studentTimetables, setStudentTimetables] = useState<StudentTimetable[]>([]);
  const [showStudentTimetables, setShowStudentTimetables] = useState(false);
  const [showStudyAreas, setShowStudyAreas] = useState(false);
  const [showAddStudyArea, setShowAddStudyArea] = useState(false);
  const [showEditStudyArea, setShowEditStudyArea] = useState(false);
  const [editingArea, setEditingArea] = useState<any>(null);
  const [studyAreas, setStudyAreas] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    fetchWeeklyReport();
    fetchStudentTimetables();
    fetchStudyAreas();
    fetchReports();
  }, []);

  const fetchStudyAreas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/study-areas');
      const data = await res.json();
      if (data.success) {
        setStudyAreas(data.data.studyAreas || []);
      }
    } catch (err) {
      console.error('Error fetching study areas:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/reports');
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const handleAddStudyArea = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const studyAreaData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      capacity: parseInt(formData.get('capacity') as string),
      description: formData.get('description') as string,
      amenities: formData.get('amenities') ? [formData.get('amenities') as string] : []
    };

    try {
      const res = await fetch('http://localhost:3000/api/study-areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyAreaData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        setShowAddStudyArea(false);
        fetchStudyAreas(); // Refresh the list
        alert('Study area added successfully!');
      } else {
        alert('Error adding study area: ' + result.message);
      }
    } catch (err) {
      console.error('Error adding study area:', err);
      alert('Error adding study area. Please try again.');
    }
  };

  const handleEditStudyArea = (area: any) => {
    setEditingArea(area);
    setShowEditStudyArea(true);
  };

  const handleEditStudyAreaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editingArea) return;
    
    const formData = new FormData(e.currentTarget);
    const studyAreaData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      capacity: parseInt(formData.get('capacity') as string),
      description: formData.get('description') as string,
      amenities: formData.get('amenities') ? [formData.get('amenities') as string] : []
    };

    try {
      const res = await fetch(`http://localhost:3000/api/study-areas/${editingArea._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyAreaData)
      });
      
      const result = await res.json();
      
      if (result.success) {
        setShowEditStudyArea(false);
        setEditingArea(null);
        fetchStudyAreas(); // Refresh the list
        alert('Study area updated successfully!');
      } else {
        alert('Error updating study area: ' + result.message);
      }
    } catch (err) {
      console.error('Error updating study area:', err);
      alert('Error updating study area. Please try again.');
    }
  };

  const handleDeleteStudyArea = async (areaId: string) => {
    if (window.confirm('Are you sure you want to delete this study area? This action cannot be undone.')) {
      try {
        const res = await fetch(`http://localhost:3000/api/study-areas/${areaId}`, {
          method: 'DELETE'
        });
        
        const result = await res.json();
        
        if (result.success) {
          fetchStudyAreas(); // Refresh the list
          alert('Study area deleted successfully!');
        } else {
          alert('Error deleting study area: ' + result.message);
        }
      } catch (err) {
        console.error('Error deleting study area:', err);
        alert('Error deleting study area. Please try again.');
      }
    }
  };

  const fetchWeeklyReport = async (weekNumber?: number, year?: number) => {
    try {
      setLoading(true);
      const res = await getWeeklyConfirmationReport(weekNumber, year);
      setWeeklyReport(res.data.report);
      if (!weekNumber) {
        setSelectedWeek(res.data.currentWeek);
        setSelectedYear(res.data.currentYear);
      }
    } catch (error) {
      console.error("Error fetching weekly report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentTimetables = async () => {
    try {
      setLoading(true);
      const res = await getStudentTimetables();
      setStudentTimetables(res.data.timetables);
    } catch (error) {
      console.error("Error fetching student timetables:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="content-card admin-dashboard-intro">
        <div className="section-head">
          <div>
            <h2 className="dashboard-title">Administrator Dashboard</h2>
            <p className="dashboard-description">
              Manage campus facilities, monitor energy saving alerts, and oversee academic schedules
            </p>
          </div>
        </div>
        <div className="admin-dashboard-actions">
          <Link
            to="/energy-alerts"
            className="admin-action-btn energy-alerts-btn"
          >
            <span>Energy Alerts</span>
          </Link>
          <Link
            to="/admin/labtimetables"
            className="admin-action-btn lab-timetables-btn"
          >
            <span>📅 Lab Timetables</span>
          </Link>
          <button
            onClick={() => setShowWeeklyReport(!showWeeklyReport)}
            className={`admin-action-btn weekly-report-btn ${showWeeklyReport ? 'active' : ''}`}
          >
            <span>📊 {showWeeklyReport ? 'Hide Weekly Report' : 'Weekly Report'}</span>
          </button>
          <button
            onClick={() => setShowStudentTimetables(!showStudentTimetables)}
            className={`admin-action-btn student-timetables-btn ${showStudentTimetables ? 'active' : ''}`}
          >
            <span>📚 {showStudentTimetables ? 'Hide Student Schedules' : 'Student Schedules'}</span>
          </button>
          <button
            onClick={() => setShowStudyAreas(!showStudyAreas)}
            className={`admin-action-btn study-areas-btn ${showStudyAreas ? 'active' : ''}`}
          >
            <span>🏛️ {showStudyAreas ? 'Hide Study Areas' : 'Study Areas'}</span>
          </button>
          <button
            onClick={() => setShowReports(!showReports)}
            className={`admin-action-btn reports-btn ${showReports ? 'active' : ''}`}
            style={{ backgroundColor: '#f97316', color: 'white' }}
          >
            <span>📋 {showReports ? 'Hide All Issues' : 'All Issues'}</span>
          </button>
        </div>
      </div>

      {/* All Issues Section */}
      {showReports && (
        <div className="content-card mb-8">
          <div className="section-head mb-6">
            <h3>All Facility Issues</h3>
            <p>Comprehensive list of all reported facility issues across the campus</p>
          </div>
          
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm font-semibold uppercase tracking-wider">
                  <th className="p-4 border-b">ID</th>
                  <th className="p-4 border-b">Location</th>
                  <th className="p-4 border-b">Issue Type</th>
                  <th className="p-4 border-b">Details</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">Reported By</th>
                  <th className="p-4 border-b">Assigned To</th>
                  <th className="p-4 border-b">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map(report => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-500">{report._id.slice(-6)}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{report.location}</td>
                    <td className="p-4 text-sm text-gray-600">{report.issueType}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={report.comment}>{report.comment || "N/A"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                        report.status === 'Fixed' ? 'bg-green-100 text-green-700' :
                        report.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{report.studentId}</td>
                    <td className="p-4 text-sm text-gray-600">{report.assignedTo || "-"}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">No issues found in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly Confirmation Report Section */}
      {showWeeklyReport && (
        <div className="content-card">
          <div className="section-head">
            <h3>Weekly Confirmation Report</h3>
            <p>View confirmations from previous weeks, categorized by each lab</p>
          </div>
          
          <div className="no-print" style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '1rem' }}>
              Week: 
              <input
                type="number"
                value={selectedWeek || ''}
                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                style={{ marginLeft: '0.5rem', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Current week"
              />
            </label>
            <label style={{ marginLeft: '1rem' }}>
              Year: 
              <input
                type="number"
                value={selectedYear || ''}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ marginLeft: '0.5rem', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Current year"
              />
            </label>
            <button
              onClick={() => fetchWeeklyReport(selectedWeek, selectedYear)}
              style={{ marginLeft: '1rem', padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Filter
            </button>
            <button
              onClick={() => fetchWeeklyReport()}
              style={{ marginLeft: '0.5rem', padding: '4px 8px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Show All
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
              {/* Bulb Report Header */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Weekly Confirmation Report
                </h1>
                <p className="text-gray-600 text-lg">
                  Campus Facility Management System
                </p>
                <div className="flex justify-center gap-8 mt-4 text-sm text-gray-500">
                  <span>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                  <span>Period: Last {weeklyReport.length} weeks</span>
                </div>
              </div>

              {/* Weekly Bulb Grid */}
              {weeklyReport.map((week) => (
                <div key={week.weekKey} className="mb-16">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{week.weekKey}</h2>
                    <div className="flex justify-center gap-6 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        Labs: {week.labs.length}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        Confirmed: {week.labs.reduce((sum, lab) => sum + lab.totalConfirmed, 0)}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                        Pending: {week.labs.reduce((sum, lab) => sum + lab.totalPending, 0)}
                      </span>
                    </div>
                  </div>

                  {/* Modern Bulbs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {week.labs.map((lab, labIndex) => (
                      <div
                        key={lab.labName}
                        className={`relative group animate-fade-in-up ${
                          lab.totalPending === 0 ? 'lab-complete' : 'lab-pending'
                        }`}
                        style={{ animationDelay: `${labIndex * 0.1}s` }}
                      >
                        {/* Modern Light Rays for Complete Labs */}
                        {lab.totalPending === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="relative w-40 h-40">
                              <div className="absolute inset-0 animate-spin-slow">
                                <div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-yellow-300 to-transparent opacity-60 blur-sm"></div>
                                <div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-yellow-300 to-transparent opacity-60 blur-sm rotate-45"></div>
                                <div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-yellow-300 to-transparent opacity-60 blur-sm rotate-90"></div>
                                <div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-yellow-300 to-transparent opacity-60 blur-sm rotate-135"></div>
                              </div>
                              <div className="absolute inset-4 animate-pulse">
                                <div className="w-full h-full bg-yellow-200 rounded-full opacity-30 blur-xl"></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Modern Bulb Container */}
                        <div className="relative flex flex-col items-center">
                          {/* Modern Bulb Shape */}
                          <div className="relative mb-8">
                            <div className={`relative transition-all duration-700 transform group-hover:scale-105 group-hover:rotate-3 ${
                              lab.totalPending === 0 
                                ? 'bulb-active-glow' 
                                : 'bulb-inactive'
                            }`}>
                              {/* Modern Bulb Design */}
                              <div className="relative">
                                {/* Glass Bulb */}
                                <div className={`relative w-32 h-40 rounded-t-full transition-all duration-700 ${
                                  lab.totalPending === 0
                                    ? 'bg-gradient-to-br from-yellow-100 via-yellow-200 to-amber-300 shadow-2xl shadow-yellow-400/50'
                                    : 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 shadow-xl shadow-gray-400/30'
                                }`}>
                                  {/* Glass Shine Effect */}
                                  <div className="absolute top-4 left-6 w-8 h-12 bg-white/40 rounded-full blur-md transform rotate-12"></div>
                                  <div className="absolute top-8 left-4 w-4 h-6 bg-white/60 rounded-full blur-sm"></div>
                                  
                                  {/* Filament */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`transition-all duration-700 ${
                                      lab.totalPending === 0 ? 'opacity-100' : 'opacity-30'
                                    }`}>
                                      <div className={`w-8 h-8 rounded-full border-2 ${
                                        lab.totalPending === 0 
                                          ? 'border-orange-400 bg-orange-200 animate-pulse' 
                                          : 'border-gray-400 bg-gray-300'
                                      }`}>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <div className={`w-4 h-0.5 ${
                                            lab.totalPending === 0 ? 'bg-orange-600' : 'bg-gray-500'
                                          }`}></div>
                                          <div className={`w-0.5 h-4 absolute ${
                                            lab.totalPending === 0 ? 'bg-orange-600' : 'bg-gray-500'
                                          }`}></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Glow Overlay for Active Bulbs */}
                                  {lab.totalPending === 0 && (
                                    <div className="absolute inset-0 rounded-t-full bg-gradient-to-t from-transparent via-yellow-200/30 to-yellow-100/50 animate-pulse"></div>
                                  )}
                                </div>
                                
                                {/* Modern Bulb Base */}
                                <div className="relative w-32 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg shadow-lg">
                                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full"></div>
                                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full"></div>
                                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full"></div>
                                  <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full"></div>
                                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-gray-900 rounded-full"></div>
                                </div>
                                
                                {/* Hanging Wire */}
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-gray-400 to-gray-600"></div>
                              </div>
                            </div>
                          </div>

                          {/* Modern Lab Details Card */}
                          <div className="absolute top-48 left-1/2 transform -translate-x-1/2 w-64 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-gray-100 hover:shadow-3xl transition-all duration-300">
                            {/* Lab Header */}
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-bold text-gray-800 mb-2">{lab.labName}</h3>
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                                lab.totalPending === 0 
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' 
                                  : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${
                                  lab.totalPending === 0 ? 'bg-green-500 animate-pulse' : 'bg-orange-500'
                                }`}></span>
                                <span>{lab.totalPending === 0 ? 'All Clear' : `${lab.totalPending} Pending`}</span>
                              </div>
                            </div>

                            {/* Modern Metrics */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="text-center p-2 bg-green-50 rounded-xl border border-green-200">
                                <div className="text-xl font-bold text-green-600 animate-fade-in">{lab.totalConfirmed}</div>
                                <div className="text-xs text-green-700 font-medium">Confirmed</div>
                              </div>
                              <div className="text-center p-2 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="text-xl font-bold text-orange-600 animate-fade-in">{lab.totalPending}</div>
                                <div className="text-xs text-orange-700 font-medium">Pending</div>
                              </div>
                              <div className="text-center p-2 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="text-xl font-bold text-blue-600 animate-fade-in">{lab.totalConfirmed + lab.totalPending}</div>
                                <div className="text-xs text-blue-700 font-medium">Total</div>
                              </div>
                            </div>

                            {/* Modern Alert Details */}
                            <div className="space-y-2">
                              {lab.confirmedAlerts.length > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                      <span className="text-green-700 text-sm font-semibold">Confirmed</span>
                                    </div>
                                    <span className="text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded-full">{lab.confirmedAlerts.length}</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {lab.confirmedAlerts.slice(0, 2).map((alert, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs p-1.5 bg-white/70 rounded-lg">
                                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                          {alert.lecturerName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-gray-700 font-medium truncate">{alert.lecturerName}</div>
                                          <div className="text-gray-500">{alert.day} {alert.timeSlot}</div>
                                        </div>
                                      </div>
                                    ))}
                                    {lab.confirmedAlerts.length > 2 && (
                                      <div className="text-xs text-green-600 text-center bg-green-50 rounded-lg py-1">
                                        +{lab.confirmedAlerts.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {lab.pendingAlerts.length > 0 && (
                                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                      <span className="text-orange-700 text-sm font-semibold">Pending</span>
                                    </div>
                                    <span className="text-orange-600 text-xs font-medium bg-orange-100 px-2 py-1 rounded-full">{lab.pendingAlerts.length}</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {lab.pendingAlerts.slice(0, 2).map((alert, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs p-1.5 bg-white/70 rounded-lg">
                                        <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                          {alert.lecturerName.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-gray-700 font-medium truncate">{alert.lecturerName}</div>
                                          <div className="text-gray-500">{alert.day} {alert.timeSlot}</div>
                                        </div>
                                      </div>
                                    ))}
                                    {lab.pendingAlerts.length > 2 && (
                                      <div className="text-xs text-orange-600 text-center bg-orange-50 rounded-lg py-1">
                                        +{lab.pendingAlerts.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {lab.confirmedAlerts.length === 0 && lab.pendingAlerts.length === 0 && (
                                <div className="text-center py-4 bg-gray-50 rounded-xl border border-gray-200">
                                  <div className="text-gray-400 text-sm font-medium">No alerts</div>
                                  <div className="text-gray-300 text-xs mt-1">All systems clear</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Summary Section */}
              <div className="mt-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Report Summary</h2>
                <div className="flex justify-center gap-8 flex-wrap">
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-blue-600">{weeklyReport.length}</div>
                    <div className="text-sm text-gray-600">Weeks</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-green-600">
                      {weeklyReport.reduce((sum, week) => sum + week.confirmedAlerts, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Confirmed</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-orange-600">
                      {weeklyReport.reduce((sum, week) => sum + week.pendingAlerts, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-purple-600">
                      {(() => {
                        const totalConfirmed = weeklyReport.reduce((sum, week) => sum + week.confirmedAlerts, 0);
                        const totalPending = weeklyReport.reduce((sum, week) => sum + week.pendingAlerts, 0);
                        return totalConfirmed + totalPending > 0 
                          ? Math.round((totalConfirmed / (totalConfirmed + totalPending)) * 100)
                          : 0;
                      })()}%
                    </div>
                    <div className="text-sm text-gray-600">Completion</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      
      {/* Student Timetables Section - Presentation Style */}
      {showStudentTimetables && (
        <div className="timetable-presentation">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((studentTimetables.length > 0 ? 100 : 0))}%` }}></div>
          </div>
          
          <div className="presentation-container">
            <div className="presentation-header">
              <h1 className="presentation-title slide-top">Student Academic Timetables</h1>
              <p className="presentation-subtitle slide-bottom delay-200">
                Comprehensive Academic Schedules - Year {new Date().getFullYear()}
              </p>
            </div>

            <div className="stats-container">
              <div className="stat-card slide-left delay-300">
                <div className="stat-number">{studentTimetables.length}</div>
                <div className="stat-label">Total Programs</div>
              </div>
              <div className="stat-card slide-right delay-400">
                <div className="stat-number">
                  {studentTimetables.reduce((acc, tt) => acc + tt.groups.length, 0)}
                </div>
                <div className="stat-label">Total Groups</div>
              </div>
              <div className="stat-card slide-top delay-500">
                <div className="stat-number">
                  {studentTimetables.reduce((acc, tt) => 
                    acc + tt.groups.reduce((groupAcc, group) => groupAcc + group.totalSessions, 0), 0
                  )}
                </div>
                <div className="stat-label">Total Sessions</div>
              </div>
            </div>
            
            {loading ? (
              <div className="presentation-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <>
                {studentTimetables.length === 0 ? (
                  <div className="timetable-card flip-in">
                    <div className="timetable-header">
                      <h2 className="timetable-title">No Timetables Available</h2>
                      <p className="timetable-info">Student timetables will appear here once they are generated</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {studentTimetables.map((timetable, index) => (
                      <div 
                        key={`${timetable.year}-${timetable.semester}-${timetable.batch}-${timetable.specialization}`} 
                        className={`timetable-card ${index % 2 === 0 ? 'slide-left' : 'slide-right'} delay-${(index * 100) + 600}`}
                      >
                        <div className="timetable-header">
                          <div className="timetable-title">
                            <h2 className="text-3xl font-bold mb-2">
                              {timetable.year} - {timetable.semester}
                            </h2>
                            <div className="flex gap-3 flex-wrap">
                              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                                {timetable.batch}
                              </span>
                              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold">
                                {timetable.specialization}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl mb-2">{'\ud83d\udc65'}</div>
                            <div className="text-xl font-bold text-white">
                              {timetable.groups.length} Groups
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {timetable.groups.map((group, groupIndex) => (
                              <div 
                                key={group.group} 
                                className={`day-card ${groupIndex % 3 === 0 ? 'zoom-rotate' : groupIndex % 3 === 1 ? 'flip-in' : 'slide-bottom'} delay-${(groupIndex * 100) + 800}`}
                              >
                                <div className="day-header">
                                  <div className="day-icon">{'\ud83d\udccb'}</div>
                                  <div>
                                    <h3 className="text-xl font-bold">Group {group.group}</h3>
                                    <p className="text-sm opacity-75">{group.totalSessions} Sessions</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-3 mt-4">
                                  {group.sessions
                                    .sort((a, b) => {
                                      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                      if (a.day !== b.day) return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                                      return a.startTime.localeCompare(b.startTime);
                                    })
                                    .map((session, sessionIndex) => (
                                      <div 
                                        key={session.sessionId} 
                                        className={`session-card ${session.type === 'LAB' ? 'lab-card' : ''} delay-${(sessionIndex * 50) + 1200}`}
                                      >
                                        <div className="session-time">
                                          <span className="font-bold text-green-700">{session.day}</span>
                                          <span className="mx-2">|</span>
                                          <span>{session.startTime} - {session.endTime}</span>
                                        </div>
                                        <div className="session-subject">{session.subject}</div>
                                        <div className="session-details">
                                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                            session.type === 'LAB' 
                                              ? 'bg-green-200 text-green-800' 
                                              : 'bg-blue-200 text-blue-800'
                                          }`}>
                                            {session.type}
                                          </span>
                                          <span className="mx-2">|</span>
                                          <span>{session.location}</span>
                                          <span className="mx-2">|</span>
                                          <span>{session.lecturer?.name || 'N/A'}</span>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="presentation-nav">
            <button className="nav-btn" onClick={() => setShowStudentTimetables(false)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Study Areas Management Section */}
      {showStudyAreas && (
        <div className="content-card">
          <div className="section-head">
            <h3>Study Areas Management</h3>
            <p>Add, edit, and manage study areas for student bookings</p>
          </div>
          
          <div className="mb-6">
            <button 
              onClick={() => setShowAddStudyArea(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add New Study Area
            </button>
          </div>

          {/* Add Study Area Modal */}
          {showAddStudyArea && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Study Area</h3>
                  <button 
                    onClick={() => setShowAddStudyArea(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleAddStudyArea} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Area Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Silent Study Room A"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Library Building 2nd Floor"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      max="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Maximum number of students"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Optional description of the study area"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <input
                      type="text"
                      name="amenities"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., WiFi, Whiteboard, Power outlets"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddStudyArea(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Study Area
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Study Area Modal */}
          {showEditStudyArea && editingArea && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Edit Study Area</h3>
                  <button 
                    onClick={() => {
                      setShowEditStudyArea(false);
                      setEditingArea(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleEditStudyAreaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Area Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingArea.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Silent Study Room A"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingArea.location}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Library Building 2nd Floor"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      defaultValue={editingArea.capacity}
                      min="1"
                      max="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Maximum number of students"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={editingArea.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Optional description of the study area"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <input
                      type="text"
                      name="amenities"
                      defaultValue={editingArea.amenities ? editingArea.amenities.join(', ') : ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., WiFi, Whiteboard, Power outlets"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditStudyArea(false);
                        setEditingArea(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Update Study Area
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Study Areas List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyAreas.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                <div className="text-gray-500 mb-4">🏛️</div>
                <p className="text-gray-600">No study areas added yet</p>
                <p className="text-sm text-gray-500 mt-2">Click "Add New Study Area" to get started</p>
              </div>
            ) : (
              studyAreas.map((area) => (
                <div key={area._id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{area.name}</h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {area.capacity} seats
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {area.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{area.location}</span>
                    </div>
                    
                    {area.description && (
                      <p className="text-sm text-gray-600">{area.description}</p>
                    )}
                    
                    {area.amenities && area.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {area.amenities.map((amenity: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <button 
                      onClick={() => handleEditStudyArea(area)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteStudyArea(area._id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AdminDashboard;
