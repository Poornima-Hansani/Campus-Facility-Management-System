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
      alert("Goal title is required.");
      return;
    }

    if (isNaN(target) || target <= 0) {
      alert("Target hours must be greater than 0.");
      return;
    }

    if (isNaN(achieved) || achieved < 0) {
      alert("Achieved hours cannot be negative.");
      return;
    }

    if (achieved > target) {
      alert("Achieved hours cannot be greater than target hours.");
      return;
    }

    const status: GoalStatus = achieved >= target ? "completed" : "pending";

    if (editingId) {
      const updatedGoals = goals.map((goal) =>
        goal.id === editingId
          ? {
              ...goal,
              title: form.title.trim(),
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
        title: form.title.trim(),
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
          <div style={styles.badge}>Progress Tracking</div>
          <h1 style={styles.heroTitle}>Study Goals</h1>
          <p style={styles.heroSubtitle}>
            Set daily, weekly, and monthly academic goals and track your progress
            with a clear and organized study plan.
          </p>
        </section>

        <section style={styles.statsGrid}>
          <StatCard label="TOTAL GOALS" value={stats.total} />
          <StatCard label="PENDING" value={stats.pending} />
          <StatCard label="COMPLETED" value={stats.completed} />
        </section>

        <section style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                {editingId ? "Edit Study Goal" : "Create New Goal"}
              </h2>
              <p style={styles.helperText}>
                Add your goal type, target hours, and current progress.
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
            <input
              type="text"
              name="title"
              placeholder="Goal Title"
              value={form.title}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <select
              name="goalType"
              value={form.goalType}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <input
              type="number"
              name="targetHours"
              placeholder="Target Hours"
              value={form.targetHours}
              onChange={handleChange}
              style={styles.input}
              min="1"
              required
            />

            <input
              type="number"
              name="achievedHours"
              placeholder="Achieved Hours"
              value={form.achievedHours}
              onChange={handleChange}
              style={styles.input}
              min="0"
            />

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.primaryButton}>
                {editingId ? "Update Goal" : "Save Goal"}
              </button>

              {editingId && (
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.goalsSection}>
          <h2 style={styles.sectionTitle}>Your Goals</h2>

          {goals.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎯</div>
              <p style={styles.emptyText}>No study goals added yet.</p>
            </div>
          ) : (
            <div style={styles.goalGrid}>
              {goals.map((goal) => {
                const progress = Math.min(
                  (goal.achievedHours / goal.targetHours) * 100,
                  100
                );

                return (
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
                          ...styles.statusBadge,
                          ...(goal.status === "completed"
                            ? styles.statusCompleted
                            : styles.statusPending),
                        }}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <p style={styles.goalInfo}>
                      <strong>Target Hours:</strong> {goal.targetHours}
                    </p>
                    <p style={styles.goalInfo}>
                      <strong>Achieved Hours:</strong> {goal.achievedHours}
                    </p>

                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div style={styles.goalButtons}>
                      <button
                        type="button"
                        onClick={() => handleEdit(goal)}
                        style={styles.secondaryMiniButton}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id)}
                        style={styles.deleteMiniButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
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
  formCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    marginBottom: 28,
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
  buttonRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 4,
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
  goalsSection: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
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
  goalGrid: {
    display: "grid",
    gap: 16,
  },
  goalCard: {
    border: "1px solid #e8efe9",
    borderRadius: 18,
    padding: 18,
    background: "#fbfffc",
  },
  goalTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 6,
  },
  goalMeta: {
    color: "#6b7280",
    fontSize: 14,
  },
  goalInfo: {
    color: "#374151",
    fontSize: 14,
    marginBottom: 8,
  },
  progressOuter: {
    width: "100%",
    height: 12,
    background: "#e8f0ea",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10,
  },
  progressInner: {
    height: "100%",
    background: "#16a34a",
    borderRadius: 999,
  },
  goalButtons: {
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
};