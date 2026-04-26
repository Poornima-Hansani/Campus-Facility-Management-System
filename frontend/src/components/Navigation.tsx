import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LogIn, UserPlus } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  if (location.pathname === '/') {
    return null;
  }
  
  const isLoggedIn = !!localStorage.getItem('unifiedUserId');
  const role = localStorage.getItem('unifiedRole');
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path: string) => 
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive(path) 
        ? 'bg-[#004905] !text-white shadow-md' 
        : 'text-gray-600 hover:bg-[#004905]/10 hover:text-[#004905]'
    }`;

  const handleLogout = () => {
    localStorage.clear(); // Clear all unified and legacy tokens
    navigate('/');
  };

  const getDashboardRoute = () => {
    switch (role) {
      case 'student': return '/student';
      case 'lecturer': return '/lecturer-dashboard';
      case 'management': return '/management-dashboard';
      case 'staff': return '/staff/dashboard';
      case 'admin': return '/admin-dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center py-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="UniManage Logo" className="h-20 w-auto" />
            <span className="ml-3 text-xl font-bold text-gray-900">UNIMANAGE</span>
          </Link>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <>
                <Link to={getDashboardRoute()} className={linkClass(getDashboardRoute())}>
                  <Home size={18} />
                  <span className="hidden sm:inline">My Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700">
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className={linkClass('/login')}>
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-sm transition-colors">
                  <UserPlus size={18} className="sm:hidden" />
                  <span className="hidden sm:inline">Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
