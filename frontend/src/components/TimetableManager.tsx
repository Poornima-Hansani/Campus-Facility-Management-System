import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../lib/api";

export type SessionTypeKind = "Lecture" | "Practical" | "Lab" | "Tutorial";

export type TimetableItem = {
  id: number;
  moduleCode: string;
  moduleName: string;
  sessionType: SessionTypeKind;
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

const lecturerTitleOptions = ["Mr.", "Miss.", "Mrs."] as const;

const sessionTypeOptions: SessionTypeKind[] = [
  "Lecture",
  "Practical",
  "Lab",
  "Tutorial",
];

function formatLecturer(
  title: (typeof lecturerTitleOptions)[number],
  name: string
) {
  const n = name.trim().replace(/\s+/g, " ");
  return `${title} ${n}`;
}

const TimetableManager = () => {
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
    sessionType: "Lecture" as SessionTypeKind,
    venueName: "",
    lecturerTitle: "Mr." as (typeof lecturerTitleOptions)[number],
    lecturerName: "",
    day: "Monday",
    startTime: "",
    endTime: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const countBySessionType = useMemo(() => {
    const init: Record<SessionTypeKind, number> = {
      Lecture: 0,
      Practical: 0,
      Lab: 0,
      Tutorial: 0,
    };
    for (const item of sessions) {
      const k = item.sessionType;
      if (k in init) init[k] += 1;
    }
    return init;
  }, [sessions]);

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
    const cleanLecturerName = formData.lecturerName.trim().replace(/\s+/g, " ");
    const fullLecturer = formatLecturer(formData.lecturerTitle, formData.lecturerName);

    if (
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanVenueName ||
      !cleanLecturerName ||
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

    if (cleanLecturerName.length < 2) {
      return "Lecturer name must contain at least 2 characters.";
    }

    if (formData.startTime >= formData.endTime) {
      return "End time must be after start time.";
    }

    const duplicateSession = sessions.some(
      (item) =>
        item.sessionType === formData.sessionType &&
        item.moduleCode === cleanModuleCode &&
        item.day === formData.day &&
        item.startTime === formData.startTime &&
        item.endTime === formData.endTime &&
        item.venueName.toLowerCase() === cleanVenueName.toLowerCase() &&
        item.lecturer.trim().replace(/\s+/g, " ") === fullLecturer
    );

    if (duplicateSession) {
      return "This timetable session already exists.";
    }

    const startMinutes = convertToMinutes(formData.startTime);
    const endMinutes = convertToMinutes(formData.endTime);

    const hasConflict = sessions.some((item) => {
      if (item.day !== formData.day) return false;
      if (item.moduleCode !== cleanModuleCode) return false;
      if (item.sessionType !== formData.sessionType) return false;
      if (item.venueName.toLowerCase() !== cleanVenueName.toLowerCase())
        return false;
      if (item.lecturer.trim().replace(/\s+/g, " ") !== fullLecturer)
        return false;

      const itemStart = convertToMinutes(item.startTime);
      const itemEnd = convertToMinutes(item.endTime);

      return startMinutes < itemEnd && endMinutes > itemStart;
    });

    if (hasConflict) {
      return "This slot clashes with another session for the same module, venue, and lecturer.";
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
        sessionType: formData.sessionType,
        venueName: formData.venueName.trim(),
        lecturerTitle: formData.lecturerTitle,
        lecturerName: formData.lecturerName.trim(),
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      await refreshSessions();

      setFormData({
        moduleCode: "",
        moduleName: "",
        sessionType: "Lecture",
        venueName: "",
        lecturerTitle: "Mr.",
        lecturerName: "",
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
      sessionType: "Lecture",
      venueName: "",
      lecturerTitle: "Mr.",
      lecturerName: "",
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
    <>
      {loadError && <p className="form-error">{loadError}</p>}

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Add module timetable session</h3>
            <p>
              Published sessions appear for students under Lecture Availability
              as &quot;Module timetable&quot;. Identical rows are blocked; same
              time is allowed if the module shares the slot with a different
              venue or lecturer.
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
              <label>Session type</label>
              <select
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
              >
                {sessionTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
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
              <label>Lecturer title</label>
              <select
                name="lecturerTitle"
                value={formData.lecturerTitle}
                onChange={handleChange}
              >
                {lecturerTitleOptions.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Lecturer name</label>
              <input
                type="text"
                name="lecturerName"
                placeholder="e.g. Nikil Perera"
                value={formData.lecturerName}
                onChange={handleChange}
                autoComplete="name"
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
          <h4>Lecture</h4>
          <h2>{countBySessionType.Lecture}</h2>
          <p>Lecture sessions</p>
        </div>
        <div className="stat-card">
          <h4>Practical</h4>
          <h2>{countBySessionType.Practical}</h2>
          <p>Practical sessions</p>
        </div>
        <div className="stat-card">
          <h4>Lab</h4>
          <h2>{countBySessionType.Lab}</h2>
          <p>Lab sessions</p>
        </div>
        <div className="stat-card">
          <h4>Tutorial</h4>
          <h2>{countBySessionType.Tutorial}</h2>
          <p>Tutorial sessions</p>
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
            <h3>Current timetable</h3>
            <p>
              All saved sessions, ordered by day and time. Delete a row to remove
              it from student search results.
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <h3>No timetable sessions yet</h3>
            <p>Add the first module session using the form above.</p>
          </div>
        ) : (
          <div className="availability-results">
            {sessions.map((item) => (
              <div key={item.id} className="availability-card">
                <div className="availability-top">
                  <div>
                    <span className="availability-badge">
                      {item.sessionType}
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
    </>
  );
};

export default TimetableManager;
