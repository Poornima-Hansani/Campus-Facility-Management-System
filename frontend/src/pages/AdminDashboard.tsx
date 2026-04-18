import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getAllLecturerAlerts, getWeeklyConfirmationReport, type LecturerAlertSummary, type WeeklyReport } from "../api/adminLabAlertsApi";
import { getStudentTimetables, type StudentTimetable } from "../api/studentTimetablesApi";
import "../styles/print.css";
import "../styles/adminDashboard.css";

const AdminDashboard = () => {
  const [lecturerAlerts, setLecturerAlerts] = useState<LecturerAlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({ totalAlerts: 0, totalConfirmed: 0, totalPending: 0 });
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport[]>([]);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number>();
  const [selectedYear, setSelectedYear] = useState<number>();
  const [studentTimetables, setStudentTimetables] = useState<StudentTimetable[]>([]);
  const [showStudentTimetables, setShowStudentTimetables] = useState(false);

  useEffect(() => {
    fetchLecturerAlerts();
    fetchWeeklyReport();
    fetchStudentTimetables();
  }, []);

  const fetchLecturerAlerts = async () => {
    try {
      setLoading(true);
      const res = await getAllLecturerAlerts();
      setLecturerAlerts(res.data.summary);
      setTotalStats({
        totalAlerts: res.data.totalAlerts,
        totalConfirmed: res.data.totalConfirmed,
        totalPending: res.data.totalPending
      });
    } catch (error) {
      console.error("Error fetching lecturer alerts:", error);
    } finally {
      setLoading(false);
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
            to="/management-dashboard"
            className="admin-action-btn management-btn"
          >
            <span>🏢 Management Dashboard</span>
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
            onClick={() => window.print()}
            className="admin-action-btn print-report-btn"
            disabled={!showWeeklyReport}
          >
            <span>🖨️ Print Report</span>
          </button>
          <button
            onClick={() => setShowStudentTimetables(!showStudentTimetables)}
            className={`admin-action-btn student-timetables-btn ${showStudentTimetables ? 'active' : ''}`}
          >
            <span>📚 {showStudentTimetables ? 'Hide Student Schedules' : 'Student Schedules'}</span>
          </button>
        </div>
      </div>

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

                  {/* Bulbs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {week.labs.map((lab, labIndex) => (
                      <div
                        key={lab.labName}
                        className={`relative group ${lab.totalPending === 0 ? 'bulb-on' : 'bulb-off'}`}
                        style={{ animationDelay: `${labIndex * 0.1}s` }}
                      >
                        {/* Light Rays for Complete Labs */}
                        {lab.totalPending === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="absolute w-32 h-32 animate-pulse">
                              <div className="absolute top-0 left-1/2 w-1 h-16 bg-yellow-300 opacity-60 animate-pulse ray-1"></div>
                              <div className="absolute top-0 left-1/2 w-1 h-16 bg-yellow-300 opacity-60 animate-pulse ray-2"></div>
                              <div className="absolute top-0 left-1/2 w-1 h-16 bg-yellow-300 opacity-60 animate-pulse ray-3"></div>
                              <div className="absolute top-0 left-1/2 w-1 h-16 bg-yellow-300 opacity-60 animate-pulse ray-4"></div>
                              <div className="absolute top-0 left-1/2 w-1 h-16 bg-yellow-300 opacity-60 animate-pulse ray-5"></div>
                              <div className="absolute top-0 left-1/2 w-1 h-16 bg-yellow-300 opacity-60 animate-pulse ray-6"></div>
                            </div>
                          </div>
                        )}

                        {/* Bulb Container */}
                        <div className="relative flex flex-col items-center">
                          {/* Bulb Shape */}
                          <div className="relative mb-6">
                            {/* Bulb Glass - SVG Shape */}
                            <div className={`relative transition-all duration-500 transform group-hover:scale-110 ${
                              lab.totalPending === 0 ? 'bulb-glow-on' : 'bulb-glow-off'
                            }`}>
                              <svg width="128" height="160" viewBox="0 0 128 160" className="drop-shadow-2xl">
                                {/* Bulb Glass Shape */}
                                <defs>
                                  <radialGradient id={`bulbGradient-${lab.labName}`} cx="50%" cy="40%" r="60%">
                                    <stop offset="0%" stopColor={lab.totalPending === 0 ? "#FEF3C7" : "#F3F4F6"} />
                                    <stop offset="100%" stopColor={lab.totalPending === 0 ? "#FCD34D" : "#D1D5DB"} />
                                  </radialGradient>
                                  <filter id={`glow-${lab.labName}`}>
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                    <feMerge>
                                      <feMergeNode in="coloredBlur"/>
                                      <feMergeNode in="SourceGraphic"/>
                                    </feMerge>
                                  </filter>
                                </defs>
                                
                                {/* Main Bulb Shape */}
                                <path
                                  d="M64 20 C90 20, 110 40, 110 70 C110 90, 100 105, 85 115 L85 120 C85 125, 80 130, 75 130 L53 130 C48 130, 43 125, 43 120 L43 115 C28 105, 18 90, 18 70 C18 40, 38 20, 64 20 Z"
                                  fill={`url(#bulbGradient-${lab.labName})`}
                                  stroke={lab.totalPending === 0 ? "#F59E0B" : "#9CA3AF"}
                                  strokeWidth="2"
                                  filter={lab.totalPending === 0 ? `url(#glow-${lab.labName})` : ""}
                                />
                                
                                {/* Glass Shine */}
                                <ellipse cx="45" cy="50" rx="15" ry="25" fill="white" opacity="0.3" />
                                
                                {/* Bulb Base */}
                                <rect x="43" y="130" width="42" height="20" rx="3" fill="#4B5563" />
                                <rect x="43" y="130" width="42" height="4" fill="#1F2937" />
                                <rect x="43" y="136" width="42" height="4" fill="#1F2937" />
                                <rect x="43" y="142" width="42" height="4" fill="#1F2937" />
                                <rect x="43" y="148" width="42" height="4" fill="#1F2937" />
                                
                                {/* Filament */}
                                <g className={`transition-all duration-500 ${lab.totalPending === 0 ? 'opacity-100' : 'opacity-30'}`}>
                                  <line x1="64" y1="60" x2="64" y2="85" stroke={lab.totalPending === 0 ? "#FB923C" : "#6B7280"} strokeWidth="2" />
                                  <circle cx="64" cy="72" r="4" fill="none" stroke={lab.totalPending === 0 ? "#FB923C" : "#6B7280"} strokeWidth="2" />
                                  <line x1="64" y1="72" x2="58" y2="78" stroke={lab.totalPending === 0 ? "#FB923C" : "#6B7280"} strokeWidth="1" />
                                  <line x1="64" y1="72" x2="70" y2="78" stroke={lab.totalPending === 0 ? "#FB923C" : "#6B7280"} strokeWidth="1" />
                                  <line x1="64" y1="72" x2="58" y2="66" stroke={lab.totalPending === 0 ? "#FB923C" : "#6B7280"} strokeWidth="1" />
                                  <line x1="64" y1="72" x2="70" y2="66" stroke={lab.totalPending === 0 ? "#FB923C" : "#6B7280"} strokeWidth="1" />
                                </g>
                                
                                {/* Glow Effect for Active Bulbs */}
                                {lab.totalPending === 0 && (
                                  <circle cx="64" cy="75" r="60" fill="#FEF3C7" opacity="0.3" className="animate-pulse" />
                                )}
                              </svg>
                            </div>

                                                      </div>

                          {/* Lab Details Inside Bulb */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                            {/* Lab Name */}
                            <div className="text-center mb-3">
                              <h3 className="text-lg font-bold text-gray-800">{lab.labName}</h3>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                lab.totalPending === 0 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                <span>{lab.totalPending === 0 ? 'All Clear' : `${lab.totalPending} Pending`}</span>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex gap-4 mb-3">
                              <div className="text-center">
                                <div className="text-xl font-bold text-green-600">{lab.totalConfirmed}</div>
                                <div className="text-xs text-gray-600">Confirmed</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-orange-600">{lab.totalPending}</div>
                                <div className="text-xs text-gray-600">Pending</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xl font-bold text-blue-600">{lab.totalConfirmed + lab.totalPending}</div>
                                <div className="text-xs text-gray-600">Total</div>
                              </div>
                            </div>

                            {/* Alert Details */}
                            <div className="w-full px-4 space-y-2">
                              {lab.confirmedAlerts.length > 0 && (
                                <div className="bg-green-50 rounded-lg p-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-green-600 text-xs font-medium">Confirmed</span>
                                    <span className="text-green-600 text-xs">({lab.confirmedAlerts.length})</span>
                                  </div>
                                  <div className="space-y-1">
                                    {lab.confirmedAlerts.slice(0, 2).map((alert, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs">
                                        <div className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {alert.lecturerName.charAt(0)}
                                        </div>
                                        <span className="text-gray-700 truncate">{alert.lecturerName}</span>
                                        <span className="text-gray-500">{alert.day} {alert.timeSlot}</span>
                                      </div>
                                    ))}
                                    {lab.confirmedAlerts.length > 2 && (
                                      <div className="text-xs text-gray-500 text-center">+{lab.confirmedAlerts.length - 2} more</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {lab.pendingAlerts.length > 0 && (
                                <div className="bg-orange-50 rounded-lg p-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-orange-600 text-xs font-medium">Pending</span>
                                    <span className="text-orange-600 text-xs">({lab.pendingAlerts.length})</span>
                                  </div>
                                  <div className="space-y-1">
                                    {lab.pendingAlerts.slice(0, 2).map((alert, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs">
                                        <div className="w-4 h-4 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {alert.lecturerName.charAt(0)}
                                        </div>
                                        <span className="text-gray-700 truncate">{alert.lecturerName}</span>
                                        <span className="text-gray-500">{alert.day} {alert.timeSlot}</span>
                                      </div>
                                    ))}
                                    {lab.pendingAlerts.length > 2 && (
                                      <div className="text-xs text-gray-500 text-center">+{lab.pendingAlerts.length - 2} more</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {lab.confirmedAlerts.length === 0 && lab.pendingAlerts.length === 0 && (
                                <div className="text-center py-2">
                                  <div className="text-gray-400 text-sm">No alerts</div>
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
                    <div className="text-3xl font-bold text-green-600">{totalStats.totalConfirmed}</div>
                    <div className="text-sm text-gray-600">Confirmed</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-orange-600">{totalStats.totalPending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
                    <div className="text-3xl font-bold text-purple-600">
                      {totalStats.totalConfirmed + totalStats.totalPending > 0 
                        ? Math.round((totalStats.totalConfirmed / (totalStats.totalConfirmed + totalStats.totalPending)) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Completion</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lecturer Energy Alerts Section */}
      <div className="content-card">
        <div className="section-head">
          <h3>Energy Saving Alerts Status</h3>
          <p>Monitor all lecturers' lab energy saving alert confirmations</p>
        </div>
        
        {loading ? (
          <div>Loading alert data...</div>
        ) : (
          <>
            {/* Stats Summary */}
            <div className="energy-stats-grid">
              <div className="energy-stat-card total-alerts">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{'\ud83d\udcca'}</span>
                </div>
                <div className="stat-content">
                  <h4 className="stat-title">Total Alerts</h4>
                  <div className="stat-number">{totalStats.totalAlerts}</div>
                  <div className="stat-description">Active energy saving alerts</div>
                </div>
              </div>
              
              <div className="energy-stat-card confirmed-alerts">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{'\u2705'}</span>
                </div>
                <div className="stat-content">
                  <h4 className="stat-title">Confirmed</h4>
                  <div className="stat-number">{totalStats.totalConfirmed}</div>
                  <div className="stat-description">Successfully confirmed</div>
                </div>
              </div>
              
              <div className="energy-stat-card pending-alerts">
                <div className="stat-icon-wrapper">
                  <span className="stat-icon">{'\u23f3'}</span>
                </div>
                <div className="stat-content">
                  <h4 className="stat-title">Pending</h4>
                  <div className="stat-number">{totalStats.totalPending}</div>
                  <div className="stat-description">Awaiting confirmation</div>
                </div>
              </div>
            </div>

            {/* Lecturer Alerts Table */}
            <div className="energy-alerts-table">
              <div className="table-header">
                <h4 className="table-title">
                  <span className="table-icon">{'\ud83d\udc68\u200d\ud83c\udfeb'}</span>
                  Lecturer Alert Details
                </h4>
                <div className="table-summary">
                  <span className="summary-item">
                    <span className="summary-icon">{'\ud83d\udcca'}</span>
                    {lecturerAlerts.length} Lecturers
                  </span>
                  <span className="summary-item">
                    <span className="summary-icon">{'\ud83d\udd0b'}</span>
                    {totalStats.totalAlerts} Total Alerts
                  </span>
                </div>
              </div>
              
              {lecturerAlerts.length === 0 ? (
                <div className="empty-alerts-state">
                  <div className="empty-icon">{'\ud83d\udca1'}</div>
                  <h3>No Energy Alerts Found</h3>
                  <p>All labs are currently energy efficient!</p>
                </div>
              ) : (
                <div className="alerts-table-wrapper">
                  <table className="energy-alerts-table-content">
                    <thead>
                      <tr>
                        <th>
                          <span className="table-header">
                            <span className="header-icon">{'\ud83d\udc64'}</span>
                            Lecturer
                          </span>
                        </th>
                        <th>
                          <span className="table-header">
                            <span className="header-icon">{'\ud83d\udcca'}</span>
                            Total
                          </span>
                        </th>
                        <th>
                          <span className="table-header">
                            <span className="header-icon">{'\u2705'}</span>
                            Confirmed
                          </span>
                        </th>
                        <th>
                          <span className="table-header">
                            <span className="header-icon">{'\u23f3'}</span>
                            Pending
                          </span>
                        </th>
                        <th>
                          <span className="table-header">
                            <span className="header-icon">{'\ud83d\udcca'}</span>
                            Status
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lecturerAlerts.map((lecturer, index) => (
                        <tr 
                          key={lecturer.lecturerId} 
                          className="lecturer-row"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <td className="lecturer-cell">
                            <div className="lecturer-info">
                              <div className="lecturer-avatar">
                                {lecturer.lecturerName.charAt(0)}
                              </div>
                              <div className="lecturer-details">
                                <div className="lecturer-name">{lecturer.lecturerName}</div>
                                <div className="lecturer-id">{lecturer.lecturerId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="total-alerts-cell">
                            <div className="alert-count">
                              <span className="count-number">{lecturer.totalAlerts}</span>
                              <span className="count-label">alerts</span>
                            </div>
                          </td>
                          <td className="confirmed-alerts-cell">
                            <div className="confirmed-count">
                              <span className="count-number confirmed">{lecturer.confirmedAlerts}</span>
                              <span className="count-label">confirmed</span>
                            </div>
                          </td>
                          <td className="pending-alerts-cell">
                            <div className="pending-count">
                              <span className="count-number pending">{lecturer.pendingAlerts}</span>
                              <span className="count-label">pending</span>
                            </div>
                          </td>
                          <td className="status-cell">
                            {lecturer.pendingAlerts === 0 ? (
                              <div className="status-badge all-confirmed">
                                <span className="status-icon">{'\u2705'}</span>
                                <span className="status-text">All Confirmed</span>
                              </div>
                            ) : (
                              <div className="status-badge pending-status">
                                <span className="status-icon">{'\u23f3'}</span>
                                <span className="status-text">{lecturer.pendingAlerts} Pending</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </> 
        )}
      </div>

      {/* Student Timetables Section */}
      {showStudentTimetables && (
        <div className="content-card student-timetables-section">
          <div className="section-head">
            <h3 className="section-title">
              <span className="section-icon">{'\ud83d\udcda'}</span>
              Student Timetables
            </h3>
            <p className="section-description">
              Explore comprehensive academic schedules organized by year, semester, and specialization
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading student timetables...</p>
            </div>
          ) : (
            <>
              {studentTimetables.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{'\ud83d\udccb'}</div>
                  <h3>No Student Timetables Found</h3>
                  <p>There are currently no student timetables available in the system.</p>
                </div>
              ) : (
                <div className="timetables-container">
                  {studentTimetables.map((timetable, index) => (
                    <div 
                      key={`${timetable.year}-${timetable.semester}-${timetable.batch}-${timetable.specialization}`} 
                      className="timetable-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="timetable-header">
                        <div className="timetable-title">
                          <h4 className="academic-period">
                            {timetable.year} - {timetable.semester}
                          </h4>
                          <div className="timetable-badges">
                            <span className="batch-badge">{timetable.batch}</span>
                            <span className="specialization-badge">{timetable.specialization}</span>
                          </div>
                        </div>
                        <div className="group-count">
                          <span className="group-icon">{'\ud83d\udc65'}</span>
                          <span className="group-number">{timetable.groups.length} Groups</span>
                        </div>
                      </div>
                      
                      <div className="groups-grid">
                        {timetable.groups.map((group, groupIndex) => (
                          <div 
                            key={group.group} 
                            className="group-card"
                            style={{ animationDelay: `${(index * 0.1) + (groupIndex * 0.05)}s` }}
                          >
                            <div className="group-header">
                              <h5 className="group-title">
                                <span className="group-label">Group</span>
                                <span className="group-name">{group.group}</span>
                              </h5>
                              <div className="session-count">
                                <span className="session-number">{group.totalSessions}</span>
                                <span className="session-label">Sessions</span>
                              </div>
                            </div>
                            
                            <div className="sessions-container">
                              <div className="sessions-table-wrapper">
                                <table className="sessions-table">
                                  <thead>
                                    <tr>
                                      <th><span className="table-header">Day</span></th>
                                      <th><span className="table-header">Time</span></th>
                                      <th><span className="table-header">Subject</span></th>
                                      <th><span className="table-header">Type</span></th>
                                      <th><span className="table-header">Location</span></th>
                                      <th><span className="table-header">Lecturer</span></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.sessions
                                      .sort((a, b) => {
                                        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                        if (a.day !== b.day) return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                                        return a.startTime.localeCompare(b.startTime);
                                      })
                                      .map((session, sessionIndex) => (
                                        <tr 
                                          key={session.sessionId} 
                                          className="session-row"
                                          style={{ animationDelay: `${(index * 0.1) + (groupIndex * 0.05) + (sessionIndex * 0.02)}s` }}
                                        >
                                          <td className="day-cell">
                                            <span className="day-indicator">{session.day.substring(0, 3)}</span>
                                          </td>
                                          <td className="time-cell">
                                            <div className="time-slot">
                                              <span className="start-time">{session.startTime}</span>
                                              <span className="time-separator">-</span>
                                              <span className="end-time">{session.endTime}</span>
                                            </div>
                                          </td>
                                          <td className="subject-cell">
                                            <span className="subject-name">{session.subject}</span>
                                          </td>
                                          <td className="type-cell">
                                            <span className={`session-type-badge ${session.type.toLowerCase()}`}>
                                              {session.type === 'LAB' ? '\ud83d\udd2c' : '\ud83d\udcda'} {session.type}
                                            </span>
                                          </td>
                                          <td className="location-cell">
                                            <span className="location-name">{session.location}</span>
                                          </td>
                                          <td className="lecturer-cell">
                                            <div className="lecturer-info">
                                              <span className="lecturer-avatar">
                                                {session.lecturer?.name?.charAt(0) || '?'}
                                              </span>
                                              <span className="lecturer-name">
                                                {session.lecturer?.name || 'N/A'}
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

    </Layout>
  );
};

export default AdminDashboard;
