import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Users, QrCode, RefreshCcw } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type AttendanceRecord = {
  _id: string;
  studentName: string;
  studentId: string;
  module: string;
  date: string;
  scannedAt: string;
};

export default function QRAttendancePage() {
  const [moduleName, setModuleName] = useState("");
  const [qrData, setQrData] = useState("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Periodically fetch attendance when QR is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrData) {
      fetchAttendance();
      interval = setInterval(fetchAttendance, 5000); // Live update every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [qrData]);

  const fetchAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/attendance?module=${moduleName}&date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleName) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Construct the URL the student will scan
    const baseUrl = window.location.origin;
    const scanUrl = `${baseUrl}/attendance?module=${encodeURIComponent(moduleName)}&date=${today}`;
    
    setQrData(scanUrl);
    setAttendance([]); // reset attendance list for this new session
    fetchAttendance();
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-purple-100 p-2 rounded-xl">
            <QrCode className="text-purple-600" size={24} />
          </div>
          QR Attendance System
        </h2>
        <p className="text-gray-500 text-sm mt-2">Generate a QR code for students to scan and mark their attendance live.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generate QR Box */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-6">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              Generate QR
            </h3>

            <form onSubmit={handleGenerateQR} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Module Code / Name</label>
                <input 
                  type="text" 
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. OOP"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 rounded-xl text-white font-bold bg-purple-600 hover:bg-purple-700 hover:shadow-lg active:scale-[0.98] transition-all shadow-md"
              >
                Generate QR Code
              </button>
            </form>

            {qrData && (
              <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center">
                <p className="text-sm font-medium text-gray-500 mb-4 text-center">Scan this QR to mark attendance for <br/><strong className="text-gray-900">{moduleName}</strong></p>
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-purple-100">
                  <QRCodeCanvas value={qrData} size={220} level={"H"} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Attendance List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <Users className="text-gray-400" size={24} /> 
                Live Attendance
                {qrData && <span className="flex h-3 w-3 relative ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>}
              </h3>
              
              <div className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-200">
                Total: {attendance.length}
              </div>
            </div>

            {!qrData ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <QrCode size={48} className="mb-4 opacity-50" />
                <p>Generate a QR code to start tracking attendance</p>
              </div>
            ) : attendance.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <RefreshCcw size={48} className="mb-4 opacity-50 animate-spin-slow" style={{ animationDuration: '3s' }} />
                <p>Waiting for students to scan...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attendance.map((record) => (
                  <div key={record._id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md hover:border-purple-200 transition-all">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg border border-purple-200 shrink-0">
                      {record.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-gray-900 truncate">{record.studentName}</h4>
                      <div className="flex items-center gap-2 text-xs font-medium mt-1">
                        <span className="text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{record.studentId}</span>
                        <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                          {new Date(record.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
