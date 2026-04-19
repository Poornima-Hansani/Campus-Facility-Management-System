import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Student-facing pages: students can access, staff (admin) users are redirected to Admin Dashboard.
 */
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }
  // Allow students to access their pages
  return <>{children}</>;
};

export default StudentRoute;
