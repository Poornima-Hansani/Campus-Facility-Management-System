import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { apiDelete, apiGet, apiPost } from "../lib/api";

type TimetableItem = {
  id: number;
  moduleCode: string;
  moduleName: string;
  venueType: "Lecture Hall" | "Lab";
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TimetablePage = () => {
  const [sessions, setSessions] = useState<TimetableItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const refreshSessions = useCallback(async () => {
    const list = await apiGet<TimetableItem[]>("/api/timetable");
    setSessions(list);
  }, []);

  useEffect(() => {
    refreshSessions().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Could not load timetable.")
    );
  }, [refreshSessions]);

  const [formData, setFormData] = useState({
    moduleCode: "",
    moduleName: "",
    venueType: "Lecture Hall" as "Lecture Hall" | "Lab",
    venueName: "",
    lecturer: "",
    day: "Monday",
    startTime: "",
    endTime: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalLectureHalls = useMemo(
    () => sessions.filter((item) => item.venueType === "Lecture Hall").length,
    [sessions]
  );

  const totalLabs = useMemo(
    () => sessions.filter((item) => item.venueType === "Lab").length,
    [sessions]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "moduleCode" ? value.toUpperCase() : value,
    }));

    setError("");
    setSuccess("");
  };

  const convertToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const validateForm = () => {
    const cleanModuleCode = formData.moduleCode.trim().toUpperCase();
    const cleanModuleName = formData.moduleName.trim();
    const cleanVenueName = formData.venueName.trim();
    const cleanLecturer = formData.lecturer.trim();

    if (
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanVenueName ||
      !cleanLecturer ||
      !formData.day ||
      !formData.startTime ||
      !formData.endTime
    ) {
      return "All fields are required.";
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanModuleName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    if (cleanVenueName.length < 2) {
      return "Venue name must contain at least 2 characters.";
    }

    if (cleanLecturer.length < 3) {
      return "Lecturer name must contain at least 3 characters.";
    }

    if (formData.startTime >= formData.endTime) {
      return "End time must be after start time.";
    }

    const duplicateSession = sessions.some(
      (item) =>
        item.moduleCode === cleanModuleCode &&
        item.day === formData.day &&
        item.startTime === formData.startTime &&
        item.endTime === formData.endTime &&
        item.venueName.toLowerCase() === cleanVenueName.toLowerCase()
    );

    if (duplicateSession) {
      return "This timetable session already exists.";
    }

    const startMinutes = convertToMinutes(formData.startTime);
    const endMinutes = convertToMinutes(formData.endTime);

    const hasConflict = sessions.some((item) => {
      if (item.day !== formData.day) return false;

      const itemStart = convertToMinutes(item.startTime);
      const itemEnd = convertToMinutes(item.endTime);

      return startMinutes < itemEnd && endMinutes > itemStart;
    });

    if (hasConflict) {
      return "Time conflict detected with another session on the same day.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      setSuccess("");
      return;
    }

    try {
      await apiPost("/api/timetable", {
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        venueType: formData.venueType,
        venueName: formData.venueName.trim(),
        lecturer: formData.lecturer.trim(),
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      await refreshSessions();

      setFormData({
        moduleCode: "",
        moduleName: "",
        venueType: "Lecture Hall",
        venueName: "",
        lecturer: "",
        day: "Monday",
        startTime: "",
        endTime: "",
      });

      setError("");
      setSuccess("Timetable session added successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save session.");
      setSuccess("");
    }
  };

  const handleClear = () => {
    setFormData({
      moduleCode: "",
      moduleName: "",
      venueType: "Lecture Hall",
      venueName: "",
      lecturer: "",
      day: "Monday",
      startTime: "",
      endTime: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/timetable/${id}`);
      await refreshSessions();
      setSuccess("Session removed successfully.");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete session.");
      setSuccess("");
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Timetable Management"
        subtitle="Add, view, and manage lecture and lab sessions with conflict checking"
      />

      {loadError && <p className="form-error">{loadError}</p>}

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Add Timetable Session</h3>
            <p>
              Students can add lecture or lab sessions and the system
              checks for duplicate entries and time conflicts.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Module Code</label>
              <input
                type="text"
                name="moduleCode"
                placeholder="e.g. IT3040"
                value={formData.moduleCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Module Name</label>
              <input
                type="text"
                name="moduleName"
                placeholder="e.g. Project Management"
                value={formData.moduleName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Venue Type</label>
              <select
                name="venueType"
                value={formData.venueType}
                onChange={handleChange}
              >
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Lab">Labs</option>
              </select>
            </div>

            <div className="form-group">
              <label>Venue Name</label>
              <input
                type="text"
                name="venueName"
                placeholder="e.g. LH-201 or Lab A"
                value={formData.venueName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Lecturer</label>
              <input
                type="text"
                name="lecturer"
                placeholder="e.g. Dr. Perera"
                value={formData.lecturer}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Day</label>
              <select name="day" value={formData.day} onChange={handleChange}>
                {dayOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Add Session
            </button>
            <button
              type="button"
              className="secondary-form-btn"
              onClick={handleClear}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="stats-grid availability-stats">
        <div className="stat-card">
          <h4>Total Sessions</h4>
          <h2>{sessions.length}</h2>
          <p>All timetable records</p>
        </div>
        <div className="stat-card">
          <h4>Lecture Halls</h4>
          <h2>{totalLectureHalls}</h2>
          <p>Theory sessions added</p>
        </div>
        <div className="stat-card">
          <h4>Labs</h4>
          <h2>{totalLabs}</h2>
          <p>Practical sessions added</p>
        </div>
        <div className="stat-card">
          <h4>Active Days</h4>
          <h2>{new Set(sessions.map((item) => item.day)).size}</h2>
          <p>Days with scheduled sessions</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Current Timetable</h3>
            <p>
              View all saved lecture and lab sessions. Sessions are ordered by
              day and time.
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No timetable sessions added</h3>
            <p>Add your first lecture or laboratory session above.</p>
          </div>
        ) : (
          <div className="availability-results">
            {sessions.map((item) => (
              <div key={item.id} className="availability-card">
                <div className="availability-top">
                  <div>
                    <span className="availability-badge">
                      {item.venueType}
                    </span>
                    <h4>
                      {item.moduleCode} - {item.moduleName}
                    </h4>
                  </div>
                </div>

                <div className="availability-details">
                  <p>
                    <strong>Venue:</strong> {item.venueName}
                  </p>
                  <p>
                    <strong>Lecturer:</strong> {item.lecturer}
                  </p>
                  <p>
                    <strong>Day:</strong> {item.day}
                  </p>
                  <p>
                    <strong>Time:</strong> {item.startTime} - {item.endTime}
                  </p>
                </div>

                <div className="availability-actions timetable-actions">
                  <button
                    type="button"
                    className="danger-form-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TimetablePage;