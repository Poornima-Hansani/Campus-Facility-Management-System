import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { loginAsStudent, loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const go = (path: string) => {
    navigate(path, { replace: true });
  };

  const handleStudent = () => {
    loginAsStudent();
    setError("");
    go(from);
  };

  const handleAdmin = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (loginAsAdmin(password)) {
      setPassword("");
      go(from === "/login" ? "/admin-dashboard" : from);
    } else {
      setError("Incorrect administrator password.");
    }
  };

  return (
    <Layout>
    <div className="login-page">
      <div className="login-card content-card">
        <div className="section-head">
          <div>
            <h2>Sign in</h2>
            <p>
              Students use the portal as usual. Administrators sign in with the
              campus password to manage timetables and the management dashboard.
            </p>
          </div>
        </div>

        <div className="login-actions">
          <button
            type="button"
            className="primary-form-btn login-primary"
            onClick={handleStudent}
          >
            Continue as student
          </button>
        </div>

        <form className="availability-form login-admin-form" onSubmit={handleAdmin}>
          <h3 className="login-subheading">Administrator</h3>
          <div className="form-group">
            <label htmlFor="admin-password">Admin password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="secondary-form-btn">
              Sign in as administrator
            </button>
          </div>
        </form>

        <p className="login-footer">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </div>
    </Layout>
  );
};

export default LoginPage;
