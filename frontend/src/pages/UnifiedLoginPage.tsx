import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FloatingLeaves = () => (
  <div className="floating-leaves">
    <svg className="leaf leaf-1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-4" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-7" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <svg className="leaf leaf-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 C30 25, 10 50, 50 95 C90 50, 70 25, 50 5Z" fill="currentColor"/>
    </svg>
    <div className="branch branch-1">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 300 Q80 250 60 200 Q40 150 20 100" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M60 200 Q90 180 120 160" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M40 150 Q70 130 100 110" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
    <div className="branch branch-2">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 300 Q120 250 140 200 Q160 150 180 100" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M140 200 Q110 180 80 160" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M160 150 Q130 130 100 110" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  </div>
);

export default function UnifiedLoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('unifiedRole', data.role);
      localStorage.setItem('unifiedUserId', data.userId);
      localStorage.setItem('unifiedName', data.name);
      
      if (data.role === 'student') {
        localStorage.setItem('studentLoggedIn', 'true');
        localStorage.setItem('studentId', data.userId);
      } else if (data.role === 'staff') {
        localStorage.setItem('staffLoggedIn', 'true');
        localStorage.setItem('staffId', data.userId);
        localStorage.setItem('staffName', data.name);
      } else if (data.role === 'management') {
         localStorage.setItem('managementLoggedIn', 'true');
      }

      const routes: Record<string, string> = {
        student: '/student',
        lecturer: '/dashboard',
        management: '/management-dashboard',
        staff: '/staff/dashboard',
        admin: '/admin-dashboard'
      };

      const destination = routes[data.role] || '/';
      navigate(destination);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <FloatingLeaves />
      
      <div className="relative z-10 flex flex-col justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center">
            <img src="/logo.png" alt="UniManage Logo" className="h-20 w-auto" />
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
             Or{' '}
             <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
               register a new account
             </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-white/50">
            <form className="space-y-6" onSubmit={handleLogin}>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm animate-shake">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-teal-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border px-3 text-gray-900 bg-white/90"
                    placeholder="e.g. ST1023"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-teal-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3 border px-3 text-gray-900 bg-white/90"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .floating-leaves {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          color: #10b981;
        }

        .leaf {
          position: absolute;
          opacity: 0.15;
          filter: blur(1px);
        }

        .leaf-1 {
          width: 80px;
          height: 80px;
          top: 5%;
          left: 8%;
          animation: floatLeaf1 15s ease-in-out infinite;
        }

        .leaf-2 {
          width: 60px;
          height: 60px;
          top: 15%;
          right: 10%;
          animation: floatLeaf2 18s ease-in-out infinite;
          animation-delay: -3s;
        }

        .leaf-3 {
          width: 100px;
          height: 100px;
          top: 40%;
          left: 3%;
          animation: floatLeaf3 20s ease-in-out infinite;
          animation-delay: -5s;
        }

        .leaf-4 {
          width: 50px;
          height: 50px;
          top: 60%;
          right: 5%;
          animation: floatLeaf4 16s ease-in-out infinite;
          animation-delay: -8s;
        }

        .leaf-5 {
          width: 70px;
          height: 70px;
          bottom: 20%;
          left: 15%;
          animation: floatLeaf5 22s ease-in-out infinite;
          animation-delay: -2s;
        }

        .leaf-6 {
          width: 90px;
          height: 90px;
          bottom: 10%;
          right: 20%;
          animation: floatLeaf6 19s ease-in-out infinite;
          animation-delay: -7s;
        }

        .leaf-7 {
          width: 40px;
          height: 40px;
          top: 30%;
          left: 50%;
          animation: floatLeaf7 14s ease-in-out infinite;
          animation-delay: -4s;
        }

        .leaf-8 {
          width: 55px;
          height: 55px;
          bottom: 40%;
          left: 75%;
          animation: floatLeaf8 17s ease-in-out infinite;
          animation-delay: -9s;
        }

        .branch {
          position: absolute;
          color: #059669;
          opacity: 0.1;
        }

        .branch-1 {
          width: 200px;
          height: 300px;
          top: 0;
          left: 0;
          animation: swayBranch 12s ease-in-out infinite;
        }

        .branch-2 {
          width: 200px;
          height: 300px;
          top: 0;
          right: 0;
          animation: swayBranch2 15s ease-in-out infinite;
          animation-delay: -5s;
        }

        @keyframes floatLeaf1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-25px) rotate(8deg); }
        }

        @keyframes floatLeaf2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(-8deg); }
          66% { transform: translateY(-15px) rotate(5deg); }
        }

        @keyframes floatLeaf3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          20% { transform: translateY(-25px) rotate(10deg); }
          40% { transform: translateY(-35px) rotate(-5deg); }
          60% { transform: translateY(-20px) rotate(8deg); }
          80% { transform: translateY(-30px) rotate(-3deg); }
        }

        @keyframes floatLeaf4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(12deg); }
        }

        @keyframes floatLeaf5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-18px) rotate(-6deg); }
          70% { transform: translateY(-28px) rotate(10deg); }
        }

        @keyframes floatLeaf6 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-22px) rotate(7deg); }
          75% { transform: translateY(-32px) rotate(-9deg); }
        }

        @keyframes floatLeaf7 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(-10deg); }
        }

        @keyframes floatLeaf8 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          40% { transform: translateY(-25px) rotate(8deg); }
          80% { transform: translateY(-15px) rotate(-4deg); }
        }

        @keyframes swayBranch {
          0%, 100% { transform: rotate(0deg); transform-origin: top left; }
          50% { transform: rotate(3deg); transform-origin: top left; }
        }

        @keyframes swayBranch2 {
          0%, 100% { transform: rotate(0deg); transform-origin: top right; }
          50% { transform: rotate(-3deg); transform-origin: top right; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
