import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { Calendar, Clock, MapPin, Users, FileText, Plus, Hash } from "lucide-react";

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
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [meetingId, setMeetingId] = useState(`MTG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [conductor, setConductor] = useState("");

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

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          date,
          startTime,
          endTime,
          location,
          title,
          description,
          conductor
        }),
      });

      if (res.ok) {
        fetchMeetings();
        // Reset form
        setMeetingId(`MTG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
        setDate("");
        setStartTime("");
        setEndTime("");
        setLocation("");
        setTitle("");
        setDescription("");
        setConductor("");
      } else {
        console.error("Failed to schedule meeting");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <div className="bg-rose-100 p-2 rounded-xl">
            <Calendar className="text-rose-600" size={24} />
          </div>
          Meetings & Scheduling
        </h2>
        <p className="text-gray-500 text-sm mt-2">Schedule new management meetings and view upcoming agendas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scheduling Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-6">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="bg-gray-100 p-2.5 rounded-xl">
                <Plus className="text-gray-700" size={20} />
              </div>
              <h3 className="font-bold text-xl text-gray-900">Schedule Meeting</h3>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-5">
              {/* Meeting ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Hash size={16} className="text-gray-400"/> Meeting ID</label>
                <input 
                  type="text" 
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none font-mono text-sm text-gray-600"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar size={16} className="text-gray-400"/> Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock size={16} className="text-gray-400"/> Start Time</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 text-gray-400">End Time</label>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><MapPin size={16} className="text-gray-400"/> Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Boardroom A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Conductor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Users size={16} className="text-gray-400"/> Conducting Person</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prof. Alan Smith"
                  value={conductor}
                  onChange={(e) => setConductor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><FileText size={16} className="text-gray-400"/> Meeting Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Operations Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><FileText size={16} className="text-gray-400"/> Description</label>
                <textarea 
                  rows={3}
                  placeholder="Meeting agenda or main topic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-md mt-4 ${
                  isSubmitting ? 'bg-rose-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-lg active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Meetings List */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
              </div>
            ) : meetings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Calendar size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700">No Upcoming Meetings</h3>
                <p className="text-gray-500 mt-2 max-w-sm">Use the form to schedule the first management meeting.</p>
              </div>
            ) : (
              meetings.map((meeting) => (
                <div key={meeting._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 items-start md:items-center">
                  
                  {/* Time Block */}
                  <div className="flex-shrink-0 bg-rose-50 rounded-xl p-4 text-center min-w-[120px] border border-rose-100/50">
                    <p className="text-xs text-rose-600 font-bold mb-1">{meeting.date}</p>
                    <p className="text-sm font-semibold text-rose-800">{meeting.startTime}</p>
                    <div className="w-1 h-4 bg-rose-200 mx-auto my-1 rounded-full"></div>
                    <p className="text-sm font-semibold text-rose-800">{meeting.endTime}</p>
                  </div>

                  {/* Details Block */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono font-medium border border-gray-200">
                        {meeting.meetingId}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        Scheduled
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-rose-600 transition-colors">
                      {meeting.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        {meeting.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        {meeting.conductor}
                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
