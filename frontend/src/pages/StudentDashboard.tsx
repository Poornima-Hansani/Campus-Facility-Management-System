import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

type WeeklySummary = {
  totalReports: number;
  fixedReports: number;
  avgResponseTime: number;
  categoryBreakdown: Record<string, number>;
  resolutionRate: number;
};

type EscalatedGroup = {
  ids: string[];
  issueType: string;
  location: string;
  status: string;
};

type Report = {
  id: string;
  issueType: string;
  location: string;
  status: string;
  createdAt: string;
};

type DashboardData = {
  escalated?: EscalatedGroup[];
  pending?: Report[];
  assigned?: Report[];
};

type WeeklySummaryResponse = {
  summary: WeeklySummary;
};

export default function StudentDashboard() {
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  const studentId = localStorage.getItem('studentId') || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, reportsRes] = await Promise.all([
          fetch('http://localhost:3000/api/management/weekly-summary'),
          fetch('http://localhost:3000/api/management/dashboard')
        ]);
        const summaryData: WeeklySummaryResponse = await summaryRes.json();
        const reportsData: DashboardData = await reportsRes.json();
        
        setWeeklySummary(summaryData.summary);
        
        const allReports: Report[] = [
          ...(reportsData.escalated?.flatMap((g: EscalatedGroup) => 
            g.ids.map((id: string) => ({
              id,
              issueType: g.issueType,
              location: g.location,
              status: g.status,
              createdAt: new Date().toISOString()
            }))
          ) || []),
          ...(reportsData.pending || []).map((r: Report) => ({ ...r, status: 'Pending' })),
          ...(reportsData.assigned || []).map((r: Report) => ({ ...r, status: 'Assigned' }))
        ];
        setRecentReports(allReports);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-700 via-teal-800 to-blue-900">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 opacity-20 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full animate-pulse delay-2000"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6 animate-fadeIn p-6">
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 flex justify-between items-center transition-all duration-300 hover:shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {studentId}</h1>
            <p className="text-gray-500 text-sm">
              Report issues and track their resolution status
            </p>
          </div>
          <Link 
            to="/reporting"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            Report Issue
          </Link>
        </div>

      </div>
    </div>
  );
}
