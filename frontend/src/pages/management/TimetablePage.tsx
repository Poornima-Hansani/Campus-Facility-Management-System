import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet, apiPost } from "../../lib/api";
import { Calendar, Plus, X, Trash2, Download, FileDown, BellDot } from "lucide-react";

type TimetableRow = {
  id: number;
  moduleCode: string;
  moduleName: string;
  sessionType: string;
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
  faculty: string;
  year: number;
  specialization: string;
  scheduleType: string;
};

type Lecturer = {
  _id: string;
  name: string;
  moduleCode?: string;
  moduleName?: string;
};

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [filterModuleCode, setFilterModuleCode] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSyncBadge, setShowSyncBadge] = useState(false);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);

  const [formData, setFormData] = useState({
    moduleCode: "",
    moduleName: "",
    sessionType: "Lecture",
    venueName: "",
    lecturerTitle: "Mr.",
    lecturerName: "",
    day: "Monday",
    startTime: "09:00",
    endTime: "11:00",
    faculty: "Computing",
    year: "1",
    specialization: "Software Engineering",
    scheduleType: "Weekday",
  });

  useEffect(() => {
    fetchTimetable();
    fetchLecturers();
  }, []);

  const fetchTimetable = () => {
    apiGet<TimetableRow[]>("/api/timetable")
      .then(data => setTimetable(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchLecturers = () => {
    apiGet<Lecturer[]>("/api/lecturers")
      .then(data => setLecturers(data))
      .catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLecturerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLecturer = lecturers.find(l => l._id === e.target.value);
    if (selectedLecturer) {
      setFormData(prev => ({
        ...prev,
        lecturerName: selectedLecturer.name,
        moduleCode: selectedLecturer.moduleCode || prev.moduleCode,
        moduleName: selectedLecturer.moduleName || prev.moduleName,
      }));
    } else {
      // If "Manual Entry" is selected, just keep the values as they are, but clear lecturerName if desired.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    setShowSyncBadge(false);

    try {
      const payload = {
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        sessionType: formData.sessionType,
        venueName: formData.venueName.trim(),
        lecturerTitle: formData.lecturerTitle,
        lecturerName: formData.lecturerName.trim(),
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        faculty: formData.faculty,
        year: Number(formData.year),
        specialization: formData.specialization,
        scheduleType: formData.scheduleType,
      };

      await apiPost("/api/timetable", payload);
      setSuccess("Timetable added successfully!");
      setShowSyncBadge(true); // Show the badge when a new session is added!
      
      setFormData({
        moduleCode: "",
        moduleName: "",
        sessionType: "Lecture",
        venueName: "",
        lecturerTitle: "Mr.",
        lecturerName: "",
        day: "Monday",
        startTime: "09:00",
        endTime: "11:00",
        faculty: "Computing",
        year: "1",
        specialization: "Software Engineering",
        scheduleType: "Weekday",
      });
      fetchTimetable();
      setTimeout(() => setShowAddForm(false), 1500);
      
      // Hide the badge after 5 seconds
      setTimeout(() => setShowSyncBadge(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to add timetable");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await apiPost(`/api/timetable/${id}`, {}, "DELETE");
      fetchTimetable();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleDownloadPDF = () => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.open(`${API_BASE}/api/timetable/pdf`, '_blank');
  };

  const filteredTimetable = timetable.filter(item => {
    if (filterModuleCode && !item.moduleCode.toLowerCase().includes(filterModuleCode.toLowerCase())) {
      return false;
    }
    if (filterDay && item.day !== filterDay) {
      return false;
    }
    return true;
  });

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <div className="bg-green-100 p-1.5 rounded-lg">
              <Calendar className="text-green-600" size={24} />
            </div>
            Timetable & Lectures
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage module timetable and lecture schedules. The single source of truth.</p>
        </div>
        <div className="flex items-center gap-3">
          {showSyncBadge && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg animate-pulse shadow-sm">
              <BellDot size={16} />
              <span className="text-sm font-bold">New timetable updated & synced</span>
            </div>
          )}

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
          >
            <FileDown size={20} />
            Download Timetable PDF
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={20} />
            Add Session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by module code..."
          value={filterModuleCode}
          onChange={(e) => setFilterModuleCode(e.target.value.toUpperCase())}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Days</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : filteredTimetable.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-700">No timetable records found</h3>
          <p className="mt-1">Add a session to populate the timetable.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Module</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Day</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Venue</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Lecturer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Year</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b border-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTimetable.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{row.moduleCode}</div>
                    <div className="text-xs text-gray-500">{row.moduleName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{row.day}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{row.startTime} - {row.endTime}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-1">
                    {row.venueName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{row.lecturer}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold uppercase tracking-wider border border-blue-100">
                      {row.sessionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">Year {row.year}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Timetable Session</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-green-50 border border-green-100 p-4 rounded-xl mb-6">
                <label className="block text-sm font-bold text-green-900 mb-2">Select Registered Lecturer (Auto-fill)</label>
                <select onChange={handleLecturerSelect} defaultValue="" className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-700">
                  <option value="" disabled>-- Select Lecturer --</option>
                  {lecturers.map(l => (
                    <option key={l._id} value={l._id}>
                      {l.name} {l.moduleCode ? `- ${l.moduleCode} (${l.moduleName})` : ''}
                    </option>
                  ))}
                  <option value="manual">-- Manual Entry --</option>
                </select>
                <p className="text-xs text-green-700 mt-2">Selecting a lecturer will automatically fill the Module Code, Module Name, and Lecturer Name below.</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Module Code <span className="text-red-500">*</span></label>
                  <input type="text" name="moduleCode" value={formData.moduleCode} onChange={handleInputChange} placeholder="e.g. SE101" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Module Name <span className="text-red-500">*</span></label>
                  <input type="text" name="moduleName" value={formData.moduleName} onChange={handleInputChange} placeholder="e.g. Software Engineering" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Session Type <span className="text-red-500">*</span></label>
                  <select name="sessionType" value={formData.sessionType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Lecture">Lecture</option>
                    <option value="Practical">Practical</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Revision">Revision</option>
                    <option value="Extra Class">Extra Class</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Venue <span className="text-red-500">*</span></label>
                  <input type="text" name="venueName" value={formData.venueName} onChange={handleInputChange} placeholder="e.g. Lab 2" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                  <select name="lecturerTitle" value={formData.lecturerTitle} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Mr.">Mr.</option>
                    <option value="Miss.">Miss.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lecturer Name <span className="text-red-500">*</span></label>
                  <input type="text" name="lecturerName" value={formData.lecturerName} onChange={handleInputChange} placeholder="e.g. John Doe" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Day <span className="text-red-500">*</span></label>
                  <select name="day" value={formData.day} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Schedule Type</label>
                  <select name="scheduleType" value={formData.scheduleType} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Weekday">Weekday</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time <span className="text-red-500">*</span></label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time <span className="text-red-500">*</span></label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Faculty</label>
                  <select name="faculty" value={formData.faculty} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Computing">Computing</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                  <select name="year" value={formData.year} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization</label>
                  <select name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Systems">Information Systems</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-3 font-bold text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md active:scale-95 transition-all disabled:opacity-50">
                  {submitting ? "Adding..." : "Add Session to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}