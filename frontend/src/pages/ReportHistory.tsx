import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

type Report = {
  id: string;
  location: string;
  issueType: string;
  comment: string;
  status: 'Pending' | 'Action Required' | 'Assigned' | 'Fixed';
  createdAt: string;
  rating?: number;
  image?: string | null;
  assignedTo?: string;
  updatedAt?: string;
};

type FilterType = 'All' | 'Pending' | 'Assigned' | 'Fixed';

export default function ReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  const filteredReports = reports
    .filter(r => filter === 'All' || r.status === filter)
    .filter(r => {
      if (!search.trim()) return true;
      const query = search.toLowerCase();
      return r.location.toLowerCase().includes(query) || 
             r.issueType.toLowerCase().includes(query);
    });

  const fetchReports = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || 'STU12345';
      const res = await fetch(`http://localhost:3000/api/reports?studentId=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const submitRating = async (reportId: string) => {
    if (!ratingScore) return;
    try {
      await fetch(`http://localhost:3000/api/reports/${reportId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingScore, comment: ratingComment })
      });
      setRatingTarget(null);
      setRatingScore(0);
      setRatingComment('');
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Pending</span>;
      case 'Action Required':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Action Required</span>;
      case 'Assigned':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">In Progress</span>;
      case 'Fixed':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Fixed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      <div className="relative z-10 p-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              to="/reporting"
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Reports</h1>
              <p className="text-gray-500 text-sm">Track your submitted issues</p>
            </div>
          </div>
          <Link 
            to="/reporting/add"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            + Report Issue
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-4 mb-6">
          <input
            type="text"
            placeholder="Search by location or issue..."
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['All', 'Pending', 'Assigned', 'Fixed'] as FilterType[]).map(tab => {
            const count = tab === 'All' ? reports.length : reports.filter(r => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-12 text-center text-gray-500">
            No reports found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
                <div 
                  className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{report.issueType}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-gray-500">{report.location}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(report.createdAt)}</p>
                  </div>
                  {expandedId === report.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
                
                {expandedId === report.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    {report.comment && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Comment</p>
                        <p className="text-gray-600 text-sm">{report.comment}</p>
                      </div>
                    )}
                    
                    {report.image && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 font-medium mb-2">Photo</p>
                        <img src={report.image} alt="Report" className="w-32 rounded-lg border border-gray-200" />
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          ['Pending', 'Assigned', 'Fixed'].includes(report.status)
                            ? 'bg-yellow-400 text-yellow-900'
                            : 'bg-gray-200 text-gray-400'
                        }`}>1</div>
                        <span className="text-xs mt-1 text-gray-500">Pending</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 rounded ${['Assigned', 'Fixed'].includes(report.status) ? 'bg-blue-400' : 'bg-gray-200'}`} />
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          report.status === 'Assigned' ? 'bg-blue-400 text-white'
                            : report.status === 'Fixed' ? 'bg-green-400 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>2</div>
                        <span className="text-xs mt-1 text-gray-500">Assigned</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 rounded ${report.status === 'Fixed' ? 'bg-green-400' : 'bg-gray-200'}`} />
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          report.status === 'Fixed' ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>3</div>
                        <span className="text-xs mt-1 text-gray-500">Fixed</span>
                      </div>
                    </div>

                    {/* Rating */}
                    {report.status === 'Fixed' && !report.rating && ratingTarget !== report.id && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setRatingTarget(report.id); }}
                        className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg"
                      >
                        <Star size={16} />
                        Rate Service
                      </button>
                    )}

                    {report.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 text-yellow-400">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={16} fill={star <= report.rating! ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span className="text-sm text-green-600 font-medium">Thank you!</span>
                      </div>
                    )}

                    {ratingTarget === report.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">How was the service?</p>
                        <div className="flex gap-2 mb-3">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              key={star} 
                              className={`hover:scale-110 transition-transform ${
                                star <= ratingScore ? 'text-amber-400' : 'text-gray-300'
                              }`}
                              onClick={() => setRatingScore(star)}
                            >
                              <Star size={28} fill={star <= ratingScore ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Feedback (optional)"
                          className="w-full p-2 border border-gray-200 rounded-lg text-sm mb-2"
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                        />
                        <button 
                          onClick={() => submitRating(report.id)}
                          disabled={!ratingScore}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
