import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Student-facing pages: staff (admin) users are redirected to Admin Dashboard.
 */
const StudentRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }
  return <>{children}</>;
};

export default StudentRoute;
