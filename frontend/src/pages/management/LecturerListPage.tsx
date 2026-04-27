import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet } from "../../lib/api";
import { Users, UserCheck, UserMinus, UserX, Clock, Star, Trophy, Award, Target, Activity, GraduationCap } from "lucide-react";

type LecturerMember = {
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

// Mock Data
const MOCK_DAILY_STATS = {
  totalRegistered: 112,
  free: 45,
  busy: 58,
  absent: 9
};

const MOCK_TOP_PERFORMER = {
  name: "Dr. Emily Watson",
  department: "Computer Science",
  rating: 4.95,
  classesTaught: 24,
  avgStudentScore: "88%",
  avatarUrl: "https://i.pravatar.cc/150?u=emily"
};

const MOCK_CHECK_INS = [
  { id: "1", name: "Prof. Alan Smith", role: "Software Engineering", time: "07:30 AM", status: "On Time" },
  { id: "2", name: "Dr. Emily Watson", role: "Computer Science", time: "07:45 AM", status: "On Time" },
  { id: "3", name: "Dr. Marcus Johnson", role: "Information Systems", time: "08:15 AM", status: "Late" },
  { id: "4", name: "Prof. Sarah Jenkins", role: "Cyber Security", time: "08:00 AM", status: "On Time" },
  { id: "5", name: "Dr. Robert Wilson", role: "Data Science", time: "-", status: "Absent" },
  { id: "6", name: "Dr. Jessica Taylor", role: "Mathematics", time: "07:55 AM", status: "On Time" },
];

export default function LecturerListPage() {
  const [lectures, setLectures] = useState<LecturerMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Group lectures by lecturer to create a directory view
  const [directory, setDirectory] = useState<any[]>([]);

  useEffect(() => {
    // Fetch both timetable and registered lecturers
    Promise.all([
      apiGet<LecturerMember[]>("/api/lectures"),
      apiGet<{_id: string, name: string}[]>("/api/lecturers")
    ])
      .then(([timetableData, registeredData]) => {
        const rawList = timetableData || [];
        setLectures(rawList);
        
        // Process into a directory format (grouping by lecturer name)
        const lecturerMap = new Map();
        
        // Add all registered lecturers first
        if (registeredData && registeredData.length > 0) {
          registeredData.forEach((reg: any) => {
            lecturerMap.set(reg.name, {
              id: reg._id || reg.userId || Math.random().toString(),
              name: reg.name,
              department: "Computing", // mocked
              modules: new Set(),
              status: "Available" // Default
            });
          });
        }

        // Add timetable data and update statuses
        rawList.forEach(l => {
          if (!lecturerMap.has(l.lecturer)) {
            lecturerMap.set(l.lecturer, {
              id: Math.random().toString(),
              name: l.lecturer,
              department: "Computing", // mocked
              modules: new Set([l.moduleCode]),
              status: Math.random() > 0.5 ? "In Class" : "Available" // mocked status
            });
          } else {
            const entry = lecturerMap.get(l.lecturer);
            entry.modules.add(l.moduleCode);
            entry.status = Math.random() > 0.5 ? "In Class" : "Available"; // mocked status based on timetable
          }
        });
        
        setDirectory(Array.from(lecturerMap.values()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-purple-100 p-2 rounded-xl">
            <GraduationCap className="text-purple-600" size={24} />
          </div>
          Lecturer Management Overview
        </h2>
        <p className="text-gray-500 text-sm mt-2">Monitor daily attendance, performance, and academic workload</p>
      </div>

      {/* Daily Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Lecturers</p>
            <h3 className="text-2xl font-bold text-gray-900">{directory.length}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-green-100 text-green-600 p-4 rounded-xl"><UserCheck size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Available Today</p>
            <h3 className="text-2xl font-bold text-gray-900">{directory.filter(d => d.status === 'Available').length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-orange-100 text-orange-600 p-4 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Class Currently</p>
            <h3 className="text-2xl font-bold text-gray-900">{directory.filter(d => d.status === 'In Class').length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-red-100 text-red-600 p-4 rounded-xl"><UserX size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Absent Today</p>
            <h3 className="text-2xl font-bold text-gray-900">0</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Top Performer Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-6 opacity-20"><Trophy size={100} /></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <Award size={14} /> Highest Rated
              </div>
              
              <div className="flex items-center gap-5 mb-6">
                <img src={directory[0] ? `https://ui-avatars.com/api/?name=${directory[0].name}&background=random` : MOCK_TOP_PERFORMER.avatarUrl} alt="Performer" className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl" />
                <div>
                  <h3 className="text-2xl font-bold">{directory[0] ? directory[0].name : MOCK_TOP_PERFORMER.name}</h3>
                  <p className="text-purple-200 font-medium">{directory[0] ? directory[0].department : MOCK_TOP_PERFORMER.department}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Feedback Rating</p>
                  <div className="flex items-center gap-1 font-bold text-xl"><Star size={18} className="fill-yellow-400 text-yellow-400" /> {MOCK_TOP_PERFORMER.rating}</div>
                </div>
                <div>
                  <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Classes</p>
                  <div className="flex items-center gap-1 font-bold text-xl"><Target size={18} className="text-purple-200" /> {MOCK_TOP_PERFORMER.classesTaught}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-purple-200 text-xs uppercase tracking-wider mb-1">Avg Student Score</p>
                  <div className="flex items-center gap-1 font-bold text-xl"><GraduationCap size={18} className="text-purple-200" /> {MOCK_TOP_PERFORMER.avgStudentScore}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Check-In Time Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Today's Check-ins</h3>
                <p className="text-sm text-gray-500">Live attendance monitoring</p>
              </div>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-lg transition">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                    <th className="pb-4 pl-2">Lecturer Name</th>
                    <th className="pb-4">Department</th>
                    <th className="pb-4">Time</th>
                    <th className="pb-4 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {directory.slice(0, 6).map((member, idx) => (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-4 pl-2 font-medium text-gray-900">{member.name}</td>
                      <td className="py-4 text-gray-600">{member.department}</td>
                      <td className="py-4 font-medium text-gray-700">
                        {idx % 3 === 0 ? "07:30 AM" : idx % 2 === 0 ? "08:15 AM" : "-"}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          idx % 3 === 0 ? 'bg-green-100 text-green-700' :
                          idx % 2 === 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {idx % 3 === 0 ? "On Time" : idx % 2 === 0 ? "Late" : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {directory.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">No check-ins today</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Existing Lecturer Directory */}
      <div>
        <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2"><UserMinus className="text-gray-400" size={20} /> Lecturer Directory & Workload</h3>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div></div>
        ) : directory.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">No lecturers found in the directory</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directory.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg border border-purple-100 group-hover:scale-105 transition-transform">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg truncate w-40" title={member.name}>{member.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{member.department}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Modules</span>
                    <span className="text-sm font-bold text-gray-700 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100 truncate max-w-[120px]" title={Array.from(member.modules).join(', ')}>
                      {Array.from(member.modules).length} Modules
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Status</span>
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${
                      member.status === "In Class" ? "text-orange-500" : "text-green-600"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === "In Class" ? "bg-orange-500 animate-pulse" : "bg-green-600"
                      }`}></span>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
