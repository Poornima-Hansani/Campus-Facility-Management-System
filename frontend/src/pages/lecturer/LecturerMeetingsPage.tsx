import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Calendar, Clock, MapPin, Users, FileText } from "lucide-react";

type Meeting = {
  _id: string;
  meetingId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  conductor: string;
  createdAt: string;
};

export default function LecturerMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/meetings`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (dateStr: string, endTimeStr: string) => {
    const meetingDate = new Date(`${dateStr}T${endTimeStr}`);
    const now = new Date();
    return meetingDate < now ? "Completed" : "Upcoming";
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-orange-100 p-2 rounded-xl">
            <Calendar className="text-orange-600" size={24} />
          </div>
          Management Meetings
        </h2>
        <p className="text-gray-500 text-sm mt-2">View upcoming meetings scheduled by the management.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-16 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No Meetings Scheduled</h3>
          <p className="text-gray-500 mt-2">There are currently no meetings scheduled by management.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {meetings.map((meeting) => {
            const status = getStatus(meeting.date, meeting.endTime);
            const isUpcoming = status === "Upcoming";
            
            return (
              <div key={meeting._id} className={`bg-white rounded-3xl shadow-sm border p-6 flex flex-col h-full transition-all hover:shadow-md ${isUpcoming ? 'border-orange-100' : 'border-gray-100 opacity-75'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 text-xs font-mono font-bold px-2 py-1 rounded">
                      {meeting.meetingId}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isUpcoming ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">{meeting.title}</h3>

                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Calendar size={18} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">{meeting.date}</p>
                      <p>{meeting.startTime} - {meeting.endTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin size={18} className="text-orange-500 shrink-0" />
                    <span className="font-medium">{meeting.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Users size={18} className="text-orange-500 shrink-0" />
                    <span>Conducted by: <strong className="text-gray-900">{meeting.conductor}</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <FileText size={16} className="shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{meeting.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
