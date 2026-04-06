import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { apiDelete, apiGet, apiPost } from "../lib/api";

type TaskItem = {
  id: number;
  title: string;
  moduleCode: string;
  moduleName: string;
  type: "Assignment" | "Exam";
  dueDate: string;
  description: string;
};

const AssignmentExamPage = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const refreshTasks = useCallback(async () => {
    const list = await apiGet<TaskItem[]>("/api/assignments-exams");
    setTasks(list);
  }, []);

  useEffect(() => {
    refreshTasks().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Could not load tasks.")
    );
  }, [refreshTasks]);

  const [formData, setFormData] = useState({
    title: "",
    moduleCode: "",
    moduleName: "",
    type: "Assignment" as "Assignment" | "Exam",
    dueDate: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatus = (dueDate: string) => {
    const targetDate = new Date(dueDate);
    targetDate.setHours(0, 0, 0, 0);

    const diffMs = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    if (diffDays <= 3) return "Upcoming";
    return "Scheduled";
  };

  const assignmentCount = useMemo(
    () => tasks.filter((item) => item.type === "Assignment").length,
    [tasks]
  );

  const examCount = useMemo(
    () => tasks.filter((item) => item.type === "Exam").length,
    [tasks]
  );

  const overdueCount = useMemo(
    () => tasks.filter((item) => getStatus(item.dueDate) === "Overdue").length,
    [tasks]
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
    const cleanTitle = formData.title.trim();
    const cleanModuleCode = formData.moduleCode.trim().toUpperCase();
    const cleanModuleName = formData.moduleName.trim();
    const cleanDescription = formData.description.trim();

    if (
      !cleanTitle ||
      !cleanModuleCode ||
      !cleanModuleName ||
      !formData.type ||
      !formData.dueDate ||
      !cleanDescription
    ) {
      return "All fields are required.";
    }

    if (cleanTitle.length < 3) {
      return "Title must contain at least 3 characters.";
    }

    if (!/^[A-Z]{2,4}\d{3,4}$/.test(cleanModuleCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanModuleName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    if (cleanDescription.length < 10) {
      return "Description must contain at least 10 characters.";
    }

    const selectedDate = new Date(formData.dueDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Due date cannot be in the past.";
    }

    const duplicateTask = tasks.some(
      (item) =>
        item.title.toLowerCase() === cleanTitle.toLowerCase() &&
        item.moduleCode === cleanModuleCode &&
        item.dueDate === formData.dueDate
    );

    if (duplicateTask) {
      return "This assignment or exam already exists.";
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
      await apiPost("/api/assignments-exams", {
        title: formData.title.trim(),
        moduleCode: formData.moduleCode.trim().toUpperCase(),
        moduleName: formData.moduleName.trim(),
        type: formData.type,
        dueDate: formData.dueDate,
        description: formData.description.trim(),
      });
      await refreshTasks();

      setFormData({
        title: "",
        moduleCode: "",
        moduleName: "",
        type: "Assignment",
        dueDate: "",
        description: "",
      });

      setError("");
      setSuccess("Task added successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task.");
      setSuccess("");
    }
  };

  const handleClear = () => {
    setFormData({
      title: "",
      moduleCode: "",
      moduleName: "",
      type: "Assignment",
      dueDate: "",
      description: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/assignments-exams/${id}`);
      await refreshTasks();
      setError("");
      setSuccess("Task removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task.");
      setSuccess("");
    }
  };

  return (
    <Layout>
      {loadError && <p className="form-error">{loadError}</p>}

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Add Assignment or Exam</h3>
            <p>
              Students can add academic tasks and the system validates the input
              before saving.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Final Report Submission"
                value={formData.title}
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
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Enter assignment or exam details"
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
              Add Task
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
          <h4>Total Tasks</h4>
          <h2>{tasks.length}</h2>
          <p>Assignments and exams combined</p>
        </div>
        <div className="stat-card">
          <h4>Assignments</h4>
          <h2>{assignmentCount}</h2>
          <p>Coursework submissions</p>
        </div>
        <div className="stat-card">
          <h4>Exams</h4>
          <h2>{examCount}</h2>
          <p>Upcoming scheduled exams</p>
        </div>
        <div className="stat-card">
          <h4>Overdue</h4>
          <h2>{overdueCount}</h2>
          <p>Items past deadline</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Task List</h3>
            <p>
              View all added assignments and exams with their current status.
            </p>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No assignments or exams added</h3>
            <p>Add your first academic task above.</p>
          </div>
        ) : (
          <div className="availability-results">
            {tasks.map((item) => {
              const status = getStatus(item.dueDate);

              return (
                <div key={item.id} className="availability-card">
                  <div className="availability-top">
                    <div>
                      <span className={`availability-badge ${item.type === "Exam" ? "badge-exam" : "badge-assignment"}`}>
                        {item.type}
                      </span>
                      <h4>
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="availability-details">
                    <p>
                      <strong>Module:</strong> {item.moduleCode} - {item.moduleName}
                    </p>
                    <p>
                      <strong>Due Date:</strong> {item.dueDate}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={`task-status ${status.toLowerCase().replace(" ", "-")}`}>
                        {status}
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
                      Delete Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignmentExamPage;