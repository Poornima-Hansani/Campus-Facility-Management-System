import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Lecture {
  id: string;
  module: string;
  name: string;
  day: string;
  time: string;
  location: string;
}

const STORAGE_KEY = "timetable";

export default function LectureAvailabilityPage() {
  const navigate = useNavigate();

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedLectures: Lecture[] = JSON.parse(saved);
        setLectures(parsedLectures);
      } catch (error) {
        console.error("Failed to load lecture availability data:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const filteredLectures = lectures.filter((lecture) => {
    const matchesSearch =
      lecture.module.toLowerCase().includes(search.toLowerCase()) ||
      lecture.name.toLowerCase().includes(search.toLowerCase());

    const matchesDay = dayFilter === "All" ? true : lecture.day === dayFilter;

    return matchesSearch && matchesDay;
  });

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <h1 style={styles.title}>Lecture Availability</h1>
          <button type="button" style={styles.backButton} onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        <p style={styles.subtitle}>
          Search lectures by module code or module name and filter by day.
        </p>

        <div style={styles.filterSection}>
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

        <div style={styles.list}>
          {filteredLectures.length === 0 ? (
            <div style={styles.emptyBox}>No lectures found for your search.</div>
          ) : (
            filteredLectures.map((lecture) => (
              <div key={lecture.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{lecture.module}</h3>
                <p style={styles.cardText}>
                  <strong>Module Name:</strong> {lecture.name}
                </p>
                <p style={styles.cardText}>
                  <strong>Day:</strong> {lecture.day}
                </p>
                <p style={styles.cardText}>
                  <strong>Time:</strong> {lecture.time}
                </p>
                <p style={styles.cardText}>
                  <strong>Location:</strong> {lecture.location}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
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
    maxWidth: "950px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid #cfe6d7",
    boxShadow: "0 10px 24px rgba(63, 92, 74, 0.16)",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "36px",
    color: "#1f5b46",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: "24px",
    color: "#5c7667",
  },
  backButton: {
    background: "#edf7ef",
    color: "#1f5b46",
    border: "1px solid #b7dfc0",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  filterSection: {
    display: "grid",
    gap: "12px",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #b7dfc0",
    outline: "none",
    fontSize: "15px",
    background: "#dff0e2",
    color: "#23463b",
  },
  list: {
    display: "grid",
    gap: "14px",
  },
  emptyBox: {
    background: "#fbfffc",
    border: "1px dashed #cfe6d7",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    color: "#6c8679",
  },
  card: {
    border: "1px solid #d6eadb",
    borderRadius: "14px",
    padding: "16px",
    background: "#fbfffc",
  },
  cardTitle: {
    color: "#1f5b46",
    fontSize: "22px",
    marginBottom: "8px",
  },
  cardText: {
    color: "#355648",
    marginBottom: "6px",
  },
};