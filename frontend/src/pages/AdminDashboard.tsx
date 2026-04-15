import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import TimetableManager from "../components/TimetableManager";

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="content-card admin-dashboard-intro">
        <div className="section-head">
          <div>
            <h2>Administrator dashboard</h2>
            <p>
              Add and maintain the official module timetable. Students discover
              these sessions on the Lecture Availability page. Use Management
              Dashboard for encouragement emails and catalog comparison.
            </p>
          </div>
        </div>
        <div className="admin-dashboard-actions">
          <Link
            to="/management-dashboard"
            className="secondary-form-btn admin-dashboard-link"
          >
            Open Management Dashboard
          </Link>
          <Link
            to="/admin/labtimetables"
            className="primary-form-btn admin-dashboard-link"
            style={{ marginLeft: '1rem' }}
          >
            Lab Timetable
          </Link>
        </div>
      </div>

      <TimetableManager />
    </Layout>
  );
};

export default AdminDashboard;
