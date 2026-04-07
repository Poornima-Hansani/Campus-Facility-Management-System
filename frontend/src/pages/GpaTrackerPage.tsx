import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "../styles/gpa-tracker.css";

const STORAGE_KEY = "unimanage-gpa-courses-v1";

export type LetterGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "F";

const GRADE_POINTS: Record<LetterGrade, number> = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS) as LetterGrade[];

export type GpaCourseRow = {
  id: string;
  moduleCode: string;
  moduleName: string;
  credits: number;
  letterGrade: LetterGrade;
};

function loadCourses(): GpaCourseRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is GpaCourseRow =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as GpaCourseRow).id === "string" &&
        typeof (row as GpaCourseRow).credits === "number" &&
        typeof (row as GpaCourseRow).letterGrade === "string"
    );
  } catch {
    return [];
  }
}

function saveCourses(rows: GpaCourseRow[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

function computeGpa(rows: GpaCourseRow[]): { gpa: number | null; totalCredits: number } {
  let quality = 0;
  let credits = 0;
  for (const row of rows) {
    const c = row.credits;
    if (!Number.isFinite(c) || c <= 0) continue;
    const pts = GRADE_POINTS[row.letterGrade];
    if (pts === undefined) continue;
    quality += pts * c;
    credits += c;
  }
  if (credits === 0) return { gpa: null, totalCredits: 0 };
  return { gpa: quality / credits, totalCredits: credits };
}

const GpaTrackerPage = () => {
  const [rows, setRows] = useState<GpaCourseRow[]>(() => loadCourses());

  useEffect(() => {
    saveCourses(rows);
  }, [rows]);

  const { gpa, totalCredits } = useMemo(() => computeGpa(rows), [rows]);

  const [form, setForm] = useState({
    moduleCode: "",
    moduleName: "",
    credits: "",
    letterGrade: "A" as LetterGrade,
  });
  const [formError, setFormError] = useState("");

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");
      const code = form.moduleCode.trim().toUpperCase();
      const name = form.moduleName.trim();
      const cr = Number(form.credits);

      if (!code || !name) {
        setFormError("Module code and module name are required.");
        return;
      }
      if (!/^[A-Z]{2,4}\d{3,4}$/.test(code)) {
        setFormError("Module code should look like IT3040.");
        return;
      }
      if (name.length < 2) {
        setFormError("Module name is too short.");
        return;
      }
      if (!Number.isFinite(cr) || cr <= 0 || cr > 30) {
        setFormError("Credits must be a positive number (e.g. 2 or 3).");
        return;
      }

      const next: GpaCourseRow = {
        id: crypto.randomUUID(),
        moduleCode: code,
        moduleName: name,
        credits: cr,
        letterGrade: form.letterGrade,
      };
      setRows((prev) => [...prev, next]);
      setForm({
        moduleCode: "",
        moduleName: "",
        credits: "",
        letterGrade: "A",
      });
    },
    [form]
  );

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (
      rows.length > 0 &&
      !window.confirm("Remove all courses from your GPA tracker?")
    ) {
      return;
    }
    setRows([]);
  }, [rows.length]);

  return (
    <Layout>
      <div className="page-header">
        <h2>GPA tracker</h2>
        <p>
          Add modules with credit hours and letter grades. Your GPA uses a 4.0
          scale (quality points × credits ÷ total credits). Data is saved in
          this browser only.
        </p>
      </div>

      <div className="gpa-stats stats-grid">
        <div className="stat-card">
          <h4>Term / cumulative GPA</h4>
          <h2 className="gpa-stat-value">
            {gpa !== null ? gpa.toFixed(2) : "—"}
          </h2>
          <p>Based on listed modules</p>
        </div>
        <div className="stat-card">
          <h4>Credit hours counted</h4>
          <h2 className="gpa-stat-value">{totalCredits || "—"}</h2>
          <p>Sum of credits in the table</p>
        </div>
        <div className="stat-card">
          <h4>Modules</h4>
          <h2 className="gpa-stat-value">{rows.length}</h2>
          <p>Rows in your tracker</p>
        </div>
      </div>

      <div className="content-card gpa-card">
        <div className="section-head">
          <div>
            <h3>Add a module</h3>
            <p>
              Use the same module code style as elsewhere in UniManage (e.g.
              IT3040).
            </p>
          </div>
        </div>
        <form className="availability-form" onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gpa-code">Module code</label>
              <input
                id="gpa-code"
                type="text"
                value={form.moduleCode}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    moduleCode: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g. IT3040"
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gpa-name">Module name</label>
              <input
                id="gpa-name"
                type="text"
                value={form.moduleName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, moduleName: e.target.value }))
                }
                placeholder="e.g. Project Management"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gpa-credits">Credits</label>
              <input
                id="gpa-credits"
                type="number"
                min={0.5}
                max={30}
                step={0.5}
                value={form.credits}
                onChange={(e) =>
                  setForm((p) => ({ ...p, credits: e.target.value }))
                }
                placeholder="e.g. 3"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gpa-grade">Grade</label>
              <select
                id="gpa-grade"
                value={form.letterGrade}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    letterGrade: e.target.value as LetterGrade,
                  }))
                }
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g} ({GRADE_POINTS[g].toFixed(1)} pts)
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Add module
            </button>
          </div>
        </form>
      </div>

      <div className="content-card gpa-card">
        <div className="section-head gpa-table-head">
          <div>
            <h3>Your modules</h3>
            <p>Remove a row if you added it by mistake.</p>
          </div>
          {rows.length > 0 && (
            <button
              type="button"
              className="secondary-form-btn"
              onClick={clearAll}
            >
              Clear all
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="empty-state gpa-empty">
            <h3>No modules yet</h3>
            <p>Add at least one module with credits and a grade to see your GPA.</p>
          </div>
        ) : (
          <div className="gpa-table-wrap">
            <table className="gpa-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Credits</th>
                  <th>Grade</th>
                  <th>Points</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.moduleCode}</strong>
                      <div className="gpa-module-name">{row.moduleName}</div>
                    </td>
                    <td>{row.credits}</td>
                    <td>{row.letterGrade}</td>
                    <td>{GRADE_POINTS[row.letterGrade].toFixed(1)}</td>
                    <td className="gpa-actions">
                      <button
                        type="button"
                        className="danger-form-btn gpa-remove"
                        onClick={() => removeRow(row.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="content-card gpa-legend">
        <h3 className="gpa-legend-title">Grade scale (4.0)</h3>
        <ul className="gpa-legend-list">
          {GRADE_OPTIONS.map((g) => (
            <li key={g}>
              <strong>{g}</strong> — {GRADE_POINTS[g].toFixed(1)} quality points
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default GpaTrackerPage;
