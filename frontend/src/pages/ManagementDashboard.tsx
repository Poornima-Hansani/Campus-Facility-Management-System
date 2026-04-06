import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { apiDelete, apiGet, apiPost } from "../lib/api";

type EmailItem = {
  id: number;
  studentId: string;
  studentEmail: string;
  moduleCode: string;
  moduleName: string;
  subject: string;
  message: string;
  sentDate: string;
  status: "Sent";
};

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
};

type LectureRow = {
  id: number;
  moduleCode: string;
  moduleName: string;
  venueType: string;
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

type SessionFilter = "" | "lecture" | "practical" | "lab" | "tutorial";

const DAY_OPTIONS = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function matchesModuleCode(rowCode: string, filter: string) {
  const f = filter.trim().toUpperCase();
  if (!f) return true;
  return rowCode.toUpperCase().includes(f);
}

function matchesModuleName(rowName: string, filter: string) {
  const f = filter.trim().toLowerCase();
  if (!f) return true;
  return rowName.toLowerCase().includes(f);
}

function matchesDay(rowDay: string, filter: string) {
  if (!filter) return true;
  return rowDay === filter;
}

function matchesSessionTimetable(sessionType: string, v: SessionFilter) {
  if (!v) return true;
  return sessionType.toLowerCase() === v;
}

function matchesSessionCatalog(rowType: string, v: SessionFilter) {
  if (!v) return true;
  if (v === "lecture") return rowType === "Lecture Hall";
  if (v === "lab") return rowType === "Laboratory";
  return false;
}

function catalogSlotsForRow(
  row: TimetableRow,
  allLectures: LectureRow[],
  sessionFilter: SessionFilter
): LectureRow[] {
  return allLectures.filter((l) => {
    if (l.moduleCode !== row.moduleCode || l.day !== row.day) return false;
    return matchesSessionCatalog(l.venueType, sessionFilter);
  });
}

const ManagementDashboard = () => {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const [timetable, setTimetable] = useState<TimetableRow[]>([]);
  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [overviewError, setOverviewError] = useState("");

  const [filterModuleCode, setFilterModuleCode] = useState("");
  const [filterModuleName, setFilterModuleName] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterSession, setFilterSession] = useState<SessionFilter>("");

  const refreshEmails = useCallback(async () => {
    const list = await apiGet<EmailItem[]>("/api/management/emails");
    setEmails(list);
  }, []);

  const loadOverview = useCallback(async () => {
    const [tt, lec] = await Promise.all([
      apiGet<TimetableRow[]>("/api/timetable"),
      apiGet<LectureRow[]>("/api/lectures"),
    ]);
    setTimetable(tt);
    setLectures(lec);
    setOverviewError("");
  }, []);

  useEffect(() => {
    refreshEmails().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Could not load records.")
    );
  }, [refreshEmails]);

  useEffect(() => {
    loadOverview().catch((e) =>
      setOverviewError(
        e instanceof Error ? e.message : "Could not load timetable data."
      )
    );
  }, [loadOverview]);

  const filteredTimetable = useMemo(() => {
    return timetable.filter(
      (row) =>
        matchesModuleCode(row.moduleCode, filterModuleCode) &&
        matchesModuleName(row.moduleName, filterModuleName) &&
        matchesDay(row.day, filterDay) &&
        matchesSessionTimetable(row.sessionType, filterSession)
    );
  }, [timetable, filterModuleCode, filterModuleName, filterDay, filterSession]);

  const filteredLectures = useMemo(() => {
    return lectures.filter(
      (row) =>
        matchesModuleCode(row.moduleCode, filterModuleCode) &&
        matchesModuleName(row.moduleName, filterModuleName) &&
        matchesDay(row.day, filterDay) &&
        matchesSessionCatalog(row.venueType, filterSession)
    );
  }, [lectures, filterModuleCode, filterModuleName, filterDay, filterSession]);

  const clearOverviewFilters = () => {
    setFilterModuleCode("");
    setFilterModuleName("");
    setFilterDay("");
    setFilterSession("");
  };

  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    moduleCode: "",
    moduleName: "",
    subject: "",
    message: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalEmails = useMemo(() => emails.length, [emails]);

  const uniqueStudents = useMemo(
    () => new Set(emails.map((item) => item.studentId)).size,
    [emails]
  );

  const uniqueModules = useMemo(
    () => new Set(emails.map((item) => item.moduleCode)).size,
    [emails]
  );

  const todayEmails = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return emails.filter((item) => item.sentDate === today).length;
  }, [emails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "moduleCode" || name === "studentId"
          ? value.toUpperCase()
          : value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const cleanStudentId = formData.studentId.trim().toUpperCase();
    const cleanStudentEmail = formData.studentEmail.trim();
    const cleanModuleCode = formData.moduleCode.trim().toUpperCase();
    const cleanModuleName = formData.moduleName.trim();
    const cleanSubject = formData.subject.trim();
    const cleanMessage = formData.message.trim();

    if (
      !cleanStudentId ||
      !cleanStudentEmail ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !cleanSubject ||
      !cleanMessage
    ) {
      return "All fields are required.";
    }

    if (!/^IT\d{8}$/.test(cleanStudentId)) {
      return "Student ID must be in a format like IT23200001.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanStudentEmail)) {
      return "Enter a valid email address.";
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanModuleName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    if (cleanSubject.length < 5) {
      return "Subject must contain at least 5 characters.";
    }

    if (cleanMessage.length < 10) {
      return "Message must contain at least 10 characters.";
    }

    const duplicateEmail = emails.some(
      (item) =>
        item.studentId === cleanStudentId &&
        item.moduleCode === cleanModuleCode &&
        item.subject.toLowerCase() === cleanSubject.toLowerCase()
    );

    if (duplicateEmail) {
      return "A similar encouragement email has already been recorded.";
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
      await apiPost("/api/management/emails", {
        studentId: formData.studentId.trim().toUpperCase(),
        studentEmail: formData.studentEmail.trim(),
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      await refreshEmails();

      setFormData({
        studentId: "",
        studentEmail: "",
        moduleCode: "",
        moduleName: "",
        subject: "",
        message: "",
      });

      setError("");
      setSuccess("Encouragement email recorded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save record.");
      setSuccess("");
    }
  };

  const handleClear = () => {
    setFormData({
      studentId: "",
      studentEmail: "",
      moduleCode: "",
      moduleName: "",
      subject: "",
      message: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/management/emails/${id}`);
      await refreshEmails();
      setError("");
      setSuccess("Email record removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete record.");
      setSuccess("");
    }
  };

  return (
    <Layout>
      {loadError && <p className="form-error">{loadError}</p>}

      <div className="stats-grid availability-stats">
        <div className="stat-card">
          <h4>Total Emails</h4>
          <h2>{totalEmails}</h2>
          <p>Recorded encouragement emails</p>
        </div>
        <div className="stat-card">
          <h4>Students Reached</h4>
          <h2>{uniqueStudents}</h2>
          <p>Unique repeat students</p>
        </div>
        <div className="stat-card">
          <h4>Modules Covered</h4>
          <h2>{uniqueModules}</h2>
          <p>Supported academic modules</p>
        </div>
        <div className="stat-card">
          <h4>Sent Today</h4>
          <h2>{todayEmails}</h2>
          <p>Emails recorded today</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Module timetable & lecture availability</h3>
            <p>
              Review all saved timetable modules, filter them, and compare with
              the official lecture / lab catalog (same filters apply to both
              tables).
            </p>
          </div>
        </div>

        {overviewError && <p className="form-error">{overviewError}</p>}

        <p className="mgmt-hint">
          Add or remove timetable rows from the{" "}
          <Link to="/admin-dashboard" className="mgmt-inline-link">
            Admin Dashboard
          </Link>
          .
          Filters narrow both the <strong>module timetable</strong> and the{" "}
          <strong>lecture availability catalog</strong>. For each timetable row,
          &quot;Catalog (same day)&quot; counts catalog slots with the same
          module code and day—use the catalog table below to see full venue and
          time details.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label>Module code</label>
            <input
              type="text"
              placeholder="e.g. IT3040"
              value={filterModuleCode}
              onChange={(e) =>
                setFilterModuleCode(e.target.value.toUpperCase())
              }
            />
          </div>
          <div className="form-group">
            <label>Module name</label>
            <input
              type="text"
              placeholder="Contains…"
              value={filterModuleName}
              onChange={(e) => setFilterModuleName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Day</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d || "all"} value={d}>
                  {d || "All days"}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Session type</label>
            <select
              value={filterSession}
              onChange={(e) =>
                setFilterSession(e.target.value as SessionFilter)
              }
            >
              <option value="">All</option>
              <option value="lecture">Lecture</option>
              <option value="practical">Practical</option>
              <option value="lab">Lab</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="secondary-form-btn"
            onClick={clearOverviewFilters}
          >
            Clear filters
          </button>
        </div>

        <h4 className="mgmt-section-title">
          Module timetable ({filteredTimetable.length} / {timetable.length})
        </h4>
        {filteredTimetable.length === 0 ? (
          <div className="empty-state">
            <h3>No timetable rows match</h3>
            <p>Use the Admin Dashboard to add sessions, or relax the filters.</p>
          </div>
        ) : (
          <div className="mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Lecturer</th>
                  <th>Catalog (same day)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetable.map((row) => {
                  const matches = catalogSlotsForRow(
                    row,
                    lectures,
                    filterSession
                  );
                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.moduleCode}</strong>
                        <br />
                        <span style={{ color: "#6b7280" }}>{row.moduleName}</span>
                      </td>
                      <td>{row.day}</td>
                      <td>
                        {row.startTime} – {row.endTime}
                      </td>
                      <td>
                        <span className="availability-badge">
                          {row.sessionType}
                        </span>
                        <br />
                        {row.venueName}
                      </td>
                      <td>{row.lecturer}</td>
                      <td>
                        {matches.length > 0 ? (
                          <span className="mgmt-match-badge mgmt-match-yes">
                            {matches.length} slot
                            {matches.length !== 1 ? "s" : ""} in catalog
                          </span>
                        ) : (
                          <span className="mgmt-match-badge mgmt-match-none">
                            No catalog slot
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <h4
          className="mgmt-section-title"
          id="mgmt-lecture-catalog"
          style={{ scrollMarginTop: 24 }}
        >
          Lecture availability catalog ({filteredLectures.length} /{" "}
          {lectures.length})
        </h4>
        <p className="mgmt-hint">
          Official lecture and lab sessions published for availability search.
          Use the same filters as above to find matching rows.
        </p>
        {filteredLectures.length === 0 ? (
          <div className="empty-state">
            <h3>No catalog rows match</h3>
            <p>Adjust filters or check the Lecture Availability page data.</p>
          </div>
        ) : (
          <div className="mgmt-table-wrap">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Venue</th>
                  <th>Lecturer</th>
                </tr>
              </thead>
              <tbody>
                {filteredLectures.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.moduleCode}</strong>
                      <br />
                      <span style={{ color: "#6b7280" }}>{row.moduleName}</span>
                    </td>
                    <td>{row.day}</td>
                    <td>
                      {row.startTime} – {row.endTime}
                    </td>
                    <td>
                      <span className="availability-badge">{row.venueType}</span>
                      <br />
                      {row.venueName}
                    </td>
                    <td>{row.lecturer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Send Encouragement Email</h3>
            <p>
              Management can record encouragement emails sent to repeat students
              for academic support and motivation.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                name="studentId"
                placeholder="e.g. IT23200001"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Student Email</label>
              <input
                type="email"
                name="studentEmail"
                placeholder="e.g. student@my.sliit.lk"
                value={formData.studentEmail}
                onChange={handleChange}
              />
            </div>

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

            <div className="form-group form-group-full">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Enter email subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Enter encouragement message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Record Email
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

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Encouragement Email Records</h3>
            <p>
              View previously recorded repeat-student support emails.
            </p>
          </div>
        </div>

        {emails.length === 0 ? (
          <div className="empty-state">
            <h3>No email records available</h3>
            <p>Add the first encouragement email above.</p>
          </div>
        ) : (
          <div className="availability-results">
            {emails.map((item) => (
              <div key={item.id} className="availability-card">
                <div className="availability-top">
                  <div>
                    <span className="availability-badge badge-management">
                      {item.status}
                    </span>
                    <h4>{item.subject}</h4>
                  </div>
                </div>

                <div className="availability-details">
                  <p>
                    <strong>Student ID:</strong> {item.studentId}
                  </p>
                  <p>
                    <strong>Email:</strong> {item.studentEmail}
                  </p>
                  <p>
                    <strong>Module:</strong> {item.moduleCode} - {item.moduleName}
                  </p>
                  <p>
                    <strong>Sent Date:</strong> {item.sentDate}
                  </p>
                  <p>
                    <strong>Message:</strong> {item.message}
                  </p>
                </div>

                <div className="availability-actions timetable-actions">
                  <button
                    type="button"
                    className="danger-form-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete Record
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

export default ManagementDashboard;
