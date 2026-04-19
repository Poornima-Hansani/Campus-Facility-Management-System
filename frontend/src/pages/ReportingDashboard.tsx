import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Star, Award, Users, Search, Eye, ChevronUp, ChevronDown, FileText, TrendingUp, History } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/professionalTables.css';

type Report = {
  id: string;
  location: string;
  issueType: string;
  comment: string;
  status: 'Pending' | 'Action Required' | 'Fixed' | 'In Progress' | 'Assigned';
  createdAt: string;
  rating?: number;
};

type TopStaff = {
  id: string;
  name: string;
  role: string;
  fixedCount: number;
  avgRating: number | null;
};

export default function ReportingDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [topStaff, setTopStaff] = useState<TopStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingReportId, setRatingReportId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  
  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState<keyof Report>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchReports = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || 'STU12345';
      const res = await fetch(`http://localhost:3000/api/reports?studentId=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (reportId: string, rating: number) => {
    try {
      await fetch(`http://localhost:3000/api/reports/${reportId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      setReports(reports.map(r => r.id === reportId ? { ...r, rating } : r));
      setRatingReportId(null);
      setRatingValue(0);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  // Table functions
  const handleSort = (column: keyof Report) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getFilteredAndSortedReports = () => {
    let filtered = reports;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const paginatedReports = getFilteredAndSortedReports();
  const totalPages = Math.ceil(paginatedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = paginatedReports.slice(startIndex, endIndex);

  
  const fixedWithoutRating = reports.filter(r => r.status === 'Fixed' && !r.rating);

  const fetchWeeklySummary = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/student/weekly-summary');
      const data = await res.json();
      setTopStaff(data.topStaff || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchWeeklySummary();
    const interval = setInterval(() => {
      fetchReports();
      fetchWeeklySummary();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const submitted = reports.length;
  const pending = reports.filter(r => r.status === 'Pending' || r.status === 'Action Required').length;
  const inProgress = reports.filter(r => r.status === 'In Progress' || r.status === 'Assigned').length;
  const fixed = reports.filter(r => r.status === 'Fixed').length;

  const chartData = [
    { name: 'Pending', value: pending, color: '#F59E0B' },
    { name: 'In Progress', value: inProgress, color: '#3B82F6' },
    { name: 'Fixed', value: fixed, color: '#10B981' },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      <div className="relative z-10 px-6 py-10 max-w-5xl mx-auto animate-fadeIn">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center transition-all duration-300 hover:shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Reports Dashboard</h1>
            <p className="text-gray-500 text-sm">Track your submitted issues and their resolution status.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/reporting/view"
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105 active:scale-95"
            >
              <History size={18} />
              View History
            </Link>
            <Link 
              to="/reporting/add"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105 active:scale-95"
            >
              + Report Issue
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <p className="text-gray-500 text-sm">Submitted</p>
            <h2 className="text-2xl font-bold text-blue-600">{submitted}</h2>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <p className="text-gray-500 text-sm">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-500">{pending}</h2>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <p className="text-gray-500 text-sm">In Progress</p>
            <h2 className="text-2xl font-bold text-blue-500">{inProgress}</h2>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <p className="text-gray-500 text-sm">Fixed</p>
            <h2 className="text-2xl font-bold text-green-600">{fixed}</h2>
          </div>
        </div>

        {/* Rating Notifications */}
        {fixedWithoutRating.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              <span className="font-semibold">{fixedWithoutRating.length} issue{fixedWithoutRating.length > 1 ? 's' : ''} fixed - Rate now!</span>
            </div>
            {fixedWithoutRating.map(report => (
              <div 
                key={report.id}
                className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">
                        Issue <span className="text-green-600">#{report.id.slice(-4)}</span> Fixed!
                      </p>
                      <p className="text-gray-600 text-sm">{report.issueType} at {report.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ratingReportId === report.id ? (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRatingValue(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star 
                              size={28} 
                              className={star <= ratingValue ? 'text-amber-400' : 'text-gray-300'}
                              fill={star <= ratingValue ? '#FBBF24' : 'none'} 
                            />
                          </button>
                        ))}
                        <button
                          onClick={() => submitRating(report.id, ratingValue)}
                          disabled={ratingValue === 0}
                          className="ml-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300"
                        >
                          Submit
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingReportId(report.id)}
                        className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg flex items-center gap-2 transition transform hover:scale-105 active:scale-95"
                      >
                        <Star size={16} />
                        Rate Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <h3 className="text-gray-700 font-semibold mb-4">Status Distribution</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
            ) : submitted === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <FileText size={40} className="mb-2 opacity-50" />
                <p>No reports yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Resolution Rate */}
          <div className="bg-white p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <h3 className="text-gray-700 font-semibold mb-4">Resolution Rate</h3>
            {submitted === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <TrendingUp size={40} className="mb-2 opacity-50" />
                <p>No data yet</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px]">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10B981"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${(fixed / submitted) * 352} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{Math.round((fixed / submitted) * 100)}%</span>
                    <span className="text-gray-500 text-sm">Resolved</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Best Faculty of the Week */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
          <h3 className="text-gray-700 font-semibold mb-4 flex items-center gap-2">
            <Award className="text-amber-500" size={20} />
            Best Staff of the Week
          </h3>
          {topStaff.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>No staff data yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {topStaff.slice(0, 3).map((staff, index) => (
                <div key={staff.id} className="border rounded-lg p-4 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className={`text-2xl mb-2 ${index === 0 ? '' : 'opacity-50'}`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <p className="font-semibold text-gray-800">{staff.name}</p>
                  <p className="text-gray-500 text-sm">{staff.role}</p>
                  <p className="text-green-600 font-medium mt-2">{staff.fixedCount} fixed</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Professional Reports Table */}
        <div className="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-700 font-semibold text-lg">Reports Management</h3>
              <Link to="/reporting/view" className="text-blue-600 hover:text-blue-700 text-sm transition-colors flex items-center gap-1">
                View All <Eye size={16} />
              </Link>
            </div>

            {/* Table Controls */}
            <div className="table-controls">
              <div className="table-search">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="table-filters">
                <select
                  className="table-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Action Required">Action Required</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>
            </div>

            {/* Professional Data Table */}
            {currentReports.length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-icon">{'\ud83d\udccb'}</div>
                <div className="table-empty-title">No Reports Found</div>
                <div className="table-empty-description">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'No reports have been submitted yet'
                  }
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="professional-table">
                    <thead>
                      <tr>
                        <th 
                          className="sortable"
                          onClick={() => handleSort('id')}
                        >
                          ID
                          {sortColumn === 'id' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="sortable"
                          onClick={() => handleSort('issueType')}
                        >
                          Issue Type
                          {sortColumn === 'issueType' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="sortable"
                          onClick={() => handleSort('location')}
                        >
                          Location
                          {sortColumn === 'location' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                            </span>
                          )}
                        </th>
                        <th>Comment</th>
                        <th 
                          className="sortable"
                          onClick={() => handleSort('status')}
                        >
                          Status
                          {sortColumn === 'status' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                            </span>
                          )}
                        </th>
                        <th 
                          className="sortable"
                          onClick={() => handleSort('createdAt')}
                        >
                          Created
                          {sortColumn === 'createdAt' && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                            </span>
                          )}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="font-medium text-gray-900">
                            #{report.id.slice(-6)}
                          </td>
                          <td>
                            <div className="font-medium text-gray-900">
                              {report.issueType}
                            </div>
                          </td>
                          <td className="text-gray-600">
                            {report.location}
                          </td>
                          <td className="text-gray-600 max-w-xs truncate">
                            {report.comment}
                          </td>
                          <td>
                            <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="text-gray-600">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="action-btn view">
                                <Eye size={14} />
                                View
                              </button>
                              {report.status === 'Fixed' && !report.rating && (
                                <button 
                                  className="action-btn edit"
                                  onClick={() => setRatingReportId(report.id)}
                                >
                                  <Star size={14} />
                                  Rate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="table-pagination">
                    <div className="pagination-info">
                      Showing {startIndex + 1} to {Math.min(endIndex, paginatedReports.length)} of {paginatedReports.length} reports
                    </div>
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
