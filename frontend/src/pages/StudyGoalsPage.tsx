import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";

type GoalType = "Daily" | "Weekly" | "Monthly";

type GoalItem = {
  id: number;
  goalType: GoalType;
  targetHours: number;
  completedHours: number;
  status: "Active" | "Completed";
};

const initialGoals: GoalItem[] = [
  {
    id: 1,
    goalType: "Daily",
    targetHours: 4,
    completedHours: 2,
    status: "Active",
  },
  {
    id: 2,
    goalType: "Weekly",
    targetHours: 18,
    completedHours: 11,
    status: "Active",
  },
];

const StudyGoalsPage = () => {
  const [goals, setGoals] = useState<GoalItem[]>(initialGoals);

  const [formData, setFormData] = useState({
    goalType: "Daily" as GoalType,
    targetHours: "",
  });

  const [logHours, setLogHours] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const maxHoursByType: Record<GoalType, number> = {
    Daily: 24,
    Weekly: 168,
    Monthly: 720,
  };

  const activeGoalsCount = useMemo(
    () => goals.filter((goal) => goal.status === "Active").length,
    [goals]
  );

  const completedGoalsCount = useMemo(
    () => goals.filter((goal) => goal.status === "Completed").length,
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

    const duplicateGoalType = goals.some(
      (goal) => goal.goalType === formData.goalType && goal.status === "Active"
    );

    if (duplicateGoalType) {
      return `An active ${formData.goalType.toLowerCase()} goal already exists.`;
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationMessage = validateGoal();

    if (validationMessage) {
      setError(validationMessage);
      setSuccess("");
      return;
    }

    const newGoal: GoalItem = {
      id: Date.now(),
      goalType: formData.goalType,
      targetHours: Number(formData.targetHours),
      completedHours: 0,
      status: "Active",
    };

    setGoals((prev) => [...prev, newGoal]);
    setFormData({
      goalType: "Daily",
      targetHours: "",
    });
    setError("");
    setSuccess("Study goal added successfully.");
  };

  const handleClear = () => {
    setFormData({
      goalType: "Daily",
      targetHours: "",
    });
    setError("");
    setSuccess("");
  };

  const handleDelete = (id: number) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
    setError("");
    setSuccess("Goal removed successfully.");
  };

  const handleLogChange = (id: number, value: string) => {
    setLogHours((prev) => ({
      ...prev,
      [id]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleLogHours = (goal: GoalItem) => {
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

    const updatedCompleted = Math.min(
      goal.completedHours + value,
      goal.targetHours
    );

    const updatedStatus =
      updatedCompleted >= goal.targetHours ? "Completed" : "Active";

    setGoals((prev) =>
      prev.map((item) =>
        item.id === goal.id
          ? {
              ...item,
              completedHours: updatedCompleted,
              status: updatedStatus,
            }
          : item
      )
    );

    setLogHours((prev) => ({
      ...prev,
      [goal.id]: "",
    }));

    setError("");
    setSuccess(
      updatedStatus === "Completed"
        ? `${goal.goalType} goal completed successfully.`
        : "Progress logged successfully."
    );
  };

  const getProgressPercentage = (goal: GoalItem) => {
    return Math.min(
      100,
      Math.round((goal.completedHours / goal.targetHours) * 100)
    );
  };

  return (
    <Layout>
      <PageHeader
        title="Study Goals"
        subtitle="Create and track daily, weekly, and monthly academic study targets"
      />

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Set Study Goal</h3>
            <p>
              Students can create study goals and track their completed hours
              against the target.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSubmit}>
          <div className="form-grid goals-form-grid">
            <div className="form-group">
              <label>Goal Type</label>
              <select
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
              <label>Target Hours</label>
              <input
                type="number"
                name="targetHours"
                placeholder="Enter target hours"
                value={formData.targetHours}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Add Goal
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
          <h4>Total Goals</h4>
          <h2>{goals.length}</h2>
          <p>All study goals</p>
        </div>
        <div className="stat-card">
          <h4>Active Goals</h4>
          <h2>{activeGoalsCount}</h2>
          <p>Currently in progress</p>
        </div>
        <div className="stat-card">
          <h4>Completed Goals</h4>
          <h2>{completedGoalsCount}</h2>
          <p>Successfully achieved</p>
        </div>
        <div className="stat-card">
          <h4>Total Progress</h4>
          <h2>
            {totalCompletedHours}/{totalTargetHours}
          </h2>
          <p>Completed hours vs target hours</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Goal Progress</h3>
            <p>Track and update the progress of each study goal.</p>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state">
            <h3>No study goals added</h3>
            <p>Create your first daily, weekly, or monthly goal above.</p>
          </div>
        ) : (
          <div className="goals-list">
            {goals.map((goal) => {
              const percentage = getProgressPercentage(goal);

              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-card-top">
                    <div>
                      <span className={`goal-badge ${goal.goalType.toLowerCase()}-goal`}>
                        {goal.goalType} Goal
                      </span>
                      <h4>
                        {goal.completedHours} / {goal.targetHours} hours
                      </h4>
                    </div>
                    <span
                      className={`task-status ${
                        goal.status === "Completed" ? "scheduled" : "upcoming"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <p className="goal-progress-text">{percentage}% completed</p>

                  <div className="goal-log-row">
                    <input
                      type="number"
                      min="1"
                      placeholder="Log hours"
                      value={logHours[goal.id] ?? ""}
                      onChange={(e) =>
                        handleLogChange(goal.id, e.target.value)
                      }
                      disabled={goal.status === "Completed"}
                    />
                    <button
                      className="primary-form-btn"
                      onClick={() => handleLogHours(goal)}
                      disabled={goal.status === "Completed"}
                    >
                      Log Progress
                    </button>
                    <button
                      className="danger-form-btn"
                      onClick={() => handleDelete(goal.id)}
                    >
                      Delete
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

export default StudyGoalsPage;3