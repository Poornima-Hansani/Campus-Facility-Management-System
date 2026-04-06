import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../context/AuthContext";

type Props = {
  role: UserRole;
  children: React.ReactNode;
};

const ProtectedRoute = ({ role: requiredRole, children }: Props) => {
  const { role } = useAuth();
  const location = useLocation();

  if (role !== requiredRole) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ from: location.pathname, denied: requiredRole }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
