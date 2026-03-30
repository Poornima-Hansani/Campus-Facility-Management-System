import { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [helperFilter, setHelperFilter] = useState<"all" | HelperType>("all");

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

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesSearch =
        request.module.toLowerCase().includes(search.toLowerCase()) ||
        request.topic.toLowerCase().includes(search.toLowerCase());

      const matchesHelper =
        helperFilter === "all" ? true : request.helper === helperFilter;

      return matchesSearch && matchesHelper;
    });
  }, [requests, search, helperFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      lecturers: requests.filter((r) => r.helper === "lecturer").length,
      instructors: requests.filter((r) => r.helper === "instructor").length,
      seniors: requests.filter((r) => r.helper === "senior").length,
    };
  }, [requests]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "helper") {
      setForm((prev) => ({ ...prev, helper: value as HelperType }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
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

    setRequests((prev) => [newRequest, ...prev]);

    setForm({
      module: "",
      topic: "",
      helper: "lecturer",
    });
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this help request?");
    if (!ok) return;

    setRequests((prev) => prev.filter((request) => request.id !== id));
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
          <div style={styles.badge}>Academic Support</div>
          <h1 style={styles.heroTitle}>Help Requests</h1>
          <p style={styles.heroSubtitle}>
            Request help from lecturers, instructors, or senior students for
            modules and topics you find difficult.
          </p>
        </section>

        <section style={styles.statsGrid}>
          <StatCard label="TOTAL REQUESTS" value={stats.total} />
          <StatCard label="LECTURER" value={stats.lecturers} />
          <StatCard label="INSTRUCTOR" value={stats.instructors} />
          <StatCard label="SENIOR" value={stats.seniors} />
        </section>

        <section style={styles.formCard}>
          <div style={styles.formHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Create Help Request</h2>
              <p style={styles.helperText}>
                Submit a request for the module and topic you need support with.
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

            <button type="submit" style={styles.primaryButton}>
              Submit Request
            </button>
          </form>
        </section>

        <section style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Search & Filter Requests</h2>
              <p style={styles.helperText}>
                Search by module or topic and filter by helper type.
              </p>
            </div>
          </div>

          <div style={styles.filterGrid}>
            <input
              type="text"
              placeholder="Search by module or topic"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />

            <select
              value={helperFilter}
              onChange={(e) =>
                setHelperFilter(e.target.value as "all" | HelperType)
              }
              style={styles.input}
            >
              <option value="all">All Helpers</option>
              <option value="lecturer">Lecturer</option>
              <option value="instructor">Instructor</option>
              <option value="senior">Senior Student</option>
            </select>
          </div>
        </section>

        <section style={styles.requestsSection}>
          <h2 style={styles.sectionTitle}>Your Help Requests</h2>

          {filteredRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🤝</div>
              <p style={styles.emptyText}>No help requests found.</p>
            </div>
          ) : (
            <div style={styles.requestGrid}>
              {filteredRequests.map((request) => (
                <div key={request.id} style={styles.requestCard}>
                  <div style={styles.requestTop}>
                    <div>
                      <h3 style={styles.requestTitle}>{request.module}</h3>
                      <p style={styles.requestMeta}>{request.topic}</p>
                    </div>

                    <span style={styles.helperBadge}>
                      {request.helper}
                    </span>
                  </div>

                  <p style={styles.createdText}>
                    <strong>Created:</strong> {request.createdAt}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(request.id)}
                    style={styles.deleteButton}
                  >
                    Delete Request
                  </button>
                </div>
              ))}
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    marginBottom: 24,
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
  requestsSection: {
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
  requestGrid: {
    display: "grid",
    gap: 16,
  },
  requestCard: {
    border: "1px solid #e8efe9",
    borderRadius: 18,
    padding: 18,
    background: "#fbfffc",
  },
  requestTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 6,
  },
  requestMeta: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
  },
  helperBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "#ecfdf3",
    color: "#15803d",
    fontWeight: 700,
    fontSize: 12,
    height: "fit-content",
    textTransform: "capitalize",
  },
  createdText: {
    color: "#374151",
    fontSize: 14,
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 14,
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
  },
};