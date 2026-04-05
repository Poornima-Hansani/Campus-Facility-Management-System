import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const routeMeta: Record<string, { title: string; context: string }> = {
  "/dashboard": {
    title: "Academic Help Dashboard",
    context: "Overview and quick access",
  },
  "/lecture-availability": {
    title: "Lecture Availability",
    context: "Search halls and labs",
  },
  "/timetable": { title: "Timetable", context: "Sessions and conflicts" },
  "/assignments-exams": {
    title: "Assignments & Exams",
    context: "Deadlines and assessments",
  },
  "/study-goals": { title: "Study Goals", context: "Targets and progress" },
  "/help-requests": { title: "Help Requests", context: "Academic support" },
  "/management-dashboard": {
    title: "Management",
    context: "Student support records",
  },
};

const Topbar = () => {
  const { pathname } = useLocation();

  const meta = useMemo(
    () =>
      routeMeta[pathname] ?? {
        title: "UniManage",
        context: "Student Portal",
      },
    [pathname]
  );

  return (
    <header className="topbar">
      <div className="topbar-title-block">
        <p className="topbar-eyebrow">UniManage</p>
        <h1>{meta.title}</h1>
        <p className="topbar-context">{meta.context}</p>
      </div>

      <div className="topbar-user">
        <div className="user-badge" aria-hidden>
          M2
        </div>
        <div className="topbar-user-text">
          <span className="user-name">Student</span>
          <span className="user-role">Campus account</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
