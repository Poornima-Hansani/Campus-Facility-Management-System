import { useState } from "react";
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

const defaultForm = (): TaskFormData => ({
  type: "assignment",
  title: "",
  moduleCode: "",
  description: "",
  dueDateTime: "",
  status: "pending",
  reminders: ["1 day before", "1 hour before"],
});

function taskToForm(task: Task): TaskFormData {
  return {
    type: task.type,
    title: task.title,
    moduleCode: task.moduleCode,
    description: task.description,
    dueDateTime: task.dueDateTime,
    status: task.status,
    reminders: task.reminders,
  };
}

function AddTaskForm({ editingTask }: { editingTask?: Task }) {
  const navigate = useNavigate();

  const [form, setForm] = useState<TaskFormData>(() =>
    editingTask ? taskToForm(editingTask) : defaultForm()
  );

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
      <header style={styles.navbar}>
        <div style={styles.navBrandWrap}>
          <div style={styles.logoBox}>🎓</div>
          <div style={styles.navBrand}>UNIMANAGE</div>
        </div>

        <div style={styles.navActions}>
          <button
            type="button"
            style={styles.activeNavButton}
            onClick={() => navigate("/")}
          >
            Student Portal
          </button>
          <button type="button" style={styles.navButton}>
            Management
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.heroSection}>
          <div style={styles.badge}>Task Management</div>
          <h1 style={styles.heroTitle}>
            {editingTask ? "Edit Task" : "Add New Task"}
          </h1>
          <p style={styles.heroSubtitle}>
            Add assignments and exams with deadlines and reminder settings to
            stay organized and never miss submissions.
          </p>
        </section>

        <section style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Task Details</h2>
              <p style={styles.helperText}>
                Fill in the information below and choose reminder timings.
              </p>
            </div>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/")}
            >
              Back to Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.formGrid}>
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

            <input
              type="text"
              name="title"
              placeholder="Task Title"
              value={form.title}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="text"
              name="moduleCode"
              placeholder="Module Code"
              value={form.moduleCode}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="datetime-local"
              name="dueDateTime"
              value={form.dueDateTime}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <textarea
              name="description"
              placeholder="Task Description"
              value={form.description}
              onChange={handleChange}
              style={styles.textarea}
            />

            <div style={styles.reminderBox}>
              <label style={styles.label}>Reminder Options</label>
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

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.primaryButton}>
                {editingTask ? "Update Task" : "Save Task"}
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default function AddTaskPage() {
  const location = useLocation();
  const editingTask = (location.state as { task?: Task } | null)?.task;

  return (
    <AddTaskForm
      key={editingTask?.id ?? "__new__"}
      editingTask={editingTask}
    />
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f8faf8",
    fontFamily: "Arial, sans-serif",
  },
  navbar: {
    height: 84,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
  },
  navBrandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    background: "#edf7ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  navBrand: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
  },
  navActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  navButton: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#4b5563",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeNavButton: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "#15803d",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 14px rgba(21,128,61,0.18)",
    
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "42px 20px 60px",
  },
  heroSection: {
    textAlign: "center",
    marginBottom: 30,
  },
  badge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: 999,
    background: "#eaf7ed",
    color: "#15803d",
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 14,
  },
heroSubtitle: {
  maxWidth: 760,
  margin: "0 auto",
  fontSize: "clamp(14px, 2.5vw, 17px)",
  lineHeight: 1.7,
  color: "#6b7280",
},
  formCard: {
    background: "#f0fdf4",
    border: "1px solid #ccfbf1",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 14,
    color: "#6b7280",
  },
  backButton: {
    background: "#edf7ef",
    color: "#14532d",
    border: "1px solid #bbdfc6",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
  formGrid: {
    display: "grid",
    gap: 16,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #dce8de",
    outline: "none",
    fontSize: 15,
    background: "#ffffff",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #dce8de",
    outline: "none",
    fontSize: 15,
    background: "#ffffff",
    resize: "vertical",
  },
  reminderBox: {
    marginTop: 4,
  },
  label: {
    display: "block",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
  },
  chipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    border: "1px solid #bbdfc6",
    background: "#ffffff",
    color: "#14532d",
    padding: "10px 14px",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  chipActive: {
    background: "#16a34a",
    color: "#ffffff",
    border: "1px solid #16a34a",
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
  },
  primaryButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 14px rgba(22,163,74,0.18)",
    
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#14532d",
    border: "1px solid #bbdfc6",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
};