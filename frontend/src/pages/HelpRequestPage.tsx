import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { apiDelete, apiGet, apiPost } from "../lib/api";

type RequestSource = "Lecturer" | "Instructor" | "Senior Student";
type SessionType = "Individual" | "Group";
type RequestStatus = "Pending" | "Scheduled" | "Completed";

type HelpRequestItem = {
  id: number;
  studentName: string;
  moduleCode: string;
  moduleName: string;
  requestTo: RequestSource;
  sessionType: SessionType;
  topic: string;
  description: string;
  status: RequestStatus;
};

const HelpRequestPage = () => {
  const [requests, setRequests] = useState<HelpRequestItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const refreshRequests = useCallback(async () => {
    const list = await apiGet<HelpRequestItem[]>("/api/help-requests");
    setRequests(list);
  }, []);

  useEffect(() => {
    refreshRequests().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Could not load requests.")
    );
  }, [refreshRequests]);

  const [formData, setFormData] = useState({
    studentName: "",
    moduleCode: "",
    moduleName: "",
    requestTo: "Lecturer" as RequestSource,
    sessionType: "Individual" as SessionType,
    topic: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === "Pending").length,
    [requests]
  );

  const scheduledCount = useMemo(
    () => requests.filter((item) => item.status === "Scheduled").length,
    [requests]
  );

  const completedCount = useMemo(
    () => requests.filter((item) => item.status === "Completed").length,
    [requests]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "moduleCode" ? value.toUpperCase() : value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    const cleanStudentName = formData.studentName.trim();
    const cleanModuleCode = formData.moduleCode.trim().toUpperCase();
    const cleanModuleName = formData.moduleName.trim();
    const cleanTopic = formData.topic.trim();
    const cleanDescription = formData.description.trim();

    if (
      !cleanStudentName ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !formData.requestTo ||
      !formData.sessionType ||
      !cleanTopic ||
      !cleanDescription
    ) {
      return "All fields are required.";
    }

    if (cleanStudentName.length < 3) {
      return "Student name must contain at least 3 characters.";
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanModuleName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    if (cleanTopic.length < 4) {
      return "Topic must contain at least 4 characters.";
    }

    if (cleanDescription.length < 10) {
      return "Description must contain at least 10 characters.";
    }

    const duplicateActiveRequest = requests.some(
      (item) =>
        item.studentName.toLowerCase() === cleanStudentName.toLowerCase() &&
        item.moduleCode === cleanModuleCode &&
        item.topic.toLowerCase() === cleanTopic.toLowerCase() &&
        (item.status === "Pending" || item.status === "Scheduled")
    );

    if (duplicateActiveRequest) {
      return "A similar active help request already exists for this student.";
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
      await apiPost("/api/help-requests", {
        studentName: formData.studentName.trim(),
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        requestTo: formData.requestTo,
        sessionType: formData.sessionType,
        topic: formData.topic.trim(),
        description: formData.description.trim(),
      });
      await refreshRequests();

      setFormData({
        studentName: "",
        moduleCode: "",
        moduleName: "",
        requestTo: "Lecturer",
        sessionType: "Individual",
        topic: "",
        description: "",
      });

      setError("");
      setSuccess("Help request submitted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
      setSuccess("");
    }
  };

  const handleClear = () => {
    setFormData({
      studentName: "",
      moduleCode: "",
      moduleName: "",
      requestTo: "Lecturer",
      sessionType: "Individual",
      topic: "",
      description: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/help-requests/${id}`);
      await refreshRequests();
      setError("");
      setSuccess("Help request removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete request.");
      setSuccess("");
    }
  };

  return (
    <Layout>
      {loadError && <p className="form-error">{loadError}</p>}

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Submit Help Request</h3>
            <p>
              Students can request academic help for difficult topics and select
              either individual or group support.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                name="studentName"
                placeholder="Enter student name"
                value={formData.studentName}
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

            <div className="form-group">
              <label>Request To</label>
              <select
                name="requestTo"
                value={formData.requestTo}
                onChange={handleChange}
              >
                <option value="Lecturer">Lecturer</option>
                <option value="Instructor">Instructor</option>
                <option value="Senior Student">Senior Student</option>
              </select>
            </div>

            <div className="form-group">
              <label>Session Type</label>
              <select
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
              >
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
              </select>
            </div>

            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                name="topic"
                placeholder="e.g. UML diagrams"
                value={formData.topic}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Explain what kind of help is needed"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Submit Request
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
          <h4>Total Requests</h4>
          <h2>{requests.length}</h2>
          <p>All help requests</p>
        </div>
        <div className="stat-card">
          <h4>Pending</h4>
          <h2>{pendingCount}</h2>
          <p>Waiting for review</p>
        </div>
        <div className="stat-card">
          <h4>Scheduled</h4>
          <h2>{scheduledCount}</h2>
          <p>Support already arranged</p>
        </div>
        <div className="stat-card">
          <h4>Completed</h4>
          <h2>{completedCount}</h2>
          <p>Finished support sessions</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Help Request List</h3>
            <p>
              View current requests and their academic support status.
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <h3>No help requests added</h3>
            <p>Submit the first academic help request above.</p>
          </div>
        ) : (
          <div className="availability-results">
            {requests.map((item) => (
              <div key={item.id} className="availability-card">
                <div className="availability-top">
                  <div>
                    <span className="availability-badge badge-help">
                      {item.requestTo}
                    </span>
                    <h4>
                      {item.moduleCode} - {item.moduleName}
                    </h4>
                  </div>
                </div>

                <div className="availability-details">
                  <p>
                    <strong>Student:</strong> {item.studentName}
                  </p>
                  <p>
                    <strong>Session Type:</strong> {item.sessionType}
                  </p>
                  <p>
                    <strong>Topic:</strong> {item.topic}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`task-status ${
                        item.status === "Completed"
                          ? "scheduled"
                          : item.status === "Scheduled"
                          ? "upcoming"
                          : "due-today"
                      }`}
                    >
                      {item.status}
                    </span>
                  </p>
                  <p>
                    <strong>Description:</strong> {item.description}
                  </p>
                </div>

                <div className="availability-actions timetable-actions">
                  <button
                    type="button"
                    className="danger-form-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete Request
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

export default HelpRequestPage;