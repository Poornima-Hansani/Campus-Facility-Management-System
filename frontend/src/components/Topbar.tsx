import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

type RouteCopy = { title: string; detail: string };

const routeCopy: Record<string, RouteCopy> = {
  "/login": {
    title: "Sign in",
    detail: "Choose student access or sign in as an administrator.",
  },
  "/dashboard": {
    title: "Academic Help Dashboard",
    detail:
      "Overview of lectures, reminders, study goals, and academic support in one place.",
  },
  "/lecture-availability": {
    title: "Lecture Availability",
    detail:
      "Search the published catalog and the official module timetable in one place.",
  },
  "/admin-dashboard": {
    title: "Admin Dashboard",
    detail:
      "Manage the official module timetable; students see sessions in Lecture Availability.",
  },
  "/timetable": {
    title: "Timetable",
    detail: "Redirecting to the Admin Dashboard timetable tools.",
  },
  "/assignments-exams": {
    title: "Assignments & Exams",
    detail: "Track assignment deadlines and exam dates.",
  },
  "/study-goals": {
    title: "Study Goals",
    detail: "Set targets, log hours, and view due dates on the calendar.",
  },
  "/gpa-tracker": {
    title: "GPA Tracker",
    detail:
      "Record module credits and grades to estimate your GPA on a 4.0 scale.",
  },
  "/help-requests": {
    title: "Help Requests",
    detail: "Request support from lecturers, instructors, or senior students.",
  },
  "/management-dashboard": {
    title: "Management Dashboard",
    detail:
      "Catalog comparison and encouragement emails. Edit timetables on Admin Dashboard.",
  },
  "/my-results": {
    title: "My Results",
    detail: "View your academic performance and transcript.",
  },
  "/smart-booking": {
    title: "Smart Booking",
    detail: "Reserve study areas and computer labs across campus.",
  },
};

const defaultCopy: RouteCopy = {
  title: "UniManage",
  detail: "Campus facility and academic planning for students.",
};

const Topbar = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { title, detail } = useMemo(
    () => routeCopy[pathname] ?? defaultCopy,
    [pathname]
  );

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-title-stack">
          <h1 className="topbar-heading">{title}</h1>
          <p className="topbar-detail">{detail}</p>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
