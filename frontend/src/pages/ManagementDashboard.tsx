import { useEffect, useState } from 'react';
import { Users, CheckSquare, Star, Wrench } from 'lucide-react';

type EscalateGroup = {
  location: string;
  issueType: string;
  count: number;
  status: 'Action Required' | 'Fixed';
  ids: string[];
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}

export default function ManagementDashboard() {
  const [stats, setStats] = useState({ totalReports: 0, fixedReports: 0, avgRating: 0 });
  const [escalated, setEscalated] = useState<EscalateGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/management/dashboard');
      const data = await res.json();
      setStats(data.stats);
      setEscalated(data.escalated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling for demo
    return () => clearInterval(interval);
  }, []);

  const markFixed = async (ids: string[]) => {
    try {
      await fetch('http://localhost:3000/api/management/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-semibold">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Weekly Performance Dashboard</h1>
        <p className="text-gray-600 mt-1">Management View: Monitor facility issues, ratings, and escalations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Issues Reported" value={stats.totalReports} icon={Users} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Issues Fixed" value={stats.fixedReports} icon={CheckSquare} color="bg-green-100 text-green-700" />
        <StatCard title="Average Rating" value={Number(stats.avgRating).toFixed(1) + " / 5.0"} icon={Star} color="bg-yellow-100 text-yellow-700" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-2">
          <Wrench className="text-red-600" size={20} />
          <h2 className="text-lg font-bold text-red-900">Action Required (5+ Reports)</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
        ) : escalated.filter(e => e.status === 'Action Required').length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-gray-50/50">
            No pending escalations. Great job!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {escalated.filter(e => e.status === 'Action Required').map((group, idx) => (
              <div key={idx} className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-red-100 text-red-700 text-xs font-extrabold px-2 py-1 rounded-md border border-red-200">
                      {group.count} Complaints
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">{group.issueType}</h3>
                  </div>
                  <p className="text-gray-600 font-medium">{group.location}</p>
                </div>
                
                <button 
                  onClick={() => markFixed(group.ids)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 max-w-max"
                >
                  <CheckSquare size={18} />
                  Assign Staff & Mark Fixed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
