import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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

interface Lecture {
  id: string;
  module: string;
  name: string;
  day: string;
  time: string;
  location: string;
}

const TASKS_STORAGE_KEY = "assignment_exam_manager_tasks";
const TIMETABLE_STORAGE_KEY = "timetable";

export default function TaskDashboardPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "missed">("all");

  useEffect(() => {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch {
        localStorage.removeItem(TASKS_STORAGE_KEY);
      }
    }

    const savedLectures = localStorage.getItem(TIMETABLE_STORAGE_KEY);
    if (savedLectures) {
      try {
        setLectures(JSON.parse(savedLectures));
      } catch {
        localStorage.removeItem(TIMETABLE_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setTasks((prev) => {
        const updated = prev.map((task) =>
          task.status === "pending" && new Date(task.dueDateTime) < now
            ? { ...task, status: "missed" as TaskStatus }
            : task
        );

        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.moduleCode.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === "all" ? true : task.status === filter;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) return;

    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  };

  const markCompleted = (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, status: "completed" as TaskStatus } : task
    );
    setTasks(updated);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
  };

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  const todayLectures = lectures.filter((lecture) => lecture.day === todayName);

  const sortedTodayLectures = [...todayLectures].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcomingTodayLectures = sortedTodayLectures.filter((lecture) => {
    const [hours, minutes] = lecture.time.split(":").map(Number);
    const lectureMinutes = hours * 60 + minutes;
    return lectureMinutes >= currentMinutes;
  });

  return (
    <div style={styles.page}>
      <header style={styles.navbar}>
        <div style={styles.navBrandWrap}>
          <div style={styles.logoBox}>🎓</div>
          <div style={styles.navBrand}>UNIMANAGE</div>
        </div>

        <div style={styles.navActions}>
          <button type="button" style={styles.activeNavButton}>
            Student Portal
          </button>
          <button type="button" style={styles.navButton}>
            Management
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.heroSection}>
          <div style={styles.badge}>Student Services</div>
          <h1 style={styles.heroTitle}>Student Portal</h1>
          <p style={styles.heroSubtitle}>
            Welcome to the Campus Facility Management System. Access services to
            manage assignments, lectures, goals, and academic support in one place.
          </p>
        </section>

        <section style={styles.statsGrid}>
          <StatCard label="TOTAL TASKS" value={stats.total} />
          <StatCard label="PENDING" value={stats.pending} />
          <StatCard label="COMPLETED" value={stats.completed} />
        </section>

        <section style={styles.portalGrid}>
          <FeatureCard
            icon="📝"
            title="Assignment & Exam Manager"
            description="Manage your assignments, exams, deadlines, reminders, and completion progress."
            buttonText="Open Assignment Dashboard"
            onClick={() => navigate("/add-task")}
          />

          <FeatureCard
            icon="📅"
            title="Weekly Timetable"
            description="Add and organize your weekly lectures and lab sessions using day and time."
            buttonText="Open Timetable"
            onClick={() => navigate("/timetable")}
          />

          <FeatureCard
            icon="🏫"
            title="Lecture Availability"
            description="Search by module code or module name and check lecture hall or lab availability."
            buttonText="View Availability"
            onClick={() => navigate("/lecture-availability")}
          />

          <FeatureCard
            icon="🎯"
            title="Study Goals"
            description="Set daily, weekly, and monthly study targets and track your progress easily."
            buttonText="Open Study Goals"
            onClick={() => navigate("/study-goals")}
          />

          <FeatureCard
            icon="🤝"
            title="Help Requests"
            description="Request help from lecturers, instructors, or senior students for difficult topics."
            buttonText="Open Help Requests"
            onClick={() => navigate("/help")}
          />
        </section>

        <section style={styles.reminderBlock}>
          <div style={styles.reminderGrid}>
            <div style={styles.reminderCard}>
              <h2 style={styles.sectionTitle}>Today’s Lectures</h2>
              <p style={styles.infoText}>
                <strong>Today:</strong> {todayName}
              </p>

              {sortedTodayLectures.length === 0 ? (
                <p style={styles.emptyText}>No lectures scheduled for today.</p>
              ) : (
                sortedTodayLectures.map((lecture) => (
                  <div key={lecture.id} style={styles.reminderItem}>
                    <p style={styles.reminderText}>
                      <strong>{lecture.module}</strong> - {lecture.name}
                    </p>
                    <p style={styles.reminderText}>
                      {lecture.time} · {lecture.location}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div style={styles.reminderCard}>
              <h2 style={styles.sectionTitle}>Starts Soon</h2>

              {upcomingTodayLectures.length === 0 ? (
                <p style={styles.emptyText}>No more lectures coming up today.</p>
              ) : (
                upcomingTodayLectures.slice(0, 3).map((lecture) => (
                  <div key={lecture.id} style={styles.reminderItem}>
                    <p style={styles.reminderText}>
                      <strong>{lecture.module}</strong> - {lecture.name}
                    </p>
                    <p style={styles.reminderText}>
                      {lecture.time} · {lecture.location}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section style={styles.tasksSection}>
          <div style={styles.tasksHeader}>
            <h2 style={styles.sectionTitle}>Task Overview</h2>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate("/add-task")}
            >
              + Add New Task
            </button>
          </div>

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <div style={styles.filterRow}>
            {["all", "pending", "completed", "missed"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item as "all" | "pending" | "completed" | "missed")
                }
                style={{
                  ...styles.filterButton,
                  background: filter === item ? "#16a34a" : "#ffffff",
                  color: filter === item ? "#ffffff" : "#14532d",
                }}
              >
                {item}
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📋</div>
              <p style={styles.emptyText}>
                No tasks yet — add your first assignment or exam above.
              </p>
            </div>
          ) : (
            <div style={styles.taskGrid}>
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
                        ...styles.statusBadge,
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

                  <p style={styles.taskReminderText}>
                    <strong>Reminders:</strong>{" "}
                    {task.reminders.length ? task.reminders.join(", ") : "None"}
                  </p>

                  <div style={styles.taskButtonRow}>
                    <button
                      type="button"
                      onClick={() => navigate("/add-task", { state: { task } })}
                      style={styles.secondaryMiniButton}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      style={styles.deleteMiniButton}
                    >
                      Delete
                    </button>

                    {task.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => markCompleted(task.id)}
                        style={styles.primaryMiniButton}
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
      </main>
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

function FeatureCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDescription}>{description}</p>
      <button type="button" style={styles.primaryButton} onClick={onClick}>
        {buttonText}
      </button>
    </div>
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
    maxWidth: 1180,
    margin: "0 auto",
    padding: "42px 20px 60px",
  },
  heroSection: {
    textAlign: "center",
    marginBottom: 34,
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
    fontSize: 60,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 14,
  },
  heroSubtitle: {
    maxWidth: 760,
    margin: "0 auto",
    fontSize: 17,
    lineHeight: 1.7,
    color: "#6b7280",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 28,
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 18,
    padding: "24px 18px",
    textAlign: "center",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  statValue: {
    fontSize: 34,
    fontWeight: 800,
    color: "#166534",
  },
  statLabel: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
    letterSpacing: 0.4,
  },
  portalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },
  featureCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 26,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  featureIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    background: "#edf7ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#6b7280",
    marginBottom: 18,
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
  reminderBlock: {
    marginBottom: 30,
  },
  reminderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },
  reminderCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 14,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  reminderItem: {
    padding: "10px 0",
    borderBottom: "1px solid #eef3ef",
  },
  reminderText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  tasksSection: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  tasksHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  searchInput: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #dce8de",
    outline: "none",
    fontSize: 15,
    marginBottom: 16,
  },
  filterRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  filterButton: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #bbdfc6",
    cursor: "pointer",
    fontWeight: 700,
  },
  emptyState: {
    border: "1px dashed #d9e8dd",
    borderRadius: 16,
    padding: "36px 20px",
    textAlign: "center",
    background: "#fbfffc",
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
  },
  taskGrid: {
    display: "grid",
    gap: 16,
  },
  taskCard: {
    border: "1px solid #e8efe9",
    borderRadius: 18,
    padding: 18,
    background: "#fbfffc",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  taskTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 6,
  },
  taskMeta: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 3,
  },
  taskDescription: {
    marginTop: 12,
    color: "#374151",
    fontSize: 14,
    lineHeight: 1.6,
  },
  taskReminderText: {
    marginTop: 10,
    color: "#374151",
    fontSize: 14,
  },
  taskButtonRow: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  secondaryMiniButton: {
    background: "#edf7ef",
    color: "#14532d",
    border: "1px solid #bbdfc6",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteMiniButton: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  primaryMiniButton: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  statusBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    height: "fit-content",
    textTransform: "capitalize",
  },
  statusPending: {
    background: "#ecfdf3",
    color: "#15803d",
  },
  statusCompleted: {
    background: "#dcfce7",
    color: "#166534",
  },
  statusMissed: {
    background: "#fee2e2",
    color: "#b91c1c",
  },
};