import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import TimetableManager from "../components/TimetableManager";
import { getAllLecturerAlerts, type LecturerAlertSummary } from "../api/adminLabAlertsApi";

const AdminDashboard = () => {
  const [lecturerAlerts, setLecturerAlerts] = useState<LecturerAlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({ totalAlerts: 0, totalConfirmed: 0, totalPending: 0 });

  useEffect(() => {
    fetchLecturerAlerts();
  }, []);

  const fetchLecturerAlerts = async () => {
    try {
      setLoading(true);
      const res = await getAllLecturerAlerts();
      setLecturerAlerts(res.data.summary);
      setTotalStats({
        totalAlerts: res.data.totalAlerts,
        totalConfirmed: res.data.totalConfirmed,
        totalPending: res.data.totalPending
      });
    } catch (error) {
      console.error("Error fetching lecturer alerts:", error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Lecturer Energy Alerts Section */}
      <div className="content-card">
        <div className="section-head">
          <h3>Energy Saving Alerts Status</h3>
          <p>Monitor all lecturers' lab energy saving alert confirmations</p>
        </div>
        
        {loading ? (
          <div>Loading alert data...</div>
        ) : (
          <>
            {/* Summary Statistics */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div className="stat-card" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Alerts</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{totalStats.totalAlerts}</div>
              </div>
              <div className="stat-card" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Confirmed</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{totalStats.totalConfirmed}</div>
              </div>
              <div className="stat-card" style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Pending</h4>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>{totalStats.totalPending}</div>
              </div>
            </div>

            {/* Lecturer Alerts Table */}
            <div className="alerts-table">
              <h4>Lecturer Alert Details</h4>
              {lecturerAlerts.length === 0 ? (
                <p>No energy alerts found.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Lecturer</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Total Alerts</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Confirmed</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Pending</th>
                      <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerAlerts.map((lecturer) => (
                      <tr key={lecturer.lecturerId}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{lecturer.lecturerName}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{lecturer.lecturerId}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          {lecturer.totalAlerts}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          <span style={{ color: '#28a745', fontWeight: 'bold' }}>{lecturer.confirmedAlerts}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{lecturer.pendingAlerts}</span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                          {lecturer.pendingAlerts === 0 ? (
                            <span style={{ backgroundColor: '#28a745', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em' }}>
                              All Confirmed
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#ffc107', color: '#333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em' }}>
                              {lecturer.pendingAlerts} Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      <TimetableManager />
    </Layout>
  );
};

export default AdminDashboard;
