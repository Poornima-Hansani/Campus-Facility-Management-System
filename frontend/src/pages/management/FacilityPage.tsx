import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet, apiPost } from "../../lib/api";
import { Bell, AlertTriangle, Clock, UserPlus, Activity, Zap, HardHat, ThumbsUp, CheckCircle } from "lucide-react";

type ReportItem = {
  id: string;
  studentId: string;
  location: string;
  issueType: string;
  comment: string;
  status: string;
  createdAt: string;
  assignedTo?: string;
  assignedToId?: string;
};

type EscalatedGroup = {
  location: string;
  issueType: string;
  count: number;
  status: string;
  ids: string[];
  missingStaff: boolean;
};

type DashboardStats = {
  totalReports: number;
  fixedReports: number;
  avgRating: number;
  avgResponseTime: number;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  reportId?: string;
  createdAt: string;
  read: boolean;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  workloadStatus: string;
};

export default function FacilityPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalReports: 0, fixedReports: 0, avgRating: 0, avgResponseTime: 0 });
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningIds, setAssigningIds] = useState<string[]>([]);
  const [showAllIssuesModal, setShowAllIssuesModal] = useState(false);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [escalated, setEscalated] = useState<EscalatedGroup[]>([]);
  const [pending, setPending] = useState<ReportItem[]>([]);
  const [assigned, setAssigned] = useState<ReportItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await apiGet<{ staff: Staff[] }>("/api/management/staff");
      setStaffList(data.staff || []);
    } catch (err) {
      console.error("Failed to load staff list");
    }
  };

  const handleViewNow = async () => {
    try {
      const res = await apiGet<{reports: any[]}>("/api/reports");
      setAllReports(res.reports || []);
      setShowAllIssuesModal(true);
    } catch (err) {
      console.error("Failed to fetch all reports");
    }
  };

  const handleAssignClick = (ids: string[]) => {
    setAssigningIds(ids);
    setShowAssignModal(true);
  };

  const submitAssign = async (staffId: string) => {
    try {
      await apiPost("/api/management/assign", { ids: assigningIds, staffId });
      setShowAssignModal(false);
      fetchData();
      alert("Staff assigned successfully! The staff member has been notified.");
    } catch (err) {
      console.error("Failed to assign staff");
      alert("Failed to assign staff. Please try again.");
    }
  };

  const fetchData = async () => {
    try {
      const data = await apiGet<{
        stats: DashboardStats;
        escalated: EscalatedGroup[];
        pending: ReportItem[];
        assigned: ReportItem[];
      }>("/api/management/dashboard");
      setStats(data.stats);
      setEscalated(data.escalated);
      setPending(data.pending);
      setAssigned(data.assigned);
    } catch (err) {
      console.error("Failed to load facility data");
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("unifiedRole");
    const userId = localStorage.getItem("unifiedUserId");
    if (role === "management" && userId) {
      apiGet<{ notifications: Notification[] }>(`/api/notifications/management?managementId=${userId}`)
        .then(data => setNotifications(data.notifications || []))
        .catch(() => {});
    }
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await apiPost(`/api/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification read");
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <AlertTriangle className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{escalated.length + pending.length} Issues Requiring Attention</h3>
            <p className="text-white/80 text-sm">{escalated.length} escalations, {pending.length} pending</p>
          </div>
        </div>
        <button 
          onClick={handleViewNow}
          className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-sm"
        >
          View Now
        </button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
            Facility Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Real-time campus issue monitoring</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-white border border-gray-200 p-2.5 shadow-sm text-orange-500 hover:bg-orange-50 rounded-xl transition-colors relative"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 text-center">No notifications</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.read ? "bg-blue-50" : ""}`}
                    >
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-red-100 p-2 rounded-full">
              <Activity className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Total Issues</h3>
              <p className="text-xs text-red-600 font-medium">{stats.totalReports}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-orange-100 p-2 rounded-full">
              <AlertTriangle className="text-orange-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Pending Issues</h3>
              <p className="text-xs text-orange-600 font-medium">{pending.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-blue-100 p-2 rounded-full">
              <Clock className="text-blue-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Ongoing Issues</h3>
              <p className="text-xs text-blue-600 font-medium">{assigned.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Fixed Issues</h3>
              <p className="text-xs text-green-600 font-medium">{stats.fixedReports}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-red-100 p-2 rounded-full">
              <Zap className="text-red-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Action Required</h3>
              <p className="text-xs text-red-600 font-medium">{escalated.length} escalations</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {escalated.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-red-50 p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] min-h-[20px]">
                    {item.count}
                  </span>
                  <span className="text-red-500 font-medium text-sm flex-1 ml-2">{item.issueType}</span>
                  <button 
                    onClick={() => handleAssignClick(item.ids)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors">
                    <UserPlus size={12} /> Assign
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{item.location}</p>
              </div>
            ))}
            {escalated.length === 0 && <p className="text-gray-400 text-sm text-center mt-10">No escalations currently.</p>}
          </div>
        </div>

        <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Pending</h3>
              <p className="text-xs text-yellow-600 font-medium">{pending.length} waiting</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {pending.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-yellow-50 p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-gray-900 font-semibold text-sm flex-1">{item.issueType}</span>
                  <button 
                    onClick={() => handleAssignClick([item.id])}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors">
                    <UserPlus size={12} /> Assign
                  </button>
                </div>
                <p className="text-xs text-gray-500">{item.location}</p>
              </div>
            ))}
            {pending.length === 0 && <p className="text-gray-400 text-sm text-center mt-10">No pending issues.</p>}
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-blue-100 p-2 rounded-full">
              <HardHat className="text-blue-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">In Progress</h3>
              <p className="text-xs text-blue-600 font-medium">{assigned.length} assigned</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {assigned.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-blue-50 p-4">
                <div className="bg-blue-50/80 rounded-lg p-2.5 mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] text-blue-800 font-medium">Assignee: {item.assignedTo || "Staff"}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.location}</p>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-900">{item.issueType}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.comment}</p>
              </div>
            ))}
            {assigned.length === 0 && <p className="text-gray-400 text-sm text-center mt-10">No issues in progress.</p>}
          </div>
        </div>

        <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-green-100 p-2 rounded-full">
              <ThumbsUp className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Resolution Rate</h3>
              <p className="text-xs text-green-600 font-medium">Success</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-50 p-5 mt-2">
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.fixedReports}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Fixed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports - stats.fixedReports}</p>
                <p className="text-xs text-gray-400 mt-1 uppercase font-semibold">Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Staff</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {staffList.map((staff) => (
                <div key={staff.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900">{staff.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        staff.workloadStatus === 'Free' ? 'bg-green-100 text-green-700' :
                        staff.workloadStatus === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {staff.workloadStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{staff.role} • {staff.specialty}</p>
                  </div>
                  <button
                    onClick={() => submitAssign(staff.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors ml-4 whitespace-nowrap"
                  >
                    Assign
                  </button>
                </div>
              ))}
              {staffList.length === 0 && <p className="text-sm text-gray-500 text-center">No staff available.</p>}
            </div>
            <button
              onClick={() => setShowAssignModal(false)}
              className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* All Issues Modal */}
      {showAllIssuesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-xl text-gray-900">All Facility Issues</h3>
                <p className="text-gray-500 text-sm">Comprehensive list of all reported issues</p>
              </div>
              <button onClick={() => setShowAllIssuesModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 w-8 h-8 flex items-center justify-center rounded-full transition-colors">
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto flex-1 border border-gray-100 rounded-xl bg-white shadow-inner relative">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                  <tr className="text-gray-700 text-sm font-semibold uppercase tracking-wider">
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
                  {allReports.map(report => (
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
                  {allReports.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">No issues found in the system.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}