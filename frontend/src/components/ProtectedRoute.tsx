import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../context/AuthContext";

type Props = {
  role: UserRole | UserRole[];
  children: React.ReactNode;
};

const ProtectedRoute = ({ role: requiredRole, children }: Props) => {
  const { role } = useAuth();
  const location = useLocation();

  const hasAccess = Array.isArray(requiredRole) 
    ? requiredRole.includes(role)
    : role === requiredRole;

  if (!hasAccess) {
    // Redirect to the appropriate dashboard for the user's actual role
    const getDashboardRoute = (userRole: UserRole) => {
      switch (userRole) {
        case 'student': return '/student';
        case 'lecturer': return '/lecturer-dashboard';
        case 'management': return '/management-dashboard';
        case 'staff': return '/staff/dashboard';
        case 'admin': return '/admin-dashboard';
        default: return '/dashboard';
      }
    };

    return (
      <Navigate
        to={getDashboardRoute(role)}
        replace
        state={{ from: location.pathname, denied: requiredRole }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
