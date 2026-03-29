import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';

type Report = {
  id: string;
  location: string;
  issueType: string;
  comment: string;
  status: 'Pending' | 'Action Required' | 'Fixed';
  createdAt: string;
  rating?: number;
};

export default function ReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState(0);

  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/reports?studentId=STU12345');
      const data = await res.json();
      setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const submitRating = async (reportId: string) => {
    if (!ratingScore) return;
    try {
      await fetch(`http://localhost:3000/api/reports/${reportId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingScore })
      });
      setRatingTarget(null);
      setRatingScore(0);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Pending':
        return <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200"><Clock size={12}/> {status}</span>;
      case 'Action Required':
        return <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200"><AlertTriangle size={12}/> {status}</span>;
      case 'Fixed':
        return <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200"><CheckCircle size={12}/> {status}</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1">Track the status of your facility reports and provide ratings.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your history...</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          You haven't submitted any reports yet.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{report.issueType}</h3>
                  <p className="text-sm font-medium text-emerald-600">{report.location}</p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{report.comment || "No additional comments provided."}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
                
                {report.status === 'Fixed' && !report.rating && ratingTarget !== report.id && (
                  <button 
                    onClick={() => setRatingTarget(report.id)}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                  >
                    Rate Management Action
                  </button>
                )}

                {report.rating && (
                  <div className="flex gap-1 text-yellow-500" title={`Rated ${report.rating} stars`}>
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={16} fill={star <= report.rating! ? "currentColor" : "none"} />
                    ))}
                    <span className="text-xs font-semibold text-gray-500 ml-1">Rated</span>
                  </div>
                )}

                {ratingTarget === report.id && (
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} 
                          className={`hover:scale-110 transition-transform ${star <= ratingScore ? 'text-yellow-500' : 'text-gray-300'}`}
                          onMouseEnter={() => setRatingScore(star)}
                        >
                          <Star size={20} fill={star <= ratingScore ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => submitRating(report.id)}
                      disabled={!ratingScore}
                      className="bg-emerald-600 disabled:bg-emerald-300 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
