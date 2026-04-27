import { useState } from "react";
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
  FaListUl,
  FaPoll,
  FaBars,
  FaPlusCircle,
  FaCalendarAlt,
  FaUsers
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const SidebarNew = () => {
  const { isAdmin, isLecturer } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          label: "Overview",
          icon: <FaChartBar />,
        },
        {
          path: "/management/facility",
          label: "Facility",
          icon: <FaFileAlt />,
        },
        {
          path: "/management/timetable",
          label: "Timetables",
          icon: <FaChalkboardTeacher />,
        },
        {
          path: "/management/emails",
          label: "Emails",
          icon: <FaHandsHelping />,
        },
        {
          path: "/management/staff",
          label: "Stafflist",
          icon: <FaUserShield />,
        },
        {
          path: "/management/lecturers",
          label: "Lecturelist",
          icon: <FaChalkboardTeacher />,
        },
        {
          path: "/energy-alerts",
          label: "Energy",
          icon: <FaTachometerAlt />,
        },
        {
          path: "/management/meetings",
          label: "Meetings",
          icon: <FaCalendarAlt />,
        },
      ]
    : isLecturer || localStorage.getItem('unifiedRole') === 'lecturer'
    ? [
        {
          path: "/lecturer-dashboard",
          label: "Overview",
          icon: <FaChartBar />,
        },
        {
          path: "/lecturer/mails",
          label: "Mails",
          icon: <FaFileAlt />,
        },
        {
          path: "/lecturer/notes",
          label: "Add Lec Notes",
          icon: <FaPlusCircle />,
        },
        {
          path: "/lecturer/attendance",
          label: "Student Attendance",
          icon: <FaUsers />,
        },
        {
          path: "/lecturer/meetings",
          label: "Meetings",
          icon: <FaCalendarAlt />,
        },
      ]
    : [
        { path: "/dashboard", label: "Overall", icon: <FaListUl /> },
        { path: "/assignments-exams", label: "Add Task", icon: <FaPlusCircle /> },
        { path: "/study-goals", label: "Study Goals", icon: <FaBullseye /> },
        { path: "/lecture-notes", label: "Lecture Notes", icon: <FaFileAlt /> },
        {
          path: "/gpa-tracker",
          label: "GPA Tracker",
          icon: <FaGraduationCap />,
        },
        {
          path: "/help-requests",
          label: "Help Request",
          icon: <FaHandsHelping />,
        },
        {
          path: "/lecture-availability",
          label: "Lecture Availability",
          icon: <FaChalkboardTeacher />,
        },
        {
          path: "/my-results",
          label: "My Results",
          icon: <FaPoll />,
        },
      ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        {!isCollapsed && (
          <div>
            <h2>UNIMANAGE</h2>
            <p>{isAdmin ? "Administrator" : isManagement ? "Management Portal" : (isLecturer || localStorage.getItem('unifiedRole') === 'lecturer') ? "Lecturer Portal" : "Student Portal"}</p>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            padding: '4px',
            margin: isCollapsed ? '0 auto' : '0'
          }}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <FaBars size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default SidebarNew;
