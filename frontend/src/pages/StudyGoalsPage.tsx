import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { apiDelete, apiGet, apiPost } from "../lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/study-goals.css";

type GoalType = "Daily" | "Weekly" | "Monthly";

type GoalItem = {
  id: number;
  title: string;
  goalType: GoalType;
  targetHours: number;
  completedHours: number;
  status: "Active" | "Completed";
  dueDate: string | null;
};

function toISODate(y: number, month0: number, d: number): string {
  return `${y}-${String(month0 + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function todayISO(): string {
  const n = new Date();
  return toISODate(n.getFullYear(), n.getMonth(), n.getDate());
}

type CalCell = {
  dateStr: string;
  dayNum: number;
  inMonth: boolean;
};

function buildCalendarMatrix(viewYear: number, viewMonth: number): CalCell[] {
  const first = new Date(viewYear, viewMonth, 1);
  const last = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = last.getDate();
  const mondayStart = (first.getDay() + 6) % 7;
  const cells: CalCell[] = [];

  const prevLast = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = 0; i < mondayStart; i++) {
    const day = prevLast - mondayStart + i + 1;
    let y = viewYear;
    let m = viewMonth - 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
    cells.push({ dateStr: toISODate(y, m, day), dayNum: day, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      dateStr: toISODate(viewYear, viewMonth, d),
      dayNum: d,
      inMonth: true,
    });
  }
  let nextDay = 1;
  let y = viewYear;
  let m = viewMonth + 1;
  if (m > 11) {
    m = 0;
    y += 1;
  }
  while (cells.length % 7 !== 0) {
    cells.push({
      dateStr: toISODate(y, m, nextDay),
      dayNum: nextDay,
      inMonth: false,
    });
    nextDay++;
  }
  return cells;
}

function parseISODateLocal(iso: string): Date {
  const [yy, mm, dd] = iso.split("-").map(Number);
  return new Date(yy, mm - 1, dd);
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = parseISODateLocal(iso);
  const t = todayISO();
  const [ty, tm, td] = t.split("-").map(Number);
  const start = new Date(ty, tm - 1, td);
  return Math.ceil((target.getTime() - start.getTime()) / 86400000);
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weeklyHoursData = [
  { day: "Mon", hours: 2.4 },
  { day: "Tue", hours: 1.5 },
  { day: "Wed", hours: 3.0 },
  { day: "Thu", hours: 2.0 },
  { day: "Fri", hours: 1.0 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 0.5 },
];

const badgeClass = (t: GoalType) =>
  t === "Daily"
    ? "sg-badge sg-badge-daily"
    : t === "Weekly"
      ? "sg-badge sg-badge-weekly"
      : "sg-badge sg-badge-monthly";

const StudyGoalsPage = () => {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loadError, setLoadError] = useState("");

  const refreshGoals = useCallback(async () => {
    const list = await apiGet<GoalItem[]>("/api/study-goals");
    setGoals(list);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await apiGet<GoalItem[]>("/api/study-goals");
        if (!cancelled) setGoals(list);
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load goals."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [formData, setFormData] = useState({
    title: "",
    goalType: "Daily" as GoalType,
    targetHours: "",
    dueDate: "",
  });
  const [logHours, setLogHours] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [workspaceView, setWorkspaceView] = useState<"list" | "calendar">(
    "list"
  );

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const maxHoursByType: Record<GoalType, number> = {
    Daily: 24,
    Weekly: 168,
    Monthly: 720,
  };

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === "Active"),
    [goals]
  );

  const completedGoals = useMemo(
    () => goals.filter((goal) => goal.status === "Completed"),
    [goals]
  );

  const totalTargetHours = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.targetHours, 0),
    [goals]
  );

  const totalCompletedHours = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.completedHours, 0),
    [goals]
  );

  const donutData = [
    { name: "Completed", value: totalCompletedHours },
    {
      name: "Remaining",
      value: Math.max(totalTargetHours - totalCompletedHours, 0),
    },
  ];

  const goalsByDueDate = useMemo(() => {
    const map: Record<string, GoalItem[]> = {};
    for (const g of goals) {
      if (!g.dueDate) continue;
      if (!map[g.dueDate]) map[g.dueDate] = [];
      map[g.dueDate].push(g);
    }
    return map;
  }, [goals]);

  const calCells = useMemo(
    () => buildCalendarMatrix(calYear, calMonth),
    [calYear, calMonth]
  );

  const monthTitle = useMemo(
    () =>
      new Date(calYear, calMonth).toLocaleString("en", {
        month: "long",
        year: "numeric",
      }),
    [calYear, calMonth]
  );

  const goalsOnSelectedDate = useMemo(
    () => goals.filter((g) => g.dueDate === selectedDate),
    [goals, selectedDate]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const validateGoal = () => {
    const title = formData.title.trim();
    if (title.length < 2) {
      return "Goal name must be at least 2 characters.";
    }
    if (!formData.goalType || !formData.targetHours) {
      return "Goal type and target hours are required.";
    }

    const target = Number(formData.targetHours);

    if (Number.isNaN(target) || target <= 0) {
      return "Target hours must be greater than 0.";
    }

    if (target > maxHoursByType[formData.goalType]) {
      return `${formData.goalType} goal cannot exceed ${maxHoursByType[formData.goalType]} hours.`;
    }

    if (formData.dueDate) {
      const d = parseISODateLocal(formData.dueDate);
      if (Number.isNaN(d.getTime())) {
        return "Choose a valid target date.";
      }
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateGoal();

    if (validationMessage) {
      setError(validationMessage);
      setSuccess("");
      return;
    }

    try {
      await apiPost("/api/study-goals", {
        title: formData.title.trim(),
        goalType: formData.goalType,
        targetHours: Number(formData.targetHours),
        dueDate: formData.dueDate.trim() || undefined,
      });
      await refreshGoals();
      setFormData({
        title: "",
        goalType: "Daily",
        targetHours: "",
        dueDate: "",
      });
      setError("");
      setSuccess("Study goal added successfully.");
      setShowGoalForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save goal.");
      setSuccess("");
    }
  };

  const handleClear = () => {
    setFormData({
      title: "",
      goalType: "Daily",
      targetHours: "",
      dueDate: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDelete(`/api/study-goals/${id}`);
      await refreshGoals();
      setError("");
      setSuccess("Goal removed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete goal.");
      setSuccess("");
    }
  };

  const handleLogChange = (id: number, value: string) => {
    setLogHours((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleLogHours = async (goal: GoalItem) => {
    const rawValue = logHours[goal.id] ?? "";
    const value = Number(rawValue);

    if (!rawValue) {
      setError("Enter completed hours before logging progress.");
      setSuccess("");
      return;
    }

    if (Number.isNaN(value) || value <= 0) {
      setError("Logged hours must be greater than 0.");
      setSuccess("");
      return;
    }

    try {
      await apiPost(`/api/study-goals/${goal.id}/log`, { hours: value });
      const list = await apiGet<GoalItem[]>("/api/study-goals");
      setGoals(list);
      const updated = list.find((g) => g.id === goal.id);
      setLogHours((prev) => ({
        ...prev,
        [goal.id]: "",
      }));
      setError("");
      setSuccess(
        updated?.status === "Completed"
          ? `"${goal.title}" completed.`
          : "Progress logged successfully."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log hours.");
      setSuccess("");
    }
  };

  const getProgressPercentage = (goal: GoalItem) => {
    return Math.min(
      100,
      Math.round((goal.completedHours / goal.targetHours) * 100)
    );
  };

  const calPrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const calNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const renderGoalCard = (goal: GoalItem) => {
    const percentage = getProgressPercentage(goal);
    const du = daysUntil(goal.dueDate);
    let hint: string | null = null;
    if (goal.dueDate !== null && du !== null) {
      if (du < 0) hint = `Due ${goal.dueDate} (overdue)`;
      else if (du === 0) hint = "Due today";
      else if (du === 1) hint = "Due tomorrow";
      else hint = `Due ${goal.dueDate} (${du} days left)`;
    }
    const soon = du !== null && du <= 3 && du >= 0;

    return (
      <div key={goal.id} className="sg-goal-card">
        <div className="sg-goal-top">
          <div>
            <span className={badgeClass(goal.goalType)}>{goal.goalType}</span>
            <div className="sg-goal-title">{goal.title}</div>
            {hint && (
              <p
                className={
                  soon ? "sg-due-line sg-due-soon" : "sg-due-line"
                }
              >
                {hint}
              </p>
            )}
            <p className="sg-due-line" style={{ marginTop: 6 }}>
              {goal.completedHours} / {goal.targetHours} hours ·{" "}
              {goal.targetHours - goal.completedHours}h remaining
            </p>
          </div>
          <div className="sg-percent">{percentage}%</div>
        </div>

        <div className="sg-progress-track">
          <div
            className="sg-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="sg-log-row">
          <input
            type="number"
            min={1}
            placeholder="Hours studied"
            value={logHours[goal.id] ?? ""}
            onChange={(e) => handleLogChange(goal.id, e.target.value)}
          />
          <button
            type="button"
            className="primary-form-btn"
            onClick={() => handleLogHours(goal)}
          >
            Log hours
          </button>
          <button
            type="button"
            className="danger-form-btn"
            onClick={() => handleDelete(goal.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="study-goals-workspace">
        {loadError && (
          <p className="form-error" style={{ marginBottom: 12 }}>
            {loadError}
          </p>
        )}
        <header className="sg-hero">
          <div className="sg-hero-inner">
            <div>
              <p className="sg-hero-lead">
                Create unlimited goals with optional target dates, use the
                calendar for due dates, and log hours as you go.
              </p>
            </div>
            <div className="sg-hero-actions">
              <button
                type="button"
                className="sg-btn-primary"
                onClick={() => setShowGoalForm((prev) => !prev)}
              >
                {showGoalForm ? "Close form" : "Add goal"}
              </button>
            </div>
          </div>
        </header>

        <div className="sg-toolbar">
          <div className="sg-stats-row">
            <span className="sg-stat-pill">
              Active <strong>{activeGoals.length}</strong>
            </span>
            <span className="sg-stat-pill">
              Completed <strong>{completedGoals.length}</strong>
            </span>
            <span className="sg-stat-pill">
              Total targets <strong>{totalTargetHours}h</strong>
            </span>
            <span className="sg-stat-pill">
              Logged <strong>{totalCompletedHours}h</strong>
            </span>
          </div>
          <div className="sg-toolbar-actions">
            <div className="sg-segmented" role="tablist" aria-label="View mode">
              <button
                type="button"
                role="tab"
                aria-selected={workspaceView === "list"}
                className={
                  workspaceView === "list" ? "sg-segmented-active" : ""
                }
                onClick={() => setWorkspaceView("list")}
              >
                List &amp; charts
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={workspaceView === "calendar"}
                className={
                  workspaceView === "calendar" ? "sg-segmented-active" : ""
                }
                onClick={() => setWorkspaceView("calendar")}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        {showGoalForm && (
          <div className="sg-card">
            <div className="sg-card-head">
              <h3>New study goal</h3>
              <p>
                Add as many goals as you need. Optional target date appears on
                the calendar.
              </p>
            </div>

            <form className="availability-form" onSubmit={handleSubmit}>
              <div className="form-grid sg-form-grid">
                <div className="form-group form-group-full">
                  <label htmlFor="sg-title">Goal name</label>
                  <input
                    id="sg-title"
                    type="text"
                    name="title"
                    placeholder="e.g. Database revision — Week 6"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={120}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sg-type">Goal type</label>
                  <select
                    id="sg-type"
                    name="goalType"
                    value={formData.goalType}
                    onChange={handleChange}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sg-hours">Target hours</label>
                  <input
                    id="sg-hours"
                    type="number"
                    name="targetHours"
                    placeholder="Hours"
                    value={formData.targetHours}
                    onChange={handleChange}
                    min={1}
                  />
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="sg-due">Target date (optional)</label>
                  <input
                    id="sg-due"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}
              {success && <p className="form-success">{success}</p>}

              <div className="form-actions">
                <button type="submit" className="primary-form-btn">
                  Save goal
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
        )}

        {workspaceView === "calendar" ? (
          <div className="sg-calendar-layout">
            <div className="sg-calendar-panel">
              <div className="sg-cal-nav">
                <button
                  type="button"
                  onClick={calPrevMonth}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <h2>{monthTitle}</h2>
                <button
                  type="button"
                  onClick={calNextMonth}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
              <div className="sg-cal-weekdays">
                {WEEKDAY_LABELS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="sg-cal-cells">
                {calCells.map((cell, idx) => {
                  const count = goalsByDueDate[cell.dateStr]?.length ?? 0;
                  const isToday = cell.dateStr === todayISO();
                  const isSelected = cell.dateStr === selectedDate;
                  return (
                    <button
                      key={`${cell.dateStr}-${idx}`}
                      type="button"
                      className={[
                        "sg-cal-cell",
                        !cell.inMonth ? "sg-cal-other" : "",
                        isToday ? "sg-cal-today" : "",
                        isSelected ? "sg-cal-selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSelectedDate(cell.dateStr)}
                    >
                      <span className="sg-cal-day-num">{cell.dayNum}</span>
                      {count > 0 && (
                        <div className="sg-cal-dots" aria-hidden>
                          {Array.from({
                            length: Math.min(count, 3),
                          }).map((_, i) => (
                            <span key={i} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="sg-day-panel">
              <h3>
                {parseISODateLocal(selectedDate).toLocaleDateString("en", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <p>
                Goals with this target date. Goals without a date only appear in
                the list view.
              </p>
              {goalsOnSelectedDate.length === 0 ? (
                <p className="sg-due-line">No goals due on this date.</p>
              ) : (
                goalsOnSelectedDate.map((g) => (
                  <div key={g.id} className="sg-day-goal-item">
                    <strong>{g.title}</strong>
                    <span className="sg-due-line">
                      {g.goalType} · {g.completedHours}/{g.targetHours}h ·{" "}
                      {g.status}
                    </span>
                  </div>
                ))
              )}
            </aside>
          </div>
        ) : (
          <>
            <div className="sg-chart-grid">
              <div className="sg-card">
                <div className="sg-card-head">
                  <h3>Hours logged this week</h3>
                  <p>Sample weekly pattern for your study rhythm.</p>
                </div>
                <div className="sg-chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyHoursData}>
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar
                        dataKey="hours"
                        radius={[8, 8, 0, 0]}
                        fill="#6366f1"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="sg-card">
                <div className="sg-card-head">
                  <h3>Overall progress</h3>
                  <p>Completed hours vs remaining across all goals.</p>
                </div>
                <div className="sg-chart-box">
                  {totalTargetHours === 0 ? (
                    <div className="sg-chart-hint">
                      Add goals to see progress distribution.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          <Cell fill="#28c76f" />
                          <Cell fill="#d9dee7" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="sg-section-label">
              Active goals ({activeGoals.length})
            </div>

            {activeGoals.length === 0 ? (
              <div className="sg-empty">
                <h3>No active goals</h3>
                <p>Add a goal to start tracking hours and deadlines.</p>
              </div>
            ) : (
              <div className="sg-goals-grid">
                {activeGoals.map((goal) => renderGoalCard(goal))}
              </div>
            )}

            <div className="sg-section-label">
              Completed goals ({completedGoals.length})
            </div>

            {completedGoals.length === 0 ? (
              <div className="sg-empty">
                <h3>No completed goals yet</h3>
                <p>Log hours until you hit each target.</p>
              </div>
            ) : (
              <div className="sg-completed-list">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="sg-completed-row">
                    <div>
                      <h4>{goal.title}</h4>
                      <p className="sg-completed-meta">
                        {goal.goalType} · {goal.targetHours}h target
                        {goal.dueDate ? ` · due ${goal.dueDate}` : ""}
                      </p>
                    </div>
                    <div className="sg-completed-actions">
                      <span className="sg-done-badge">Done</span>
                      <button
                        type="button"
                        className="danger-form-btn"
                        onClick={() => handleDelete(goal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default StudyGoalsPage;
