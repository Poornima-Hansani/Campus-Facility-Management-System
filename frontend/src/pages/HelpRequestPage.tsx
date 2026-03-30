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
    if (saved) setRequests(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.module.trim() || !form.topic.trim()) {
      alert("Fill all fields");
      return;
    }

    const newRequest: HelpRequest = {
      id: Date.now().toString(),
      module: form.module,
      topic: form.topic,
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
          <button style={styles.backButton} onClick={() => navigate("/")}>
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="module"
            placeholder="Module Code"
            value={form.module}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="topic"
            placeholder="Problem / Topic"
            value={form.topic}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="helper"
            value={form.helper}
            onChange={handleChange}
            style={styles.input}
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
            <p>No requests yet</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} style={styles.card}>
                <h3>{r.module}</h3>
                <p>{r.topic}</p>
                <p>Helper: {r.helper}</p>
                <small>{r.createdAt}</small>

                <button
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

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#edf0ed",
    padding: 40,
  },
  container: {
    maxWidth: 700,
    margin: "auto",
    background: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 30,
    color: "#1f5b46",
  },
  form: {
    display: "grid",
    gap: 10,
    marginTop: 20,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  submitButton: {
    background: "#275d3f",
    color: "#fff",
    padding: 10,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  list: {
    marginTop: 20,
  },
  card: {
    padding: 10,
    border: "1px solid #ddd",
    marginBottom: 10,
    borderRadius: 8,
  },
  deleteButton: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 5,
    marginTop: 5,
    cursor: "pointer",
  },
  backButton: {
    padding: 8,
    cursor: "pointer",
  },
};