import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type GoalType = "daily" | "weekly" | "monthly";
type GoalStatus = "pending" | "completed";

interface StudyGoal {
  id: string;
  title: string;
  goalType: GoalType;
  targetHours: number;
  achievedHours: number;
  status: GoalStatus;
}

const STORAGE_KEY = "study_goals_data";

export default function StudyGoalsPage() {
  const navigate = useNavigate();

  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    goalType: "daily" as GoalType,
    targetHours: "",
    achievedHours: "",
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem(STORAGE_KEY);
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const stats = useMemo(() => {
    return {
      total: goals.length,
      completed: goals.filter((goal) => goal.status === "completed").length,
      pending: goals.filter((goal) => goal.status === "pending").length,
    };
  }, [goals]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "goalType") {
      setForm((prev) => ({ ...prev, goalType: value as GoalType }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      title: "",
      goalType: "daily",
      targetHours: "",
      achievedHours: "",
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const target = Number(form.targetHours);
    const achieved = Number(form.achievedHours || 0);

    if (!form.title.trim()) {
      alert("Please enter goal title.");
      return;
    }

    if (target <= 0) {
      alert("Target hours must be greater than 0.");
      return;
    }

    const status: GoalStatus = achieved >= target ? "completed" : "pending";

    if (editingId) {
      const updatedGoals = goals.map((goal) =>
        goal.id === editingId
          ? {
              ...goal,
              title: form.title,
              goalType: form.goalType,
              targetHours: target,
              achievedHours: achieved,
              status,
            }
          : goal
      );

      setGoals(updatedGoals);
    } else {
      const newGoal: StudyGoal = {
        id: Date.now().toString(),
        title: form.title,
        goalType: form.goalType,
        targetHours: target,
        achievedHours: achieved,
        status,
      };

      setGoals([newGoal, ...goals]);
    }

    resetForm();
  };

  const handleEdit = (goal: StudyGoal) => {
    setEditingId(goal.id);
    setForm({
      title: goal.title,
      goalType: goal.goalType,
      targetHours: String(goal.targetHours),
      achievedHours: String(goal.achievedHours),
    });
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this goal?");
    if (!ok) return;

    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <h1 style={styles.title}>Study Goals</h1>
          <button style={styles.backButton} onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        <p style={styles.subtitle}>
          Set daily, weekly, and monthly study targets to stay consistent.
        </p>

        <div style={styles.statsGrid}>
          <StatCard label="TOTAL GOALS" value={stats.total} />
          <StatCard label="PENDING" value={stats.pending} />
          <StatCard label="COMPLETED" value={stats.completed} />
        </div>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {editingId ? "Edit Goal" : "Add New Goal"}
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.gridTwo}>
              <div>
                <label style={styles.label}>GOAL TITLE</label>
                <input
                  type="text"
                  name="title"
                  placeholder="eg: Finish database revision"
                  value={form.title}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>GOAL TYPE</label>
                <select
                  name="goalType"
                  value={form.goalType}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>TARGET HOURS</label>
                <input
                  type="number"
                  name="targetHours"
                  placeholder="eg: 10"
                  value={form.targetHours}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>ACHIEVED HOURS</label>
                <input
                  type="number"
                  name="achievedHours"
                  placeholder="eg: 4"
                  value={form.achievedHours}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.actionRow}>
              <button type="submit" style={styles.submitButton}>
                {editingId ? "Update Goal" : "Add Goal"}
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
          <h2 style={styles.sectionTitle}>Your Goals</h2>

          {goals.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎯</div>
              <p style={styles.emptyText}>No study goals added yet.</p>
            </div>
          ) : (
            <div style={styles.goalList}>
              {goals.map((goal) => (
                <div key={goal.id} style={styles.goalCard}>
                  <div style={styles.goalTop}>
                    <div>
                      <h3 style={styles.goalTitle}>{goal.title}</h3>
                      <p style={styles.goalMeta}>
                        {goal.goalType.toUpperCase()} GOAL
                      </p>
                    </div>

                    <span
                      style={{
                        ...styles.statusPill,
                        ...(goal.status === "completed"
                          ? styles.statusCompleted
                          : styles.statusPending),
                      }}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <p style={styles.goalMeta}>
                    Target Hours: {goal.targetHours}
                  </p>
                  <p style={styles.goalMeta}>
                    Achieved Hours: {goal.achievedHours}
                  </p>

                  <div style={styles.progressOuter}>
                    <div
                      style={{
                        ...styles.progressInner,
                        width: `${Math.min(
                          (goal.achievedHours / goal.targetHours) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div style={styles.actionButtons}>
                    <button onClick={() => handleEdit(goal)} style={styles.editButton}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(goal.id)} style={styles.deleteButton}>
                      Delete
                    </button>
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
    padding: "40px 20px",
  },
  container: {
    maxWidth: 950,
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
    marginBottom: 24,
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
  },
  statLabel: {
    marginTop: 6,
    fontSize: 11,
    color: "#628371",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 28,
    color: "#1f5b46",
    marginBottom: 18,
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
  goalList: {
    display: "grid",
    gap: 14,
  },
  goalCard: {
    border: "1px solid #d6eadb",
    borderRadius: 14,
    padding: 16,
    background: "#fbfffc",
  },
  goalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  goalTitle: {
    color: "#1f5b46",
    fontSize: 22,
    marginBottom: 4,
  },
  goalMeta: {
    color: "#5c7667",
    fontSize: 14,
    marginTop: 4,
  },
  progressOuter: {
    width: "100%",
    height: 12,
    background: "#e6efe8",
    borderRadius: 999,
    marginTop: 14,
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    background: "#2d7d52",
    borderRadius: 999,
  },
  actionButtons: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  editButton: {
    background: "#e6f2e8",
    color: "#1f5b46",
    border: "1px solid #b7dfc0",
    borderRadius: 999,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  deleteButton: {
    background: "#fbe9e9",
    color: "#9d2d2d",
    border: "1px solid #efc4c4",
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
};