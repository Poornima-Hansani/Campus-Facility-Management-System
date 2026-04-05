import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";

const TaskDashboardPage = () => {
  const alerts = [
    {
      id: 1,
      title: "Software Engineering assignment due tomorrow",
      type: "Assignment Alert",
      time: "Tomorrow, 11:59 PM",
    },
    {
      id: 2,
      title: "Database Systems lecture reminder",
      type: "Lecture Reminder",
      time: "Today, 2:00 PM",
    },
    {
      id: 3,
      title: "Help request session arranged by lecturer",
      type: "Help Session",
      time: "Friday, 10:00 AM",
    },
  ];

  const quickActions = [
    {
      title: "Find Lecture Availability",
      description: "Search lecture halls and labs by module code or module name.",
      path: "/lecture-availability",
      button: "Open Availability",
    },
    {
      title: "Manage Timetable",
      description: "Add and view timetable sessions with time conflict checking.",
      path: "/timetable",
      button: "Open Timetable",
    },
    {
      title: "Track Assignments & Exams",
      description: "Add deadlines, upcoming exams, and academic alerts.",
      path: "/assignments-exams",
      button: "Open Tasks",
    },
    {
      title: "Set Study Goals",
      description: "Create daily, weekly, and monthly study targets.",
      path: "/study-goals",
      button: "Open Goals",
    },
    {
      title: "Request Academic Help",
      description: "Ask lecturers, instructors, or seniors for support.",
      path: "/help-requests",
      button: "Open Help Requests",
    },
    {
      title: "Management Overview",
      description: "View repeat-student support and management monitoring data.",
      path: "/management-dashboard",
      button: "Open Dashboard",
    },
  ];

  return (
    <Layout>
      <PageHeader
        title="Academic Help Dashboard"
        subtitle="Overview of lectures, reminders, study goals, academic tasks, and support activities"
      />

      <div className="dashboard-hero">
        <div className="dashboard-hero-text">
          <span className="hero-badge">UNIMANAGE Student Portal</span>
          <h2>Academic Help and Planning for Campus Students</h2>
          <p>
            This portal helps campus students manage lecture availability, timetable sessions,
            assignments, exams, study goals, and academic help requests in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/lecture-availability" className="primary-action-btn">
              Explore Lecture Availability
            </Link>
            <Link to="/study-goals" className="secondary-action-btn">
              View Study Goals
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-panel">
          <div className="hero-panel-card">
            <h4>Today’s Focus</h4>
            <ul>
              <li>1 lecture reminder pending</li>
              <li>2 assignments need attention</li>
              <li>1 help request is active</li>
              <li>Daily study goal is 70% completed</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Today’s Lectures" value="04" subtitle="Scheduled academic sessions" />
        <StatCard title="Pending Assignments" value="05" subtitle="Upcoming tasks to complete" />
        <StatCard title="Active Goals" value="03" subtitle="Daily, weekly, monthly targets" />
        <StatCard title="Help Requests" value="02" subtitle="Open academic support requests" />
      </div>

      <div className="dashboard-grid">
        <div className="content-card dashboard-left">
          <div className="section-head">
            <div>
              <h3>Quick Access</h3>
              <p>Go directly to the main functions of your module.</p>
            </div>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((item, index) => (
              <div key={index} className="quick-action-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <Link to={item.path} className="mini-action-btn">
                  {item.button}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card dashboard-right">
          <div className="section-head">
            <div>
              <h3>Today’s Summary</h3>
              <p>Important academic highlights for the student.</p>
            </div>
          </div>

          <div className="summary-list">
            <div className="summary-item">
              <span className="summary-dot green"></span>
              <div>
                <h4>Lecture Hall Search Available</h4>
                <p>Students can filter lecture halls and labs by module and day.</p>
              </div>
            </div>

            <div className="summary-item">
              <span className="summary-dot blue"></span>
              <div>
                <h4>Goal Tracking Active</h4>
                <p>Daily, weekly, and monthly study goals can be monitored.</p>
              </div>
            </div>

            <div className="summary-item">
              <span className="summary-dot orange"></span>
              <div>
                <h4>Upcoming Assessment Alerts</h4>
                <p>Assignment deadlines and exams will be shown to students clearly.</p>
              </div>
            </div>

            <div className="summary-item">
              <span className="summary-dot red"></span>
              <div>
                <h4>Help Request Support</h4>
                <p>Students can request individual or group support sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="section-head">
          <div>
            <h3>Recent Alerts</h3>
            <p>Sample notifications students should see from this module.</p>
          </div>
        </div>

        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <div className="alert-left">
                <span className="alert-badge">{alert.type}</span>
                <div>
                  <h4>{alert.title}</h4>
                  <p>{alert.time}</p>
                </div>
              </div>
              <button className="alert-view-btn">View</button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default TaskDashboardPage;