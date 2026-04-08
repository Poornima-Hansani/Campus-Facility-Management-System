import { Navigate } from "react-router-dom";

const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const staffLoggedIn = localStorage.getItem('staffLoggedIn') === 'true';
  const staffId = localStorage.getItem('staffId');
  
  if (!staffLoggedIn || !staffId) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default StaffRoute;
