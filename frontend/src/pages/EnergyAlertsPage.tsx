import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getAllLecturerAlerts, type LecturerAlertSummary } from "../api/adminLabAlertsApi";
import "../styles/adminDashboard.css";

export default function EnergyAlertsPage() {
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
      
      // Use the totals from the API response
      setTotalStats({
        totalAlerts: res.data.totalAlerts,
        totalConfirmed: res.data.totalConfirmed,
        totalPending: res.data.totalPending,
      });
    } catch (error) {
      console.error("Error fetching lecturer alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="admin-dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">Energy Saving Alerts Status</h1>
              <p className="dashboard-subtitle">
                Monitor all lecturers' lab energy saving alert confirmations
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading energy alerts data...</p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="energy-stats-grid">
                <div className="energy-stat-card total-alerts">
                  <div className="stat-icon-wrapper">
                    <span className="stat-icon">{'\ud83d\udcca'}</span>
                  </div>
                  <div className="stat-content">
                    <h4 className="stat-title">Total Alerts</h4>
                    <div className="stat-number">{totalStats.totalAlerts}</div>
                    <div className="stat-description">Active energy saving alerts</div>
                  </div>
                </div>
                
                <div className="energy-stat-card confirmed-alerts">
                  <div className="stat-icon-wrapper">
                    <span className="stat-icon">{'\u2705'}</span>
                  </div>
                  <div className="stat-content">
                    <h4 className="stat-title">Confirmed</h4>
                    <div className="stat-number">{totalStats.totalConfirmed}</div>
                    <div className="stat-description">Successfully confirmed</div>
                  </div>
                </div>
                
                <div className="energy-stat-card pending-alerts">
                  <div className="stat-icon-wrapper">
                    <span className="stat-icon">{'\u23f3'}</span>
                  </div>
                  <div className="stat-content">
                    <h4 className="stat-title">Pending</h4>
                    <div className="stat-number">{totalStats.totalPending}</div>
                    <div className="stat-description">Awaiting confirmation</div>
                  </div>
                </div>
              </div>

              {/* Lecturer Alerts Table */}
              <div className="energy-alerts-table">
                <div className="table-header">
                  <h4 className="table-title">
                    <span className="table-icon">{'\ud83d\udc68\u200d\ud83c\udfeb'}</span>
                    Lecturer Alert Details
                  </h4>
                  <div className="table-summary">
                    <span className="summary-item">
                      <span className="summary-icon">{'\ud83d\udcca'}</span>
                      {lecturerAlerts.length} Lecturers
                    </span>
                    <span className="summary-item">
                      <span className="summary-icon">{'\ud83d\udd0b'}</span>
                      {totalStats.totalAlerts} Total Alerts
                    </span>
                  </div>
                </div>
                
                {lecturerAlerts.length === 0 ? (
                  <div className="empty-alerts-state">
                    <div className="empty-icon">{'\ud83d\udca1'}</div>
                    <h3>No Energy Alerts Found</h3>
                    <p>All labs are currently energy efficient!</p>
                  </div>
                ) : (
                  <div className="alerts-table-wrapper">
                    <table className="energy-alerts-table-content">
                      <thead>
                        <tr>
                          <th>
                            <span className="table-header">
                              <span className="header-icon">{'\ud83d\udc64'}</span>
                              Lecturer
                            </span>
                          </th>
                          <th>
                            <span className="table-header">
                              <span className="header-icon">{'\ud83d\udcca'}</span>
                              Total
                            </span>
                          </th>
                          <th>
                            <span className="table-header">
                              <span className="header-icon">{'\u2705'}</span>
                              Confirmed
                            </span>
                          </th>
                          <th>
                            <span className="table-header">
                              <span className="header-icon">{'\u23f3'}</span>
                              Pending
                            </span>
                          </th>
                          <th>
                            <span className="table-header">
                              <span className="header-icon">{'\ud83d\udcca'}</span>
                              Status
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lecturerAlerts.map((lecturer, index) => (
                          <tr 
                            key={lecturer.lecturerId} 
                            className="lecturer-row"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="lecturer-cell">
                              <div className="lecturer-info">
                                <div className="lecturer-avatar">
                                  {lecturer.lecturerName.charAt(0)}
                                </div>
                                <div className="lecturer-details">
                                  <div className="lecturer-name">{lecturer.lecturerName}</div>
                                  <div className="lecturer-id">{lecturer.lecturerId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="total-alerts-cell">
                              <div className="alert-count">
                                <span className="count-number">{lecturer.totalAlerts}</span>
                                <span className="count-label">alerts</span>
                              </div>
                            </td>
                            <td className="confirmed-alerts-cell">
                              <div className="confirmed-count">
                                <span className="count-number confirmed">{lecturer.confirmedAlerts}</span>
                                <span className="count-label">confirmed</span>
                              </div>
                            </td>
                            <td className="pending-alerts-cell">
                              <div className="pending-count">
                                <span className="count-number pending">{lecturer.pendingAlerts}</span>
                                <span className="count-label">pending</span>
                              </div>
                            </td>
                            <td className="status-cell">
                              {lecturer.pendingAlerts === 0 ? (
                                <div className="status-badge all-confirmed">
                                  <span className="status-icon">{'\u2705'}</span>
                                  <span className="status-text">All Confirmed</span>
                                </div>
                              ) : (
                                <div className="status-badge pending-status">
                                  <span className="status-icon">{'\u23f3'}</span>
                                  <span className="status-text">{lecturer.pendingAlerts} Pending</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
