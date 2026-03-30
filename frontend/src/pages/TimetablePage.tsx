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
        const parsedLectures: Lecture[] = JSON.parse(saved);
        setLectures(parsedLectures);
      } catch (error) {
        console.error("Failed to load timetable data:", error);
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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <h1 style={styles.title}>Weekly Timetable</h1>
          <button type="button" style={styles.backButton} onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        <p style={styles.subtitle}>
          Add weekly lecture and lab sessions using day and time.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
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
            placeholder="Lab / Hall"
            value={form.location}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.addButton}>
            Add Lecture
          </button>
        </form>

        <div style={styles.list}>
          {lectures.length === 0 ? (
            <div style={styles.emptyBox}>No lectures added yet.</div>
          ) : (
            lectures.map((lecture) => (
              <div key={lecture.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{lecture.module}</h3>
                <p style={styles.cardText}>
                  <strong>Name:</strong> {lecture.name}
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

                <button
                  type="button"
                  onClick={() => handleDelete(lecture.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
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
    maxWidth: "900px",
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
  form: {
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
  addButton: {
    background: "#275d3f",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
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
  deleteButton: {
    marginTop: "12px",
    background: "#fbe9e9",
    color: "#9d2d2d",
    border: "1px solid #efc4c4",
    borderRadius: "999px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
};