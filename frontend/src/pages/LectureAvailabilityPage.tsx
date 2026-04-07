import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import type { SessionTypeKind, TimetableItem } from "../components/TimetableManager";
import { apiGet, apiPost } from "../lib/api";

type LectureItem = {
  id: number;
  moduleCode: string;
  moduleName: string;
  venueType: "Lecture Hall" | "Laboratory";
  venueName: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
};

type UnifiedRow =
  | { kind: "catalog"; item: LectureItem }
  | { kind: "timetable"; item: TimetableItem };

const dayOptions = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function dayIndex(d: string) {
  const i = dayOrder.indexOf(d);
  return i === -1 ? 99 : i;
}

function sortRows(rows: UnifiedRow[]) {
  return [...rows].sort((x, y) => {
    const ax = x.kind === "catalog" ? x.item : x.item;
    const bx = y.kind === "catalog" ? y.item : y.item;
    const d = dayIndex(ax.day) - dayIndex(bx.day);
    if (d !== 0) return d;
    return ax.startTime.localeCompare(bx.startTime);
  });
}

function unifiedSessionKind(row: UnifiedRow): SessionTypeKind | null {
  if (row.kind === "timetable") return row.item.sessionType;
  const v = row.item.venueType;
  if (v === "Lecture Hall") return "Lecture";
  if (v === "Laboratory") return "Lab";
  return null;
}

const LectureAvailabilityPage = () => {
  const [lectureData, setLectureData] = useState<LectureItem[]>([]);
  const [timetableData, setTimetableData] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [day, setDay] = useState("");
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [reminders, setReminders] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lectures, tt, rem] = await Promise.all([
          apiGet<LectureItem[]>("/api/lectures"),
          apiGet<TimetableItem[]>("/api/timetable"),
          apiGet<{ sessionIds: number[] }>("/api/lecture-reminders"),
        ]);
        if (!cancelled) {
          setLectureData(lectures);
          setTimetableData(tt);
          setReminders(rem.sessionIds);
          setLoadError("");
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load lecture data."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCatalog = useMemo(() => {
    const codeValue = moduleCode.trim().toUpperCase();
    const nameValue = moduleName.trim().toLowerCase();

    return lectureData.filter((item) => {
      const codeMatch = codeValue
        ? item.moduleCode.toUpperCase().includes(codeValue)
        : true;

      const nameMatch = nameValue
        ? item.moduleName.toLowerCase().includes(nameValue)
        : true;

      const dayMatch = day ? item.day === day : true;

      return codeMatch && nameMatch && dayMatch;
    });
  }, [lectureData, moduleCode, moduleName, day]);

  const filteredTimetable = useMemo(() => {
    const codeValue = moduleCode.trim().toUpperCase();
    const nameValue = moduleName.trim().toLowerCase();

    return timetableData.filter((item) => {
      const codeMatch = codeValue
        ? item.moduleCode.toUpperCase().includes(codeValue)
        : true;

      const nameMatch = nameValue
        ? item.moduleName.toLowerCase().includes(nameValue)
        : true;

      const dayMatch = day ? item.day === day : true;

      return codeMatch && nameMatch && dayMatch;
    });
  }, [timetableData, moduleCode, moduleName, day]);

  const filteredResults = useMemo(() => {
    const merged: UnifiedRow[] = [
      ...filteredCatalog.map((item) => ({ kind: "catalog" as const, item })),
      ...filteredTimetable.map((item) => ({
        kind: "timetable" as const,
        item,
      })),
    ];
    return sortRows(merged);
  }, [filteredCatalog, filteredTimetable]);

  const totalCombined = searched
    ? filteredResults.length
    : lectureData.length + timetableData.length;

  const baseUnifiedRows = useMemo((): UnifiedRow[] => {
    return sortRows([
      ...lectureData.map((item) => ({ kind: "catalog" as const, item })),
      ...timetableData.map((item) => ({ kind: "timetable" as const, item })),
    ]);
  }, [lectureData, timetableData]);

  const statsRows = searched ? filteredResults : baseUnifiedRows;

  const sessionKindCounts = useMemo(() => {
    const init: Record<SessionTypeKind, number> = {
      Lecture: 0,
      Practical: 0,
      Lab: 0,
      Tutorial: 0,
    };
    for (const row of statsRows) {
      const k = unifiedSessionKind(row);
      if (k) init[k] += 1;
    }
    return init;
  }, [statsRows]);

  const validateSearch = () => {
    const cleanCode = moduleCode.trim().toUpperCase();
    const cleanName = moduleName.trim();

    if (!cleanCode && !cleanName && !day) {
      return "Enter a module code, module name, or select a day.";
    }

    if (cleanCode && !/^[A-Z]{2,4}\d{3,4}$/.test(cleanCode)) {
      return "Module code must be in a format like IT3040.";
    }

    if (cleanName && cleanName.length < 3) {
      return "Module name must contain at least 3 characters.";
    }

    return "";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const validationMessage = validateSearch();

    if (validationMessage) {
      setError(validationMessage);
      setSearched(false);
      return;
    }

    setError("");
    setSearched(true);
  };

  const handleClear = () => {
    setModuleCode("");
    setModuleName("");
    setDay("");
    setError("");
    setSearched(false);
  };

  const toggleReminder = async (id: number) => {
    try {
      const data = await apiPost<{ sessionIds: number[] }>(
        "/api/lecture-reminders/toggle",
        { sessionId: id }
      );
      setReminders(data.sessionIds);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not update reminder."
      );
    }
  };

  return (
    <Layout>
      {loadError && <p className="form-error">{loadError}</p>}
      {loading && !loadError && (
        <p className="page-header" style={{ marginBottom: 16 }}>
          Loading sessions…
        </p>
      )}

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Search Lecture Availability &amp; Module Timetable</h3>
            <p>
              Find published catalog sessions and official module timetable
              slots in one search. Reminders apply to catalog sessions only.
            </p>
          </div>
        </div>

        <form className="availability-form" onSubmit={handleSearch}>
          <div className="form-grid">
            <div className="form-group">
              <label>Module Code</label>
              <input
                type="text"
                placeholder="e.g. IT3040"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label>Module Name</label>
              <input
                type="text"
                placeholder="e.g. Project Management"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Day</label>
              <select value={day} onChange={(e) => setDay(e.target.value)}>
                {dayOptions.map((item) => (
                  <option key={item || "all"} value={item}>
                    {item || "All Days"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="primary-form-btn">
              Search
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
          <h4>Total matches</h4>
          <h2>{totalCombined}</h2>
          <p>
            {searched
              ? "Catalog + module timetable rows"
              : "All catalog and timetable rows loaded"}
          </p>
        </div>
        <div className="stat-card">
          <h4>Lecture</h4>
          <h2>{sessionKindCounts.Lecture}</h2>
          <p>In the current view</p>
        </div>
        <div className="stat-card">
          <h4>Practical</h4>
          <h2>{sessionKindCounts.Practical}</h2>
          <p>Module timetable only</p>
        </div>
        <div className="stat-card">
          <h4>Lab</h4>
          <h2>{sessionKindCounts.Lab}</h2>
          <p>In the current view</p>
        </div>
        <div className="stat-card">
          <h4>Tutorial</h4>
          <h2>{sessionKindCounts.Tutorial}</h2>
          <p>Module timetable only</p>
        </div>
        <div className="stat-card">
          <h4>Reminders set</h4>
          <h2>{reminders.length}</h2>
          <p>Catalog sessions only</p>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Results</h3>
            <p>
              Each card shows whether the row comes from the published catalog
              or the module timetable administrators maintain.
            </p>
          </div>
        </div>

        {!searched ? (
          <div className="empty-state">
            <h3>Search to view sessions</h3>
            <p>
              Use module code, module name, or day to find catalog and timetable
              entries together.
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <h3>No matching sessions found</h3>
            <p>Try another module code, name, or day.</p>
          </div>
        ) : (
          <div className="availability-results">
            {filteredResults.map((row) => {
              if (row.kind === "catalog") {
                const item = row.item;
                const hasReminder = reminders.includes(item.id);

                return (
                  <div
                    key={`catalog-${item.id}`}
                    className="availability-card"
                  >
                    <div className="availability-top">
                      <div>
                        <div className="availability-badge-row">
                          <span className="availability-badge source-catalog">
                            Published catalog
                          </span>
                          <span className="availability-badge">{item.venueType}</span>
                        </div>
                        <h4>
                          {item.moduleCode} - {item.moduleName}
                        </h4>
                      </div>
                    </div>

                    <div className="availability-details">
                      <p>
                        <strong>Venue:</strong> {item.venueName}
                      </p>
                      <p>
                        <strong>Lecturer:</strong> {item.lecturer}
                      </p>
                      <p>
                        <strong>Day:</strong> {item.day}
                      </p>
                      <p>
                        <strong>Time:</strong> {item.startTime} - {item.endTime}
                      </p>
                    </div>

                    <div className="availability-actions">
                      <button
                        type="button"
                        className={
                          hasReminder
                            ? "secondary-form-btn reminder-active"
                            : "primary-form-btn"
                        }
                        onClick={() => toggleReminder(item.id)}
                      >
                        {hasReminder ? "Remove Reminder" : "Set Reminder"}
                      </button>
                    </div>
                  </div>
                );
              }

              const item = row.item;
              return (
                <div
                  key={`timetable-${item.id}`}
                  className="availability-card availability-card-timetable"
                >
                  <div className="availability-top">
                    <div>
                      <div className="availability-badge-row">
                        <span className="availability-badge source-timetable">
                          Module timetable
                        </span>
                        <span className="availability-badge">{item.sessionType}</span>
                      </div>
                      <h4>
                        {item.moduleCode} - {item.moduleName}
                      </h4>
                    </div>
                  </div>

                  <div className="availability-details">
                    <p>
                      <strong>Venue:</strong> {item.venueName}
                    </p>
                    <p>
                      <strong>Lecturer:</strong> {item.lecturer}
                    </p>
                    <p>
                      <strong>Day:</strong> {item.day}
                    </p>
                    <p>
                      <strong>Time:</strong> {item.startTime} - {item.endTime}
                    </p>
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

export default LectureAvailabilityPage;
