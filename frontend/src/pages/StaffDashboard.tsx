import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, User, Phone, Mail, MapPin, Clock,
  CheckCircle, AlertCircle, PlayCircle, Star,
  FileText, LogOut, RefreshCw, Filter, X,
  Bell, BellRing
} from 'lucide-react';

type Task = {
  id: string;
  studentId: string;
  location: string;
  issueType: string;
  comment: string;
  status: 'Assigned' | 'In Progress' | 'Fixed';
  createdAt: string;
  fixedAt?: string;
  rating?: number;
  staffNote?: string;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
};

type Stats = {
  totalAssigned: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgRating: number | null;
};

type Feedback = {
  id: string;
  location: string;
  issueType: string;
  rating: number;
  staffNote?: string;
  fixedAt: string;
  studentId: string;
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState<Task | null>(null);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'feedback'>('tasks');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotifCount, setNewNotifCount] = useState(0);

  const staffId = localStorage.getItem('staffId');

  useEffect(() => {
    if (!staffId) {
      navigate('/login');
      return;
    }
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Poll every 10 seconds for new notifications & tasks
    return () => clearInterval(interval);
  }, [staffId]);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [profileRes, tasksRes, feedbackRes, notifRes] = await Promise.all([
        fetch(`http://localhost:3000/api/staff/profile?staffId=${staffId}`),
        fetch(`http://localhost:3000/api/staff/tasks?staffId=${staffId}`),
        fetch(`http://localhost:3000/api/staff/feedback?staffId=${staffId}`),
        fetch(`http://localhost:3000/api/notifications/staff?staffId=${staffId}`)
      ]);

      const profileData = await profileRes.json();
      
      if (!profileRes.ok) {
        console.error('Profile error:', profileData.error);
        setLoading(false);
        return;
      }

      const tasksData = await tasksRes.json();
      const feedbackData = await feedbackRes.json();
      const notifData = await notifRes.json();

      setStaff(profileData.staff);
      setStats(profileData.stats);
      setTasks(tasksData.tasks || []);
      setFeedback(feedbackData.feedback || []);
      setNotifications(notifData.notifications || []);
      
      const unreadCount = (notifData.notifications || []).filter((n: any) => !n.read).length;
      setNewNotifCount(unreadCount);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const filterParam = filter === 'all' ? '' : `&filter=${filter}`;
      const res = await fetch(`http://localhost:3000/api/staff/tasks?staffId=${staffId}${filterParam}`);
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdating(taskId);
    try {
      const res = await fetch(`http://localhost:3000/api/staff/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const updateTaskNote = async () => {
    if (!showNoteModal) return;

    try {
      const res = await fetch(`http://localhost:3000/api/staff/tasks/${showNoteModal.id}/note`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });

      if (res.ok) {
        setShowNoteModal(null);
        setNoteText('');
        fetchData();
      }
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffLoggedIn');
    localStorage.removeItem('staffId');
    localStorage.removeItem('staffName');
    localStorage.removeItem('staffRole');
    navigate('/');
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch(`http://localhost:3000/api/notifications/staff/${notificationId}/read?staffId=${staffId}`, {
        method: 'PUT'
      });
      fetchData();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fixed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Assigned': return <AlertCircle size={16} className="text-yellow-600" />;
      case 'In Progress': return <PlayCircle size={16} className="text-blue-600" />;
      case 'Fixed': return <CheckCircle size={16} className="text-green-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full"></div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">
            Your session may have expired or the server restarted.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Note: Registered staff data is stored in memory and will be lost if the server restarts.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('staffLoggedIn');
              localStorage.removeItem('staffId');
              localStorage.removeItem('staffName');
              localStorage.removeItem('staffRole');
              navigate('/login');
            }}
            className="bg-[#004905] text-white px-6 py-2 rounded-lg hover:bg-[#003804] transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#004905] rounded-xl">
              <Wrench className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {staff.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    notifications.filter(n => !n.read).forEach(n => markNotificationRead(n.id));
                    setNewNotifCount(0);
                  }
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                title="Notifications"
              >
                {newNotifCount > 0 ? (
                  <BellRing size={20} className="text-amber-500" />
                ) : (
                  <Bell size={20} />
                )}
                {newNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {newNotifCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                    <h4 className="font-bold text-white">Notifications</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.filter(n => !n.read).length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="mx-auto mb-2 text-gray-300" size={32} />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.filter(n => !n.read).map((notif) => (
                        <div key={notif.id} className="px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                              <Wrench size={14} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => fetchData()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#004905] to-green-600 rounded-2xl flex items-center justify-center">
                  <User className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{staff.name}</h2>
                  <p className="text-[#004905] font-medium">{staff.role}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Wrench size={16} />
                  </div>
                  <span className="text-sm">{staff.specialty}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone size={16} />
                  </div>
                  <span className="text-sm">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Mail size={16} />
                  </div>
                  <span className="text-sm">{staff.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <span className="text-sm font-medium">ID: {staff.id}</span>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats?.inProgress || 0}</div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats?.completed || 0}</div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats?.avgRating ? stats.avgRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-sm text-purple-700">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tasks & Feedback */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'tasks' 
                      ? 'bg-[#004905] text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  My Tasks
                </button>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'feedback' 
                      ? 'bg-[#004905] text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Feedback ({feedback.length})
                </button>
              </div>

              {activeTab === 'tasks' && (
                <div className="p-6">
                  {/* Filters */}
                  <div className="flex items-center gap-2 mb-6">
                    <Filter size={18} className="text-gray-500" />
                    <div className="flex gap-2">
                      {[
                        { key: 'all', label: 'All' },
                        { key: 'pending', label: 'Pending' },
                        { key: 'inProgress', label: 'In Progress' },
                        { key: 'completed', label: 'Completed' }
                      ].map(f => (
                        <button
                          key={f.key}
                          onClick={() => setFilter(f.key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === f.key
                              ? 'bg-[#004905] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Task List */}
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No tasks found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(task.status)}`}>
                                  {getStatusIcon(task.status)}
                                  {task.status}
                                </span>
                              </div>
                              <h4 className="font-semibold text-gray-900">{task.issueType}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {task.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {formatDate(task.createdAt)}
                                </span>
                              </div>
                              {task.comment && (
                                <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                                  "{task.comment}"
                                </p>
                              )}
                              {task.staffNote && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                  <p className="text-xs font-medium text-blue-700 mb-1">Your Note:</p>
                                  <p className="text-sm text-blue-800">{task.staffNote}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                            {task.status === 'Assigned' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'In Progress')}
                                disabled={updating === task.id}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                              >
                                {updating === task.id ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                  <PlayCircle size={16} />
                                )}
                                Start Work
                              </button>
                            )}
                            {task.status === 'In Progress' && (
                              <>
                                <button
                                  onClick={() => updateTaskStatus(task.id, 'Fixed')}
                                  disabled={updating === task.id}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                  {updating === task.id ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : (
                                    <CheckCircle size={16} />
                                  )}
                                  Mark as Fixed
                                </button>
                                <button
                                  onClick={() => {
                                    setShowNoteModal(task);
                                    setNoteText(task.staffNote || '');
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                  <FileText size={16} />
                                  {task.staffNote ? 'Edit Note' : 'Add Note'}
                                </button>
                              </>
                            )}
                            {task.status === 'Fixed' && task.rating && (
                              <div className="flex items-center gap-1">
                                {renderStars(task.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="p-6">
                  {feedback.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Star size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No feedback yet</p>
                      <p className="text-sm">Complete tasks to receive ratings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedback.map(item => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.issueType}</h4>
                              <p className="text-sm text-gray-500">{item.location}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating)}
                            </div>
                          </div>
                          {item.staffNote && (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mt-2">
                              <span className="font-medium">Your note: </span>{item.staffNote}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Fixed on {formatDate(item.fixedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add Note</h3>
              <button
                onClick={() => setShowNoteModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="font-medium text-gray-900">{showNoteModal.issueType}</p>
                <p className="text-sm text-gray-500">{showNoteModal.location}</p>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g., Replaced cable, working now..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004905] focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNoteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={updateTaskNote}
                className="flex-1 px-4 py-2 bg-[#004905] text-white rounded-xl hover:bg-[#003804] transition-colors font-medium"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
