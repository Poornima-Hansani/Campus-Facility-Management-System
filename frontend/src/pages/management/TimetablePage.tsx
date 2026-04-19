import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { apiGet, apiPost } from "../../lib/api";
import { Calendar, Plus, X, Trash2, Upload, Download, FileDown } from "lucide-react";

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

type UploadedFile = {
  id: number;
  fileName: string;
  originalName: string;
  rowCount: number;
  sessions: number[];
  createdAt: string;
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
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [viewMode, setViewMode] = useState<"sessions" | "files">("sessions");

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
    specialization: "SE",
    scheduleType: "Weekday",
  });

  useEffect(() => {
    fetchTimetable();
    fetchUploadedFiles();
  }, []);

  const fetchTimetable = () => {
    apiGet<TimetableRow[]>("/api/timetable")
      .then(data => setTimetable(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchUploadedFiles = () => {
    apiGet<UploadedFile[]>("/api/timetable/files")
      .then(data => setUploadedFiles(data))
      .catch(() => {});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

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
        specialization: "SE",
        scheduleType: "Weekday",
      });
      fetchTimetable();
      setTimeout(() => setShowAddForm(false), 1500);
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

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const results: { success: number; failed: number; errors: string[]; sessionIds: number[] } = { success: 0, failed: 0, errors: [], sessionIds: [] };

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',').map(c => c.trim());
        if (cols.length < 8) {
          results.failed++;
          continue;
        }

        try {
          const payload = {
            moduleCode: cols[0],
            moduleName: cols[1],
            sessionType: cols[2] || "Lecture",
            venueName: cols[3],
            lecturerTitle: cols[4] || "Mr.",
            lecturerName: cols[5],
            day: cols[6],
            startTime: cols[7],
            endTime: cols[8] || cols[7],
            faculty: cols[9] || "Computing",
            year: parseInt(cols[10]) || 1,
            specialization: cols[11] || "SE",
            scheduleType: cols[12] || "Weekday",
          };

          console.log("Sending row", i, "payload:", payload);
          const created = await apiPost<{id: number}>("/api/timetable", payload);
          console.log("Row", i, "success, id:", created.id);
          results.success++;
          results.sessionIds.push(created.id);
        } catch (err: any) {
          console.log("Row", i, "error:", err.message);
          results.failed++;
          results.errors.push(`Row ${i}: ${err.message}`);
        }
      }

      if (results.success > 0) {
        const fileName = `timetable_${Date.now()}.csv`;
        await apiPost("/api/timetable/files", {
          fileName,
          originalName: file.name,
          rowCount: results.success,
          sessionIds: results.sessionIds,
        });
        
        // Notify lecturers about new timetable
        try {
          await apiPost("/api/timetable/notifications", {
            type: "Created",
            moduleCode: "ALL",
            moduleName: "New Timetable Uploaded",
            lecturer: "All Lecturers",
            day: "-",
            message: `New timetable with ${results.success} sessions has been uploaded. Check your dashboard for your classes.`,
            targetAudience: "Lecturer",
          });
        } catch (e) {
          console.log("Notification error:", e);
        }
        
        setSuccess(`Successfully imported ${results.success} sessions!`);
        fetchTimetable();
        fetchUploadedFiles();
        setTimeout(() => setShowUploadForm(false), 2000);
      } else {
        setError("All imports failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process file");
    } finally {
      setUploading(false);
    }
  };

  const deleteUploadedFile = async (id: number) => {
    if (!confirm("Delete this uploaded file and all its sessions?")) return;
    try {
      await apiPost(`/api/timetable/files/${id}`, {}, "DELETE");
      fetchTimetable();
      fetchUploadedFiles();
    } catch (err) {
      alert("Failed to delete file");
    }
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
          <p className="text-gray-500 text-sm mt-1">Manage module timetable and lecture schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
              window.open(`${API_BASE}/api/timetable/export`, '_blank');
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Export CSV
          </button>
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={20} />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("files")}
          className={`px-4 py-2 rounded-lg ${viewMode === "files" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Uploaded Files
        </button>
        <button
          onClick={() => setViewMode("sessions")}
          className={`px-4 py-2 rounded-lg ${viewMode === "sessions" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}
        >
          All Sessions
        </button>
      </div>

      {viewMode === "files" ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">Uploaded Files</h3>
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No files uploaded yet</div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="font-medium">{file.originalName}</div>
                    <div className="text-sm text-gray-500">
                      {file.rowCount} sessions | {new Date(file.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUploadedFile(file.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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
            <div className="text-center py-8">Loading...</div>
          ) : filteredTimetable.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No timetable records found</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Module</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Day</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Venue</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Lecturer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Year</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTimetable.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{row.moduleCode}</div>
                        <div className="text-xs text-gray-500">{row.moduleName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{row.day}</td>
                      <td className="px-4 py-3 text-sm">{row.startTime} - {row.endTime}</td>
                      <td className="px-4 py-3 text-sm">{row.venueName}</td>
                      <td className="px-4 py-3 text-sm">{row.lecturer}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{row.sessionType}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">Year {row.year}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-500 hover:text-red-700"
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
        </>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Timetable Session</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Code *</label>
                  <input type="text" name="moduleCode" value={formData.moduleCode} onChange={handleInputChange} placeholder="SE101" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Name *</label>
                  <input type="text" name="moduleName" value={formData.moduleName} onChange={handleInputChange} placeholder="Software Engineering" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type *</label>
                  <select name="sessionType" value={formData.sessionType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <input type="text" name="venueName" value={formData.venueName} onChange={handleInputChange} placeholder="Lab 2" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer Title</label>
                  <select name="lecturerTitle" value={formData.lecturerTitle} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Mr.">Mr.</option>
                    <option value="Miss.">Miss.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer Name *</label>
                  <input type="text" name="lecturerName" value={formData.lecturerName} onChange={handleInputChange} placeholder="John Doe" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
                  <select name="day" value={formData.day} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                  <select name="scheduleType" value={formData.scheduleType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Weekday">Weekday</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                  <select name="faculty" value={formData.faculty} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Computing">Computing</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select name="year" value={formData.year} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="SE">SE</option>
                    <option value="IT">IT</option>
                    <option value="DS">DS</option>
                    <option value="CS">CS</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {submitting ? "Adding..." : "Add Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Import Timetable from CSV</h3>
              <button onClick={() => setShowUploadForm(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-2">CSV Format: moduleCode,moduleName,sessionType,venue,lecturerTitle,lecturerName,day,startTime,endTime,faculty,year,specialization,scheduleType</p>
              <button
                type="button"
                onClick={() => {
                  const template = "moduleCode,moduleName,sessionType,venue,lecturerTitle,lecturerName,day,startTime,endTime,faculty,year,specialization,scheduleType\nSE101,Software Engineering,Lecture,Lab 2,Mr.,John Doe,Monday,09:00,11:00,Computing,1,SE,Weekday";
                  const blob = new Blob([template], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "timetable_template.csv";
                  a.click();
                }}
                className="mt-2 flex items-center gap-1 text-sm text-blue-700 hover:text-blue-900 underline"
              >
                <FileDown size={14} /> Download Template
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>
                <input type="file" name="file" accept=".csv" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowUploadForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {uploading ? "Importing..." : "Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}