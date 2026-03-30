import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Lecture {
  id: string;
  module: string;
  name: string;
  day: string;
  time: string;
  location: string;
}

interface LectureFormData {
  module: string;
  name: string;
  day: string;
  time: string;
  location: string;
}

const STORAGE_KEY = "timetable";

export default function TimetablePage() {
  const navigate = useNavigate();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");
  const [form, setForm] = useState<LectureFormData>({
    module: "",
    name: "",
    day: "Monday",
    time: "",
    location: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLectures(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures));
  }, [lectures]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.module.trim()) {
      alert("Module code is required.");
      return;
    }

    if (!form.name.trim()) {
      alert("Module name is required.");
      return;
    }

    if (!form.day) {
      alert("Please select a day.");
      return;
    }

    if (!form.time) {
      alert("Please select a time.");
      return;
    }

    if (!form.location.trim()) {
      alert("Location is required.");
      return;
    }

    const duplicateLecture = lectures.some(
      (lecture) =>
        lecture.module.toLowerCase() === form.module.trim().toLowerCase() &&
        lecture.day === form.day &&
        lecture.time === form.time
    );

    if (duplicateLecture) {
      alert("This lecture already exists for the same day and time.");
      return;
    }

    const newLecture: Lecture = {
      id: Date.now().toString(),
      module: form.module.trim(),
      name: form.name.trim(),
      day: form.day,
      time: form.time,
      location: form.location.trim(),
    };

    setLectures((prev) => [newLecture, ...prev]);

    setForm({
      module: "",
      name: "",
      day: "Monday",
      time: "",
      location: "",
    });
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("Do you want to delete this lecture?");
    if (!ok) return;
    setLectures((prev) => prev.filter((lecture) => lecture.id !== id));
  };

  const filteredLectures = useMemo(() => {
    return lectures.filter((lecture) => {
      const matchesSearch =
        lecture.module.toLowerCase().includes(search.toLowerCase()) ||
        lecture.name.toLowerCase().includes(search.toLowerCase());

      const matchesDay = dayFilter === "All" ? true : lecture.day === dayFilter;

      return matchesSearch && matchesDay;
    });
  }, [lectures, search, dayFilter]);

  const groupedLectures = useMemo(() => {
    const order = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const grouped: Record<string, Lecture[]> = {};

    filteredLectures.forEach((lecture) => {
      if (!grouped[lecture.day]) grouped[lecture.day] = [];
      grouped[lecture.day].push(lecture);
    });

    order.forEach((day) => {
      if (grouped[day]) {
        grouped[day].sort((a, b) => a.time.localeCompare(b.time));
      }
    });

    return order
      .filter((day) => grouped[day]?.length > 0)
      .map((day) => ({ day, lectures: grouped[day] }));
  }, [filteredLectures]);

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
          <div style={styles.badge}>Weekly Schedule</div>
          <h1 style={styles.heroTitle}>Timetable Management</h1>
          <p style={styles.heroSubtitle}>
            Add weekly lectures and lab sessions, organize them by day and time,
            and manage your academic schedule more effectively.
          </p>
        </section>

        <section style={styles.topCard}>
          <div style={styles.topCardHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Add New Lecture Session</h2>
              <p style={styles.helperText}>
                Enter module details, weekday, time, and lecture hall or lab.
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
              name="module"
              placeholder="Module Code"
              value={form.module}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="text"
              name="name"
              placeholder="Module Name"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              style={styles.input}
              required
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>

            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Lecture Hall / Lab"
              value={form.location}
              onChange={handleChange}
              style={styles.input}
              required
            />

            <button type="submit" style={styles.primaryButton}>
              Add Lecture
            </button>
          </form>
        </section>

        <section style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Search & Filter Timetable</h2>
              <p style={styles.helperText}>
                Search by module code or name and filter timetable by day.
              </p>
            </div>
          </div>

          <div style={styles.filterGrid}>
            <input
              type="text"
              placeholder="Search by module code or module name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />

            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              style={styles.input}
            >
              <option value="All">All Days</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div style={styles.quickStats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{lectures.length}</div>
              <div style={styles.statLabel}>TOTAL SESSIONS</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{filteredLectures.length}</div>
              <div style={styles.statLabel}>MATCHING RESULTS</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{groupedLectures.length}</div>
              <div style={styles.statLabel}>DAYS AVAILABLE</div>
            </div>
          </div>
        </section>

        {filteredLectures.length === 0 ? (
          <section style={styles.emptySection}>
            <div style={styles.emptyIcon}>📅</div>
            <h3 style={styles.emptyTitle}>No timetable sessions found</h3>
            <p style={styles.emptyText}>
              Add a lecture above or change your search and day filters.
            </p>
          </section>
        ) : (
          <section style={styles.daySectionWrap}>
            {groupedLectures.map((group) => (
              <div key={group.day} style={styles.dayCard}>
                <div style={styles.dayHeader}>
                  <h2 style={styles.dayTitle}>{group.day}</h2>
                  <span style={styles.dayCount}>
                    {group.lectures.length} session
                    {group.lectures.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div style={styles.lectureGrid}>
                  {group.lectures.map((lecture) => (
                    <div key={lecture.id} style={styles.lectureCard}>
                      <div style={styles.lectureTop}>
                        <div style={styles.iconBadge}>📘</div>
                        <div>
                          <h3 style={styles.lectureModule}>{lecture.module}</h3>
                          <p style={styles.lectureName}>{lecture.name}</p>
                        </div>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Time</span>
                        <span style={styles.infoValue}>{lecture.time}</span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Location</span>
                        <span style={styles.infoValue}>{lecture.location}</span>
                      </div>

                      <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Type</span>
                        <span style={styles.infoValue}>Lecture / Lab Session</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(lecture.id)}
                        style={styles.deleteButton}
                      >
                        Delete Session
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
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
  topCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    marginBottom: 24,
  },
  topCardHeader: {
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  filterCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
    marginBottom: 28,
  },
  filterHeader: {
    marginBottom: 16,
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
    marginBottom: 20,
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
  quickStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  statCard: {
    background: "#f8fcf9",
    border: "1px solid #e5f0e7",
    borderRadius: 16,
    padding: "22px 16px",
    textAlign: "center",
  },
  statValue: {
    fontSize: 30,
    fontWeight: 800,
    color: "#166534",
  },
  statLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 0.4,
  },
  emptySection: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: "46px 20px",
    textAlign: "center",
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 15,
  },
  daySectionWrap: {
    display: "grid",
    gap: 20,
  },
  dayCard: {
    background: "#ffffff",
    border: "1px solid #e8efe9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 8px 22px rgba(0,0,0,0.04)",
  },
  dayHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  dayTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: "#0f172a",
  },
  dayCount: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "#ecfdf3",
    color: "#15803d",
    fontWeight: 700,
    fontSize: 13,
  },
  lectureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },
  lectureCard: {
    border: "1px solid #e8efe9",
    borderRadius: 18,
    padding: 18,
    background: "#fbfffc",
  },
  lectureTop: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#edf7ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  lectureModule: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 4,
  },
  lectureName: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 0",
    borderTop: "1px solid #eef3ef",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 600,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: 600,
    textAlign: "right",
  },
  deleteButton: {
    marginTop: 16,
    width: "100%",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
};