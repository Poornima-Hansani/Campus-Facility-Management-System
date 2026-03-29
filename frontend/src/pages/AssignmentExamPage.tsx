import { useEffect, useMemo, useState } from "react";

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

export default function AssignmentExamPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "missed">("all");

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setTasks((prev) =>
        prev.map((task) =>
          task.status === "pending" && new Date(task.dueDateTime) < now
            ? { ...task, status: "missed" }
            : task
        )
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const completed = tasks.filter((task) => task.status === "completed").length;

    return { total, pending, completed };
  }, [tasks]);

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

  const resetForm = () => {
    setForm({
      type: "assignment",
      title: "",
      moduleCode: "",
      description: "",
      dueDateTime: "",
      status: "pending",
      reminders: ["1 day before", "1 hour before"],
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.moduleCode.trim() || !form.dueDateTime) {
      alert("Please fill all required fields.");
      return;
    }

    if (new Date(form.dueDateTime) <= new Date()) {
      alert("Please choose a future date and time.");
      return;
    }

    if (editingId) {
      const updatedTasks = tasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              type: form.type,
              title: form.title,
              moduleCode: form.moduleCode,
              description: form.description,
              dueDateTime: form.dueDateTime,
              status: task.status === "missed" ? "pending" : task.status,
              reminders: form.reminders,
            }
          : task
      );

      setTasks(updatedTasks);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        type: form.type,
        title: form.title,
        moduleCode: form.moduleCode,
        description: form.description,
        dueDateTime: form.dueDateTime,
        status: "pending",
        reminders: form.reminders,
      };

      setTasks([newTask, ...tasks]);
    }

    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      type: task.type,
      title: task.title,
      moduleCode: task.moduleCode,
      description: task.description,
      dueDateTime: task.dueDateTime,
      status: task.status,
      reminders: task.reminders,
    });
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) return;

    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const markCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: "completed" } : task
      )
    );
  };

    const reminderOptions = [
    "1 week before",
    "1 day before",
    "12 hrs before",
    "1 hr before",
    "30 min before",
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.moduleCode.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" ? true : task.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.smallTop}>Students studying</p>
          <h1 style={styles.title}>
            Assignment & <span style={styles.titleLight}>Exam</span> Manager
          </h1>
          <p style={styles.subtitle}>
            Stay on top of deadlines · Track reminders · Never miss a submission
          </p>
        </div>
      </div>

      <div style={styles.mainCard}>
        <div style={styles.statsGrid}>
          <StatCard label="TOTAL TASKS" value={stats.total} />
          <StatCard label="PENDING" value={stats.pending} />
          <StatCard label="COMPLETED" value={stats.completed} />
        </div>

        <div style={styles.illustrationRow}>
          <span style={styles.emoji}>✍️</span>
          <span style={styles.emoji}>📓</span>
          <span style={styles.emoji}>📝</span>
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Add New Task</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.gridTwo}>
              <div>
                <label style={styles.label}>TYPE</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={styles.input}
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
                      {active ? "✓ " : ""}{option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.actionRow}>
              <button type="submit" style={styles.submitButton}>
                {editingId ? "Update Task" : "+ Add Task"}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm} style={styles.cancelButton}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

                <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Tasks</h2>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #b7dfc0",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["all", "pending", "completed", "missed"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() =>
                  setFilter(f as "all" | "pending" | "completed" | "missed")
                }
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #b7dfc0",
                  background: filter === f ? "#2d7d52" : "#f4fbf5",
                  color: filter === f ? "#fff" : "#355648",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <p style={styles.emptyText}>
                No tasks yet — add your first assignment or exam above!
              </p>
            </div>
          ) : (
                        <div style={styles.taskList}>
              {filteredTasks.map((task) => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskTop}>
                    <div>
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <p style={styles.taskMeta}>
                        {task.type.toUpperCase()} · {task.moduleCode}
                      </p>
                      <p style={styles.taskMeta}>
                        {new Date(task.dueDateTime).toLocaleString()}
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusPill,
                        ...(task.status === "completed"
                          ? styles.statusCompleted
                          : task.status === "missed"
                          ? styles.statusMissed
                          : styles.statusPending),
                      }}
                    >
                      {task.status}
                    </span>
                  </div>

                  <p style={styles.taskDescription}>
                    {task.description || "No description added."}
                  </p>

                  <div style={styles.reminderText}>
                    <strong>Reminders:</strong>{" "}
                    {task.reminders.length ? task.reminders.join(", ") : "None"}
                  </div>

                  <div style={styles.taskActions}>
                    <button type="button" onClick={() => handleEdit(task)} style={styles.smallButton}>
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      style={styles.smallDeleteButton}
                    >
                      Delete
                    </button>

                    {task.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => markCompleted(task.id)}
                        style={styles.smallCompleteButton}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#edf0ed",
  },
  hero: {
  background: "linear-gradient(180deg, #7ea08f 0%, #8fb19f 100%)",
  minHeight: 280,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "40px 20px 110px",
},
  heroInner: {
  textAlign: "center",
  color: "#ffffff",
  maxWidth: "900px",
},
  smallTop: {
    fontSize: 11,
    opacity: 0.8,
    marginBottom: 8,
  },
 title: {
  fontSize: 44,
  fontWeight: 700,
  textShadow: "0 2px 2px rgba(0,0,0,0.18)",
  lineHeight: 1.2,
  marginBottom: 10,
},
  titleLight: {
    color: "#d6f0dc",
  },
  subtitle: {
  marginTop: 8,
  fontSize: 13,
  opacity: 0.95,
  lineHeight: 1.5,
},
  mainCard: {
  maxWidth: 980,
  margin: "-85px auto 30px",
  background: "#ffffff",
  borderRadius: 16,
  padding: 24,
  border: "1px solid #cfe6d7",
  boxShadow: "0 10px 24px rgba(63, 92, 74, 0.16)",
},
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  },
  statCard: {
    background: "#edf7ef",
    border: "1px solid #cfe6d7",
    borderRadius: 10,
    padding: "16px 10px",
    textAlign: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1f5b46",
    lineHeight: 1.1,
  },
  statLabel: {
    marginTop: 6,
    fontSize: 11,
    color: "#628371",
    letterSpacing: 0.5,
  },
  illustrationRow: {
    display: "flex",
    gap: 28,
    justifyContent: "flex-start",
    marginTop: 16,
    marginBottom: 28,
    paddingLeft: 6,
  },
  emoji: {
    fontSize: 26,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 30,
    color: "#1f5b46",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  form: {
    display: "grid",
    gap: 16,
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
    letterSpacing: 0.5,
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
    fontSize: 14,
    background: "#dff0e2",
    color: "#23463b",
    minHeight: 80,
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
    gap: 10,
    alignItems: "center",
  },
  submitButton: {
    background: "#275d3f",
    color: "#ffffff",
    border: "none",
    borderRadius: 999,
    padding: "11px 18px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 6px 10px rgba(39, 93, 63, 0.2)",
  },
  cancelButton: {
    background: "#f0f5f1",
    color: "#275d3f",
    border: "1px solid #b7dfc0",
    borderRadius: 999,
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  emptyState: {
    marginTop: 10,
    border: "1px dashed #cfe6d7",
    borderRadius: 14,
    padding: "32px 20px",
    textAlign: "center",
    background: "#fbfffc",
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyText: {
    color: "#6c8679",
    fontSize: 14,
  },
  taskList: {
    display: "grid",
    gap: 14,
  },
  taskCard: {
    border: "1px solid #d6eadb",
    borderRadius: 14,
    padding: 16,
    background: "#fbfffc",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  taskTitle: {
    color: "#1f5b46",
    fontSize: 22,
    marginBottom: 4,
  },
  taskMeta: {
    color: "#5c7667",
    fontSize: 13,
    marginTop: 3,
  },
  taskDescription: {
    marginTop: 10,
    color: "#355648",
    fontSize: 14,
  },
  reminderText: {
    marginTop: 10,
    color: "#355648",
    fontSize: 13,
  },
  taskActions: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  smallButton: {
    background: "#e6f2e8",
    color: "#1f5b46",
    border: "1px solid #b7dfc0",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  smallDeleteButton: {
    background: "#fbe9e9",
    color: "#9d2d2d",
    border: "1px solid #efc4c4",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  smallCompleteButton: {
    background: "#275d3f",
    color: "#ffffff",
    border: "none",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  statusPill: {
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    height: "fit-content",
    textTransform: "capitalize",
  },
  statusPending: {
    background: "#e7f4ea",
    color: "#2d7d52",
  },
  statusCompleted: {
    background: "#dff1e4",
    color: "#1f5b46",
  },
  statusMissed: {
    background: "#f9e2e2",
    color: "#a33b3b",
  },
};