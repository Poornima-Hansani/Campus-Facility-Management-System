import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { 
  MapPin, BookOpen, Calendar, 
  CheckCircle, Bell, PlayCircle, AlertTriangle,
  Clock, TrendingUp, Users
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
  if (!timeStr) return 0;
  
  // Try 12-hour format first
  const match12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = parseInt(match12[2]);
    const period = match12[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  
  // Try 24-hour format
  const match24 = timeStr.match(/(\d+):(\d+)/);
  if (match24) {
    const hours = parseInt(match24[1]);
    const minutes = parseInt(match24[2]);
    return hours * 60 + minutes;
  }
  
  return 0;
}

function format12Hour(timeStr: string): string {
  const mins = convertTo24Hour(timeStr);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
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

type Meeting = {
  _id: string;
  meetingId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  conductor: string;
};

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const lecturerId = localStorage.getItem('unifiedUserId');
  const lecturerName = localStorage.getItem('unifiedName');
  
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_loadError, setLoadError] = useState("");
  const [_currentTime, setCurrentTime] = useState(getCurrentTime());
  const [lecturerStatus, setLecturerStatus] = useState<"Free" | "In Lecture" | "Day Off">("Free");

  const [_notifications, setNotifications] = useState<Notification[]>([]);
  const [labAlerts, setLabAlerts] = useState<LabAlert[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!lecturerId) {
      navigate('/login');
      return;
    }
    fetchData();
    fetchNotifications();
    fetchAlerts();
    fetchMeetings();
    
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [lecturerId]);

  const fetchNotifications = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const lecturerParam = encodeURIComponent(String(lecturerName || lecturerId || ''));
      
      // Fetch timetable notifications
      const ttNotifs = await fetch(`${API_BASE}/api/timetable/notifications/lecturer?lecturer=${lecturerParam}`).then(r => r.json());
      
      // Fetch meeting notifications for this lecturer
      const meetingNotifs = await fetch(`${API_BASE}/api/notifications/lecturer?lecturerId=${encodeURIComponent(lecturerId || '')}`).then(r => r.json()).catch(() => ({ notifications: [] }));
      
      // Combine notifications
      const allNotifs = [
        ...(Array.isArray(ttNotifs) ? ttNotifs : []),
        ...(meetingNotifs.notifications || [])
      ];
      
      setNotifications(allNotifs);
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

  const fetchMeetings = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/meetings`);
      const data = await res.json();
      const allMeetings = Array.isArray(data) ? data : [];
      // Filter meetings for this lecturer
      const myMeetings = allMeetings.filter(
        (m: Meeting) => m.conductor && (m.conductor === lecturerName || m.conductor === lecturerId)
      );
      setMeetings(myMeetings);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
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

  const handleStartClass = (session: TodaySession) => {
    console.log("Starting class for", session.moduleName);
  };

  // Logout functionality available for future use
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
    <Layout>
      <div className="space-y-6">
        {/* Top Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-2xl">
            {lecturerName ? lecturerName.charAt(0).toUpperCase() : (lecturerId ? lecturerId.charAt(0).toUpperCase() : 'L')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lecturerName || lecturerId || 'Lecturer Name'}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <BookOpen className="w-4 h-4" />
              Senior Lecturer - Faculty of Computing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select 
              value={lecturerStatus}
              onChange={(e) => setLecturerStatus(e.target.value as any)}
              className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${
                lecturerStatus === "Free" ? "text-green-600" :
                lecturerStatus === "In Lecture" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <option value="Free">Free</option>
              <option value="In Lecture">In Lecture</option>
              <option value="Day Off">Day Off</option>
            </select>
          </div>
          <button className="p-3 relative text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Left Side (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-teal-600" />
              Weekly Timetable
            </h2>
            
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="text-center font-semibold text-gray-500 py-2">Time</div>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-700 py-2 bg-gray-50 rounded-lg">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {(Array.from(new Set(timetableData.map(item => item.startTime))).sort((a, b) => convertTo24Hour(a) - convertTo24Hour(b)).length > 0 
                    ? Array.from(new Set(timetableData.map(item => item.startTime))).sort((a, b) => convertTo24Hour(a) - convertTo24Hour(b))
                    : ['08:00 AM', '10:00 AM', '01:00 PM', '03:00 PM']
                  ).map(time => (
                    <div key={time} className="grid grid-cols-6 gap-2">
                      <div className="text-center text-sm font-medium text-gray-500 py-4 flex items-center justify-center whitespace-nowrap px-1">
                        {format12Hour(time)}
                      </div>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                        const sessions = timetableData.filter((item: any) => item.day === day && item.startTime === time);
                        return (
                          <div key={`${day}-${time}`} className="bg-gray-50 rounded-xl min-h-[80px] p-2 border border-gray-100">
                            {sessions.map((session: any, idx: number) => (
                              <div key={idx} className="bg-teal-50 border border-teal-200 p-2 rounded-lg mb-1">
                                <div className="text-xs font-bold text-teal-800">{session.moduleCode}</div>
                                <div className="text-[10px] text-teal-600 truncate">{session.moduleName}</div>
                                <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {session.venueName}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Lab Free Time Alerts */}
          {labAlerts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Lab Free Time Alerts (Turn off AC & Lights)
              </h2>

              {labAlerts.map((a, i) => (
                <div key={i} className="mb-3 p-4 bg-white rounded-xl border border-yellow-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        {a.labName} - {a.day}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        Free from {a.start}:00 to {a.end}:00 ({a.duration} hours)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Week {a.weekNumber} - {a.year}
                      </p>
                    </div>
                    <div className="ml-4">
                      {!a.confirmed ? (
                        <button
                          onClick={() => handleConfirmAlert(a._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Confirm Turn Off</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg border border-gray-200">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Confirmed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Today Classes Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Today's Classes
              </h2>
              <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">
                {getCurrentDay()}
              </span>
            </div>
            
            {todaySessions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No classes today</p>
                <p className="text-sm mt-1">Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaySessions.map((session) => {
                  const status = getSessionStatus(session.startTime, session.endTime);
                  const isOngoing = status === "Ongoing";
                  const isFinished = status === "Finished";
                  
                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border-l-4 transition-all ${
                        isOngoing
                          ? "border-l-green-500 bg-green-50 shadow-sm"
                          : isFinished
                          ? "border-l-gray-300 bg-gray-50 opacity-75"
                          : "border-l-teal-500 bg-teal-50/50 hover:bg-teal-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                          {session.startTime}
                        </span>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isOngoing
                            ? "bg-green-500 text-white"
                            : isFinished
                            ? "bg-gray-300 text-gray-600"
                            : "bg-teal-100 text-teal-700"
                        }`}>
                          {isOngoing ? "Ongoing" : isFinished ? "Done" : "Upcoming"}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 leading-tight">
                        {session.moduleCode}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-3">
                        {session.moduleName}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200/60">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded shadow-sm">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {session.venueName}
                        </div>
                        
                        {!isFinished && status === "Upcoming" && (
                          <button
                            onClick={() => handleStartClass(session)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
                          >
                            <PlayCircle className="w-3 h-3" />
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Meetings Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Scheduled Meetings
              </h2>
            </div>
            
            {meetings.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No meetings scheduled</p>
                <p className="text-sm mt-1">Management hasn't scheduled any meetings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.slice(0, 5).map((meeting) => (
                  <div
                    key={meeting._id}
                    className="p-4 rounded-xl border-l-4 border-l-orange-400 bg-orange-50/50 hover:bg-orange-50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-orange-700 bg-white px-2 py-1 rounded shadow-sm">
                        {meeting.meetingId}
                      </span>
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                        {meeting.date}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {meeting.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1 mb-3">
                      {meeting.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200/60">
                      <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                          <Clock className="w-3 h-3" />
                          {meeting.startTime} - {meeting.endTime}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                          <MapPin className="w-3 h-3 text-red-500" />
                          {meeting.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quick Stats or Info */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <p className="text-teal-100 text-xs font-medium uppercase tracking-wider mb-1">Total Classes</p>
                <p className="text-2xl font-bold">{timetableData.length}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
                <p className="text-teal-100 text-xs font-medium uppercase tracking-wider mb-1">Students</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  );
}
