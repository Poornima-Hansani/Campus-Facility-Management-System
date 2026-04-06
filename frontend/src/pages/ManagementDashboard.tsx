<<<<<<< HEAD
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, AlertTriangle, Clock, ThumbsUp, TrendingUp, Activity, BarChart3, MapPin, UserCheck, X, Send, Bell, BellRing, Calendar, CheckCircle, HardHat, Zap, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error';
};

type EscalateGroup = {
  location: string;
  issueType: string;
  count: number;
  status: 'Action Required' | 'Fixed';
  ids: string[];
  missingStaff?: boolean;
};

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

type StaffMember = {
  id: string;
  name: string;
  role: string;
  specialty: string;
};

export default function ManagementDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalReports: 0, fixedReports: 0, avgRating: 0, avgResponseTime: 0 });
  const [escalated, setEscalated] = useState<EscalateGroup[]>([]);
  const [pending, setPending] = useState<PendingReport[]>([]);
  const [assigned, setAssigned] = useState<PendingReport[]>([]);
  const [topLocations, setTopLocations] = useState<{ location: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ categoryData: Array<{ name: string; count: number }>; weeklyData: Array<{ day: string; count: number }> }>({ categoryData: [], weeklyData: [] });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [assignModal, setAssignModal] = useState<{ ids: string[]; issueInfo: string } | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: string; time: string }[]>([]);
  const [backendNotifications, setBackendNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newEscalationCount, setNewEscalationCount] = useState(0);
  const [fixCompleteNotifications, setFixCompleteNotifications] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<{
    totalReports: number;
    fixedReports: number;
    avgResponseTime: number;
    categoryBreakdown: Record<string, number>;
    resolutionRate: number;
  } | null>(null);
  const prevEscalatedCount = useRef(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ id: Date.now().toString(), message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalActionRequired = escalated.filter(e => e.status === 'Action Required').length + pending.length;
  const topLocation = topLocations[0]?.location || 'N/A';
  const topCategory = chartData.categoryData.sort((a, b) => b.count - a.count)[0]?.name || 'N/A';

  const fetchData = async () => {
    try {
      const [dashboardRes, chartsRes, staffRes, summaryRes, notifRes] = await Promise.all([
        fetch('http://localhost:3000/api/management/dashboard'),
        fetch('http://localhost:3000/api/management/charts'),
        fetch('http://localhost:3000/api/management/staff'),
        fetch('http://localhost:3000/api/management/weekly-summary'),
        fetch('http://localhost:3000/api/notifications/management')
      ]);
      const dashboardData = await dashboardRes.json();
      const chartsData = await chartsRes.json();
      const staffData = await staffRes.json();
      const summaryData = await summaryRes.json();
      const notifData = await notifRes.json();
      
      const currentActionCount = (dashboardData.escalated?.filter((e: EscalateGroup) => e.status === 'Action Required').length || 0) + (dashboardData.pending?.length || 0);
      
      if (prevEscalatedCount.current > 0 && currentActionCount > prevEscalatedCount.current) {
        const newItems = currentActionCount - prevEscalatedCount.current;
        setNewEscalationCount(prev => prev + newItems);
        setNotifications(prev => [{
          id: Date.now().toString(),
          message: `${newItems} new escalation${newItems > 1 ? 's' : ''} require attention`,
          type: 'escalation',
          time: 'Just now'
        }, ...prev.slice(0, 4)]);
      }
      prevEscalatedCount.current = currentActionCount;
      
      setStats(dashboardData.stats);
      setEscalated(dashboardData.escalated || []);
      setPending(dashboardData.pending || []);
      setAssigned(dashboardData.assigned || []);
      console.log('Fetched assigned:', dashboardData.assigned);
      setTopLocations(dashboardData.topLocations || []);
      setChartData(chartsData);
      setStaff(staffData.staff || []);
      setWeeklySummary(summaryData.summary);
      
      // Update backend notifications
      setBackendNotifications(notifData.notifications || []);
      
      // Extract fix complete notifications
      const fixNotifs = (notifData.notifications || []).filter((n: any) => n.type === 'management_fix_complete' && !n.read);
      setFixCompleteNotifications(fixNotifs);
      setNewEscalationCount(prev => prev + fixNotifs.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAssign = async () => {
    if (!assignModal || !selectedStaff) return;
    try {
      const response = await fetch('http://localhost:3000/api/management/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: assignModal.ids, staffId: selectedStaff })
      });
      const result = await response.json();
      console.log('Assign result:', result);
      setAssignModal(null);
      setSelectedStaff(null);
      await fetchData();
      showToast('Staff assigned successfully', 'success');
    } catch (err) {
      console.error('Assign error:', err);
      showToast('Failed to assign staff', 'error');
    }
  };

  const handleMarkFixed = async (ids: string[]) => {
    try {
      await fetch('http://localhost:3000/api/management/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      fetchData();
      showToast('Issue marked as fixed', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to mark as fixed', 'error');
    }
  };

  const handleApproveFix = async (reportId: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/management/approve-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId })
      });
      if (response.ok) {
        fetchData();
        showToast('Fix approved! Student has been notified.', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to approve fix', 'error');
    }
  };

  const resolutionRate = stats.totalReports > 0 
    ? Math.round((stats.fixedReports / stats.totalReports) * 100) 
    : 0;

  const formatResponseTime = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce ${
          toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="text-white" size={24} />
          ) : (
            <X className="text-white" size={24} />
          )}
          <p className="font-bold text-white">{toast.message}</p>
        </div>
      )}

      {totalActionRequired === 0 && !loading && stats.totalReports > 0 && (
        <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div>
                <p className="font-bold text-white text-lg">All Systems Running Smoothly</p>
                <p className="text-white/80 text-sm">No issues requiring immediate attention</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalActionRequired > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-xl p-4 shadow-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <div>
                <p className="font-bold text-white text-lg">
                  {totalActionRequired} Issues Requiring Attention
                </p>
                <p className="text-white/80 text-sm">
                  {escalated.filter(e => e.status === 'Action Required').length} escalations, {pending.length} pending
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/management/issues?filter=Action%20Required')}
              className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              View Now
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="text-white" size={24} />
                <div>
                  <h3 className="font-bold text-white text-lg">Assign Staff</h3>
                  <p className="text-white/80 text-sm">{assignModal.issueInfo}</p>
                </div>
              </div>
              <button onClick={() => { setAssignModal(null); setSelectedStaff(null); }} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 font-medium">Select a staff member to assign:</p>
              <div className="space-y-3">
                {staff.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaff(s.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      selectedStaff === s.id 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      selectedStaff === s.id ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}>
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.role}</p>
                      <p className="text-xs text-emerald-600 mt-1">{s.specialty}</p>
                    </div>
                    {selectedStaff === s.id && (
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckSquare className="text-white" size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAssign}
                disabled={!selectedStaff}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Send size={18} />
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl text-white">
              <Activity size={28} />
            </div>
            Facility Management
          </h1>
          <p className="text-white/70 mt-1">Real-time campus issue monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div ref={notificationRef} className="relative">
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setNewEscalationCount(0); }}
              className="relative p-3 bg-white rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
            >
              {totalActionRequired > 0 ? (
                <BellRing className="text-amber-500" size={24} />
              ) : (
                <Bell className="text-gray-500" size={24} />
              )}
              {newEscalationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {newEscalationCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                  <h4 className="font-bold text-white">Notifications</h4>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    {totalActionRequired + fixCompleteNotifications.length} pending
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {/* Fix Complete Notifications */}
                  {fixCompleteNotifications.length > 0 && (
                    <div className="border-b border-gray-200">
                      <div className="px-4 py-2 bg-green-50 text-green-800 text-xs font-semibold">
                        Staff Fixed Issues - Awaiting Approval
                      </div>
                      {fixCompleteNotifications.map((notif) => (
                        <div key={notif.id} className="px-4 py-3 border-b border-gray-100 bg-green-50/50 hover:bg-green-100 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                              <CheckCircle size={14} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Staff: {notif.staffName}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleApproveFix(notif.reportId)}
                            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={14} />
                            Approve & Notify Student
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Other Notifications */}
                  {notifications.length === 0 && fixCompleteNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="mx-auto mb-2 text-gray-300" size={32} />
                      <p className="text-sm">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="px-4 py-3 border-b border-gray-100 hover:bg-amber-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notif.type === 'escalation' ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <AlertTriangle size={14} className={notif.type === 'escalation' ? 'text-red-500' : 'text-blue-500'} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mt-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <Zap className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Action Required</h3>
                <p className="text-sm text-red-600">{escalated.filter(e => e.status === 'Action Required').length} escalations</p>
              </div>
            </div>
            {escalated.filter(e => e.status === 'Action Required').length > 0 && (
              <button 
                onClick={() => navigate('/management/issues?filter=Action%20Required')}
                className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1"
              >
                View All
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-4 text-red-400">Loading...</div>
          ) : escalated.filter(e => e.status === 'Action Required').length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl font-medium">
              No escalations
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {escalated.filter(e => e.status === 'Action Required').map((group, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border border-red-100 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{group.count}</span>
                        <span className="text-xs text-red-600 font-medium">{group.issueType}</span>
                      </div>
                      <p className="text-xs text-gray-600">{group.location}</p>
                    </div>
                    <button 
                      onClick={() => setAssignModal({ ids: group.ids, issueInfo: `${group.issueType} at ${group.location} (${group.count} issues)` })}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-2 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1 text-xs whitespace-nowrap"
                    >
                      <UserCheck size={12} />
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Pending</h3>
                <p className="text-sm text-amber-600">{pending.length} waiting</p>
              </div>
            </div>
            {pending.length > 0 && (
              <button 
                onClick={() => navigate('/management/issues?filter=Pending')}
                className="text-amber-600 hover:text-amber-800 text-xs font-semibold flex items-center gap-1"
              >
                View All
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-4 text-amber-400">Loading...</div>
          ) : pending.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl font-medium">
              No pending issues
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {pending.map((report) => (
                <div key={report.id} className="bg-white rounded-xl p-4 border border-amber-100 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{report.issueType}</h4>
                      <p className="text-xs text-gray-600">{report.location}</p>
                    </div>
                    <button 
                      onClick={() => setAssignModal({ ids: [report.id], issueInfo: `${report.issueType} at ${report.location}` })}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-2 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1 text-xs"
                    >
                      <UserCheck size={12} />
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <HardHat className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">In Progress</h3>
                <p className="text-sm text-blue-600">{assigned.length} assigned</p>
              </div>
            </div>
            {assigned.length > 0 && (
              <button 
                onClick={() => navigate('/management/issues?filter=Assigned')}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
              >
                View All
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-4 text-blue-400">Loading...</div>
          ) : assigned.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl font-medium">
              No assignments in progress
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {assigned.map((report) => (
                <div key={report.id} className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="bg-blue-100 rounded-lg p-2 mb-2">
                        <p className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                          <UserCheck size={10} />
                          Assigned to: {report.assignedTo}
                        </p>
                        <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                          <Clock size={10} />
                          Status: In Progress
                        </p>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{report.issueType}</h4>
                      <p className="text-xs text-gray-600">{report.location}</p>
                    </div>
                    <button 
                      onClick={() => handleMarkFixed([report.id])}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-2 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1 text-xs"
                    >
                      <ThumbsUp size={12} />
                      Fixed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <ThumbsUp className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Resolution Rate</h3>
              <p className="text-sm text-green-600">{resolutionRate}% success</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
            {stats.totalReports === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="mx-auto mb-2 text-green-400" size={32} />
                <p className="font-medium">All systems operational</p>
              </div>
            ) : (
              <>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold inline-block text-green-600">
                      {resolutionRate}%
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-full bg-green-100 h-3">
                    <div 
                      style={{ width: `${resolutionRate}%` }}
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
                    ></div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.fixedReports}</p>
                    <p className="text-xs text-gray-500">Fixed</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stats.totalReports - stats.fixedReports}</p>
                    <p className="text-xs text-gray-500">Remaining</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 shadow-lg mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/10 rounded-xl">
            <MapPin className="text-red-400" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Most Problematic Locations</h3>
            <p className="text-slate-400 text-sm">Top 3 hotspots requiring attention</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topLocations.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-slate-400">
              <p>No location data available</p>
            </div>
          ) : (
            topLocations.map((loc, idx) => (
              <div key={loc.location} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    idx === 0 ? 'bg-red-500 text-white' : idx === 1 ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm truncate">{loc.location}</p>
                    <p className="text-slate-400 text-xs">{loc.count} complaints</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(3 - idx)].map((_, i) => (
                      <div key={i} className="w-2 h-6 bg-red-400 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-100 rounded-lg">
              <BarChart3 className="text-violet-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Issues by Category</h3>
              <p className="text-sm text-gray-500">Distribution across campus areas</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
              >
                {chartData.categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#8B5CF6', '#F59E0B', '#10B981', '#6B7280'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {chartData.categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: ['#8B5CF6', '#F59E0B', '#10B981', '#6B7280'][idx] }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-bold text-gray-900">({item.count})</span>
              </div>
            ))}
          </div>
          {topCategory !== 'N/A' && (
            <div className="mt-4 bg-violet-50 rounded-lg p-3 border border-violet-100">
              <p className="text-xs text-violet-700">
                <span className="font-semibold">Insight:</span> Most issues occur in {topCategory}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Weekly Trend</h3>
              <p className="text-sm text-gray-500">Issues reported Mon - Sun</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB' }}
                cursor={{ fill: '#F3F4F6' }}
              />
              <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {topLocation !== 'N/A' && (
            <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Insight:</span> {topLocation} is the highest complaint area
              </p>
            </div>
          )}
        </div>
      </div>

      {weeklySummary && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 shadow-lg mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">Weekly Performance Summary</h3>
              <p className="text-white/80 text-sm">This week's campus facility report</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{weeklySummary.totalReports}</p>
              <p className="text-white/80 text-sm mt-1">Reports Received</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{weeklySummary.fixedReports}</p>
              <p className="text-white/80 text-sm mt-1">Issues Fixed</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{weeklySummary.resolutionRate}%</p>
              <p className="text-white/80 text-sm mt-1">Resolution Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">{formatResponseTime(weeklySummary.avgResponseTime)}</p>
              <p className="text-white/80 text-sm mt-1">Avg Response</p>
            </div>
          </div>
          <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-white font-semibold mb-3">Category Breakdown</p>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(weeklySummary.categoryBreakdown).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                  <span className="text-white/80 text-sm">{cat}:</span>
                  <span className="text-white font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-white/20 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-700">Syncing data...</span>
        </div>
      )}
      </div>
    </div>
  );
}
=======
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiDelete, apiGet, apiPost } from "../lib/api";

type EmailItem = {
  id: number;
  studentId: string;
  studentEmail: string;
  moduleCode: string;
  moduleName: string;
  subject: string;
  message: string;
  sentDate: string;
  status: "Sent";
};

type TimetableRow = {
  id: number;
  moduleCode: string;
  moduleName: string;
  sessionType: string;
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

type LectureRow = {
  id: number;
  moduleCode: string;
  moduleName: string;
  venueType: string;
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

type SessionFilter = "" | "lecture" | "practical" | "lab" | "tutorial";

const DAY_OPTIONS = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function matchesModuleCode(rowCode: string, filter: string) {
  const f = filter.trim().toUpperCase();
  if (!f) return true;
  return rowCode.toUpperCase().includes(f);
}

function matchesModuleName(rowName: string, filter: string) {
  const f = filter.trim().toLowerCase();
  if (!f) return true;
  return rowName.toLowerCase().includes(f);
}

function matchesDay(rowDay: string, filter: string) {
  if (!filter) return true;
  return rowDay === filter;
}

function matchesSessionTimetable(sessionType: string, v: SessionFilter) {
  if (!v) return true;
  return sessionType.toLowerCase() === v;
}

function matchesSessionCatalog(rowType: string, v: SessionFilter) {
  if (!v) return true;
  if (v === "lecture") return rowType === "Lecture Hall";
  if (v === "lab") return rowType === "Laboratory";
  return false;
}

function catalogSlotsForRow(
  row: TimetableRow,
  allLectures: LectureRow[],
  sessionFilter: SessionFilter
): LectureRow[] {
  return allLectures.filter((l) => {
    if (l.moduleCode !== row.moduleCode || l.day !== row.day) return false;
    return matchesSessionCatalog(l.venueType, sessionFilter);
  });
}

const ManagementDashboard = () => {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [overviewError, setOverviewError] = useState("");

  const [filterModuleCode, setFilterModuleCode] = useState("");
  const [filterModuleName, setFilterModuleName] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterSession, setFilterSession] = useState<SessionFilter>("");

  const refreshEmails = useCallback(async () => {
    const list = await apiGet<EmailItem[]>("/api/management/emails");
    setEmails(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await apiGet<EmailItem[]>("/api/management/emails");
        if (!cancelled) setEmails(list);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load records."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [tt, lec] = await Promise.all([
          apiGet<TimetableRow[]>("/api/timetable"),
          apiGet<LectureRow[]>("/api/lectures"),
        ]);
        if (!cancelled) {
          setTimetable(tt);
          setLectures(lec);
          setOverviewError("");
        }
      } catch (e) {
        if (!cancelled) {
          setOverviewError(
            e instanceof Error ? e.message : "Could not load timetable data."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTimetable = useMemo(() => {
    return timetable.filter(
      (row) =>
        matchesModuleCode(row.moduleCode, filterModuleCode) &&
        matchesModuleName(row.moduleName, filterModuleName) &&
        matchesDay(row.day, filterDay) &&
        matchesSessionTimetable(row.sessionType, filterSession)
    );
  }, [timetable, filterModuleCode, filterModuleName, filterDay, filterSession]);

  const filteredLectures = useMemo(() => {
    return lectures.filter(
      (row) =>
        matchesModuleCode(row.moduleCode, filterModuleCode) &&
        matchesModuleName(row.moduleName, filterModuleName) &&
        matchesDay(row.day, filterDay) &&
        matchesSessionCatalog(row.venueType, filterSession)
    );
  }, [lectures, filterModuleCode, filterModuleName, filterDay, filterSession]);

  const clearOverviewFilters = () => {
    setFilterModuleCode("");
    setFilterModuleName("");
    setFilterDay("");
    setFilterSession("");
  };

  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    moduleCode: "",
    moduleName: "",
    subject: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalEmails = useMemo(() => emails.length, [emails]);

  const uniqueStudents = useMemo(
    () => new Set(emails.map((item) => item.studentId)).size,
    [emails]
  );

  const uniqueModules = useMemo(
    () => new Set(emails.map((item) => item.moduleCode)).size,
    [emails]
  );

  const todayEmails = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return emails.filter((item) => item.sentDate === today).length;
  }, [emails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "moduleCode" || name === "studentId"
          ? value.toUpperCase()
          : value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const cleanStudentId = formData.studentId.trim().toUpperCase();
    const cleanStudentEmail = formData.studentEmail.trim();
    const cleanModuleCode = formData.moduleCode.trim().toUpperCase();
    const cleanModuleName = formData.moduleName.trim();
    const cleanSubject = formData.subject.trim();
    const cleanMessage = formData.message.trim();

    if (
      !cleanStudentId ||
      !cleanStudentEmail ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanSubject ||
      !cleanMessage
    ) {
      return "All fields are required.";
    }

    if (!/^IT\d{8}$/.test(cleanStudentId)) {
      return "Student ID must be in a format like IT23200001.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanStudentEmail)) {
      return "Enter a valid email address.";
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanModuleName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    if (cleanSubject.length < 5) {
      return "Subject must contain at least 5 characters.";
    }

    if (cleanMessage.length < 10) {
      return "Message must contain at least 10 characters.";
    }

    const duplicateEmail = emails.some(
      (item) =>
        item.studentId === cleanStudentId &&
        item.moduleCode === cleanModuleCode &&
        item.subject.toLowerCase() === cleanSubject.toLowerCase()
    );

    if (duplicateEmail) {
      return "A similar encouragement email has already been recorded.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      setSuccess("");
      return;
    }

    try {
      await apiPost("/api/management/emails", {
        studentId: formData.studentId.trim().toUpperCase(),
        studentEmail: formData.studentEmail.trim(),
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      await refreshEmails();

      setFormData({
        studentId: "",
        studentEmail: "",
        moduleCode: "",
        moduleName: "",
        subject: "",
        message: "",
      });

      setError("");
      setSuccess("Encouragement email recorded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record.");
      setSuccess("");
    }
  };

  const handleClear = () => {
    setFormData({
      studentId: "",
      studentEmail: "",
      moduleCode: "",
      moduleName: "",
      subject: "",
      message: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/management/emails/${id}`);
      await refreshEmails();
      setError("");
      setSuccess("Email record removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record.");
      setSuccess("");
    }
  };

  return (
    <Layout>
      {loadError && <p className="form-error">{loadError}</p>}

      <div className="stats-grid availability-stats">
        <div className="stat-card">
          <h4>Total Emails</h4>
          <h2>{totalEmails}</h2>
          <p>Recorded encouragement emails</p>
        </div>
        <div className="stat-card">
          <h4>Students Reached</h4>
          <h2>{uniqueStudents}</h2>
          <p>Unique repeat students</p>
        </div>
        <div className="stat-card">
          <h4>Modules Covered</h4>
          <h2>{uniqueModules}</h2>
          <p>Supported academic modules</p>
        </div>
        <div className="stat-card">
          <h4>Sent Today</h4>
          <h2>{todayEmails}</h2>
          <p>Emails recorded today</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Module timetable & lecture availability</h3>
            <p>
              Review all saved timetable modules, filter them, and compare with
              the official lecture / lab catalog (same filters apply to both
              tables).
            </p>
          </div>
        </div>

        {overviewError && <p className="form-error">{overviewError}</p>}

        <p className="mgmt-hint">
          Add or remove timetable rows from the{" "}
          <Link to="/admin-dashboard" className="mgmt-inline-link">
            Admin Dashboard
          </Link>
          .
          Filters narrow both the <strong>module timetable</strong> and the{" "}
          <strong>lecture availability catalog</strong>. For each timetable row,
          &quot;Catalog (same day)&quot; counts catalog slots with the same
          module code and day—use the catalog table below to see full venue and
          time details.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label>Module code</label>
            <input
              type="text"
              placeholder="e.g. IT3040"
              value={filterModuleCode}
              onChange={(e) =>
                setFilterModuleCode(e.target.value.toUpperCase())
              }
            />
          </div>
          <div className="form-group">
            <label>Module name</label>
            <input
              type="text"
              placeholder="Contains…"
              value={filterModuleName}
              onChange={(e) => setFilterModuleName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Day</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d || "all"} value={d}>
                  {d || "All days"}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Session type</label>
            <select
              value={filterSession}
              onChange={(e) =>
                setFilterSession(e.target.value as SessionFilter)
              }
            >
              <option value="">All</option>
              <option value="lecture">Lecture</option>
              <option value="practical">Practical</option>
              <option value="lab">Lab</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="secondary-form-btn"
            onClick={clearOverviewFilters}
          >
            Clear filters
          </button>
        </div>

        <h4 className="mgmt-section-title">
          Module timetable ({filteredTimetable.length} / {timetable.length})
        </h4>
        {filteredTimetable.length === 0 ? (
          <div className="empty-state">
            <h3>No timetable rows match</h3>
            <p>Use the Admin Dashboard to add sessions, or relax the filters.</p>
          </div>
        ) : (
          <div className="mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Lecturer</th>
                  <th>Catalog (same day)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetable.map((row) => {
                  const matches = catalogSlotsForRow(
                    row,
                    lectures,
                    filterSession
                  );
                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.moduleCode}</strong>
                        <br />
                        <span style={{ color: "#6b7280" }}>{row.moduleName}</span>
                      </td>
                      <td>{row.day}</td>
                      <td>
                        {row.startTime} – {row.endTime}
                      </td>
                      <td>
                        <span className="availability-badge">
                          {row.sessionType}
                        </span>
                        <br />
                        {row.venueName}
                      </td>
                      <td>{row.lecturer}</td>
                      <td>
                        {matches.length > 0 ? (
                          <span className="mgmt-match-badge mgmt-match-yes">
                            {matches.length} slot
                            {matches.length !== 1 ? "s" : ""} in catalog
                          </span>
                        ) : (
                          <span className="mgmt-match-badge mgmt-match-none">
                            No catalog slot
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <h4
          className="mgmt-section-title"
          id="mgmt-lecture-catalog"
          style={{ scrollMarginTop: 24 }}
        >
          Lecture availability catalog ({filteredLectures.length} /{" "}
          {lectures.length})
        </h4>
        <p className="mgmt-hint">
          Official lecture and lab sessions published for availability search.
          Use the same filters as above to find matching rows.
        </p>
        {filteredLectures.length === 0 ? (
          <div className="empty-state">
            <h3>No catalog rows match</h3>
            <p>Adjust filters or check the Lecture Availability page data.</p>
          </div>
        ) : (
          <div className="mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Lecturer</th>
                </tr>
              </thead>
              <tbody>
                {filteredLectures.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.moduleCode}</strong>
                      <br />
                      <span style={{ color: "#6b7280" }}>{row.moduleName}</span>
                    </td>
                    <td>{row.day}</td>
                    <td>
                      {row.startTime} – {row.endTime}
                    </td>
                    <td>
                      <span className="availability-badge">{row.venueType}</span>
                      <br />
                      {row.venueName}
                    </td>
                    <td>{row.lecturer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Send Encouragement Email</h3>
            <p>
              Management can record encouragement emails sent to repeat students
              for academic support and motivation.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                placeholder="e.g. IT23200001"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Student Email</label>
              <input
                type="email"
                name="studentEmail"
                placeholder="e.g. student@my.sliit.lk"
                value={formData.studentEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Module Code</label>
              <input
                type="text"
                name="moduleCode"
                placeholder="e.g. IT3040"
                value={formData.moduleCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Module Name</label>
              <input
                type="text"
                name="moduleName"
                placeholder="e.g. Project Management"
                value={formData.moduleName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Enter encouragement message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Record Email
            </button>
            <button
              type="button"
              className="secondary-form-btn"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Encouragement Email Records</h3>
            <p>
              View previously recorded repeat-student support emails.
            </p>
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="empty-state">
            <h3>No email records available</h3>
            <p>Add the first encouragement email above.</p>
          </div>
        ) : (
          <div className="availability-results">
            {emails.map((item) => (
              <div key={item.id} className="availability-card">
                <div className="availability-top">
                  <div>
                    <span className="availability-badge badge-management">
                      {item.status}
                    </span>
                    <h4>{item.subject}</h4>
                  </div>
                </div>

                <div className="availability-details">
                  <p>
                    <strong>Student ID:</strong> {item.studentId}
                  </p>
                  <p>
                    <strong>Email:</strong> {item.studentEmail}
                  </p>
                  <p>
                    <strong>Module:</strong> {item.moduleCode} - {item.moduleName}
                  </p>
                  <p>
                    <strong>Sent Date:</strong> {item.sentDate}
                  </p>
                  <p>
                    <strong>Message:</strong> {item.message}
                  </p>
                </div>

                <div className="availability-actions timetable-actions">
                  <button
                    type="button"
                    className="danger-form-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManagementDashboard;
>>>>>>> main
