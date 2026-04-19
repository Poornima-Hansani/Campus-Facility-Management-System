import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { apiDelete, apiGet, apiPost } from "../lib/api";
import { Bell, AlertTriangle, Clock, CheckCircle, Wrench, Users, BarChart3, PieChart, UserPlus, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from "recharts";

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

type ChartData = {
  categoryData: { name: string; count: number }[];
  weeklyData: { day: string; count: number }[];
};

type WeeklySummary = {
  totalReports: number;
  fixedReports: number;
  avgResponseTime: number;
  resolutionRate: number;
};

type Notification = {
  id: string;
  type: string;
  message: string;
  reportId?: string;
  createdAt: string;
  read: boolean;
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
};

const CHART_COLORS = ['#0d4f34', '#22c55e', '#3b82f6', '#f59e0b'];

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
  const navigate = useNavigate();
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const [escalated, setEscalated] = useState<EscalatedGroup[]>([]);
  const [pending, setPending] = useState<ReportItem[]>([]);
  const [assigned, setAssigned] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalReports: 0, fixedReports: 0, avgRating: 0, avgResponseTime: 0 });
  const [charts, setCharts] = useState<ChartData>({ categoryData: [], weeklyData: [] });
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({ totalReports: 0, fixedReports: 0, avgResponseTime: 0, resolutionRate: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPending, setSelectedPending] = useState<ReportItem[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

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

  const fetchManagementData = useCallback(async () => {
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
      console.error("Failed to fetch management dashboard data:", err);
    }
  }, []);

  const fetchChartsData = useCallback(async () => {
    try {
      const data = await apiGet<ChartData>("/api/management/charts");
      setCharts(data);
    } catch (err) {
      console.error("Failed to fetch charts data:", err);
    }
  }, []);

  const fetchWeeklySummary = useCallback(async () => {
    try {
      const data = await apiGet<{ summary: WeeklySummary }>("/api/management/weekly-summary");
      setWeeklySummary(data.summary);
    } catch (err) {
      console.error("Failed to fetch weekly summary:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const role = localStorage.getItem("unifiedRole");
      const userId = localStorage.getItem("unifiedUserId");
      if (role === "management" && userId) {
        const data = await apiGet<{ notifications: Notification[] }>(`/api/notifications/management?managementId=${userId}`);
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await apiGet<{ staff: StaffMember[] }>("/api/management/staff");
      setStaff(data.staff || []);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  }, []);

  useEffect(() => {
    fetchManagementData();
    fetchChartsData();
    fetchWeeklySummary();
    fetchNotifications();
    fetchStaff();
  }, [fetchManagementData, fetchChartsData, fetchWeeklySummary, fetchNotifications, fetchStaff]);

  const handleMarkFixed = async (ids: string[]) => {
    try {
      await apiPost("/api/management/fix", { ids });
      await fetchManagementData();
      await fetchChartsData();
      await fetchWeeklySummary();
    } catch (err) {
      console.error("Failed to mark as fixed:", err);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffId || selectedPending.length === 0) return;
    try {
      const ids = selectedPending.map(p => p.id);
      await apiPost("/api/management/assign", { ids, staffId: selectedStaffId });
      await fetchManagementData();
      await fetchStaff();
      setShowAssignModal(false);
      setSelectedPending([]);
      setSelectedStaffId("");
    } catch (err) {
      console.error("Failed to assign staff:", err);
    }
  };

  const openAssignModal = (reports: ReportItem[]) => {
    setSelectedPending(reports);
    setSelectedStaffId("");
    setShowAssignModal(true);
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiPost(`/api/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Management Dashboard</h2>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Issue Management Overview</h3>
            <p>Track escalated, pending, and assigned facility issues</p>
          </div>
        </div>

        <div className="stats-grid availability-stats">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h4>Escalated</h4>
                <h2>{escalated.length}</h2>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <h4>Pending</h4>
                <h2>{pending.length}</h2>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Awaiting assignment</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wrench className="text-blue-600" size={24} />
              </div>
              <div>
                <h4>Assigned</h4>
                <h2>{assigned.length}</h2>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">In progress</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h4>Resolved</h4>
                <h2>{stats.fixedReports}</h2>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Issues fixed</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Weekly Performance Summary</h3>
            <p>Last 7 days performance metrics</p>
          </div>
        </div>

        <div className="stats-grid availability-stats">
          <div className="stat-card">
            <h4>Reports This Week</h4>
            <h2>{weeklySummary.totalReports}</h2>
            <p>New issues reported</p>
          </div>

          <div className="stat-card">
            <h4>Fixed This Week</h4>
            <h2>{weeklySummary.fixedReports}</h2>
            <p>Issues resolved</p>
          </div>

          <div className="stat-card">
            <h4>Avg Response Time</h4>
            <h2>{weeklySummary.avgResponseTime} min</h2>
            <p>Average fix time</p>
          </div>

          <div className="stat-card">
            <h4>Resolution Rate</h4>
            <h2>{weeklySummary.resolutionRate}%</h2>
            <p>Success rate</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Quick Actions</h3>
            <p>Manage timetable and scheduling</p>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/timetable-builder')}
            className="w-full text-left px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-3"
          >
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="text-purple-900 font-medium">Add Time Table</span>
          </button>
        </div>
      </div>

      {(escalated.length > 0 || assigned.length > 0) && (
        <div className="content-card">
          <div className="section-head">
            <div>
              <h3>Issue Management</h3>
              <p>Manage escalated and assigned issues</p>
            </div>
          </div>

          {escalated.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Escalated Issues ({escalated.length})
              </h4>
              <div className="space-y-3">
                {escalated.map((item, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.location} - {item.issueType}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.count} reports • Status: {item.status}
                        </p>
                        {item.missingStaff && (
                          <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Needs Staff Assignment
                          </span>
                        )}
                      </div>
                      {item.ids.length > 0 && (
                        <button
                          onClick={() => handleMarkFixed(item.ids)}
                          className="primary-form-btn text-sm"
                        >
                          Mark Fixed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assigned.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                <Wrench size={18} />
                Assigned Issues ({assigned.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {assigned.slice(0, 6).map((item) => (
                  <div key={item.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-gray-900 text-sm">{item.issueType}</p>
                    <p className="text-xs text-gray-600">{item.location}</p>
                    <p className="text-xs text-gray-500 mt-1">Assigned to: {item.assignedTo || "Staff"}</p>
                    <button
                      onClick={() => handleMarkFixed([item.id])}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Mark Fixed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => openAssignModal(pending)}
                className="primary-form-btn flex items-center gap-2"
              >
                <UserPlus size={18} />
                Assign Staff to {pending.length} Pending
              </button>
            </div>
          )}
        </div>
      )}

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Reports Analytics</h3>
            <p>Visual insights into facility issues by location and weekly trends</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <PieChart size={18} />
              Issues by Location
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={charts.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {charts.categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Weekly Reports Trend
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d4f34" name="Reports" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

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

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={24} />
                Assign Staff
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Assigning {selectedPending.length} issue(s) to a staff member
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Selected Issues:</h4>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-1">
                  {selectedPending.map(p => (
                    <p key={p.id} className="text-sm text-gray-700">
                      {p.issueType} at {p.location}
                    </p>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Select Staff Member</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full"
                >
                  <option value="">Choose staff...</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role}) - {s.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStaffId && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Staff: <strong>{staff.find(s => s.id === selectedStaffId)?.name}</strong>
                    <br />
                    Role: {staff.find(s => s.id === selectedStaffId)?.role}
                    <br />
                    Specialty: {staff.find(s => s.id === selectedStaffId)?.specialty}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="secondary-form-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                disabled={!selectedStaffId}
                className="primary-form-btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManagementDashboard;
