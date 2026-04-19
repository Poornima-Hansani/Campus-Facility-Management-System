import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet } from "../../lib/api";
import { Activity } from "lucide-react";

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

export default function IssuesPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ issues: ReportItem[] }>("/api/management/issues")
      .then(data => setReports(data.issues || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <Activity className="text-green-600" size={24} />
          </div>
          Issues List
        </h2>
        <p className="text-gray-500 text-sm mt-1">View and manage all reported issues</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No issues found</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Issue Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{report.issueType}</td>
                  <td className="px-4 py-3 text-sm">{report.location}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      report.status === "resolved" ? "bg-green-100 text-green-700" :
                      report.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}