import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter, AlertTriangle, Clock, HardHat, ThumbsUp, CheckCircle, Search } from 'lucide-react';

type PendingReport = {
  id: string;
  studentId: string;
  location: string;
  issueType: string;
  comment: string;
  status: string;
  createdAt: string;
  rating: number | null;
  assignedTo?: string;
};

type EscalatedGroup = {
  ids: string[];
  issueType: string;
  location: string;
  status: string;
};

type DashboardData = {
  escalated?: EscalatedGroup[];
  pending?: PendingReport[];
  assigned?: PendingReport[];
};

export default function AllIssues() {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/management/dashboard');
      const data: DashboardData = await res.json();
      
      const allReports: PendingReport[] = [
        ...(data.escalated?.flatMap((g: EscalatedGroup) => 
          g.ids.map((id: string) => ({
            id,
            studentId: 'STU',
            location: g.location,
            issueType: g.issueType,
            comment: '',
            status: g.status,
            createdAt: new Date().toISOString(),
            rating: null
          }))
        ) || []),
        ...(data.pending || []),
        ...(data.assigned || [])
      ];
      
      setReports(allReports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = activeFilter === 'all' || report.status === activeFilter;
    const matchesSearch = searchTerm === '' || 
      report.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const escalatedReports = reports.filter(r => r.status === 'Action Required');
  const pendingReports = reports.filter(r => r.status === 'Pending');
  const assignedReports = reports.filter(r => r.status === 'Assigned');
  const fixedReports = reports.filter(r => r.status === 'Fixed');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Action Required': 'bg-red-100 text-red-700 border-red-200',
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Assigned': 'bg-blue-100 text-blue-700 border-blue-200',
      'Fixed': 'bg-green-100 text-green-700 border-green-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Action Required': return <AlertTriangle size={14} className="text-red-500" />;
      case 'Pending': return <Clock size={14} className="text-amber-500" />;
      case 'Assigned': return <HardHat size={14} className="text-blue-500" />;
      case 'Fixed': return <ThumbsUp size={14} className="text-green-500" />;
      default: return null;
    }
  };

  const filters = [
    { key: 'all', label: 'All Issues', count: reports.length, icon: null },
    { key: 'Action Required', label: 'Action Required', count: escalatedReports.length, icon: AlertTriangle, color: 'text-red-500' },
    { key: 'Pending', label: 'Pending', count: pendingReports.length, icon: Clock, color: 'text-amber-500' },
    { key: 'Assigned', label: 'In Progress', count: assignedReports.length, icon: HardHat, color: 'text-blue-500' },
    { key: 'Fixed', label: 'Fixed', count: fixedReports.length, icon: CheckCircle, color: 'text-green-500' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 animate-fadeIn">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-white hover:text-white/80 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-300 hover:shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">All Issues</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by issue type or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeFilter === filter.key
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.icon && <filter.icon size={16} className={filter.color} />}
                {filter.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.key ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center transition-all duration-300 hover:shadow-md">
            <Filter className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No issues found</h3>
            <p className="text-gray-500">
              {activeFilter === 'all' 
                ? 'No issues have been reported yet.'
                : `No issues with status "${activeFilter}".`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(report.status)}`}>
                    {getStatusIcon(report.status)}
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{report.issueType}</h4>
                <p className="text-sm text-gray-600 mb-2">{report.location}</p>
                {report.assignedTo && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    <HardHat size={12} />
                    {report.assignedTo}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-gray-500">
          Showing {filteredReports.length} of {reports.length} issues
        </div>
      </div>
    </div>
  );
}
