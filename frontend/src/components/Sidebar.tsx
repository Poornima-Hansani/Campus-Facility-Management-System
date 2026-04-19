import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaUserCog,
  FaFileAlt,
  FaBullseye,
  FaHandsHelping,
  FaChartBar,
  FaUserShield,
  FaGraduationCap,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const isManagement = localStorage.getItem('unifiedRole') === 'management' || localStorage.getItem('managementLoggedIn') === 'true';

  const menuItems = isAdmin
    ? [
        {
          path: "/admin-dashboard",
          label: "Admin Dashboard",
          icon: <FaUserCog />,
        },
        {
          path: "/management-dashboard",
          label: "Management Dashboard",
          icon: <FaChartBar />,
        },
      ]
    : isManagement
    ? [
        {
          path: "/management-dashboard",
          label: "Management Dashboard",
          icon: <FaChartBar />,
        },
        {
          path: "/management/issues",
          label: "Issues List",
          icon: <FaFileAlt />,
        },
      ]
    : [
        { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
        {
          path: "/lecture-availability",
          label: "Lecture Availability",
          icon: <FaChalkboardTeacher />,
        },
        {
          path: "/assignments-exams",
          label: "Assignments & Exams",
          icon: <FaFileAlt />,
        },
        { path: "/study-goals", label: "Study Goals", icon: <FaBullseye /> },
        {
          path: "/gpa-tracker",
          label: "GPA Tracker",
          icon: <FaGraduationCap />,
        },
        {
          path: "/help-requests",
          label: "Help Requests",
          icon: <FaHandsHelping />,
        },
      ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>UNIMANAGE</h2>
        <p>{isAdmin ? "Administrator" : isManagement ? "Management Portal" : "Student Portal"}</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? "sidebar-link sidebar-link-muted active" : "sidebar-link sidebar-link-muted"
          }
        >
          <span className="sidebar-icon">
            <FaUserShield />
          </span>
          <span>{isAdmin ? "Switch account" : "Login as Staff"}</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;