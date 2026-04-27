import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { QrCode, CheckCircle, AlertCircle, User, Fingerprint } from "lucide-react";

export default function AttendanceScanPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const module = searchParams.get("module") || "";
  const date = searchParams.get("date") || "";

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // If missing params, show error
    if (!module || !date) {
      setStatus("error");
      setErrorMessage("Invalid attendance link. Please scan the QR code again.");
    }
    
    // Auto-fill from local storage if available (Student login)
    const savedName = localStorage.getItem('unifiedName');
    const savedId = localStorage.getItem('unifiedUserId');
    if (savedName) setStudentName(savedName);
    if (savedId) setStudentId(savedId);
  }, [module, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentId) return;

    setIsSubmitting(true);
    setStatus("idle");

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName,
          studentId,
          module,
          date
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to mark attendance");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-purple-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <QrCode size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-1">Class Attendance</h1>
          {module && <p className="text-purple-200 font-medium">{module} • {date}</p>}
        </div>

        {/* Content */}
        <div className="p-8">
          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Marked!</h2>
              <p className="text-gray-500 mb-8">You have successfully checked in for {module}.</p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors w-full"
              >
                Go to Dashboard
              </button>
            </div>
          ) : status === "error" && !module ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
              <p className="text-gray-500">{errorMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "error" && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User size={16} className="text-gray-400" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Fingerprint size={16} className="text-gray-400" /> Student ID
                </label>
                <input 
                  type="text" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU12345"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none font-mono text-gray-700 uppercase"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-md mt-6 text-lg ${
                  isSubmitting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Mark Present'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
