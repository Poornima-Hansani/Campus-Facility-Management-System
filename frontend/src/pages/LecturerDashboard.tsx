import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  MapPin, BookOpen, Calendar, 
  Users, Monitor, Snowflake, CheckCircle,
  Bell, PlayCircle, PlusCircle, AlertTriangle,
  BarChart3, User, Clock, TrendingUp
} from "lucide-react";
import { getLecturerLabAlerts, confirmLabAlert, type LabAlert } from "../api/labGapApi";

type TodaySession = {
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

type RoomInfo = {
  name: string;
  capacity: number;
  hasProjector: boolean;
  hasAC: boolean;
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getCurrentTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

function getCurrentDay(): string {
  const now = new Date();
  return dayNames[now.getDay()];
}

function convertTo24Hour(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getSessionStatus(startTime: string, endTime: string): "Upcoming" | "Ongoing" | "Finished" {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const startMinutes = convertTo24Hour(startTime);
  const endMinutes = convertTo24Hour(endTime);
  
  if (currentMinutes < startMinutes) return "Upcoming";
  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) return "Ongoing";
  return "Finished";
}

type Notification = {
  id: number;
  type: string;
  moduleCode: string;
  moduleName: string;
  lecturer: string;
  day: string;
  message: string;
  createdAt: string;
  readBy: string[];
};

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const lecturerId = localStorage.getItem('unifiedUserId');
  const lecturerName = localStorage.getItem('unifiedName');
  
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_loadError, setLoadError] = useState("");
  const [_currentTime, setCurrentTime] = useState(getCurrentTime());
  const [reminders, setReminders] = useState<number[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomInfo | null>(null);
  const [_notifications, setNotifications] = useState<Notification[]>([]);
  const [labAlerts, setLabAlerts] = useState<LabAlert[]>([]);

  useEffect(() => {
    if (!lecturerId) {
      navigate('/login');
      return;
    }
    fetchData();
    fetchNotifications();
    fetchAlerts();
    
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [lecturerId]);

  const fetchNotifications = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const lecturerParam = encodeURIComponent(String(lecturerName || lecturerId || ''));
      const notifs = await fetch(`${API_BASE}/api/timetable/notifications/lecturer?lecturer=${lecturerParam}`).then(r => r.json());
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (e) {
      console.log("Failed to fetch notifications");
    }
  };

  const fetchData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const lecturerParam = encodeURIComponent(String(lecturerName || lecturerId || ''));
      const tt = await fetch(`${API_BASE}/api/timetable/lecturer?lecturer=${lecturerParam}`).then(r => r.json());
      
      setTimetableData(Array.isArray(tt) ? tt : []);
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await getLecturerLabAlerts(lecturerId || '');
      setLabAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAlert = async (alertId: string) => {
    try {
      await confirmLabAlert(alertId);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const todaySessions: TodaySession[] = timetableData
    .filter((item: any) => item.day === getCurrentDay())
    .sort((a: any, b: any) => {
      return convertTo24Hour(a.startTime) - convertTo24Hour(b.startTime);
    })
    .map((item: any): TodaySession => ({
      id: item.id,
      moduleCode: item.moduleCode,
      moduleName: item.moduleName,
      venueType: item.venueType || "Lecture Hall",
      venueName: item.venueName,
      lecturer: item.lecturer,
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime
    }));

  const getRoomInfo = (venueName: string): RoomInfo => {
    const rooms: Record<string, RoomInfo> = {
      "Lab 1": { name: "Lab 1", capacity: 40, hasProjector: true, hasAC: true },
      "Lab 2": { name: "Lab 2", capacity: 40, hasProjector: true, hasAC: true },
      "Lab 3": { name: "Lab 3", capacity: 30, hasProjector: true, hasAC: true },
      "Lecture Hall 1": { name: "Lecture Hall 1", capacity: 100, hasProjector: true, hasAC: true },
      "Lecture Hall 2": { name: "Lecture Hall 2", capacity: 80, hasProjector: true, hasAC: true },
    };
    return rooms[venueName] || { name: venueName, capacity: 30, hasProjector: false, hasAC: false };
  };

  const handleRemind = (sessionId: number) => {
    setReminders(prev => [...prev, sessionId]);
    setTimeout(() => {
      setReminders(prev => prev.filter(id => id !== sessionId));
    }, 5000);
  };

  const handleStartClass = (session: TodaySession) => {
    const roomInfo = getRoomInfo(session.venueName);
    setCurrentRoom(roomInfo);
  };

  // Logout functionality available for future use
  // const handleLogout = () => {
  //   localStorage.clear();
  //   navigate('/login');
  // };

  // Session status check available for future use
  // const ongoingSession = todaySessions.find(s => getSessionStatus(s.startTime, s.endTime) === "Ongoing");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-teal-600" />
          Lecturer Dashboard
        </h1>
        <div className="text-sm text-gray-500 flex items-center gap-3">
          <User className="w-4 h-4" />
          Welcome back, {lecturerName || lecturerId || 'Lecturer'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todaySessions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">156</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
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

      {/* Today's Schedule - Detailed View */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Today's Schedule ({getCurrentDay()})
        </h2>
        
        {todaySessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No classes scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySessions.map((session) => {
              const status = getSessionStatus(session.startTime, session.endTime);
              const isOngoing = status === "Ongoing";
              const isFinished = status === "Finished";
              
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border-2 transition ${
                    isOngoing
                      ? "border-green-500 bg-green-50"
                      : isFinished
                      ? "border-gray-300 bg-gray-50 opacity-60"
                      : "border-teal-200 bg-teal-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-lg font-bold text-gray-700">
                        {session.startTime}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.moduleCode} - {session.moduleName}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {session.venueName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isOngoing
                          ? "bg-green-500 text-white"
                          : isFinished
                          ? "bg-gray-400 text-white"
                          : "bg-teal-500 text-white"
                      }`}>
                        {isOngoing ? "Ongoing" : isFinished ? "Finished" : "Upcoming"}
                      </span>
                      {!isFinished && (
                        <button
                          onClick={() => handleRemind(session.id)}
                          disabled={reminders.includes(session.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                            reminders.includes(session.id)
                              ? "bg-gray-300 text-gray-600 cursor-default"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          <Bell className="w-3 h-3" />
                          {reminders.includes(session.id) ? "Reminded!" : "Remind me"}
                        </button>
                      )}
                      {status === "Upcoming" && (
                        <button
                          onClick={() => handleStartClass(session)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-green-500 text-white hover:bg-green-600"
                        >
                          <PlayCircle className="w-3 h-3" />
                          Start class
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Room Information */}
      {currentRoom && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Room Information
          </h2>
          
          <div className="p-4 rounded-xl border-2 border-teal-500 bg-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {currentRoom.name}
                </div>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Capacity: {currentRoom.capacity}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentRoom.hasProjector ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {currentRoom.hasProjector ? <CheckCircle className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  Projector {currentRoom.hasProjector ? "Yes" : "No"}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentRoom.hasAC ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {currentRoom.hasAC ? <CheckCircle className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                  AC {currentRoom.hasAC ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Free Time Alerts */}
      {labAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-yellow-800 mb-4">
            Lab Free Time Alerts (Turn off AC & Lights)
          </h2>

          {labAlerts.map((a, i) => (
            <div key={i} className="mb-3 p-3 bg-white rounded border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {a.labName} - {a.day}
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
      )}

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
            <Link to="/lab-booking" className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <PlusCircle className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Book Extra Room</span>
            </Link>
            <Link to="/report-issue" className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">Report Issue</span>
            </Link>
            <Link to="/reports" className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <span className="text-gray-900">View Reports</span>
            </Link>
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
    </div>
  );
}
