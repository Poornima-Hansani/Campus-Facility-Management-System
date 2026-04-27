import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet } from "../../lib/api";
import { Users, UserCheck, UserMinus, UserX, Clock, Star, Trophy, Award, Target, Activity } from "lucide-react";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  workloadStatus: string;
  activeTasks: number;
};

// Mock Data
const MOCK_DAILY_STATS = {
  totalRegistered: 48,
  free: 12,
  busy: 31,
  absent: 5
};

const MOCK_TOP_PERFORMER = {
  name: "Sarah Jenkins",
  role: "Senior Technician",
  rating: 4.9,
  tasksCompleted: 142,
  avgResponseTime: "12 mins",
  specialty: "HVAC Systems",
  avatarUrl: "https://i.pravatar.cc/150?u=sarah"
};

const MOCK_CHECK_INS = [
  { id: "1", name: "David Miller", role: "Maintenance", time: "07:45 AM", status: "On Time" },
  { id: "2", name: "Emily Chen", role: "IT Support", time: "08:02 AM", status: "On Time" },
  { id: "3", name: "Marcus Johnson", role: "Electrician", time: "08:15 AM", status: "Late" },
  { id: "4", name: "Sarah Jenkins", role: "Senior Technician", time: "07:30 AM", status: "On Time" },
  { id: "5", name: "Robert Wilson", role: "Plumber", time: "-", status: "Absent" },
  { id: "6", name: "Jessica Taylor", role: "Janitorial", time: "06:55 AM", status: "On Time" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ staff: StaffMember[] }>("/api/management/staff")
      .then(data => setStaff(data.staff || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Users className="text-blue-600" size={24} />
          </div>
          Staff Management Overview
        </h2>
        <p className="text-gray-500 text-sm mt-2">Monitor daily attendance, performance, and workload assignments</p>
      </div>

      {/* Daily Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Registered</p>
            <h3 className="text-2xl font-bold text-gray-900">{staff.length}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-green-100 text-green-600 p-4 rounded-xl"><UserCheck size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Free Staff</p>
            <h3 className="text-2xl font-bold text-gray-900">{staff.filter(s => s.workloadStatus === 'Free').length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition hover:shadow-md">
          <div className="bg-orange-100 text-orange-600 p-4 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Busy Staff</p>
            <h3 className="text-2xl font-bold text-gray-900">{staff.filter(s => s.workloadStatus !== 'Free').length}</h3>
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
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-6 opacity-20"><Trophy size={100} /></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <Award size={14} /> Star Performer
              </div>
              
              <div className="flex items-center gap-5 mb-6">
                <img src={staff[0] ? `https://ui-avatars.com/api/?name=${staff[0].name}&background=random` : MOCK_TOP_PERFORMER.avatarUrl} alt="Performer" className="w-20 h-20 rounded-full border-4 border-white/20 shadow-xl" />
                <div>
                  <h3 className="text-2xl font-bold">{staff[0] ? staff[0].name : MOCK_TOP_PERFORMER.name}</h3>
                  <p className="text-blue-200 font-medium">{staff[0] ? staff[0].role : MOCK_TOP_PERFORMER.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Rating</p>
                  <div className="flex items-center gap-1 font-bold text-xl"><Star size={18} className="fill-yellow-400 text-yellow-400" /> {MOCK_TOP_PERFORMER.rating}</div>
                </div>
                <div>
                  <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Tasks Done</p>
                  <div className="flex items-center gap-1 font-bold text-xl"><Target size={18} className="text-blue-200" /> {MOCK_TOP_PERFORMER.tasksCompleted}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-blue-200 text-xs uppercase tracking-wider mb-1">Avg Response Time</p>
                  <div className="flex items-center gap-1 font-bold text-xl"><Clock size={18} className="text-blue-200" /> {MOCK_TOP_PERFORMER.avgResponseTime}</div>
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
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                    <th className="pb-4 pl-2">Staff Member</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Time</th>
                    <th className="pb-4 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {staff.slice(0, 6).map((member, idx) => (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="py-4 pl-2 font-medium text-gray-900">{member.name}</td>
                      <td className="py-4 text-gray-600">{member.role}</td>
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
                  {staff.length === 0 && (
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

      {/* Existing Staff Grid */}
      <div>
        <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2"><UserMinus className="text-gray-400" size={20} /> Staff Directory & Workload</h3>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500">No staff members found in the directory</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(member => (
              <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 group-hover:scale-105 transition-transform">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{member.role}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Specialty</span>
                    <span className="text-sm font-bold text-gray-700">{member.specialty || "General"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Active Tasks</span>
                    <span className="text-sm font-bold text-gray-700 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{member.activeTasks || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-1 border-t border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Status</span>
                    <span className={`text-sm font-bold flex items-center gap-1.5 ${
                      member.workloadStatus === "Busy" ? "text-red-600" :
                      member.workloadStatus === "Medium" ? "text-orange-500" :
                      "text-green-600"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        member.workloadStatus === "Busy" ? "bg-red-600 animate-pulse" :
                        member.workloadStatus === "Medium" ? "bg-orange-500" :
                        "bg-green-600"
                      }`}></span>
                      {member.workloadStatus || "Available"}
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