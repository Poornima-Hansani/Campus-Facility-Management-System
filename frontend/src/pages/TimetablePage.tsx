import { Navigate } from "react-router-dom";

/** Legacy route: timetable editing lives on the Admin Dashboard. */
const TimetablePage = () => (
  <Navigate to="/admin-dashboard" replace />
);

export default TimetablePage;
