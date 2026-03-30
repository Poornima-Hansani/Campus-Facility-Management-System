import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type TaskType = "assignment" | "exam";
type TaskStatus = "pending" | "completed" | "missed";

interface Task {
  id: string;
  type: TaskType;
  title: string;
  moduleCode: string;
  description: string;
  dueDateTime: string;
  status: TaskStatus;
  reminders: string[];
}

interface TaskFormData {
  type: TaskType;
  title: string;
  moduleCode: string;
  description: string;
  dueDateTime: string;
  status: TaskStatus;
  reminders: string[];
}

const STORAGE_KEY = "assignment_exam_manager_tasks";

export default function AddTaskPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const editingTask = (location.state as { task?: Task } | null)?.task;

  const [form, setForm] = useState<TaskFormData>({
    type: "assignment",
    title: "",
    moduleCode: "",
    description: "",
    dueDateTime: "",
    status: "pending",
    reminders: ["1 day before", "1 hour before"],
  });

  useEffect(() => {
    if (editingTask) {
      setForm({
        type: editingTask.type,
        title: editingTask.title,
        moduleCode: editingTask.moduleCode,
        description: editingTask.description,
        dueDateTime: editingTask.dueDateTime,
        status: editingTask.status,
        reminders: editingTask.reminders,
      });
    }
  }, [editingTask]);

  const reminderOptions = [
    "1 week before",
    "1 day before",
    "12 hrs before",
    "1 hour before",
    "30 min before",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "type") {
      setForm((prev) => ({ ...prev, type: value as TaskType }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleReminder = (label: string) => {
    setForm((prev) => {
      const exists = prev.reminders.includes(label);

      if (exists) {
        return {
          ...prev,
          reminders: prev.reminders.filter((item) => item !== label),
        };
      }

      return {
        ...prev,
        reminders: [...prev.reminders, label],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Task title is required.");
      return;
    }

    if (!form.moduleCode.trim()) {
      alert("Module code is required.");
      return;
    }

    if (!form.dueDateTime) {
      alert("Deadline is required.");
      return;
    }

    if (new Date(form.dueDateTime) <= new Date()) {
      alert("Deadline must be a future date and time.");
      return;
    }

    if (form.reminders.length === 0) {
      alert("Please select at least one reminder.");
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    const tasks: Task[] = saved ? JSON.parse(saved) : [];

    if (editingTask) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              type: form.type,
              title: form.title.trim(),
              moduleCode: form.moduleCode.trim(),
              description: form.description.trim(),
              dueDateTime: form.dueDateTime,
              status: form.status,
              reminders: form.reminders,
            }
          : task
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        type: form.type,
        title: form.title.trim(),
        moduleCode: form.moduleCode.trim(),
        description: form.description.trim(),
        dueDateTime: form.dueDateTime,
        status: "pending",
        reminders: form.reminders,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([newTask, ...tasks]));
    }

    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <h1 style={styles.title}>{editingTask ? "Edit Task" : "Add New Task"}</h1>
          <button type="button" style={styles.backButton} onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        <p style={styles.subtitle}>
          Add assignments and exams with reminders using the white and green theme.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.gridTwo}>
            <div>
              <label style={styles.label}>TYPE</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            <div>
              <label style={styles.label}>TASK NAME</label>
              <input
                type="text"
                name="title"
                placeholder="eg: Data Structures Lab"
                value={form.title}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div>
              <label style={styles.label}>MODULE / COURSE</label>
              <input
                type="text"
                name="moduleCode"
                placeholder="eg: IT2030"
                value={form.moduleCode}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div>
              <label style={styles.label}>DEADLINE</label>
              <input
                type="datetime-local"
                name="dueDateTime"
                value={form.dueDateTime}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>DESCRIPTION</label>
            <textarea
              name="description"
              placeholder="Brief notes about this task..."
              value={form.description}
              onChange={handleChange}
              style={styles.textarea}
            />
          </div>

          <div>
            <label style={styles.label}>REMINDERS</label>
            <div style={styles.chipRow}>
              {reminderOptions.map((option) => {
                const active = form.reminders.includes(option);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleReminder(option)}
                    style={{
                      ...styles.chip,
                      ...(active ? styles.chipActive : {}),
                    }}
                  >
                    {active ? "✓ " : ""}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.actionRow}>
            <button type="submit" style={styles.submitButton}>
              {editingTask ? "Update Task" : "Save Task"}
            </button>

            <button type="button" onClick={() => navigate("/")} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#edf0ed",
    padding: "40px 20px",
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: 16,
    padding: 28,
    border: "1px solid #cfe6d7",
    boxShadow: "0 10px 24px rgba(63, 92, 74, 0.16)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 36,
    color: "#1f5b46",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: "#5c7667",
  },
  backButton: {
    background: "#edf7ef",
    color: "#1f5b46",
    border: "1px solid #b7dfc0",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  form: {
    display: "grid",
    gap: 18,
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#557565",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #b7dfc0",
    outline: "none",
    fontSize: 15,
    background: "#dff0e2",
    color: "#23463b",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #b7dfc0",
    outline: "none",
    fontSize: 15,
    background: "#dff0e2",
    color: "#23463b",
    minHeight: 100,
    resize: "vertical",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    border: "1px solid #b7dfc0",
    background: "#f4fbf5",
    color: "#567564",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 12,
  },
  chipActive: {
    background: "#2d7d52",
    color: "#ffffff",
    border: "1px solid #2d7d52",
  },
  actionRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  submitButton: {
    background: "#275d3f",
    color: "#ffffff",
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 10px rgba(39, 93, 63, 0.2)",
  },
  cancelButton: {
    background: "#f0f5f1",
    color: "#275d3f",
    border: "1px solid #b7dfc0",
    borderRadius: 999,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
};