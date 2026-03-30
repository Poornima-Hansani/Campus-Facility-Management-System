import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type HelperType = "lecturer" | "instructor" | "senior";

interface HelpRequest {
  id: string;
  module: string;
  topic: string;
  helper: HelperType;
  createdAt: string;
}

const STORAGE_KEY = "help_requests";

export default function HelpRequestPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [form, setForm] = useState({
    module: "",
    topic: "",
    helper: "lecturer" as HelperType,
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value as HelperType & string });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.module.trim()) {
      alert("Module code is required.");
      return;
    }

    if (!form.topic.trim()) {
      alert("Problem/topic is required.");
      return;
    }

    if (form.topic.trim().length < 5) {
      alert("Problem/topic must be at least 5 characters.");
      return;
    }

    if (!form.helper) {
      alert("Please select a helper type.");
      return;
    }

    const newRequest: HelpRequest = {
      id: Date.now().toString(),
      module: form.module.trim(),
      topic: form.topic.trim(),
      helper: form.helper,
      createdAt: new Date().toLocaleString(),
    };

    setRequests([newRequest, ...requests]);

    setForm({
      module: "",
      topic: "",
      helper: "lecturer",
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this request?")) return;
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <h1 style={styles.title}>Help Requests</h1>
          <button type="button" style={styles.backButton} onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        <p style={styles.subtitle}>
          Request support from lecturers, instructors, or senior students.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="module"
            placeholder="Module Code"
            value={form.module}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="topic"
            placeholder="Problem / Topic"
            value={form.topic}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <select
            name="helper"
            value={form.helper}
            onChange={handleChange}
            style={styles.input}
            required
          >
            <option value="lecturer">Lecturer</option>
            <option value="instructor">Instructor</option>
            <option value="senior">Senior Student</option>
          </select>

          <button type="submit" style={styles.submitButton}>
            Submit Request
          </button>
        </form>

        <div style={styles.list}>
          {requests.length === 0 ? (
            <div style={styles.emptyBox}>No requests yet.</div>
          ) : (
            requests.map((r) => (
              <div key={r.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{r.module}</h3>
                <p style={styles.cardText}>{r.topic}</p>
                <p style={styles.cardText}>
                  <strong>Helper:</strong> {r.helper}
                </p>
                <p style={styles.cardText}>
                  <strong>Created:</strong> {r.createdAt}
                </p>

                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
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
    maxWidth: 800,
    margin: "0 auto",
    background: "#fff",
    padding: 24,
    borderRadius: 16,
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
    fontSize: 32,
    color: "#1f5b46",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: "#5c7667",
  },
  form: {
    display: "grid",
    gap: 12,
    marginTop: 20,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #b7dfc0",
    background: "#dff0e2",
    fontSize: 15,
  },
  submitButton: {
    background: "#275d3f",
    color: "#fff",
    padding: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
  list: {
    marginTop: 20,
    display: "grid",
    gap: 12,
  },
  card: {
    padding: 14,
    border: "1px solid #d6eadb",
    marginBottom: 10,
    borderRadius: 12,
    background: "#fbfffc",
  },
  cardTitle: {
    color: "#1f5b46",
    marginBottom: 8,
  },
  cardText: {
    color: "#355648",
    marginBottom: 6,
  },
  deleteButton: {
    background: "#fbe9e9",
    color: "#9d2d2d",
    border: "1px solid #efc4c4",
    padding: 8,
    marginTop: 8,
    cursor: "pointer",
    borderRadius: 999,
    fontWeight: 700,
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
  emptyBox: {
    background: "#fbfffc",
    border: "1px dashed #cfe6d7",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    color: "#6c8679",
  },
};