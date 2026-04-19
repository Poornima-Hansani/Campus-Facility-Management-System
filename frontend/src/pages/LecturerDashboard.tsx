import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, MapPin, User, BookOpen, Calendar, 
  LogOut, Search, ChevronDown 
} from "lucide-react";
import type { TimetableItem } from "../components/TimetableManager";

type LectureItem = {
  id: number;
  moduleCode: string;
  moduleName: string;
  venueType: "Lecture Hall" | "Laboratory";
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dayIndex(d: string) {
  const i = dayOrder.indexOf(d);
  return i === -1 ? 99 : i;
}

function sortRows(rows: any[]) {
  return [...rows].sort((x, y) => {
    const d = dayIndex(x.day) - dayIndex(y.day);
    if (d !== 0) return d;
    return x.startTime.localeCompare(y.startTime);
  });
}

export default function LecturerDashboard() {
  const navigate = useNavigate();
  const lecturerId = localStorage.getItem('unifiedUserId');
  const lecturerName = localStorage.getItem('unifiedName');
  
  const [lectureData, setLectureData] = useState<LectureItem[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [day, setDay] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'timetable'>('catalog');

  useEffect(() => {
    if (!lecturerId) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [lecturerId]);

  const fetchData = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const [lectures, tt] = await Promise.all([
        fetch(`${API_BASE}/api/lectures`).then(r => r.json()),
        fetch(`${API_BASE}/api/timetable`).then(r => r.json())
      ]);
      
      setLectureData(Array.isArray(lectures) ? lectures : []);
      setTimetableData(Array.isArray(tt) ? tt : []);
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLectures = useMemo(() => {
    let filtered = lectureData;
    if (activeTab === 'catalog') {
      if (moduleCode) {
        filtered = filtered.filter(x => 
          x.moduleCode.toLowerCase().includes(moduleCode.toLowerCase())
        );
      }
      if (moduleName) {
        filtered = filtered.filter(x => 
          x.moduleName.toLowerCase().includes(moduleName.toLowerCase())
        );
      }
      if (day) {
        filtered = filtered.filter(x => x.day === day);
      }
    }
    return sortRows(filtered);
  }, [lectureData, moduleCode, moduleName, day, activeTab]);

  const filteredTimetable = useMemo(() => {
    let filtered = timetableData;
    if (activeTab === 'timetable') {
      if (moduleCode) {
        filtered = filtered.filter(x => 
          x.moduleCode.toLowerCase().includes(moduleCode.toLowerCase())
        );
      }
      if (moduleName) {
        filtered = filtered.filter(x => 
          x.moduleName.toLowerCase().includes(moduleName.toLowerCase())
        );
      }
      if (day) {
        filtered = filtered.filter(x => x.day === day);
      }
    }
    return sortRows(filtered);
  }, [timetableData, moduleCode, moduleName, day, activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleClearFilters = () => {
    setModuleCode('');
    setModuleName('');
    setDay('');
    setSearched(false);
  };

  const sessionCounts = useMemo(() => {
    const catCount = lectureData.length;
    const ttCount = timetableData.length;
    return { catalog: catCount, timetable: ttCount };
  }, [lectureData, timetableData]);

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Lecturer Dashboard
            </h1>
            <p className="text-teal-100 mt-1">Welcome, {lecturerName || lecturerId}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Module Code"
                  value={moduleCode}
                  onChange={(e) => {
                    setModuleCode(e.target.value);
                    setSearched(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Module Name"
                  value={moduleName}
                  onChange={(e) => {
                    setModuleName(e.target.value);
                    setSearched(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="w-48">
              <div className="relative">
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={day}
                  onChange={(e) => {
                    setDay(e.target.value);
                    setSearched(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                >
                  <option value="">All Days</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>
            {searched && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'catalog'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Module Catalog ({sessionCounts.catalog})
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'timetable'
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Published Timetable ({sessionCounts.timetable})
            </button>
          </div>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {loadError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Module</th>
                  <th className="px-6 py-4 text-left">Venue</th>
                  <th className="px-6 py-4 text-left">Lecturer</th>
                  <th className="px-6 py-4 text-left">Day</th>
                  <th className="px-6 py-4 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(activeTab === 'catalog' ? filteredLectures : filteredTimetable).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No sessions found
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'catalog' ? filteredLectures : filteredTimetable).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{item.moduleCode}</div>
                        <div className="text-sm text-gray-500">{item.moduleName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {item.venueName}
                        </div>
                        <div className="text-xs text-gray-400">{item.venueType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          {item.lecturer}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {item.day}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {item.startTime} - {item.endTime}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {activeTab === 'catalog' ? filteredLectures.length : filteredTimetable.length} of{' '}
          {activeTab === 'catalog' ? sessionCounts.catalog : sessionCounts.timetable} sessions
        </div>
      </div>
    </div>
  );
}