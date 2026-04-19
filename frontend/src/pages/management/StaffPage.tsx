import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet } from "../../lib/api";
import { Users } from "lucide-react";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  workloadStatus: string;
  activeTasks: number;
};

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
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <Users className="text-green-600" size={24} />
          </div>
          Staff List
        </h2>
        <p className="text-gray-500 text-sm mt-1">View staff members and their workload</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : staff.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No staff members found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Specialty</span>
                  <span className="text-sm font-medium">{member.specialty || "General"}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Active Tasks</span>
                  <span className="text-sm font-medium">{member.activeTasks || 0}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`text-sm font-medium ${
                    member.workloadStatus === "Busy" ? "text-red-600" :
                    member.workloadStatus === "Medium" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {member.workloadStatus || "Available"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}