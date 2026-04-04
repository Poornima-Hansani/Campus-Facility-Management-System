import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaFileAlt,
  FaBullseye,
  FaHandsHelping,
  FaChartBar,
} from "react-icons/fa";

const Sidebar = () => {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/lecture-availability", label: "Lecture Availability", icon: <FaChalkboardTeacher /> },
    { path: "/timetable", label: "Timetable", icon: <FaCalendarAlt /> },
    { path: "/assignments-exams", label: "Assignments & Exams", icon: <FaFileAlt /> },
    { path: "/study-goals", label: "Study Goals", icon: <FaBullseye /> },
    { path: "/help-requests", label: "Help Requests", icon: <FaHandsHelping /> },
    { path: "/management-dashboard", label: "Management Dashboard", icon: <FaChartBar /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>UNIMANAGE</h2>
        <p>Student Portal</p>
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
    </aside>
  );
};

export default Sidebar;